import { Math3D } from "../lib/Tools/Math3D.js";
import { Utils } from "../lib/Tools/Utils.js";
import { SafeArray } from "../lib/Tools/SafeArray.js";

export class Math3DHandlers {
    constructor() {}

    static ZEROD_VEC = SafeArray.createWithArray([0, 0, 0]);
    static MAT4_IDENTITY = SafeArray.createWithArray(Math3D.mat4_identity());

    static parseInputOrIdentity(input, util) {
        return (Utils.parseInput(input, util) || Math3DHandlers.MAT4_IDENTITY)
            .underlying;
    }

    static parseInputOrZerod(input, util) {
        return (Utils.parseInput(input, util) || Math3DHandlers.ZEROD_VEC)
            .underlying;
    }

    v3_Init({ X, Y, Z }) {
        return SafeArray.createWithArray([Number(X), Number(Y), Number(Z)]);
    }

    v3_Modify({ V, OP, OTHER }, util) {
        const a = Math3DHandlers.parseInputOrZerod(V, util);
        const b = Math3DHandlers.parseInputOrZerod(OTHER, util);

        if (OP === "+") return SafeArray.createWithArray(Math3D.vec3_add(a, b));
        if (OP === "-") return SafeArray.createWithArray(Math3D.vec3_sub(a, b));
        if (OP === "mul")
            return SafeArray.createWithArray(Math3D.vec3_mul(a, b));
    }

    v3_Scale({ V, SCALAR }, util) {
        const x = Math3DHandlers.parseInputOrZerod(V, util);
        const scalar = Number(SCALAR);
        return SafeArray.createWithArray(Math3D.vec3_scale(x, scalar));
    }

    v3_Dot({ V, OTHER }, util) {
        const a = Math3DHandlers.parseInputOrZerod(V, util);
        const b = Math3DHandlers.parseInputOrZerod(OTHER, util);
        return Math3D.vec3_dot(a, b);
    }

    v3_Cross({ V, OTHER }, util) {
        const a = Math3DHandlers.parseInputOrZerod(V, util);
        const b = Math3DHandlers.parseInputOrZerod(OTHER, util);
        return SafeArray.createWithArray(Math3D.vec3_cross(a, b));
    }

    v3_ApplyMatrix({ V, M }, util) {
        const v = Math3DHandlers.parseInputOrZerod(V, util);
        const mat = Math3DHandlers.parseInputOrIdentity(M, util);
        return SafeArray.createWithArray(Math3D.vec3_transform(v, mat));
    }

    v3_Lerp({ A, B, T }, util) {
        const a = Math3DHandlers.parseInputOrZerod(A, util);
        const b = Math3DHandlers.parseInputOrZerod(B, util);
        const t = Number(T);
        return SafeArray.createWithArray(Math3D.vec3_lerp(a, b, t));
    }

    v3_Clamp({ X, MIN, MAX }, util) {
        const x = Math3DHandlers.parseInputOrZerod(X, util);
        const min = Math3DHandlers.parseInputOrZerod(MIN, util);
        const max = Math3DHandlers.parseInputOrZerod(MAX, util);
        return SafeArray.createWithArray(Math3D.vec3_clamp(x, min, max));
    }

    v3_Normalize({ V }, util) {
        const v = Math3DHandlers.parseInputOrZerod(V, util);
        return SafeArray.createWithArray(Math3D.vec3_normalize(v));
    }

    v3_Get({ V, COMP }, util) {
        const v = Math3DHandlers.parseInputOrZerod(V, util);
        const map = { X: 0, Y: 1, Z: 2 };
        return v[map[COMP]] ?? 0;
    }

    m4_Identity() {
        return Math3DHandlers.MAT4_IDENTITY;
    }

    m4_Perspective({ F, A, N, F2 }) {
        return SafeArray.createWithArray(
            Math3D.mat4_perspective((F * Math.PI) / 180, A, N, F2),
        );
    }

    m4_LookAt({ EX, EY, EZ, TX, TY, TZ, UX, UY, UZ }) {
        return SafeArray.createWithArray(
            Math3D.mat4_lookAt([EX, EY, EZ], [TX, TY, TZ], [UX, UY, UZ]),
        );
    }

    m4_Translate({ M, X, Y, Z }, util) {
        const mat = Math3DHandlers.parseInputOrIdentity(M, util);
        return SafeArray.createWithArray(Math3D.mat4_translate(mat, X, Y, Z));
    }

    m4_Rotate({ M, AXIS, DEG }, util) {
        const mat = Math3DHandlers.parseInputOrIdentity(M, util);
        const rad = (DEG * Math.PI) / 180;

        let result;
        if (AXIS === "X") result = Math3D.mat4_rotateX(mat, rad);
        else if (AXIS === "Y") result = Math3D.mat4_rotateY(mat, rad);
        else result = Math3D.mat4_rotateZ(mat, rad);

        return SafeArray.createWithArray(result);
    }

    m4_Scale({ M, X, Y, Z }, util) {
        const mat = Math3DHandlers.parseInputOrIdentity(M, util);
        return SafeArray.createWithArray(Math3D.mat4_scale(mat, X, Y, Z));
    }

    m4_Multiply({ A, B }, util) {
        const matA = Math3DHandlers.parseInputOrIdentity(A, util);
        const matB = Math3DHandlers.parseInputOrIdentity(B, util);
        return SafeArray.createWithArray(Math3D.mat4_multiply(matA, matB));
    }

    m4_Inverse({ M }, util) {
        const baseMat = Math3DHandlers.parseInputOrIdentity(M, util);
        const mat = Math3D.mat4_inverse(baseMat);
        return SafeArray.createWithArray(mat);
    }

    TRS_Create(args) {
        return Math3D.TRS_create(
            args.PX,
            args.PY,
            args.PZ,
            args.RX,
            args.RY,
            args.RZ,
            args.SX,
            args.SY,
            args.SZ,
        );
    }

    TRS_Decompose(args) {
        return Math3D.TRS_decompose(args.TRS, args.TYPE, args.AXIS); // 好像没必要用 json.stringify
    }

    TRS_Add(args) {
        return Math3D.TRS_add(args.TRSA, args.TRSB);
    }

    TRS_Lerp(args) {
        const t = Math.max(0, Math.min(1, Number(args.T) || 0));
        return Math3D.TRS_lerp(args.A, args.B, t);
    }
}
