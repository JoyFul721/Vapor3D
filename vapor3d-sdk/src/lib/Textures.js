export class Texture {
    constructor(gl) {
        this.gl = gl;
        this.id = gl.createTexture();
        this.target = gl.TEXTURE_2D;
        this.width = 0;
        this.height = 0;
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
        this.setFilter("LINEAR", "LINEAR");
        this.setWrap("S", "CLAMP_TO_EDGE");
        this.setWrap("T", "CLAMP_TO_EDGE");
    }

    uploadImageBitmap(bitmap) {
        this.bind();
        this.gl.texImage2D(this.target, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, bitmap);
        this.width = bitmap.width; this.height = bitmap.height;
        this.setFilter("LINEAR", "LINEAR");
        this.setWrap("S", "REPEAT");
        this.setWrap("T", "REPEAT");
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