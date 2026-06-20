export class Utils {
    static parseInput(input, util) {
        if (typeof input === "string" && input.startsWith("[")) {
            try { return JSON.parse(input); } catch (e) { return null; }
        }
        // 如果 input 是列表名，从 Scratch 运行时查找
        const list = util.target.lookupVariableByNameAndType(input, "list");
        return list ? list.value.map(Number) : null;
    }
    
    static async fetchBinary(url) {
        if (url.startsWith('data:')) {
            const b64 = url.split(',').pop();
            const binStr = atob(b64);
            const bytes = new Uint8Array(binStr.length);
            for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
            return bytes;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return new Uint8Array(await response.arrayBuffer());
    }

    static getFormatConfig(gl, formatStr) {
        if (!gl) return null;
        const key = String(formatStr).toUpperCase().trim();
        const map = {
            "RGB16F": { internal: gl.RGB16F, format: gl.RGB, type: gl.HALF_FLOAT },
            "RGBA16F": { internal: gl.RGBA16F, format: gl.RGBA, type: gl.HALF_FLOAT },
            "RGB32F": { internal: gl.RGB32F, format: gl.RGB, type: gl.FLOAT },
            "RGB8": { internal: gl.RGB8, format: gl.RGB, type: gl.UNSIGNED_BYTE },
            "RGBA8": { internal: gl.RGBA8, format: gl.RGBA, type: gl.UNSIGNED_BYTE },
            "R11G11B10F": { internal: gl.R11F_G11F_B10F, format: gl.RGB, type: gl.FLOAT },
            "R16F": { internal: gl.R16F, format: gl.RED, type: gl.HALF_FLOAT },
            "RG16F": { internal: gl.RG16F, format: gl.RG, type: gl.HALF_FLOAT },
            "DEPTH24_STENCIL8": { internal: gl.DEPTH24_STENCIL8, format: gl.DEPTH_STENCIL, type: gl.UNSIGNED_INT_24_8 },
            "DEPTH_COMPONENT24": { internal: gl.DEPTH_COMPONENT24, format: gl.DEPTH_COMPONENT, type: gl.UNSIGNED_INT }
        };
        return map[key] || map["RGBA8"];
    }

    static parseKTX(buffer) {
        const bytes = new Uint8Array(buffer);
        const identifier = [0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A];
        for (let i = 0; i < 12; i++) {
            if (bytes[i] !== identifier[i]) throw new Error("Vapor3D: Not a valid KTX 1.0 file");
        }

        const dv = new DataView(buffer);
        const littleEndian = dv.getUint32(12, true) === 0x04030201;

        const glType = dv.getUint32(16, littleEndian);
        const glFormat = dv.getUint32(24, littleEndian);
        const glInternalFormat = dv.getUint32(28, littleEndian);
        const pixelWidth = dv.getUint32(36, littleEndian);
        const pixelHeight = dv.getUint32(40, littleEndian);
        const numberOfFaces = dv.getUint32(52, littleEndian);
        let numberOfMipmapLevels = dv.getUint32(56, littleEndian);
        const bytesOfKeyValueData = dv.getUint32(60, littleEndian);

        if (numberOfFaces !== 6) throw new Error("Vapor3D: KTX must be a Cubemap");
        if (numberOfMipmapLevels === 0) numberOfMipmapLevels = 1;

        let offset = 64 + bytesOfKeyValueData;
        const mipmaps = [];

        for (let mip = 0; mip < numberOfMipmapLevels; mip++) {
            const imageSize = dv.getUint32(offset, littleEndian);
            offset += 4;
            for (let face = 0; face < numberOfFaces; face++) {
                const faceBuffer = buffer.slice(offset, offset + imageSize);
                let dataArray;
                if (glType === 5126) dataArray = new Float32Array(faceBuffer);
                else if (glType === 5131 || glType === 36193) dataArray = new Uint16Array(faceBuffer);
                else dataArray = new Uint8Array(faceBuffer);

                mipmaps.push({
                    level: mip, face: face,
                    width: Math.max(1, pixelWidth >> mip), height: Math.max(1, pixelHeight >> mip),
                    data: dataArray
                });
                offset += imageSize;
                offset = (offset + 3) & ~3;
            }
            offset = (offset + 3) & ~3;
        }
        return { glInternalFormat, glFormat, glType, numberOfMipmapLevels, mipmaps };
    }

    static parseHDR(buffer) {
        const view = new DataView(buffer);
        let pos = 0;

        const readLine = () => {
            let str = "";
            while (pos < buffer.byteLength) {
                const char = String.fromCharCode(view.getUint8(pos++));
                if (char === "\n") break;
                str += char;
            }
            return str;
        };

        let line = readLine();
        if (!line.startsWith("#?")) throw new Error("Vapor3D: Invalid HDR format");

        while (pos < buffer.byteLength) {
            line = readLine();
            if (line.startsWith("-Y") || line.startsWith("+Y")) break;
        }

        const parts = line.split(/\s+/);
        const height = parseInt(parts[1]);
        const width = parseInt(parts[3]);

        const floatData = new Float32Array(width * height * 3);
        let floatOffset = 0;

        for (let y = 0; y < height; y++) {
            const rgbe = new Uint8Array(4);
            rgbe[0] = view.getUint8(pos++);
            rgbe[1] = view.getUint8(pos++);
            rgbe[2] = view.getUint8(pos++);
            rgbe[3] = view.getUint8(pos++);

            // If New RLE
            const isNewRLE = (rgbe[0] === 2 && rgbe[1] === 2 && !(rgbe[2] & 0x80));

            if (!isNewRLE) {
                // 非压缩格式
                const convertToFloat = (r, g, b, e) => {
                    if (e === 0) return [0, 0, 0];
                    const f = Math.pow(2.0, e - 128) / 256.0;
                    return [r * f, g * f, b * f];
                };
                let res = convertToFloat(rgbe[0], rgbe[1], rgbe[2], rgbe[3]);
                floatData[floatOffset++] = res[0];
                floatData[floatOffset++] = res[1];
                floatData[floatOffset++] = res[2];

                for (let x = 1; x < width; x++) {
                    const r = view.getUint8(pos++);
                    const g = view.getUint8(pos++);
                    const b = view.getUint8(pos++);
                    const e = view.getUint8(pos++);
                    res = convertToFloat(r, g, b, e);
                    floatData[floatOffset++] = res[0];
                    floatData[floatOffset++] = res[1];
                    floatData[floatOffset++] = res[2];
                }
            } else {
                // New RLE
                const scanline = new Uint8Array(4 * width);
                let scanOffset = 0;

                for (let channel = 0; channel < 4; channel++) {
                    const channelEnd = (channel + 1) * width;
                    while (scanOffset < channelEnd) {
                        let code = view.getUint8(pos++);
                        if (code > 128) {
                            let count = code - 128;
                            let val = view.getUint8(pos++);
                            while (count-- > 0) scanline[scanOffset++] = val;
                        } else {
                            let count = code;
                            while (count-- > 0) scanline[scanOffset++] = view.getUint8(pos++);
                        }
                    }
                }
                for (let x = 0; x < width; x++) {
                    const r = scanline[x];
                    const g = scanline[x + width];
                    const b = scanline[x + 2 * width];
                    const e = scanline[x + 3 * width];

                    if (e > 0) {
                        const f = Math.pow(2.0, e - 136);
                        floatData[floatOffset++] = r * f;
                        floatData[floatOffset++] = g * f;
                        floatData[floatOffset++] = b * f;
                    } else {
                        floatData[floatOffset++] = 0;
                        floatData[floatOffset++] = 0;
                        floatData[floatOffset++] = 0;
                    }
                }
            }
        }

        return { width, height, data: floatData };
    }
}