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

    setIndices(indicesArray, isUint32 = false) {
        this.bind();
        this.ebo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indicesArray, this.gl.STATIC_DRAW);
        this.hasElements = true;
        this.defaultCount = indicesArray.length;
        this.elementType = isUint32 ? this.gl.UNSIGNED_INT : this.gl.UNSIGNED_SHORT;
        this.unbind();
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