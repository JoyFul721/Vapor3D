// /lib/Loader/CastParser.js

/**
 * bin -> node tree { type, hash, properties, children }
 */

const TYPE_MAP = { 2: "v2", 3: "v3", 4: "v4" };

function normalizePath(path) {
    return String(path)
        .replace(/\\/g, "/")
        .replace(/\/{2,}/g, "/")
        .replace(/^\/+/, "");
}

class CastReader {
    constructor(buffer, path = "") {
        this.dv = new DataView(buffer);
        this.bytes = new Uint8Array(buffer);
        this.off = 0;
        this.size = buffer.byteLength;
        this.path = path;
        this.decoder = new TextDecoder();
    }

    u8() { return this.dv.getUint8(this.off++); }
    u16() { const v = this.dv.getUint16(this.off, true); this.off += 2; return v; }
    u32() { const v = this.dv.getUint32(this.off, true); this.off += 4; return v; }
    u64() { const v = this.dv.getBigUint64(this.off, true); this.off += 8; return v; }
    f32() { const v = this.dv.getFloat32(this.off, true); this.off += 4; return v; }

    strFixed(n) {
        if (n === 0) return "";
        const view = this.bytes.subarray(this.off, this.off + n);
        this.off += n;
        return this.decoder.decode(view).replace(/[\x00-\x1F\x7F]/g, "").trim();
    }

    strNull() {
        const start = this.off;
        while (this.off < this.size && this.bytes[this.off] !== 0) this.off++;
        const view = this.bytes.subarray(start, this.off);
        if (this.off < this.size) this.off++; // skip null terminator
        return this.decoder.decode(view);
    }
}

function idToFourCC(id) {
    const raw = String.fromCharCode(
        id & 0xFF,
        (id >> 8) & 0xFF,
        (id >> 16) & 0xFF,
        (id >>> 24) & 0xFF,
    );
    return raw.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

class CastParser {
    constructor(reader) {
        this.r = reader;
    }

    parse() {
        const magic = this.r.strFixed(4);
        if (magic !== "cast") throw new Error("Not a CAST file");

        this.r.u32(); // version
        const rootCount = this.r.u32();
        this.r.u32(); // flags

        const roots = [];
        for (let i = 0; i < rootCount; i++) roots.push(this.parseNode());
        roots.path = this.r.path;
        return roots;
    }

    parseNode() {
        const start = this.r.off;

        const idRaw = this.r.u32();
        const size = this.r.u32();
        const hash = this.r.u64();
        const propCount = this.r.u32();
        const childCount = this.r.u32();

        const node = {
            type: idToFourCC(idRaw),
            id: idRaw,
            hash,
            properties: {},
            children: [],
        };

        for (let i = 0; i < propCount; i++) {
            const prop = this.parseProperty();
            node.properties[prop.name.replace(/[^a-zA-Z0-9]/g, "")] = prop.value;
        }

        for (let i = 0; i < childCount; i++) node.children.push(this.parseNode());

        this.r.off = start + size;
        return node;
    }

    parseProperty() {
        const idRaw = this.r.u16();
        const nameSize = this.r.u16();
        const arrayLength = this.r.u32();

        const b1 = idRaw & 0xFF;
        const b2 = (idRaw >> 8) & 0xFF;
        let typeStr = String.fromCharCode(b1);
        if (b2 !== 0) typeStr += String.fromCharCode(b2);

        // 类型以小端存放
        typeStr = TYPE_MAP[typeStr[0]] ?? typeStr;

        const name = this.r.strFixed(nameSize);
        const values = [];
        for (let i = 0; i < arrayLength; i++) values.push(this.readValue(typeStr));

        // 键值缓冲即使长度为 1 也保留数组，否则 duration/marker 会丢帧
        const keepArray = name === "kv" || name === "kb";
        return {
            name,
            value: arrayLength === 1 && !keepArray ? values[0] : values,
        };
    }

    readValue(type) {
        switch (type) {
            case "b": return this.r.u8();
            case "h": return this.r.u16();
            case "i": return this.r.u32();
            case "l": return this.r.u64();
            case "f": return this.r.f32();
            case "s": return this.r.strNull();
            case "v2": return [this.r.f32(), this.r.f32()];
            case "v3": return [this.r.f32(), this.r.f32(), this.r.f32()];
            case "v4": return [this.r.f32(), this.r.f32(), this.r.f32(), this.r.f32()];
            default:
                throw new Error(`Vapor3D [CAST]: unsupported property type "${type}"`);
        }
    }
}

export function parseCast(buffer, path = "") {
    const reader = new CastReader(buffer, path);
    return new CastParser(reader).parse();
}

/**
 * 解析结果的索引按 hash / type 归档，并按 cast 文件目录解析内部资源路径
 */
export class CastWorkspace {
    constructor(roots) {
        this.roots = roots;
        this.nodesByHash = new Map();
        this.nodesByType = new Map();
        this.basePath = "";

        const castPath = roots.path || "";
        const lastSlash = castPath.lastIndexOf("/");
        this.basePath = lastSlash !== -1 ? castPath.substring(0, lastSlash + 1) : "";

        const scan = (node) => {
            if (node.hash !== undefined && node.hash !== 0n) {
                this.nodesByHash.set(node.hash.toString(), node);
            }
            if (!this.nodesByType.has(node.type)) this.nodesByType.set(node.type, []);
            this.nodesByType.get(node.type).push(node);
            for (const child of node.children) scan(child);
        };
        for (const root of roots) scan(root);
    }

    ofType(type) {
        return this.nodesByType.get(type) ?? [];
    }

    find(type) {
        return this.ofType(type)[0] ?? null;
    }

    /**
     * 顺着 hash 找到节点里的贴图原始路径，不含 basePath
     */
    rawPath(targetHash, visited = new Set()) {
        if (targetHash === undefined || targetHash === null) return null;

        if (typeof targetHash === "string") return normalizePath(targetHash);

        const hashStr = targetHash.toString();
        if (visited.has(hashStr)) return null;
        visited.add(hashStr);

        const node = this.nodesByHash.get(hashStr);
        if (!node) return null;

        for (const value of Object.values(node.properties)) {
            const str = Array.isArray(value) ? value[0] : value;
            if (typeof str !== "string") continue;
            if (str.includes(".dds") || str.includes(".tga") || str.includes("/")) {
                return normalizePath(str);
            }
        }

        for (const child of node.children) {
            const result = this.rawPath(child.hash, visited);
            if (result) return result;
        }
        return null;
    }

    /**
     * 原始路径 + cast 文件所在目录
     */
    resolvePath(targetHash) {
        const path = this.rawPath(targetHash);
        return path ? this.basePath + path : null;
    }
}
