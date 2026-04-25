export const Math3DBlocks = [
    { opcode: "v3_Init", blockType: "command", text: "vec3 [ID] = X [X] Y [Y] Z [Z]", arguments: { ID: { type: "string", defaultValue: "v1" }, X: { type: "number" }, Y: { type: "number" }, Z: { type: "number" } } },
    { opcode: "v3_Modify", blockType: "command", text: "vec3 [ID] [OP] [OTHER]", arguments: { ID: { type: "string", defaultValue: "v1" }, OP: { type: "string", menu: "v3OpMenu" }, OTHER: { type: "string", defaultValue: "v2" } } },
    { opcode: "v3_ApplyMatrix", blockType: "command", text: "vec3 [ID] apply mat4 [M]", arguments: { ID: { type: "string", defaultValue: "v1" }, M: { type: "string" } } },
    { opcode: "v3_Get", blockType: "reporter", text: "vec3 [ID] 's [COMP]", arguments: { ID: { type: "string", defaultValue: "v1" }, COMP: { type: "string", menu: "v3CompMenu" } } },
    { opcode: "m4_Identity", blockType: "reporter", text: "glm::mat4" },
    { opcode: "m4_Perspective", blockType: "reporter", text: "glm::perspective [F] [A] [N] [F2]", arguments: { F: { type: "number", defaultValue: 45 }, A: { type: "number", defaultValue: 1.33 }, N: { type: "number", defaultValue: 0.1 }, F2: { type: "number", defaultValue: 100 } } },
    { opcode: "m4_LookAt", blockType: "reporter", text: "glm::lookAt Eye[EX],[EY],[EZ] Target[TX],[TY],[TZ] Up[UX],[UY],[UZ]", arguments: { EX: { type: "number", defaultValue: 0 }, EY: { type: "number", defaultValue: 0 }, EZ: { type: "number", defaultValue: 5 }, TX: { type: "number", defaultValue: 0 }, TY: { type: "number", defaultValue: 0 }, TZ: { type: "number", defaultValue: 0 }, UX: { type: "number", defaultValue: 0 }, UY: { type: "number", defaultValue: 1 }, UZ: { type: "number", defaultValue: 0 } } },
    { opcode: "m4_Translate", blockType: "reporter", text: "glm::translate [M] [X] [Y] [Z]", arguments: { M: { type: "string" }, X: { type: "number" }, Y: { type: "number" }, Z: { type: "number" } } },
    { opcode: "m4_Rotate", blockType: "reporter", text: "glm::rotate [M] [AXIS] [DEG]", arguments: { M: { type: "string" }, AXIS: { type: "string", menu: "axisMenu" }, DEG: { type: "number" } } },
    { opcode: "m4_Scale", blockType: "reporter", text: "glm::scale [M] X[X] Y[Y] Z[Z]", arguments: { M: { type: "string" }, X: { type: "number", defaultValue: 1 }, Y: { type: "number", defaultValue: 1 }, Z: { type: "number", defaultValue: 1 } } },
    { opcode: "m4_Multiply", blockType: "reporter", text: "glm:: [A] * [B]", arguments: { A: { type: "string" }, B: { type: "string" } } },
    { opcode: "m4_Inverse", blockType: "reporter", text: "glm::inverse [M]", arguments: { M: { type: "string" } } },
    
    "---","---",
];