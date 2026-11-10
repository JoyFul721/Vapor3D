import { LIB_MATH3D } from "../compiler/lib_Math3D";
import { LIB_SAFEARRAY } from "../compiler/lib_SafeArray";
import { LIB_PARSEVEC3, LIB_PARSEMAT4 } from "../compiler/lib_ParseInput";

export const Math3DBlocks = [
    { blockType: "label", text: "Vector" },
    {
        opcode: "v3_Init",
        blockType: "reporter",
        text: "new vec3 [X] [Y] [Z]",
        arguments: {
            X: { type: "number", defaultValue: 0 },
            Y: { type: "number", defaultValue: 0 },
            Z: { type: "number", defaultValue: 0 },
        },
        compile({ X, Y, Z }, _) {
            const libSafeArray = this.evaluateOnce(LIB_SAFEARRAY);

            const x = this.descendInput(X);
            const y = this.descendInput(Y);
            const z = this.descendInput(Z);

            return `(${libSafeArray}.createWithArray([${x},${y},${z}]))`;
        },
    },
    {
        opcode: "v3_Modify",
        blockType: "reporter",
        text: "vec3 [V] [OP] [OTHER]",
        arguments: {
            V: { type: "string", defaultValue: "[0,0,0]" },
            OP: { type: "string", menu: "v3OpMenu" },
            OTHER: { type: "string", defaultValue: "[0,0,0]" },
        },
        compile({ V, OP, OTHER }, _) {
            const libMath3D = this.evaluateOnce(LIB_MATH3D);
            const libSafeArray = this.evaluateOnce(LIB_SAFEARRAY);
            const libParseVec3 = this.evaluateOnce(LIB_PARSEVEC3(libSafeArray));

            const opFnNames = {
                "+": "vec3_add",
                "-": "vec3_sub",
                mul: "vec3_mul",
            };

            const lhs = `${libParseVec3}(${this.descendInput(V)})`;
            const opFnName = opFnNames[OP];
            const rhs = `${libParseVec3}(${this.descendInput(OTHER)})`;

            return `(${libSafeArray}.createWithArray(${libMath3D}.${opFnName}(${lhs},${rhs})))`;
        },
    },
    {
        opcode: "v3_Scale",
        blockType: "reporter",
        text: "vec3 [V] mul_scalar [SCALAR]",
        arguments: {
            V: { type: "string", defaultValue: "[0,0,0]" },
            SCALAR: { type: "number", defaultValue: 1 },
        },
        compile({ V, SCALAR }, _) {
            const libMath3D = this.evaluateOnce(LIB_MATH3D);
            const libSafeArray = this.evaluateOnce(LIB_SAFEARRAY);
            const libParseVec3 = this.evaluateOnce(LIB_PARSEVEC3(libSafeArray));

            const v = `${libParseVec3}(${this.descendInput(V)})`;
            const scalar = `Number(${this.descendInput(SCALAR)})`;

            return `(${libSafeArray}.createWithArray(${libMath3D}.vec3_scale(${v},${scalar})))`;
        },
    },
    {
        opcode: "v3_Dot",
        blockType: "reporter",
        text: "vec3 [V] dot [OTHER]",
        arguments: {
            V: { type: "string", defaultValue: "[0,0,0]" },
            OTHER: { type: "string", defaultValue: "[0,0,0]" },
        },
        compile({ V, OTHER }, _) {
            const libMath3D = this.evaluateOnce(LIB_MATH3D);
            const libSafeArray = this.evaluateOnce(LIB_SAFEARRAY);
            const libParseVec3 = this.evaluateOnce(LIB_PARSEVEC3(libSafeArray));

            const lhs = `${libParseVec3}(${this.descendInput(V)})`;
            const rhs = `${libParseVec3}(${this.descendInput(OTHER)})`;

            return `(${libMath3D}.vec3_dot(${lhs},${rhs}))`;
        },
    },
    {
        opcode: "v3_Cross",
        blockType: "reporter",
        text: "vec3 [V] cross [OTHER]",
        arguments: {
            V: { type: "string", defaultValue: "[0,0,0]" },
            OTHER: { type: "string", defaultValue: "[0,0,0]" },
        },
        compile({ V, OTHER }, _) {
            const libMath3D = this.evaluateOnce(LIB_MATH3D);
            const libSafeArray = this.evaluateOnce(LIB_SAFEARRAY);
            const libParseVec3 = this.evaluateOnce(LIB_PARSEVEC3(libSafeArray));

            const lhs = `${libParseVec3}(${this.descendInput(V)})`;
            const rhs = `${libParseVec3}(${this.descendInput(OTHER)})`;

            return `(${libSafeArray}.createWithArray(${libMath3D}.vec3_cross(${lhs},${rhs})))`;
        },
    },
    {
        opcode: "v3_Lerp",
        blockType: "reporter",
        text: "interpolate vec3 [A] [B] T [T]",
        arguments: {
            A: { type: "string", defaultValue: "[0,0,0]" },
            B: { type: "string", defaultValue: "[1,1,1]" },
            T: { type: "number", defaultValue: 0.5 },
        },
        compile({ A, B, T }, _) {
            const libMath3D = this.evaluateOnce(LIB_MATH3D);
            const libSafeArray = this.evaluateOnce(LIB_SAFEARRAY);
            const libParseVec3 = this.evaluateOnce(LIB_PARSEVEC3(libSafeArray));

            const a = `${libParseVec3}(${this.descendInput(A)})`;
            const b = `${libParseVec3}(${this.descendInput(B)})`;
            const t = `Number(${this.descendInput(T)})`;

            return `(${libSafeArray}.createWithArray(${libMath3D}.vec3_lerp(${a},${b}, ${t})))`;
        },
    },
    {
        opcode: "v3_Clamp",
        blockType: "reporter",
        text: "clamp vec3 [X] min [MIN] max [MAX]",
        arguments: {
            X: { type: "string", defaultValue: "[0.5,0.5,0.5]" },
            MIN: { type: "string", defaultValue: "[0,0,0]" },
            MAX: { type: "string", defaultValue: "[1,1,1]" },
        },
        compile({ X, MIN, MAX }, _) {
            const libMath3D = this.evaluateOnce(LIB_MATH3D);
            const libSafeArray = this.evaluateOnce(LIB_SAFEARRAY);
            const libParseVec3 = this.evaluateOnce(LIB_PARSEVEC3(libSafeArray));

            const x = `${libParseVec3}(${this.descendInput(X)})`;
            const min = `${libParseVec3}(${this.descendInput(MIN)})`;
            const max = `${libParseVec3}(${this.descendInput(MAX)})`;

            return `(${libSafeArray}.createWithArray(${libMath3D}.vec3_clamp(${x},${min},${max})))`;
        },
    },
    {
        opcode: "v3_Normalize",
        blockType: "reporter",
        text: "vec3 [V] .normalize",
        arguments: {
            V: { type: "string", defaultValue: "[0,0,0]" },
        },
        compile({ V }, _) {
            const libMath3D = this.evaluateOnce(LIB_MATH3D);
            const libSafeArray = this.evaluateOnce(LIB_SAFEARRAY);
            const libParseVec3 = this.evaluateOnce(LIB_PARSEVEC3(libSafeArray));

            const v = `${libParseVec3}(${this.descendInput(V)})`;

            return `(${libSafeArray}.createWithArray(${libMath3D}.vec3_normalize(${v})))`;
        },
    },
    {
        opcode: "v3_ApplyMatrix",
        blockType: "reporter",
        text: "vec3 [V] .applyMat4 [M]",
        arguments: {
            V: { type: "string", defaultValue: "[0,0,0]" },
            M: {
                type: "string",
                defaultValue: "[1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]",
            },
        },
        compile({ V, M }, _) {
            const libMath3D = this.evaluateOnce(LIB_MATH3D);
            const libSafeArray = this.evaluateOnce(LIB_SAFEARRAY);
            const libParseVec3 = this.evaluateOnce(LIB_PARSEVEC3(libSafeArray));
            const libParseMat4 = this.evaluateOnce(LIB_PARSEMAT4(libSafeArray));

            const v = `${libParseVec3}(${this.descendInput(V)})`;
            const m = `${libParseMat4}(${this.descendInput(M)})`;

            return `(${libSafeArray}.createWithArray(${libMath3D}.vec3_transform(${v},${m})))`;
        },
    },
    {
        opcode: "v3_Get",
        blockType: "reporter",
        text: "vec3 [V] [COMP]",
        arguments: {
            V: { type: "string", defaultValue: "[0,0,0]" },
            COMP: { type: "string", menu: "axisMenu" },
        },
        compile({ V, COMP }, _) {
            const libSafeArray = this.evaluateOnce(LIB_SAFEARRAY);
            const libParseVec3 = this.evaluateOnce(LIB_PARSEVEC3(libSafeArray));

            const compIndexes = { X: 0, Y: 1, Z: 2 };

            const v = `${libParseVec3}(${this.descendInput(V)})`;
            const compIndex = compIndexes[COMP];

            return `(${v}[${compIndex}])`;
        },
    },

    { blockType: "label", text: "Matrix" },
    {
        opcode: "m4_Identity",
        blockType: "reporter",
        text: "mat4 identity",

        compile({}, _) {
            const libSafeArray = this.evaluateOnce(LIB_SAFEARRAY);
            return `(${libSafeArray}.createWithArray([1,0,0,0,
                                                      0,1,0,0,
                                                      0,0,1,0,
                                                      0,0,0,1]))`;
        },
    },
    {
        opcode: "m4_Perspective",
        blockType: "reporter",
        text: "mat4 perspective [F] [A] [N] [F2]",
        arguments: {
            F: { type: "number", defaultValue: 45 },
            A: { type: "number", defaultValue: 1.33 },
            N: { type: "number", defaultValue: 0.1 },
            F2: { type: "number", defaultValue: 100 },
        },
        compile({ F, A, N, F2 }, _) {
            const libMath3D = this.evaluateOnce(LIB_MATH3D);
            const libSafeArray = this.evaluateOnce(LIB_SAFEARRAY);

            const f = `Number(${this.descendInput(F)})`;
            const a = `Number(${this.descendInput(A)})`;
            const n = `Number(${this.descendInput(N)})`;
            const f2 = `Number(${this.descendInput(F2)})`;

            return `(${libSafeArray}.createWithArray(${libMath3D}.mat4_perspective(${f}*Math.PI/180,${a},${n},${f2})))`;
        },
    },
    {
        opcode: "m4_LookAt",
        blockType: "reporter",
        text: "mat4 lookAt eye [EX] [EY] [EZ] target [TX] [TY] [TZ] up [UX] [UY] [UZ]",
        arguments: {
            EX: { type: "number", defaultValue: 0 },
            EY: { type: "number", defaultValue: 0 },
            EZ: { type: "number", defaultValue: 5 },
            TX: { type: "number", defaultValue: 0 },
            TY: { type: "number", defaultValue: 0 },
            TZ: { type: "number", defaultValue: 0 },
            UX: { type: "number", defaultValue: 0 },
            UY: { type: "number", defaultValue: 1 },
            UZ: { type: "number", defaultValue: 0 },
        },
        compile({ EX, EY, EZ, TX, TY, TZ, UX, UY, UZ }, _) {
            const libMath3D = this.evaluateOnce(LIB_MATH3D);
            const libSafeArray = this.evaluateOnce(LIB_SAFEARRAY);

            const ex = `Number(${this.descendInput(EX)})`;
            const ey = `Number(${this.descendInput(EY)})`;
            const ez = `Number(${this.descendInput(EZ)})`;
            const tx = `Number(${this.descendInput(TX)})`;
            const ty = `Number(${this.descendInput(TY)})`;
            const tz = `Number(${this.descendInput(TZ)})`;
            const ux = `Number(${this.descendInput(UX)})`;
            const uy = `Number(${this.descendInput(UY)})`;
            const uz = `Number(${this.descendInput(UZ)})`;

            return `(${libSafeArray}.createWithArray(${libMath3D}.mat4_lookAt([${ex},${ey},${ez}],[${tx},${ty},${tz}],[${ux},${uy},${uz}])))`;
        },
    },
    {
        opcode: "m4_Translate",
        blockType: "reporter",
        text: "mat4 [M] .translate [X] [Y] [Z]",
        arguments: {
            M: { type: "string" },
            X: { type: "number", defaultValue: 0 },
            Y: { type: "number", defaultValue: 0 },
            Z: { type: "number", defaultValue: 0 },
        },
        compile({ M, X, Y, Z }, _) {
            const libMath3D = this.evaluateOnce(LIB_MATH3D);
            const libSafeArray = this.evaluateOnce(LIB_SAFEARRAY);
            const libParseMat4 = this.evaluateOnce(LIB_PARSEMAT4(libSafeArray));

            const m = `${libParseMat4}(${this.descendInput(M)})`;
            const x = `Number(${this.descendInput(X)})`;
            const y = `Number(${this.descendInput(Y)})`;
            const z = `Number(${this.descendInput(Z)})`;

            return `(${libSafeArray}.createWithArray(${libMath3D}.mat4_translate(${m},${x},${y},${z})))`;
        },
    },
    {
        opcode: "m4_Rotate",
        blockType: "reporter",
        text: "mat4 [M] .rotate [AXIS] [DEG]",
        arguments: {
            M: { type: "string" },
            AXIS: { type: "string", menu: "axisMenu" },
            DEG: { type: "number", defaultValue: 0 },
        },
        compile({ M, AXIS, DEG }, _) {
            const libMath3D = this.evaluateOnce(LIB_MATH3D);
            const libSafeArray = this.evaluateOnce(LIB_SAFEARRAY);
            const libParseMat4 = this.evaluateOnce(LIB_PARSEMAT4(libSafeArray));

            const rotateFnNames = {
                X: "mat4_rotateX",
                Y: "mat4_rotateY",
                Z: "mat4_rotateZ",
            };

            const m = `${libParseMat4}(${this.descendInput(M)})`;
            const rotateFnName = rotateFnNames[AXIS];
            const deg = `Number(${this.descendInput(DEG)})`;

            return `(${libSafeArray}.createWithArray(${libMath3D}.${rotateFnName}(${m},${deg}*Math.PI/180)))`;
        },
    },
    {
        opcode: "m4_Scale",
        blockType: "reporter",
        text: "mat4 [M] .scale [X] [Y] [Z]",
        arguments: {
            M: { type: "string" },
            X: { type: "number", defaultValue: 1 },
            Y: { type: "number", defaultValue: 1 },
            Z: { type: "number", defaultValue: 1 },
        },
        compile({ M, X, Y, Z }, _) {
            const libMath3D = this.evaluateOnce(LIB_MATH3D);
            const libSafeArray = this.evaluateOnce(LIB_SAFEARRAY);
            const libParseMat4 = this.evaluateOnce(LIB_PARSEMAT4(libSafeArray));

            const m = `${libParseMat4}(${this.descendInput(M)})`;
            const x = `Number(${this.descendInput(X)})`;
            const y = `Number(${this.descendInput(Y)})`;
            const z = `Number(${this.descendInput(Z)})`;

            return `(${libSafeArray}.createWithArray(${libMath3D}.mat4_scale(${m},${x},${y},${z})))`;
        },
    },
    {
        opcode: "m4_Multiply",
        blockType: "reporter",
        text: "mat4 [A] * [B]",
        arguments: { A: { type: "string" }, B: { type: "string" } },
        compile({ A, B }, _) {
            const libMath3D = this.evaluateOnce(LIB_MATH3D);
            const libSafeArray = this.evaluateOnce(LIB_SAFEARRAY);
            const libParseMat4 = this.evaluateOnce(LIB_PARSEMAT4(libSafeArray));

            const a = `${libParseMat4}(${this.descendInput(A)})`;
            const b = `${libParseMat4}(${this.descendInput(B)})`;

            return `(${libSafeArray}.createWithArray(${libMath3D}.mat4_multiply(${a},${b})))`;
        },
    },
    {
        opcode: "m4_Inverse",
        blockType: "reporter",
        text: "mat4 [M] .inverse",
        arguments: { M: { type: "string" } },
        compile({ M }, _) {
            const libMath3D = this.evaluateOnce(LIB_MATH3D);
            const libSafeArray = this.evaluateOnce(LIB_SAFEARRAY);
            const libParseMat4 = this.evaluateOnce(LIB_PARSEMAT4(libSafeArray));

            const m = `${libParseMat4}(${this.descendInput(M)})`;

            return `(${libSafeArray}.createWithArray(${libMath3D}.mat4_inverse(${m})))`;
        },
    },

    { blockType: "label", text: "TRS" },
    {
        opcode: "TRS_Create",
        blockType: "reporter",
        text: "new TRS pos [PX][PY][PZ] rot [RX][RY][RZ] scale [SX][SY][SZ]",
        arguments: {
            PX: { type: "number", defaultValue: 0 },
            PY: { type: "number", defaultValue: 0 },
            PZ: { type: "number", defaultValue: 0 },
            RX: { type: "number", defaultValue: 0 },
            RY: { type: "number", defaultValue: 0 },
            RZ: { type: "number", defaultValue: 0 },
            SX: { type: "number", defaultValue: 1 },
            SY: { type: "number", defaultValue: 1 },
            SZ: { type: "number", defaultValue: 1 },
        },
    },
    {
        opcode: "TRS_Decompose",
        blockType: "reporter",
        text: "decompose TRS [TRS] [TYPE] [AXIS]",
        arguments: {
            TRS: { type: "string", defaultValue: "[0,0,0, 0,0,0, 1,1,1]" },
            TYPE: { type: "string", menu: "TRSTypeMenu" }, // Pos, Rot, Scale
            AXIS: { type: "string", menu: "axisMenu" }, // X, Y, Z
        },
    },
    {
        opcode: "TRS_Add",
        blockType: "reporter",
        text: "combine TRS [TRSA] [TRSB]",
        arguments: {
            TRSA: { type: "string", defaultValue: "[0,0,0, 0,0,0, 1,1,1]" },
            TRSB: { type: "string", defaultValue: "[0,0,0, 0,0,0, 1,1,1]" },
        },
    },
    {
        opcode: "TRS_Lerp",
        blockType: "reporter",
        text: "interpolate TRS [A] [B] T [T]",
        arguments: {
            A: { type: "string", defaultValue: "[0,0,0, 0,0,0, 1,1,1]" },
            B: { type: "string", defaultValue: "[0,0,0, 0,0,0, 1,1,1]" },
            T: { type: "number", defaultValue: 0.5 },
        },
    },

    "---",
    "---",
];
