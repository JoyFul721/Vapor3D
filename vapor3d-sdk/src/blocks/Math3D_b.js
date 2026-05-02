export const Math3DBlocks = [
    { blockType: "label", text: "Vector" },
    { opcode: "v3_Init", blockType: "command", text: "vec3 [ID] = X [X] Y [Y] Z [Z]", arguments: { ID: { type: "string", defaultValue: "v1" }, X: { type: "number" }, Y: { type: "number" }, Z: { type: "number" } } },
    { opcode: "v3_Modify", blockType: "command", text: "vec3 [ID] [OP] [OTHER]", arguments: { ID: { type: "string", defaultValue: "v1" }, OP: { type: "string", menu: "v3OpMenu" }, OTHER: { type: "string", defaultValue: "v2" } } },
    { opcode: "v3_ApplyMatrix", blockType: "command", text: "vec3 [ID] apply mat4 [M]", arguments: { ID: { type: "string", defaultValue: "v1" }, M: { type: "string" } } },
    { opcode: "v3_Get", blockType: "reporter", text: "vec3 [ID] 's [COMP]", arguments: { ID: { type: "string", defaultValue: "v1" }, COMP: { type: "string", menu: "v3CompMenu" } } },
    { blockType: "label", text: "Matrix" },
    { opcode: "m4_Identity", blockType: "reporter", text: "glm::mat4" },
    { opcode: "m4_Perspective", blockType: "reporter", text: "glm::perspective [F] [A] [N] [F2]", arguments: { F: { type: "number", defaultValue: 45 }, A: { type: "number", defaultValue: 1.33 }, N: { type: "number", defaultValue: 0.1 }, F2: { type: "number", defaultValue: 100 } } },
    { opcode: "m4_LookAt", blockType: "reporter", text: "glm::lookAt Eye[EX],[EY],[EZ] Target[TX],[TY],[TZ] Up[UX],[UY],[UZ]", arguments: { EX: { type: "number", defaultValue: 0 }, EY: { type: "number", defaultValue: 0 }, EZ: { type: "number", defaultValue: 5 }, TX: { type: "number", defaultValue: 0 }, TY: { type: "number", defaultValue: 0 }, TZ: { type: "number", defaultValue: 0 }, UX: { type: "number", defaultValue: 0 }, UY: { type: "number", defaultValue: 1 }, UZ: { type: "number", defaultValue: 0 } } },
    { opcode: "m4_Translate", blockType: "reporter", text: "glm::translate [M] [X] [Y] [Z]", arguments: { M: { type: "string" }, X: { type: "number" }, Y: { type: "number" }, Z: { type: "number" } } },
    { opcode: "m4_Rotate", blockType: "reporter", text: "glm::rotate [M] [AXIS] [DEG]", arguments: { M: { type: "string" }, AXIS: { type: "string", menu: "axisMenu" }, DEG: { type: "number" } } },
    { opcode: "m4_Scale", blockType: "reporter", text: "glm::scale [M] X[X] Y[Y] Z[Z]", arguments: { M: { type: "string" }, X: { type: "number", defaultValue: 1 }, Y: { type: "number", defaultValue: 1 }, Z: { type: "number", defaultValue: 1 } } },
    { opcode: "m4_Multiply", blockType: "reporter", text: "glm:: [A] * [B]", arguments: { A: { type: "string" }, B: { type: "string" } } },
    { opcode: "m4_Inverse", blockType: "reporter", text: "glm::inverse [M]", arguments: { M: { type: "string" } } },
    { blockType: "label", text: "TRS" },
    {
        opcode: "TRS_Create",
        blockType: "reporter",
        text: "TRS Pos[PX][PY][PZ] Rot[RX][RY][RZ] Scale[SX][SY][SZ]",
        arguments: {
            PX: { type: "number", defaultValue: 0 },
            PY: { type: "number", defaultValue: 0 },
            PZ: { type: "number", defaultValue: 0 },
            RX: { type: "number", defaultValue: 0 },
            RY: { type: "number", defaultValue: 0 },
            RZ: { type: "number", defaultValue: 0 },
            SX: { type: "number", defaultValue: 1 },
            SY: { type: "number", defaultValue: 1 },
            SZ: { type: "number", defaultValue: 1 }
        }
    },
    {
        opcode: "TRS_Decompose",
        blockType: "reporter",
        text: "decompose [TRS] : [TYPE] [AXIS]",
        arguments: {
            TRS: { type: "string", defaultValue: "[0,0,0, 0,0,0, 1,1,1]" },
            TYPE: { type: "string", menu: "TRSTypeMenu" }, // Pos, Rot, Scale
            AXIS: { type: "string", menu: "AxisMenu" }    // X, Y, Z
        }
    },
    {
        opcode: "TRS_Add",
        blockType: "reporter",
        text: "combine TRS [TRSA] with [TRSB]",
        arguments: {
            TRSA: { type: "string", defaultValue: "[0,0,0, 0,0,0, 1,1,1]" },
            TRSB: { type: "string", defaultValue: "[0,0,0, 0,0,0, 1,1,1]" }
        }
    },
    {
        opcode: "TRS_Lerp",
        blockType: "reporter",
        text: "interpolate TRS from [A] to [B] t:[T]",
        arguments: {
            A: { type: "string", defaultValue: "[0,0,0, 0,0,0, 1,1,1]" },
            B: { type: "string", defaultValue: "[0,0,0, 0,0,0, 1,1,1]" },
            T: { type: "number", defaultValue: 0.5 }
        }
    },
    
    "---","---",
];