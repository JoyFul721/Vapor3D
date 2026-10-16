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

    detach(slotPointName) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.id);
        const point = this.gl[slotPointName];

        if (slotPointName.startsWith("COLOR_ATTACHMENT")) {
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, point, this.gl.TEXTURE_2D, null, 0);

            const index = this.activeSlots.indexOf(point);
            if (index > -1) {
                this.activeSlots.splice(index, 1);
                this.gl.drawBuffers(this.activeSlots.length > 0 ? this.activeSlots : [this.gl.NONE]);
            }
        } else {
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, point, this.gl.TEXTURE_2D, null, 0);
        }

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    attachStencilBuffer(stencilObj) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.id);

        this.gl.framebufferRenderbuffer(
            this.gl.FRAMEBUFFER,
            this.gl.STENCIL_ATTACHMENT,
            this.gl.RENDERBUFFER,
            stencilObj.id
        );

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    detachStencilBuffer() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.id);

        this.gl.framebufferRenderbuffer(
            this.gl.FRAMEBUFFER,
            this.gl.STENCIL_ATTACHMENT,
            this.gl.RENDERBUFFER,
            null
        );

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