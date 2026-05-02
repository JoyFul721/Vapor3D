export const SceneBlocks = [
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

    // ================= Node ==================
    { blockType: "label", text: "Node" },
    {
        opcode: "Scene_NodeSetTRS",
        blockType: "command",
        text: "Scene [SCENE_ID] node [PATH] set transform [TRS]",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            PATH: { type: "string", defaultValue: "sample/root" },
            TRS: { type: "string", defaultValue: "[0,0,0, 0,0,0, 1,1,1]" }
        }
    },
    {
        opcode: "Scene_NodeSetParent",
        blockType: "command",
        text: "Scene [SCENE_ID] .nodes [CHILD_PATH] set parent to [PARENT_PATH]",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            CHILD_PATH: { type: "string", defaultValue: "cup" },
            PARENT_PATH: { type: "string", defaultValue: "sample" }
        }
    },
    {
        opcode: "Scene_GetNodeMatrix",
        blockType: "reporter",
        text: "Scene [SCENE_ID] .nodes [PATH] .worldMatrix",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            PATH: { type: "string", defaultValue: "sample/joint1" }
        }
    },
    {
        opcode: "Scene_UpdateWorldMatrix",
        blockType: "command",
        text: "Scene [SCENE_ID] .updateWorldMatrix()",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" }
        }
    },


    // ======================= Model =======================

    { blockType: "label", text: "Model" }, // 参考babylon, Model 归纳为 Node ，现在的 model 相当于 node extension
    // ========= Joint =========
    {
        opcode: "Scene_GetJointCount",
        blockType: "reporter",
        text: "Scene [SCENE_ID] .nodes [MODEL] .jointCount",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" }
        }
    },
    {
        opcode: "Scene_ModelSetJointTRS",
        blockType: "command",
        text: "Scene [SCENE_ID] .nodes [MODEL] .joints [IDX] .setTRS [TRS]",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" },
            IDX: { type: "number", defaultValue: 0 },
            TRS: { type: "string", defaultValue: "[0,0,0, 0,0,0, 1,1,1]" }
        }
    },
    {
        opcode: "Scene_ModelJointIndexToName",
        blockType: "reporter",
        text: "Scene [SCENE_ID] model [MODEL] joint index [IDX] -> name",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" },
            IDX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_ModelJointNameToIndex",
        blockType: "reporter",
        text: "Scene [SCENE_ID] model [MODEL] joint name [NAME] -> index",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" },
            NAME: { type: "string", defaultValue: "Hips" }
        }
    },
    {
        opcode: "Scene_ModelBindSkeletonTex",
        blockType: "command",
        text: "Scene [SCENE_ID] .nodes [MODEL] .bindSkeletonTexture ( [UNIT] )",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" },
            UNIT: { type: "number", defaultValue: 1 }
        }
    },

    // ======== Mesh ========
    {
        opcode: "Scene_GetMeshCount",
        blockType: "reporter",
        text: "Scene [SCENE_ID] .nodes [MODEL] .meshCount",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" }
        }
    },
    {
        opcode: "Scene_MeshBindTex",
        blockType: "command",
        text: "Scene [SCENE_ID] .nodes [MODEL] .meshes [IDX] .material .bind([TEX_TYPE], [UNIT])",
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
        text: "Scene [SCENE_ID] .nodes[MODEL] .meshes[IDX] .material .get([PARAM])",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" },
            IDX: { type: "number", defaultValue: 0 },
            PARAM: { type: "string", menu: "pbrParamMenu" }
        }
    },
    {
        opcode: "Scene_MeshDraw",
        blockType: "command",
        text: "Scene [SCENE_ID] .nodes[MODEL] .meshes[IDX] .vao .draw([MODE])",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" },
            IDX: { type: "number", defaultValue: 0 },
            MODE: { type: "string", menu: "drawMode" }
        }
    },
    
    "---", "---",
];