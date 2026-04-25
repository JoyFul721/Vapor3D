export class Shader {
    constructor(gl, vsSource, fsSource) {
        this.gl = gl;
        this.program = gl.createProgram();

        const vSrc = this._fixGLSL(vsSource);
        const fSrc = this._fixGLSL(fsSource);
        const vShader = this._compile(gl.VERTEX_SHADER, vSrc);
        const fShader = this._compile(gl.FRAGMENT_SHADER, fSrc);

        if (!vShader || !fShader) return;

        gl.attachShader(this.program, vShader);
        gl.attachShader(this.program, fShader);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error("Shader Link Error:", gl.getProgramInfoLog(this.program));
        }
    }

    _fixGLSL(src) {
        if (!src) return "";
        let s = src.trim().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, (m) => m + "\n");
        if (s.includes('#version')) s = s.replace(/(#version\s+300\s+es)\s*/, "$1\n");
        if ((s.match(/\n/g) || []).length < 3) {
            s = s.replace(/;/g, ";\n").replace(/{/g, "{\n").replace(/}/g, "}\n");
        }
        return s.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n');
    }

    _compile(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error(`Shader Error:`, this.gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    use() { this.gl.useProgram(this.program); }
    setMat4(name, matArray) { this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, name), false, new Float32Array(matArray)); }
    setVec3(name, x, y, z) { this.gl.uniform3f(this.gl.getUniformLocation(this.program, name), x, y, z); }
    setVec2(name, x, y) { this.gl.uniform2f(this.gl.getUniformLocation(this.program, name), x, y); }
    setFloat(name, val) { this.gl.uniform1f(this.gl.getUniformLocation(this.program, name), val); }
    setInt(name, val) { this.gl.uniform1i(this.gl.getUniformLocation(this.program, name), val); }
    destroy() { this.gl.deleteProgram(this.program); }
}