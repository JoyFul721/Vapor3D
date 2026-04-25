import { Math3D } from '../lib/Math3D.js';
import { Utils } from '../lib/Utils.js';

export class Math3DHandlers {
    constructor(coreState) {
        this.vectors = new Map();
    }

    v3_Init({ ID, X, Y, Z }) {
        this.vectors.set(ID, [Number(X), Number(Y), Number(Z)]);
    }
    v3_Modify({ ID, OP, OTHER }) {
        const a = this.vectors.get(ID);
        const b = this.vectors.get(OTHER);
        if (!a || !b) return;

        if (OP === "+") this.vectors.set(ID, Math3D.v3_add(a, b));
        else if (OP === "-") this.vectors.set(ID, Math3D.v3_sub(a, b));
        else if (OP === "mul") this.vectors.set(ID, Math3D.v3_mul(a, b));
    }
    v3_ApplyMatrix({ ID, M }, util) {
        const v = this.vectors.get(ID);
        const mat = Utils.parseInput(M, util) || Math3D.identity();
        if (v) this.vectors.set(ID, Math3D.v3_transform(v, mat));
    }
    v3_Get({ ID, COMP }) {
        const v = this.vectors.get(ID);
        return v ? (v[{ X: 0, Y: 1, Z: 2 }[COMP.toUpperCase()]] ?? 0) : 0;
    }

    m4_Identity() {
        return JSON.stringify(Math3D.identity());
    }

    m4_Perspective({ F, A, N, F2 }) {
        return JSON.stringify(Math3D.perspective(F * Math.PI / 180, A, N, F2));
    }

    m4_LookAt({ EX, EY, EZ, TX, TY, TZ, UX, UY, UZ }) {
        return JSON.stringify(Math3D.lookAt([EX, EY, EZ], [TX, TY, TZ], [UX, UY, UZ]));
    }

    m4_Translate({ M, X, Y, Z }, util) {
        const mat = Utils.parseInput(M, util) || Math3D.identity();
        return JSON.stringify(Math3D.translate(mat, X, Y, Z));
    }

    m4_Rotate({ M, AXIS, DEG }, util) {
        const mat = Utils.parseInput(M, util) || Math3D.identity();
        const rad = DEG * Math.PI / 180;
        const axis = AXIS.toUpperCase();

        let result;
        if (axis === "X") result = Math3D.rotateX(mat, rad);
        else if (axis === "Y") result = Math3D.rotateY(mat, rad);
        else result = Math3D.rotateZ(mat, rad);

        return JSON.stringify(result);
    }

    m4_Scale({ M, X, Y, Z }, util) {
        const mat = Utils.parseInput(M, util) || Math3D.identity();
        return JSON.stringify(Math3D.scale(mat, X, Y, Z));
    }

    m4_Multiply({ A, B }, util) {
        const matA = Utils.parseInput(A, util) || Math3D.identity();
        const matB = Utils.parseInput(B, util) || Math3D.identity();
        return JSON.stringify(Math3D.multiply(matA, matB));
    }

    m4_Inverse({ M }, util) {
        const baseMat = Utils.parseInput(M, util) || Math3D.identity();
        const mat = Math3D.inverse(baseMat);

        if (!mat) {
            console.warn("Vapor3D: Invalid mat");
            return JSON.stringify(Math3D.identity());
        }
        return JSON.stringify(mat);
    }
}