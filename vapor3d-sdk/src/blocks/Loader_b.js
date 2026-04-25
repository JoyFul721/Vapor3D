export const LoaderBlocks = [
    { blockType: "label", text: "GLB Loader" },
    {
        opcode: "Loader_load_glb",
        blockType: "command",
        text: "Loader.loadGLB([U]) to Scene [SCENE_ID] as [NAME]",
        arguments: {
            U: {
                type: "string",
                defaultValue: "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/WaterBottle/glTF-Binary/WaterBottle.glb"
            },
            SCENE_ID: { type: "string", defaultValue: "Main" },
            NAME: { type: "string", defaultValue: "sampleModel" }
        }
    },

    { blockType: "label", text: "Texture Loader" },
    {
        opcode: "Loader_load_texture_url",
        blockType: "command",
        text: "Loader.loadTexture( [U] , [NAME] )",
        arguments: {
            U: { type: "string", defaultValue: "https://..." },
            NAME: { type: "string", defaultValue: "texURL1" }
        }
    },
    {
        opcode: "Loader_load_texture_costume",
        blockType: "command",
        text: "Loader.loadTextureFromCostume( [C]) , [NAME] )",
        arguments: {
            C: { type: "string", menu: "costumeMenu" },
            NAME: { type: "string", defaultValue: "texCostume1" }
        }
    },
    {
        opcode: "Loader_load_ktx_url",
        blockType: "command",
        text: "Loader.loadKTX( [U]) , [NAME] )",
        arguments: {
            U: { type: "string", defaultValue: "https://..." },
            NAME: { type: "string", defaultValue: "envMap1" }
        }
    },
    "---", "---",
];