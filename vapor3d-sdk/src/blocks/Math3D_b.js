import { LIB } from "../compiler/Patcher";

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
        compile({ X, Y, Z }, { TYPE_STRING }) {
            const x = `Number(${this.descendInput(X).asUnknown()})`;
            const y = `Number(${this.descendInput(Y).asUnknown()})`;
            const z = `Number(${this.descendInput(Z).asUnknown()})`;

            return [
                `(${LIB("SafeArray")}.createWithArray([${x},${y},${z}]))`,
                TYPE_STRING,
            ];
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
        compile({ V, OP, OTHER }, { TYPE_STRING }) {
            const opFnNames = {
                "+": "vec3_add",
                "-": "vec3_sub",
                mul: "vec3_mul",
            };

            const lhs = `${LIB("Vec3")}(target,${this.descendInput(V).asUnknown()})`;
            const opFnName = opFnNames[OP];
            const rhs = `${LIB("Vec3")}(target,${this.descendInput(OTHER).asUnknown()})`;

            return [
                `(${LIB("SafeArray")}.createWithArray(${LIB("Math3D")}.${opFnName}(${lhs},${rhs})))`,
                TYPE_STRING,
            ];
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
        compile({ V, SCALAR }, { TYPE_STRING }) {
            const v = `${LIB("Vec3")}(target,${this.descendInput(V).asUnknown()})`;
            const scalar = `Number(${this.descendInput(SCALAR).asUnknown()})`;

            return [
                `(${LIB("SafeArray")}.createWithArray(${LIB("Math3D")}.vec3_scale(${v},${scalar})))`,
                TYPE_STRING,
            ];
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
        compile({ V, OTHER }, { TYPE_NUMBER }) {
            const lhs = `${LIB("Vec3")}(target,${this.descendInput(V).asUnknown()})`;
            const rhs = `${LIB("Vec3")}(target,${this.descendInput(OTHER).asUnknown()})`;

            return [`(${LIB("Math3D")}.vec3_dot(${lhs},${rhs}))`, TYPE_NUMBER];
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
        compile({ V, OTHER }, { TYPE_STRING }) {
            const lhs = `${LIB("Vec3")}(target,${this.descendInput(V).asUnknown()})`;
            const rhs = `${LIB("Vec3")}(target,${this.descendInput(OTHER).asUnknown()})`;

            return [
                `(${LIB("SafeArray")}.createWithArray(${LIB("Math3D")}.vec3_cross(${lhs},${rhs})))`,
                TYPE_STRING,
            ];
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
        compile({ A, B, T }, { TYPE_STRING }) {
            const a = `${LIB("Vec3")}(target,${this.descendInput(A).asUnknown()})`;
            const b = `${LIB("Vec3")}(target,${this.descendInput(B).asUnknown()})`;
            const t = `Number(${this.descendInput(T).asUnknown()})`;

            return [
                `(${LIB("SafeArray")}.createWithArray(${LIB("Math3D")}.vec3_lerp(${a},${b}, ${t})))`,
                TYPE_STRING,
            ];
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
        compile({ X, MIN, MAX }, { TYPE_STRING }) {
            const x = `${LIB("Vec3")}(target,${this.descendInput(X).asUnknown()})`;
            const min = `${LIB("Vec3")}(target,${this.descendInput(MIN).asUnknown()})`;
            const max = `${LIB("Vec3")}(target,${this.descendInput(MAX).asUnknown()})`;

            return [
                `(${LIB("SafeArray")}.createWithArray(${LIB("Math3D")}.vec3_clamp(${x},${min},${max})))`,
                TYPE_STRING,
            ];
        },
    },
    {
        opcode: "v3_Normalize",
        blockType: "reporter",
        text: "vec3 [V] .normalize",
        arguments: {
            V: { type: "string", defaultValue: "[0,0,0]" },
        },
        compile({ V }, { TYPE_STRING }) {
            const v = `${LIB("Vec3")}(target,${this.descendInput(V).asUnknown()})`;

            return [
                `(${LIB("SafeArray")}.createWithArray(${LIB("Math3D")}.vec3_normalize(${v})))`,
                TYPE_STRING,
            ];
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
        compile({ V, M }, { TYPE_STRING }) {
            const v = `${LIB("Vec3")}(target,${this.descendInput(V).asUnknown()})`;
            const m = `${LIB("Mat4")}(target,${this.descendInput(M).asUnknown()})`;

            return [
                `(${LIB("SafeArray")}.createWithArray(${LIB("Math3D")}.vec3_transform(${v},${m})))`,
                TYPE_STRING,
            ];
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
        compile({ V, COMP }, { TYPE_NUMBER }) {
            const compIndexes = { X: 0, Y: 1, Z: 2 };

            const v = `${LIB("Vec3")}(target,${this.descendInput(V).asUnknown()})`;
            const compIndex = compIndexes[COMP];

            return [`(${v}[${compIndex}])`, TYPE_NUMBER];
        },
    },

    { blockType: "label", text: "Matrix" },
    {
        opcode: "m4_Identity",
        blockType: "reporter",
        text: "mat4 identity",

        compile({}, { TYPE_STRING }) {
            return [
                `(${LIB("SafeArray")}.createWithArray([1,0,0,0,
                                                      0,1,0,0,
                                                      0,0,1,0,
                                                      0,0,0,1]))`,
                TYPE_STRING,
            ];
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
        compile({ F, A, N, F2 }, { TYPE_STRING }) {
            const f = `Number(${this.descendInput(F).asUnknown()})`;
            const a = `Number(${this.descendInput(A).asUnknown()})`;
            const n = `Number(${this.descendInput(N).asUnknown()})`;
            const f2 = `Number(${this.descendInput(F2).asUnknown()})`;

            return [
                `(${LIB("SafeArray")}.createWithArray(${LIB("Math3D")}.mat4_perspective(${f}*Math.PI/180,${a},${n},${f2})))`,
                TYPE_STRING,
            ];
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
        compile({ EX, EY, EZ, TX, TY, TZ, UX, UY, UZ }, { TYPE_STRING }) {
            const ex = `Number(${this.descendInput(EX).asUnknown()})`;
            const ey = `Number(${this.descendInput(EY).asUnknown()})`;
            const ez = `Number(${this.descendInput(EZ).asUnknown()})`;
            const tx = `Number(${this.descendInput(TX).asUnknown()})`;
            const ty = `Number(${this.descendInput(TY).asUnknown()})`;
            const tz = `Number(${this.descendInput(TZ).asUnknown()})`;
            const ux = `Number(${this.descendInput(UX).asUnknown()})`;
            const uy = `Number(${this.descendInput(UY).asUnknown()})`;
            const uz = `Number(${this.descendInput(UZ).asUnknown()})`;

            return [
                `(${LIB("SafeArray")}.createWithArray(${LIB("Math3D")}.mat4_lookAt([${ex},${ey},${ez}],[${tx},${ty},${tz}],[${ux},${uy},${uz}])))`,
                TYPE_STRING,
            ];
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
        compile({ M, X, Y, Z }, { TYPE_STRING }) {
            const m = `${LIB("Mat4")}(target,${this.descendInput(M).asUnknown()})`;
            const x = `Number(${this.descendInput(X).asUnknown()})`;
            const y = `Number(${this.descendInput(Y).asUnknown()})`;
            const z = `Number(${this.descendInput(Z).asUnknown()})`;

            return [
                `(${LIB("SafeArray")}.createWithArray(${LIB("Math3D")}.mat4_translate(${m},${x},${y},${z})))`,
                TYPE_STRING,
            ];
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
        compile({ M, AXIS, DEG }, { TYPE_STRING }) {
            const rotateFnNames = {
                X: "mat4_rotateX",
                Y: "mat4_rotateY",
                Z: "mat4_rotateZ",
            };

            const m = `${LIB("Mat4")}(target,${this.descendInput(M).asUnknown()})`;
            const rotateFnName = rotateFnNames[AXIS];
            const deg = `Number(${this.descendInput(DEG).asUnknown()})`;

            return [
                `(${LIB("SafeArray")}.createWithArray(${LIB("Math3D")}.${rotateFnName}(${m},${deg}*Math.PI/180)))`,
                TYPE_STRING,
            ];
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
        compile({ M, X, Y, Z }, { TYPE_STRING }) {
            const m = `${LIB("Mat4")}(target,${this.descendInput(M).asUnknown()})`;
            const x = `Number(${this.descendInput(X).asUnknown()})`;
            const y = `Number(${this.descendInput(Y).asUnknown()})`;
            const z = `Number(${this.descendInput(Z).asUnknown()})`;

            return [
                `(${LIB("SafeArray")}.createWithArray(${LIB("Math3D")}.mat4_scale(${m},${x},${y},${z})))`,
                TYPE_STRING,
            ];
        },
    },
    {
        opcode: "m4_Multiply",
        blockType: "reporter",
        text: "mat4 [A] * [B]",
        arguments: { A: { type: "string" }, B: { type: "string" } },
        compile({ A, B }, { TYPE_STRING }) {
            const a = `${LIB("Mat4")}(target,${this.descendInput(A).asUnknown()})`;
            const b = `${LIB("Mat4")}(target,${this.descendInput(B).asUnknown()})`;

            return [
                `(${LIB("SafeArray")}.createWithArray(${LIB("Math3D")}.mat4_multiply(${a},${b})))`,
                TYPE_STRING,
            ];
        },
    },
    {
        opcode: "m4_Inverse",
        blockType: "reporter",
        text: "mat4 [M] .inverse",
        arguments: { M: { type: "string" } },
        compile({ M }, { TYPE_STRING }) {
            const m = `${LIB("Mat4")}(target,${this.descendInput(M).asUnknown()})`;

            return [
                `(${LIB("SafeArray")}.createWithArray(${LIB("Math3D")}.mat4_inverse(${m})))`,
                TYPE_STRING,
            ];
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
        compile({ PX, PY, PZ, RX, RY, RZ, SX, SY, SZ }, { TYPE_STRING }) {
            const px = `Number(${this.descendInput(PX).asUnknown()})`;
            const py = `Number(${this.descendInput(PY).asUnknown()})`;
            const pz = `Number(${this.descendInput(PZ).asUnknown()})`;
            const rx = `Number(${this.descendInput(RX).asUnknown()})`;
            const ry = `Number(${this.descendInput(RY).asUnknown()})`;
            const rz = `Number(${this.descendInput(RZ).asUnknown()})`;
            const sx = `Number(${this.descendInput(SX).asUnknown()})`;
            const sy = `Number(${this.descendInput(SY).asUnknown()})`;
            const sz = `Number(${this.descendInput(SZ).asUnknown()})`;

            return [
                `(${LIB("SafeArray")}.createWithArray([${px},${py},${pz},${rx},${ry},${rz},${sx},${sy},${sz}]))`,
                TYPE_STRING,
            ];
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
        compile({ TRS, TYPE, AXIS }, { TYPE_NUMBER }) {
            const trs = `${LIB("TRS")}(target,${this.descendInput(TRS).asUnknown()})`;

            return [
                `(${LIB("Math3D")}.TRS_decompose(${trs}, "${TYPE}", "${AXIS}"))`,
                TYPE_NUMBER,
            ];
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
        compile({ TRSA, TRSB }, { TYPE_STRING }) {
            const trsa = `${LIB("TRS")}(target,${this.descendInput(TRSA).asUnknown()})`;
            const trsb = `${LIB("TRS")}(target,${this.descendInput(TRSB).asUnknown()})`;

            return [
                `(${LIB("SafeArray")}.createWithArray(${LIB("Math3D")}.TRS_add(${trsa}, ${trsb})))`,
                TYPE_STRING,
            ];
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
        compile({ A, B, T }, { TYPE_STRING }) {
            const trsa = `${LIB("TRS")}(target,${this.descendInput(A).asUnknown()})`;
            const trsb = `${LIB("TRS")}(target,${this.descendInput(B).asUnknown()})`;
            const t = `Math.min(Math.max(Number(${this.descendInput(T).asUnknown()}),0),1)`;

            return [
                `(${LIB("SafeArray")}.createWithArray(${LIB("Math3D")}.TRS_lerp(${trsa}, ${trsb}, ${t})))`,
                TYPE_STRING,
            ];
        },
    },

    "---",
    "---",
];
