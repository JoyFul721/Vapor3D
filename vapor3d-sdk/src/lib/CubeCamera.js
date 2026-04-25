import { Math3D } from './Math3D.js';

export class CubeCamera {
    static PROJ = Math3D.perspective(Math.PI / 2, 1, 0.1, 100);
    static DIRECTIONS = [
        { target: [1, 0, 0], up: [0, -1, 0] }, { target: [-1, 0, 0], up: [0, -1, 0] },
        { target: [0, 1, 0], up: [0, 0, 1] }, { target: [0, -1, 0], up: [0, 0, -1] },
        { target: [0, 0, 1], up: [0, -1, 0] }, { target: [0, 0, -1], up: [0, -1, 0] }
    ];

    static getViewMatrix(x, y, z, faceIndex) {
        const pos = [x, y, z];
        const dir = this.DIRECTIONS[faceIndex % 6];
        return Math3D.lookAt(pos, Math3D.v3_add(pos, dir.target), dir.up);
    }

    static getProjectionMatrix() {
        return this.PROJ;
    }
}