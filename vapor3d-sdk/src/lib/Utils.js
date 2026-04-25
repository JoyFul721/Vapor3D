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
}