import { Math3D } from '../lib/Tools/Math3D.js';
import { Utils } from '../lib/Tools/Utils.js';

export class Math3DHandlers {
    constructor() {
    }

    v3_Init({ X, Y, Z }) {
        return JSON.stringify([Number(X), Number(Y), Number(Z)]);
    }

    v3_Modify({ V, OP, OTHER }, util) {
        const a = Utils.parseInput(V, util) || [0, 0, 0];
        const b = Utils.parseInput(OTHER, util) || [0, 0, 0];

        if (OP === "+") return JSON.stringify(Math3D.v3_add(a, b));
        if (OP === "-") return JSON.stringify(Math3D.v3_sub(a, b));
        if (OP === "mul") return JSON.stringify(Math3D.v3_mul(a, b));
    }

    v3_ApplyMatrix({ V, M }, util) {
        const v = Utils.parseInput(V, util) || [0, 0, 0];
        const mat = Utils.parseInput(M, util) || Math3D.mat4_identity();
        return JSON.stringify(Math3D.v3_transform(v, mat));
    }

    v3_Get({ V, COMP }, util) {
        const v = Utils.parseInput(V, util) || [0, 0, 0];
        const map = { X: 0, Y: 1, Z: 2 };
        return v[map[COMP]] ?? 0;
    }

    m4_Identity() {
        return JSON.stringify(Math3D.mat4_identity());
    }

    m4_Perspective({ F, A, N, F2 }) {
        return JSON.stringify(Math3D.mat4_perspective(F * Math.PI / 180, A, N, F2));
    }

    m4_LookAt({ EX, EY, EZ, TX, TY, TZ, UX, UY, UZ }) {
        return JSON.stringify(Math3D.mat4_lookAt([EX, EY, EZ], [TX, TY, TZ], [UX, UY, UZ]));
    }

    m4_Translate({ M, X, Y, Z }, util) {
        const mat = Utils.parseInput(M, util) || Math3D.mat4_identity();
        return JSON.stringify(Math3D.mat4_translate(mat, X, Y, Z));
    }

    m4_Rotate({ M, AXIS, DEG }, util) {
        const mat = Utils.parseInput(M, util) || Math3D.mat4_identity();
        const rad = DEG * Math.PI / 180;

        let result;
        if (AXIS === "X") result = Math3D.mat4_rotateX(mat, rad);
        else if (AXIS === "Y") result = Math3D.mat4_rotateY(mat, rad);
        else result = Math3D.mat4_rotateZ(mat, rad);

        return JSON.stringify(result);
    }

    m4_Scale({ M, X, Y, Z }, util) {
        const mat = Utils.parseInput(M, util) || Math3D.mat4_identity();
        return JSON.stringify(Math3D.mat4_scale(mat, X, Y, Z));
    }

    m4_Multiply({ A, B }, util) {
        const matA = Utils.parseInput(A, util) || Math3D.mat4_identity();
        const matB = Utils.parseInput(B, util) || Math3D.mat4_identity();
        return JSON.stringify(Math3D.mat4_multiply(matA, matB));
    }

    m4_Inverse({ M }, util) {
        const baseMat = Utils.parseInput(M, util) || Math3D.mat4_identity();
        const mat = Math3D.mat4_inverse(baseMat);
        return JSON.stringify(mat || Math3D.mat4_identity());
    }


    TRS_Create(args) {
        return Math3D.TRS_create(
            args.PX, args.PY, args.PZ,
            args.RX, args.RY, args.RZ,
            args.SX, args.SY, args.SZ
        );
    }

    TRS_Decompose(args) {
        return Math3D.TRS_decompose(args.TRS, args.TYPE, args.AXIS); // 好像没必要用 JSON.stringify
    }

    TRS_Add(args) {
        return Math3D.TRS_add(args.TRSA, args.TRSB);
    }

    TRS_Lerp(args) {
        const t = Math.max(0, Math.min(1, Number(args.T) || 0));
        return Math3D.TRS_lerp(args.A, args.B, t);
    }

}