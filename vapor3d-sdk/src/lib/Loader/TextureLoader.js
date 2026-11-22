// /lib/Loader/TextureLoader.js

import { Texture2D, TextureCube } from '../Engine/Textures.js';
import { Utils } from '../Tools/Utils.js';

export class TextureLoader {
    constructor(gl) {
        this.gl = gl;
    }

    /** 
     * 从 ImageBitmap / Canvas / Blob 创建 Texture2D 
     */
    createFromImageSource(source, { mipmaps = false } = {}) {
        const tex = new Texture2D(this.gl);
        tex.uploadImageBitmap(source);
        if (mipmaps) {
            tex.generateMipmap();
            tex.setFilter('LINEAR_MIPMAP_LINEAR', 'LINEAR');
        }
        return tex;
    }

    async loadTexture(url) {
        const data = await Utils.fetchBinary(url);
        const bitmap = await createImageBitmap(new Blob([data]));
        return this.createFromImageSource(bitmap);
    }

    async loadTextureFromSource(source) {
        const bitmap = await createImageBitmap(source);
        return this.createFromImageSource(bitmap);
    }

    // KTX 1.0
    async loadTextureKTX(url) {
        const data = await Utils.fetchBinary(url);
        const ktxData = Utils.parseKTX(data.buffer);
        const tex = new TextureCube(this.gl);
        tex.uploadKTX(ktxData);
        return tex;
    }

    // HDR
    async loadHDRTexture(url) {
        const data = await Utils.fetchBinary(url);
        const hdrData = Utils.parseHDR(data.buffer);
        const tex = new Texture2D(this.gl);
        tex.uploadHDR(hdrData);
        return tex;
    }

    // DDS (BC1~BC7)
    async loadTextureDDS(url) {
        const data = await Utils.fetchBinary(url);
        const ddsData = Utils.parseDDS(data);
        const tex = new Texture2D(this.gl);
        tex.uploadDDS(ddsData);
        return tex;
    }
}
