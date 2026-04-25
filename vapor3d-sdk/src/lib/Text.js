import { Texture2D } from "./Textures";

export class Text {
    static canvas = document.createElement("canvas");
    static ctx = this.canvas.getContext("2d", { willReadFrequently: true });

    static createFromText(gl, text, font, color, borderSize, borderColor) {
        const ctx = this.ctx;
        ctx.font = font;
        const m = ctx.measureText(text);

        const b = borderSize > 0 ? Math.ceil(borderSize) : 0;
        const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight + 2 * b;
        const h = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent + 2 * b;

        this.canvas.width = w;
        this.canvas.height = h;

        ctx.font = font;
        ctx.textBaseline = 'alphabetic';
        ctx.clearRect(0, 0, w, h);

        if (borderSize > 0) {
            ctx.lineWidth = borderSize;
            ctx.strokeStyle = borderColor;
            ctx.strokeText(text, m.actualBoundingBoxLeft + b, m.fontBoundingBoxAscent + b);
        }

        ctx.fillStyle = color;
        ctx.fillText(text, m.actualBoundingBoxLeft + b, m.fontBoundingBoxAscent + b);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        const tex = new Texture2D(gl);
        tex.uploadImageBitmap(this.canvas);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        return tex;
    }
}