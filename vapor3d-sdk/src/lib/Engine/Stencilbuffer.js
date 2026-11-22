export class Stencilbuffer {
    constructor(gl) {
        this.name = null;
        this.gl = gl;
        this.id = gl.createRenderbuffer();
        this.width = 0;
        this.height = 0;
        this.attachmentPoint = 'STENCIL_ATTACHMENT';

        this.registryIndex = -1;
    }

    allocate(width, height, format = 'STENCIL_INDEX8') {
        const gl = this.gl;
        this.width = width;
        this.height = height;

        if (format === 'DEPTH24_STENCIL8') this.attachmentPoint = 'DEPTH_STENCIL_ATTACHMENT';
        else if (format === 'DEPTH_COMPONENT24') this.attachmentPoint = 'DEPTH_ATTACHMENT';
        else this.attachmentPoint = 'STENCIL_ATTACHMENT';

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.id);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl[format], width, height);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        return this;
    }

    destroy() {
        if (this.id) {
            this.gl.deleteRenderbuffer(this.id);
            this.id = null;
        }
    }
}