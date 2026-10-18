export const SceneBlocks = [
    {
        opcode: "Scene_Create",
        blockType: "reporter",
        text: "new Scene ([NAME])",
        arguments: {
            NAME: { type: "string", defaultValue: "Main" }
        }
    },
    {
        opcode: "Scene_Destroy",
        blockType: "command",
        text: "Scene [Index] .destroy()",
        arguments: {
            Index: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_Clear",
        blockType: "command",
        text: "Scene [Index] .clear()",
        arguments: {
            Index: { type: "number", defaultValue: 0 }
        }
    },


    { blockType: "label", text: "Node" },
    {
        opcode: "Scene_NodeSetTRS",
        blockType: "command",
        text: "Scene [Index] Node [NODE_IDX] set TRS [TRS]",
        arguments: {
            Index: { type: "number", defaultValue: 0 },
            NODE_IDX: { type: "number", defaultValue: 0 },
            TRS: { type: "string", defaultValue: "[0,0,0,0,0,0,1,1,1,1]" }
        }
    },
    {
        opcode: "Scene_NodeSetParent",
        blockType: "command",
        text: "Scene [Index] Node [CHILD_NODE_IDX] parent [PARENT_NODE_IDX]",
        arguments: {
            Index: { type: "number", defaultValue: 0 },
            CHILD_NODE_IDX: { type: "number", defaultValue: 0 },
            PARENT_NODE_IDX: { type: "number", defaultValue: -1 }
        }
    },
    {
        opcode: "Scene_GetNodeMatrix",
        blockType: "reporter",
        text: "Scene [Index] Node [NODE_IDX] world matrix",
        arguments: {
            Index: { type: "number", defaultValue: 0 },
            NODE_IDX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_GetNodeTRS",
        blockType: "reporter",
        text: "Scene [Index] Node [NODE_IDX] TRS",
        arguments: {
            Index: { type: "number", defaultValue: 0 },
            NODE_IDX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_UpdateWorldMatrix",
        blockType: "command",
        text: "Scene [Index] .update()",
        arguments: {
            Index: { type: "number", defaultValue: 0 }
        }
    },

    { blockType: "label", text: "Container" },
    {
        opcode: "Scene_GetContainerRootIndex",
        blockType: "reporter",
        text: "Container [Index] .rootNodeIndex",
        arguments: {
            Index: { type: "number", defaultValue: 0 },
        }
    },
    {
        opcode: "Scene_GetContainerMeshCount",
        blockType: "reporter",
        text: "Container [Index] .meshCount",
        arguments: {
            Index: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_AddContainer",
        blockType: "command",
        text: "Scene [Index] .addContainer [CONTAINER_IDX]",
        arguments: {
            Index: { type: "number", defaultValue: 0 },
            CONTAINER_IDX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_RemoveContainer",
        blockType: "command",
        text: "Scene [Index] .removeContainer [CONTAINER_IDX]",
        arguments: {
            Index: { type: "number", defaultValue: 0 },
            CONTAINER_IDX: { type: "number", defaultValue: 0 }
        }
    },


    { blockType: "label", text: "Skeleton" },
    {
        opcode: "Scene_SkeletonGetJointCount",
        blockType: "reporter",
        text: "Skeleton [Index] .jointCount",
        arguments: {
            Index: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_SkeletonSetJointTRS",
        blockType: "command",
        text: "Skeleton [Index] .joint [JOINT_IDX] .setTRS [TRS]",
        arguments: {
            Index: { type: "number", defaultValue: 0 },
            JOINT_IDX: { type: "number", defaultValue: 0 },
            TRS: { type: "string", defaultValue: "[0,0,0,0,0,0,1,1,1,1]" }
        }
    },
    {
        opcode: "Scene_SkeletonBindTexture",
        blockType: "command",
        text: "Skeleton [Index] .bindTextureUnit [UNIT]",
        arguments: {
            Index: { type: "number", defaultValue: 0 },
            UNIT: { type: "number", defaultValue: 0 }
        }
    },

    { blockType: "label", text: "Mesh" },
    {
        opcode: "Scene_MeshDraw",
        blockType: "command",
        text: "Mesh [Index] draw [MODE]",
        arguments: {
            Index: { type: "number", defaultValue: 0 },
            MODE: { type: "string", menu: "drawMode" }
        }
    },
    {
        opcode: "Scene_MeshGetTexture",
        blockType: "reporter",
        text: "MeshNode [Index] .getTexture [TEX_TYPE]",
        arguments: {
            Index: { type: "number", defaultValue: 0 },
            TEX_TYPE: { type: "string", menu: "pbrTexMenu" }
        }
    },
    {
        opcode: "Scene_MeshGetParam",
        blockType: "reporter",
        text: "MeshNode [Index] .getMaterial [PARAM]",
        arguments: {
            Index: { type: "number", defaultValue: 0 },
            PARAM: { 
                type: "string", 
                menu: "pbrTexMenu",
                defaultValue: "baseColor" }
        }
    },
    {
        opcode: "Scene_MeshGetLightmapParam",
        blockType: "reporter",
        text: "MeshNode [Index] .lightmap.parameter [PARAM]",
        arguments: {
            Index: { type: "string", defaultValue: "0" },
            PARAM: {
                type: "string",
                menu: "lightmapParamMenu",
                defaultValue: "hasLightmap"
            }
        }
    },
    {
        opcode: "Scene_MeshGetLightmapScaleOffsetComp",
        blockType: "reporter",
        text: "MeshNode [Index] .lightmap.scaleOffset [COMP]",
        arguments: {
            Index: { type: "number", defaultValue: 0 },
            COMP: {
                type: "string",
                menu: "v4CompMenu",
                defaultValue: "X"
            }
        }
    },

    "---", "---",
];