export class VAO {
    constructor(gl) {
        this.name = null;
        this.gl = gl;
        this.id = gl.createVertexArray();
        this.vbos = [];
        this.ebo = null;
        this.hasElements = false;
        this.defaultCount = 0;
        this.elementType = gl.UNSIGNED_SHORT;

        this.instanceAttribs = new Map();   // baseLocation -> record
        this.instanceCount = 0;
        this.instanceCountLocked = false;

        this.registryIndex = -1;
    }

    bind() { this.gl.bindVertexArray(this.id); }
    unbind() { this.gl.bindVertexArray(null); }

    addBuffer(dataArray, location, size, type = this.gl.FLOAT) {
        this.bind();
        const vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, dataArray, this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(location);
        this.gl.vertexAttribPointer(location, size, type, false, 0, 0);
        this.vbos.push(vbo);
        if (!this.hasElements && location === 0) {
            this.defaultCount = dataArray.length / size;
        }
        this.unbind();
    }

    addInstanceBuffer(dataArray, location, size, type = this.gl.FLOAT, divisor = 1) {
        this.bind();
        const vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, dataArray, this.gl.DYNAMIC_DRAW);
        this.gl.enableVertexAttribArray(location);
        this.gl.vertexAttribPointer(location, size, type, false, 0, 0);
        this.gl.vertexAttribDivisor(location, divisor);
        this.vbos.push(vbo);
        this.instanceAttribs.set(location, {
            vbo, size, type, divisor, isMatrix: false,
            capacity: dataArray.byteLength,
            count: dataArray.length / size
        });
        this._recalcInstanceCount();
        this.unbind();
        return vbo;
    }

    // mat4 实例化：dataArray 长度 16 * N，按 [m0..m15] 连续排布
    // baseLocation 占 baseLocation ~ baseLocation+3
    addInstanceMatrix4(dataArray, baseLocation) {
        if (dataArray.length % 16 !== 0) {
            console.error(`Vapor3D: instance matrix data length ${dataArray.length} is not a multiple of 16`);
            return null;
        }
        const count = dataArray.length / 16;
        this.bind();
        const vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, dataArray, this.gl.DYNAMIC_DRAW);

        const stride = 16 * 4;
        for (let i = 0; i < 4; i++) {
            const loc = baseLocation + i;
            this.gl.enableVertexAttribArray(loc);
            this.gl.vertexAttribPointer(loc, 4, this.gl.FLOAT, false, stride, i * 16);
            this.gl.vertexAttribDivisor(loc, 1);
        }
        this.vbos.push(vbo);
        this.instanceAttribs.set(baseLocation, {
            vbo, size: 16, type: this.gl.FLOAT, divisor: 1, isMatrix: true,
            capacity: dataArray.byteLength,
            count
        });
        this._recalcInstanceCount();
        this.unbind();
        return vbo;
    }

    setIndices(indicesArray, glType = this.gl.UNSIGNED_SHORT) {
        this.bind();
        this.ebo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indicesArray, this.gl.STATIC_DRAW);
        this.hasElements = true;
        this.defaultCount = indicesArray.length;
        this.elementType = glType;
        this.unbind();
    }

    updateInstanceBuffer(dataArray, location) {
        const rec = this.instanceAttribs.get(location);
        if (!rec) return false;

        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, rec.vbo);
        if (dataArray.byteLength <= rec.capacity) {
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, dataArray);
        } else {
            gl.bufferData(gl.ARRAY_BUFFER, dataArray, gl.DYNAMIC_DRAW);
            rec.capacity = dataArray.byteLength;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        rec.count = dataArray.length / rec.size;
        this._recalcInstanceCount();
        return true;
    }

    setDivisor(location, divisor) {
        this.bind();
        this.gl.vertexAttribDivisor(location, divisor);
        this.unbind();
    }

    setInstanceCount(count) {
        this.instanceCount = Math.max(0, Math.trunc(count) || 0);
        this.instanceCountLocked = true;
    }

    _recalcInstanceCount() {
        if (this.instanceCountLocked) return;
        let max = 0;
        for (const rec of this.instanceAttribs.values()) {
            if (rec.count > max) max = rec.count;
        }
        this.instanceCount = max;
    }

    draw(modeName, count = -1) {
        if (this.defaultCount === 0) return;
        this.bind();
        const drawCount = (count <= 0) ? this.defaultCount : count;
        const glMode = this.gl[modeName] || this.gl.TRIANGLES;
        if (this.hasElements) {
            this.gl.drawElements(glMode, drawCount, this.elementType, 0);
        } else {
            this.gl.drawArrays(glMode, 0, drawCount);
        }
        this.unbind();
    }

    drawInstanced(modeName, count = -1, instanceCount = -1) {
        const inst = (instanceCount > 0) ? instanceCount : this.instanceCount;
        if (this.defaultCount === 0 || inst <= 0) return;
        this.bind();
        const drawCount = (count <= 0) ? this.defaultCount : count;
        const glMode = this.gl[modeName] || this.gl.TRIANGLES;
        if (this.hasElements) {
            this.gl.drawElementsInstanced(glMode, drawCount, this.elementType, 0, inst);
        } else {
            this.gl.drawArraysInstanced(glMode, 0, drawCount, inst);
        }
        this.unbind();
    }

    destroy() {
        this.vbos.forEach(b => this.gl.deleteBuffer(b));
        if (this.ebo) this.gl.deleteBuffer(this.ebo);
        this.gl.deleteVertexArray(this.id);
    }

    // 静态预制件生成
    static createScreenQuad(gl) {
        const vao = new VAO(gl);
        vao.addBuffer(new Float32Array([-1, 1, 0, -1, -1, 0, 1, 1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0]), 0, 3);
        vao.addBuffer(new Float32Array([0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0]), 1, 2);
        vao.defaultCount = 6;
        return vao;
    }

    static createCube(gl) {
        const faces = [
            { p: [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]], n: [0, 0, 1] },
            { p: [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]], n: [1, 0, 0] },
            { p: [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]], n: [0, 0, -1] },
            { p: [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]], n: [-1, 0, 0] },
            { p: [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]], n: [0, 1, 0] },
            { p: [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]], n: [0, -1, 0] }
        ];
        const uv = [[0, 0], [1, 0], [1, 1], [0, 1]];
        const positions = [], uvs = [], indices = [];
        for (const face of faces) {
            const base = positions.length / 3;
            for (let i = 0; i < 4; i++) {
                positions.push(...face.p[i]);
                uvs.push(...uv[i]);
            }
            indices.push(base, base + 1, base + 2, base + 2, base + 3, base);
        }
        const vao = new VAO(gl);
        vao.addBuffer(new Float32Array(positions), 0, 3);
        vao.addBuffer(new Float32Array(uvs), 1, 2);
        vao.setIndices(new Uint16Array(indices));
        vao.defaultCount = 36;
        return vao;
    }

    static createSphere(gl, lat = 16, lon = 16) {
        const latBands = Math.max(3, parseInt(lat) || 16);
        const lonBands = Math.max(3, parseInt(lon) || 16);
        const pos = [], uv = [], indices = [];
        for (let i = 0; i <= latBands; i++) {
            const theta = (i * Math.PI) / latBands;
            const sinTheta = Math.sin(theta), cosTheta = Math.cos(theta);
            for (let j = 0; j <= lonBands; j++) {
                const phi = (j * 2 * Math.PI) / lonBands;
                pos.push(Math.cos(phi) * sinTheta, cosTheta, Math.sin(phi) * sinTheta);
                uv.push(j / lonBands, 1 - i / latBands);
            }
        }
        for (let i = 0; i < latBands; i++) {
            for (let j = 0; j < lonBands; j++) {
                const first = i * (lonBands + 1) + j, second = first + lonBands + 1;
                indices.push(first, first + 1, second, second, first + 1, second + 1);
            }
        }
        const vao = new VAO(gl);
        vao.addBuffer(new Float32Array(pos), 0, 3);
        vao.addBuffer(new Float32Array(uv), 1, 2);
        vao.setIndices(new Uint16Array(indices));
        vao.defaultCount = indices.length;
        return vao;
    }
}