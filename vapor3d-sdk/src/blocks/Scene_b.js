export const SceneBlocks = [
    {
        opcode: "Scene_Create",
        blockType: "reporter",
        text: "new Scene [NAME] [MAXNODES]",
        arguments: {
            NAME: { type: "string", defaultValue: "Main" },
            MAXNODES: { type: "string", defaultValue: "1042"}
        }
    },
    {
        opcode: "Scene_Destroy",
        blockType: "command",
        text: "Scene [INDEX] .destroy",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_Clear",
        blockType: "command",
        text: "Scene [INDEX] .clear",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 }
        }
    },



    { blockType: "label", text: "Node" },
    {
        opcode: "Scene_CreateNode",
        blockType: "reporter",
        text: "new Node [NAME] [SCENE_IDX] [PARENT_NODE_IDX]",
        arguments: {
            SCENE_IDX: { type: "number", defaultValue: 0 },
            NAME: { type: "string", defaultValue: "node" },
            PARENT_NODE_IDX: { type: "number", defaultValue: -1 }
        }
    },
    {
        opcode: "Scene_DestroyNode",
        blockType: "command",
        text: "Node [NODE_IDX] .destroy",
        arguments: {
            NODE_IDX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_NodeSetTRS",
        blockType: "command",
        text: "Node [NODE_IDX] .setTRS [TRS]",
        arguments: {
            NODE_IDX: { type: "number", defaultValue: 0 },
            TRS: { type: "string", defaultValue: "[0,0,0,0,0,0,1,1,1,1]" }
        }
    },
    {
        opcode: "Scene_NodeSetParent",
        blockType: "command",
        text: "Node [CHILD_NODE_IDX] .setParent [PARENT_NODE_IDX]",
        arguments: {
            CHILD_NODE_IDX: { type: "number", defaultValue: 0 },
            PARENT_NODE_IDX: { type: "number", defaultValue: -1 }
        }
    },
    {
        opcode: "Scene_GetNodeMatrix",
        blockType: "reporter",
        text: "Node [NODE_IDX] .worldMatrix",
        arguments: {
            NODE_IDX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_GetNodeTRS",
        blockType: "reporter",
        text: "Node [NODE_IDX] .TRS",
        arguments: {
            NODE_IDX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_UpdateWorldMatrix",
        blockType: "command",
        text: "Scene [INDEX] .update",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 }
        }
    },



    { blockType: "label", text: "Container" },
    {
        opcode: "Scene_GetContainerRootIndex",
        blockType: "reporter",
        text: "Container [INDEX] .rootNodeIndex",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
        }
    },
    {
        opcode: "Scene_GetContainerMeshCount",
        blockType: "reporter",
        text: "Container [INDEX] .meshCount",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_AddContainer",
        blockType: "command",
        text: "Scene [INDEX] .addContainer [CONTAINER_IDX]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            CONTAINER_IDX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_RemoveContainer",
        blockType: "command",
        text: "Scene [INDEX] .removeContainer [CONTAINER_IDX]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            CONTAINER_IDX: { type: "number", defaultValue: 0 }
        }
    },



    { blockType: "label", text: "Skeleton" },
    {
        opcode: "Scene_SkeletonGetJointCount",
        blockType: "reporter",
        text: "Skeleton [INDEX] .jointCount",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_SkeletonGetJoint",
        blockType: "reporter",
        text: "Skeleton [INDEX] .getJoint [NAME] ",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            NAME: { type: "string", defaultValue: "spine" }
        }
    },
    {
        opcode: "Scene_SkeletonBindTexture",
        blockType: "command",
        text: "Skeleton [INDEX] .texture.bind [UNIT]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            UNIT: { type: "number", defaultValue: 0 }
        }
    },



    { blockType: "label", text: "Mesh" },
    {
        opcode: "Scene_MeshDraw",
        blockType: "command",
        text: "MeshNode [INDEX] .draw [MODE]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            MODE: { type: "string", menu: "drawMode" }
        }
    },
    {
        opcode: "Scene_MeshIsVisible",
        blockType: "reporter",
        text: "MeshNode [INDEX] is visible",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_MeshSetVisible",
        blockType: "command",
        text: "MeshNode [NODE_IDX] .setVisible [VISIBLE] recursive [RECURSIVE]",
        arguments: {
            NODE_IDX: { type: "number", defaultValue: 0 },
            VISIBLE: { type: "number", defaultValue: 1 },
            RECURSIVE: { type: "string", menu: "boolMenu" }
        }
    },
    {
        opcode: "Scene_MeshGetMaterial",
        blockType: "reporter",
        text: "MeshNode [INDEX] .material",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_MeshSetMaterial",
        blockType: "command",
        text: "MeshNode [NODE_IDX] .setMaterial [MAT_IDX]",
        arguments: {
            NODE_IDX: { type: "number", defaultValue: 0 },
            MAT_IDX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Scene_MeshGetTexture",
        blockType: "reporter",
        text: "MeshNode [INDEX] .getMaterialTexture [TEX_TYPE]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            TEX_TYPE: { type: "string", menu: "pbrTexMenu" }
        }
    },
    {
        opcode: "Scene_MeshGetParam",
        blockType: "reporter",
        text: "MeshNode [INDEX] .getMaterialParam [PARAM]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            PARAM: {
                type: "string",
                menu: "pbrParamMenu",
                defaultValue: "baseColor"
            }
        }
    },
    {
        opcode: "Scene_MeshGetLightmapParam",
        blockType: "reporter",
        text: "MeshNode [INDEX] .lightmap.parameter [PARAM]",
        arguments: {
            INDEX: { type: "string", defaultValue: "0" },
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
        text: "MeshNode [INDEX] .lightmap.scaleOffset [COMP]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            COMP: {
                type: "string",
                menu: "v4CompMenu",
                defaultValue: "X"
            }
        }
    },



    { blockType: "label", text: "Material" },
    {
        opcode: "Material_Create",
        blockType: "reporter",
        text: "create Material [NAME]",
        arguments: {
            NAME: { type: "string", defaultValue: "Mat"}
        }
    },
    {
        opcode: "Material_GetTexture",
        blockType: "reporter",
        text: "Material [INDEX] .getTexture [TEX_TYPE]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            TEX_TYPE: { type: "string", menu: "pbrTexMenu" }
        }
    },
    {
        opcode: "Material_SetTexture",
        blockType: "command",
        text: "Material [INDEX] .setTexture [TEX_TYPE] [TEX_IDX]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            TEX_TYPE: { type: "string", menu: "pbrTexMenu" },
            TEX_IDX: { type: "number", defaultValue: 0 }
        }
    },
    {
        opcode: "Material_GetParam",
        blockType: "reporter",
        text: "Material [INDEX] .getParam [PARAM]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            PARAM: {
                type: "string",
                menu: "pbrParamMenu",
                defaultValue: "baseColor"
            }
        }
    },
    {
        opcode: "Material_SetParam",
        blockType: "command",
        text: "Material [INDEX] .setParam [PARAM] [VALUE]",
        arguments: {
            INDEX: { type: "number", defaultValue: 0 },
            PARAM: {
                type: "string",
                menu: "pbrParamMenu",
                defaultValue: "baseColor"
            },
            VALUE: { type: "string", defaultValue: "[1,1,1,1]" }
        }
    },

    "---", "---",
];