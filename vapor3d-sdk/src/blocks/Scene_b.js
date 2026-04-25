export const SceneBlocks = [
    { blockType: "label", text: "Scene Control" },
    // 创建场景
    {
        opcode: "Scene_Create",
        blockType: "command",
        text: "new Scene [ID] ()",
        arguments: {
            ID: { type: "string", defaultValue: "Main" }
        }
    },
    // 销毁场景
    {
        opcode: "Scene_Destroy",
        blockType: "command",
        text: "Scene [ID] .destroy()",
        arguments: {
            ID: { type: "string", defaultValue: "Main" }
        }
    },
    // 清空场景内的模型
    {
        opcode: "Scene_Clear",
        blockType: "command",
        text: "Scene [SCENE_ID] .clear()",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" }
        }
    },



    { blockType: "label", text: "Model Assets" }, // Models
    {
        opcode: "Scene_GetMeshCount",
        blockType: "reporter",
        text: "Scene [SCENE_ID] .models[MODEL] .meshCount",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" }
        }
    },
    {
        opcode: "Scene_MeshBindTex",
        blockType: "command",
        text: "Scene [SCENE_ID] .models[MODEL] .meshes[IDX] .material .bind([TEX_TYPE], Unit:[UNIT])",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" },
            IDX: { type: "number", defaultValue: 0 },
            TEX_TYPE: { type: "string", menu: "pbrTexMenu" },
            UNIT: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_MeshGetParam",
        blockType: "reporter",
        text: "Scene [SCENE_ID] .models[MODEL] .meshes[IDX] .material .get([PARAM])",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" },
            IDX: { type: "number", defaultValue: 0 },
            PARAM: { type: "string", menu: "pbrParamMenu" }
        }
    },



    { blockType: "label", text: "Draw Call" }, // Draw Call
    {
        opcode: "Scene_MeshDraw",
        blockType: "command",
        text: "Scene [SCENE_ID] .models[MODEL] .meshes[IDX] .vao .draw([MODE])",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" },
            IDX: { type: "number", defaultValue: 0 },
            MODE: { type: "string", menu: "drawMode" }
        }
    },
    
    "---", "---",
];