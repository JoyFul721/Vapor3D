export class Core {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;image-rendering:pixelated;z-index:0;';

        this.gl = this.canvas.getContext('webgl2', {
            alpha: true, depth: true, stencil: true, antialias: false,
            preserveDrawingBuffer: true, powerPreference: 'high-performance'
        });

        if (!this.gl) throw new Error("WebGL2 not supported");

        this.gl.getExtension('OES_texture_float_linear');
        this.gl.getExtension('OES_texture_half_float_linear');
        this.gl.getExtension('EXT_color_buffer_float');
    }

    resize(width, height) {
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.gl.viewport(0, 0, width, height);
        }
    }

    destroy() {
        if (this.canvas.parentElement) this.canvas.remove();
        // WebGL context loosely lost
        const ext = this.gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
    }

    // ================= State Management =================
    clear(maskMode) {
        const gl = this.gl;
        const mask = (maskMode === "ALL")
            ? (gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)
            : gl[maskMode];
        gl.clear(mask);
    }
    setClearColor(r, g, b, a) { this.gl.clearColor(r, g, b, a); }
    enable(cap) { this.gl.enable(this.gl[cap]); }
    disable(cap) { this.gl.disable(this.gl[cap]); }
    cullFace(mode) { this.gl.cullFace(this.gl[mode]); }
    depthMask(state) { this.gl.depthMask(state); }
    depthFunc(func) { this.gl.depthFunc(this.gl[func]); }
    colorMask(r, g, b, a) { this.gl.colorMask(r, g, b, a); }
    blendFuncSeparate(srgb, drgb, sa, da) { this.gl.blendFuncSeparate(this.gl[srgb], this.gl[drgb], this.gl[sa], this.gl[da]); }
    stencilOp(face, sf, zf, zp) { this.gl.stencilOpSeparate(this.gl[face], this.gl[sf], this.gl[zf], this.gl[zp]); }
    stencilFunc(face, func, ref, mask) { this.gl.stencilFuncSeparate(this.gl[face], this.gl[func], ref, mask); }
    stencilMask(mask) { this.gl.stencilMask(mask); }
}