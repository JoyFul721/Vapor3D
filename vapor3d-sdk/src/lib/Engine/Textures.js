export class Texture {
    constructor(gl) {
        this.name = null;
        this.gl = gl;
        this.id = gl.createTexture();
        this.target = gl.TEXTURE_2D;
        this.internalFormat = null;
        this.width = 0;
        this.height = 0;

        this.registryIndex = -1;
    }

    bind(unit = 0) {
        this.gl.activeTexture(this.gl.TEXTURE0 + unit);
        this.gl.bindTexture(this.target, this.id);
    }

    setFilter(minMode, magMode) {
        this.bind();
        this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, this.gl[minMode]);
        this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, this.gl[magMode]);
    }

    setWrap(axis, mode) {
        this.bind();
        const axisMap = { "S": this.gl.TEXTURE_WRAP_S, "T": this.gl.TEXTURE_WRAP_T, "R": this.gl.TEXTURE_WRAP_R };
        const modeMap = { "REPEAT": this.gl.REPEAT, "CLAMP_TO_EDGE": this.gl.CLAMP_TO_EDGE, "MIRRORED_REPEAT": this.gl.MIRRORED_REPEAT };
        this.gl.texParameteri(this.target, axisMap[axis], modeMap[mode]);
    }

    generateMipmap() {
        this.bind();
        this.gl.generateMipmap(this.target);
    }

    destroy() { this.gl.deleteTexture(this.id); }
}

export class Texture2D extends Texture {
    constructor(gl) {
        super(gl);
        this.target = gl.TEXTURE_2D;
    }

    uploadEmpty(w, h, internalFormat, format, type) {
        this.bind();
        this.gl.texImage2D(this.target, 0, internalFormat, w, h, 0, format, type, null);
        this.width = w; this.height = h;
        this.internalFormat = internalFormat;
        this.setFilter("LINEAR", "LINEAR");
        this.setWrap("S", "CLAMP_TO_EDGE");
        this.setWrap("T", "CLAMP_TO_EDGE");
    }

    uploadImageBitmap(bitmap) {
        this.bind();
        this.gl.texImage2D(this.target, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, bitmap);
        this.width = bitmap.width; this.height = bitmap.height;
        this.internalFormat = this.gl.RGBA8;
        this.setFilter("LINEAR", "LINEAR");
        this.setWrap("S", "REPEAT");
        this.setWrap("T", "REPEAT");
    }

    uploadData(width, height, data, internalFormat = this.gl.RGBA, format = this.gl.RGBA, type = this.gl.UNSIGNED_BYTE) {
        this.bind();
        const gl = this.gl;
        if (width === 1 && height === 1) {
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        }
        gl.texImage2D(
            this.target,
            0,
            internalFormat,
            width,
            height,
            0,
            format,
            type,
            data
        );
        this.width = width;
        this.height = height;
        this.internalFormat = internalFormat;
        if (width === 1 && height === 1) {
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        }
        this.setFilter("NEAREST", "NEAREST");
        this.setWrap("S", "CLAMP_TO_EDGE");
        this.setWrap("T", "CLAMP_TO_EDGE");
    }

    updateFromList(list, type) {
        const gl = this.gl;
        const formats = {
            RGB8: [gl.RGB8, gl.RGB, gl.UNSIGNED_BYTE, 3, Uint8Array],
            RGBA8: [gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, 4, Uint8Array],
            R16F: [gl.R16F, gl.RED, gl.FLOAT, 1, Float32Array],
            RG16F: [gl.RG16F, gl.RG, gl.FLOAT, 2, Float32Array],
            RGB16F: [gl.RGB16F, gl.RGB, gl.FLOAT, 3, Float32Array],
            RGBA16F: [gl.RGBA16F, gl.RGBA, gl.FLOAT, 4, Float32Array],
            R32F: [gl.R32F, gl.RED, gl.FLOAT, 1, Float32Array],
            RG32F: [gl.RG32F, gl.RG, gl.FLOAT, 2, Float32Array],
            RGB32F: [gl.RGB32F, gl.RGB, gl.FLOAT, 3, Float32Array],
            RGBA32F: [gl.RGBA32F, gl.RGBA, gl.FLOAT, 4, Float32Array]
        };
        const config = formats[type];
        if (!config) return console.error(`Vapor3D: Unsupported texture format "${type}"`);
        const [internalFormat, format, dataType, channels, ArrayType] = config;
        if (!this.id || !this.width || !this.height) return console.error("Vapor3D: Texture is not initialized");
        if (this.internalFormat !== internalFormat) return console.error(`Vapor3D: Texture format mismatch, expected ${type}`);
        if (!list || list.length !== this.width * this.height * channels) return console.error(`Vapor3D: Invalid list length, expected ${this.width * this.height * channels}, got ${list?.length ?? 0}`);
        const values = list.map(Number);
        if (values.some(v => !Number.isFinite(v))) return console.error("Vapor3D: List contains invalid numbers");
        if (ArrayType === Uint8Array && values.some(v => !Number.isInteger(v) || v < 0 || v > 255)) return console.error("Vapor3D: RGB8/RGBA8 values must be integers between 0 and 255");
        const data = new ArrayType(values);
        this.bind();
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texSubImage2D(this.target, 0, 0, 0, this.width, this.height, format, dataType, data);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    }

    uploadHDR(hdr) {
        this.bind();
        const gl = this.gl;
        // 默认 RGB16F
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB16F,
            hdr.width,
            hdr.height,
            0,
            gl.RGB,
            gl.FLOAT,
            hdr.data
        );
        this.width = hdr.width;
        this.height = hdr.height;
        this.internalFormat = gl.RGB16F;
        this.setFilter("LINEAR", "LINEAR");
        this.setWrap("S", "CLAMP_TO_EDGE");
        this.setWrap("T", "CLAMP_TO_EDGE");
    }
}

export class TextureCube extends Texture {
    constructor(gl) {
        super(gl);
        this.target = gl.TEXTURE_CUBE_MAP;
    }

    uploadEmpty(size, internalFormat, format, type) {
        this.bind();
        for (let i = 0; i < 6; i++) {
            this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, internalFormat, size, size, 0, format, type, null);
        }
        this.width = size; this.height = size;
        this.setFilter("NEAREST", "NEAREST");
        this.setWrap("S", "CLAMP_TO_EDGE");
        this.setWrap("T", "CLAMP_TO_EDGE");
        this.setWrap("R", "CLAMP_TO_EDGE");
    }

    uploadKTX(ktx) {
        this.bind();
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 4);
        ktx.mipmaps.forEach(mip => {
            this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + mip.face, mip.level, ktx.glInternalFormat, mip.width, mip.height, 0, ktx.glFormat, ktx.glType, mip.data);
        });
        const mipCount = ktx.numberOfMipmapLevels;
        this.gl.texParameteri(this.target, this.gl.TEXTURE_MAX_LEVEL, mipCount - 1);
        this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, (mipCount > 1) ? this.gl.LINEAR_MIPMAP_LINEAR : this.gl.LINEAR);
        this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.setWrap("S", "CLAMP_TO_EDGE"); this.setWrap("T", "CLAMP_TO_EDGE"); this.setWrap("R", "CLAMP_TO_EDGE");
    }
}