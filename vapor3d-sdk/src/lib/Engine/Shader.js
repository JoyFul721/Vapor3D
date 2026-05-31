export class Shader {
    constructor(gl, vsSource, fsSource) {
        this.gl = gl;
        this.program = gl.createProgram();

        this.locationCache = new Map();
        this.cachePool = {
            mat4: new Map(),
            vec3: new Map(),
            vec2: new Map(),
            float: new Map(),
            int: new Map()
        };

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

    destroy() { this.gl.deleteProgram(this.program); }

    use() { this.gl.useProgram(this.program); }

    getUniformLocation(name) {
        if (!this.locationCache.has(name)) {
            this.locationCache.set(name, this.gl.getUniformLocation(this.program, name));
        }
        return this.locationCache.get(name);
    }
    setMat4(name, matArray) {
        const loc = this.getUniformLocation(name);
        if (!loc) return;
        let cache = this.cachePool.mat4.get(name);
        if (!cache) {
            cache = new Float32Array(matArray);
            this.cachePool.mat4.set(name, cache);
            this.gl.uniformMatrix4fv(loc, false, cache);
            return;
        }
        let changed = false;
        for (let i = 0; i < 16; i++) {
            if (cache[i] !== matArray[i]) { changed = true; break; }
        }
        if (changed) {
            cache.set(matArray);
            this.gl.uniformMatrix4fv(loc, false, cache);
        }
    }
    setVec4(name, x, y, z, w) {
        const loc = this.getUniformLocation(name);
        if (!loc) return;
        let cache = this.cachePool.vec4.get(name);
        if (!cache) {
            cache = new Float32Array([x, y, z, w]);
            this.cachePool.vec4.set(name, cache);
            this.gl.uniform4f(loc, x, y, z, w);
            return;
        }

        if (cache[0] !== x || cache[1] !== y || cache[2] !== z || cache[3] !== w) {
            cache[0] = x; cache[1] = y; cache[2] = z; cache[3] = w;
            this.gl.uniform4f(loc, x, y, z, w);
        }
    }
    setVec3(name, x, y, z) {
        const loc = this.getUniformLocation(name);
        if (!loc) return;
        let cache = this.cachePool.vec3.get(name);
        if (!cache) {
            cache = new Float32Array([x, y, z]);
            this.cachePool.vec3.set(name, cache);
            this.gl.uniform3f(loc, x, y, z);
            return;
        }
        if (cache[0] !== x || cache[1] !== y || cache[2] !== z) {
            cache[0] = x; cache[1] = y; cache[2] = z;
            this.gl.uniform3f(loc, x, y, z);
        }
    }
    setVec2(name, x, y) {
        const loc = this.getUniformLocation(name);
        if (!loc) return;
        let cache = this.cachePool.vec2.get(name);
        if (!cache) {
            cache = new Float32Array([x, y]);
            this.cachePool.vec2.set(name, cache);
            this.gl.uniform2f(loc, x, y);
            return;
        }
        if (cache[0] !== x || cache[1] !== y) {
            cache[0] = x; cache[1] = y;
            this.gl.uniform2f(loc, x, y);
        }
    }
    setFloat(name, val) {
        const loc = this.getUniformLocation(name);
        if (!loc) return;
        if (this.cachePool.float.get(name) !== val) {
            this.gl.uniform1f(loc, val);
            this.cachePool.float.set(name, val);
        }
    }
    setInt(name, val) {
        const loc = this.getUniformLocation(name);
        if (!loc) return;
        if (this.cachePool.int.get(name) !== val) {
            this.gl.uniform1i(loc, val);
            this.cachePool.int.set(name, val);
        }
    }
}