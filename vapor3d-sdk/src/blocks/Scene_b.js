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
        text: "Scene [SCENE_ID] node index [NODE_IDX] set transform [TRS]",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            NODE_IDX: { type: "number", defaultValue: 0 },
            TRS: { type: "string", defaultValue: "[0,0,0, 0,0,0, 1,1,1]" }
        }
    },
    {
        opcode: "Scene_NodeSetParent",
        blockType: "command",
        text: "Scene [SCENE_ID] node index [CHILD_IDX] set parent to index [PARENT_IDX]",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            CHILD_IDX: { type: "number", defaultValue: 0 },
            PARENT_IDX: { type: "number", defaultValue: -1 }
        }
    },
    {
        opcode: "Scene_GetNodeMatrix",
        blockType: "reporter",
        text: "Scene [SCENE_ID] node index [NODE_IDX] .worldMatrix",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            NODE_IDX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_GetNodeTRS",
        blockType: "reporter",
        text: "Scene [SCENE_ID] node index [NODE_IDX] .TRS",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            NODE_IDX: { type: "number", defaultValue: 0 }
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
    {
        opcode: "Scene_GetModelRootIndex",
        blockType: "reporter",
        text: "Scene [SCENE_ID] get model [MODEL] root index",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" }
        }
    },   
    // ========= Joint =========
    { blockType: "label", text: "Joint"},
    {
        opcode: "Scene_GetJointNodeIndex",
        blockType: "reporter",
        text: "Scene [SCENE_ID] get model [MODEL] joint [IDX] index",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "animation" },
            IDX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_GetJointCount",
        blockType: "reporter",
        text: "Scene [SCENE_ID] model [MODEL] .jointCount",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "animation" }
        }
    },
    {
        opcode: "Scene_ModelSetJointTRS",
        blockType: "command",
        text: "Scene [SCENE_ID] model [MODEL] .joints [IDX] .setTRS [TRS]",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "animation" },
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
            MODEL: { type: "string", defaultValue: "animation" },
            IDX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_ModelJointNameToIndex",
        blockType: "reporter",
        text: "Scene [SCENE_ID] model [MODEL] joint name [NAME] -> index",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "animation" },
            NAME: { type: "string", defaultValue: "Hips" }
        }
    },
    {
        opcode: "Scene_ModelBindSkeletonTex",
        blockType: "command",
        text: "Scene [SCENE_ID] model [MODEL] .bindSkeletonTexture ( [UNIT] )",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "animation" },
            UNIT: { type: "number", defaultValue: 1 }
        }
    },

    // ======== Mesh ========
    { blockType: "label", text: "Mesh" },
    {
        opcode: "Scene_GetMeshNodeIndex",
        blockType: "reporter",
        text: "Scene [SCENE_ID] get model [MODEL] mesh [IDX] index",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" },
            IDX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_GetMeshCount",
        blockType: "reporter",
        text: "Scene [SCENE_ID] model [MODEL] .meshCount",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" }
        }
    },
    {
        opcode: "Scene_MeshBindTex",
        blockType: "command",
        text: "Scene [SCENE_ID] model [MODEL] .meshes [IDX] .material .bind([TEX_TYPE], [UNIT])",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" },
            IDX: { type: "number", defaultValue: 0 },
            TEX_TYPE: { type: "string", menu: "pbrTexMenu" },
            UNIT: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_MeshTex_SetFilter",
        blockType: "command",
        text: "Scene [SCENE_ID] model [MODEL] .meshes [IDX] .material .setFilter([NAME], [MIN_MODE], [MAG_MODE])",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" },
            IDX: { type: "number", defaultValue: 0 },
            NAME: { type: "string", menu: "pbrTexMenu" },
            MIN_MODE: { type: "string", menu: "filterMode" },
            MAG_MODE: { type: "string", menu: "filterMode" }
        }
    },
    {
        opcode: "Scene_MeshTex_SetWrap",
        blockType: "command",
        text: "Scene [SCENE_ID] model [MODEL] .meshes [IDX] .material .setWrap([NAME], [MODE])",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" },
            IDX: { type: "number", defaultValue: 0 },
            NAME: { type: "string", menu: "pbrTexMenu" },
            MODE: { type: "string", menu: "wrapMode" }
        }
    },
    {
        opcode: "Scene_MeshGetParam",
        blockType: "reporter",
        text: "Scene [SCENE_ID] model [MODEL] .meshes[IDX] .material .get([PARAM])",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" },
            IDX: { type: "number", defaultValue: 0 },
            PARAM: { type: "string", menu: "pbrParamMenu" }
        }
    },
    {
        opcode: "Scene_MeshGetLightmapParam",
        blockType: "reporter",
        text: "Scene [SCENE_ID] model [MODEL] .meshes[IDX] .getLightmap([PARAM])",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" },
            IDX: { type: "number", defaultValue: 0 },
            PARAM: { type: "string", menu: "lightmapParamMenu" }
        }
    },
    {
        opcode: "Scene_MeshGetLightmapScaleOffsetComp",
        blockType: "reporter",
        text: "Scene [SCENE_ID] model [MODEL] .meshes[IDX] .material .lightmapScaleOffset .[COMP]",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" },
            IDX: { type: "number", defaultValue: 0 },
            COMP: { type: "string", menu: "v4CompMenu" }
        }
    },
    {
        opcode: "Scene_MeshDraw",
        blockType: "command",
        text: "Scene [SCENE_ID] model [MODEL] .meshes[IDX] .vao .draw([MODE])",
        arguments: {
            SCENE_ID: { type: "string", defaultValue: "Main" },
            MODEL: { type: "string", defaultValue: "sample" },
            IDX: { type: "number", defaultValue: 0 },
            MODE: { type: "string", menu: "drawMode" }
        }
    },
    
    "---", "---",
];