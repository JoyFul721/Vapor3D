export class Framebuffer {
    constructor(gl) {
        this.gl = gl;
        this.id = gl.createFramebuffer();
        this.width = 0;
        this.height = 0;
        this.activeSlots = [];
    }

    attachTexture(texture, slotPointName) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.id);
        const point = this.gl[slotPointName];

        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, point, texture.target, texture.id, 0);

        if (texture.width && texture.height) {
            this.width = texture.width;
            this.height = texture.height;
        }

        if (slotPointName.startsWith("COLOR_ATTACHMENT")) {
            if (!this.activeSlots.includes(point)) {
                this.activeSlots.push(point);
                this.activeSlots.sort((a, b) => a - b);
                this.gl.drawBuffers(this.activeSlots);
            }
        }
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    attachCubeFace(textureCube, faceIndex, slotPointName) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.id);
        const targetFace = this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + Number(faceIndex);
        const point = this.gl[slotPointName];

        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, point, targetFace, textureCube.id, 0);
        this.width = textureCube.width;
        this.height = textureCube.height;

        if (slotPointName.startsWith("COLOR_ATTACHMENT")) {
            if (!this.activeSlots.includes(point)) {
                this.activeSlots.push(point);
                this.activeSlots.sort((a, b) => a - b);
                this.gl.drawBuffers(this.activeSlots);
            }
        }
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    bind(fallbackW, fallbackH) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.id);
        this.gl.viewport(0, 0, this.width || fallbackW, this.height || fallbackH);
    }

    static bindScreen(gl, canvasW, canvasH) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvasW, canvasH);
    }

    destroy() { this.gl.deleteFramebuffer(this.id); }
}