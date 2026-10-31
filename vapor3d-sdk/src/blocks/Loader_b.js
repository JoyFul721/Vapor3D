export const LoaderBlocks = [
    { blockType: "label", text: "GLB Loader" },
    {
        opcode: "Loader_load_glb",
        blockType: "reporter",
        text: "Loader.loadGLB [U] to Scene [SCENE_INDEX] as [NAME]",
        arguments: {
            U: { type: "string", defaultValue: "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/WaterBottle/glTF-Binary/WaterBottle.glb" },
            SCENE_INDEX: { type: "number", defaultValue: 0 },
            NAME: { type: "string", defaultValue: "sample" }
        }
    },
    {
        opcode: "Loader_apply_lightmap_metadata",
        blockType: "command",
        text: "Loader.applyLightmapMeta [JSON] to Container [CONTAINER_INDEX]",
        arguments: {
            JSON: { type: "string", defaultValue: '{"items":[]}' },
            CONTAINER_INDEX: { type: "number", defaultValue: 0 }
        }
    },

    { blockType: "label", text: "Texture Loader" },
    {
        opcode: "Loader_load_texture_url",
        blockType: "reporter",
        text: "Loader.loadTexture [U] [NAME]",
        arguments: {
            U: { type: "string", defaultValue: "https://example.com/texture.png" },
            NAME: { type: "string", defaultValue: "texURL1" }
        }
    },
    {
        opcode: "Loader_load_texture_costume",
        blockType: "reporter",
        text: "Loader.loadTextureFromCostume [C] [NAME]",
        arguments: {
            C: { type: "string", menu: "costumeMenu" },
            NAME: { type: "string", defaultValue: "texCostume1" }
        }
    },
    {
        opcode: "Loader_load_ktx_url",
        blockType: "reporter",
        text: "Loader.loadKTX [U] [NAME]",
        arguments: {
            U: { type: "string", defaultValue: "https://example.com/env.ktx" },
            NAME: { type: "string", defaultValue: "envMap1" }
        }
    },
    {
        opcode: "Loader_load_hdr_url",
        blockType: "reporter",
        text: "Loader.loadHDR [U] [NAME]",
        arguments: {
            U: { type: "string", defaultValue: "https://example.com/env.hdr" },
            NAME: { type: "string", defaultValue: "lightmap1" }
        }
    },
    "---", "---"
];