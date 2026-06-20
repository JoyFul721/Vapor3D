export class Shader {
    constructor(gl, vsSource, fsSource) {
        this.gl = gl;
        this.program = gl.createProgram();
        this.locationCache = new Map();

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

    destroy() {
        this.gl.deleteProgram(this.program);
    }

    use() {
        this.gl.useProgram(this.program);
    }

    getUniformLocation(name) {
        if (!this.locationCache.has(name)) {
            this.locationCache.set(name, this.gl.getUniformLocation(this.program, name));
        }
        return this.locationCache.get(name);
    }

    setMat4(name, matArray) {
        const loc = this.getUniformLocation(name);
        if (loc) {
            this.gl.uniformMatrix4fv(loc, false, matArray);
        }
    }

    setVec4(name, x, y, z, w) {
        const loc = this.getUniformLocation(name);
        if (loc) {
            this.gl.uniform4f(loc, x, y, z, w);
        }
    }

    setVec3(name, x, y, z) {
        const loc = this.getUniformLocation(name);
        if (loc) {
            this.gl.uniform3f(loc, x, y, z);
        }
    }

    setVec2(name, x, y) {
        const loc = this.getUniformLocation(name);
        if (loc) {
            this.gl.uniform2f(loc, x, y);
        }
    }

    setFloat(name, val) {
        const loc = this.getUniformLocation(name);
        if (loc) {
            this.gl.uniform1f(loc, val);
        }
    }

    setInt(name, val) {
        const loc = this.getUniformLocation(name);
        if (loc) {
            this.gl.uniform1i(loc, val);
        }
    }
}