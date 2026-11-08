export const EngineMenus = {
        v3OpMenu: ["+", "-", "mul"],
        axisMenu: ["X", "Y", "Z"],
        v3CompMenu: ["X", "Y", "Z"],
        v4CompMenu: ["X", "Y", "Z", "W"],
        boolMenu: ["true", "false"],

        drawMode: ["TRIANGLES", "TRIANGLE_STRIP", "LINES", "POINTS"],
        pbrTexMenu: ["albedoTex", "normalTex", "ormTex", "emissiveTex"],
        pbrParamMenu: ["roughness", "metalness", "baseColor"],
        
        faceMenu: ["FRONT", "BACK", "FRONT_AND_BACK"],
        clearMenu: ["COLOR_BUFFER_BIT", "DEPTH_BUFFER_BIT", "STENCIL_BUFFER_BIT", "ALL"],
        capMenu: ["DEPTH_TEST", "STENCIL_TEST", "BLEND", "CULL_FACE"],      
        costumeMenu: { acceptReporters: true, items: "tex_getCostumes" },
        listMenu: { acceptReporters: true, items: "getAllLists" },
        texTypeMenu: [
                "RGB8", "RGBA8",
                "R16F", "RG16F", "RGB16F", "RGBA16F",
                "R32F", "RGB32F",
                "R11G11B10F",
                "DEPTH_COMPONENT24", "DEPTH24_STENCIL8"
        ],
        texUploadTypeMenu: [
                "RGB8", "RGBA8",
                "R16F", "RG16F", "RGB16F", "RGBA16F",
                "R32F", "RG32F", "RGB32F", "RGBA32F",
                "R11G11B10F"
        ],
        GLTypeMenu: [
                "GL_FLOAT",
                "GL_UNSIGNED_BYTE", "GL_BYTE",
                "GL_UNSIGNED_SHORT", "GL_SHORT",
                "GL_UNSIGNED_INT", "GL_INT"
        ],
        IndexTypeMenu: [
                "GL_UNSIGNED_BYTE",
                "GL_UNSIGNED_SHORT",
                "GL_UNSIGNED_INT"
        ],
        fboSlotMenu: ["COLOR_ATTACHMENT0", "COLOR_ATTACHMENT1", "COLOR_ATTACHMENT2", "COLOR_ATTACHMENT3", "COLOR_ATTACHMENT4", "COLOR_ATTACHMENT5", "DEPTH_STENCIL_ATTACHMENT", "DEPTH_ATTACHMENT"],
        depthMenu: ["RBO", "TEXTURE", "NONE"],
        filterMode: ["NEAREST", "LINEAR", "NEAREST_MIPMAP_NEAREST", "LINEAR_MIPMAP_NEAREST", "NEAREST_MIPMAP_LINEAR", "LINEAR_MIPMAP_LINEAR"],
        // wrapAxis: ["S", "T"],
        wrapMode: ["REPEAT", "CLAMP_TO_EDGE", "MIRRORED_REPEAT"],
        funcMenu: ["NEVER", "LESS", "EQUAL", "LEQUAL", "GREATER", "NOTEQUAL", "GEQUAL", "ALWAYS"],
        opMenu: ["KEEP", "ZERO", "REPLACE", "INCR", "DECR", "INVERT", "INCR_WRAP", "DECR_WRAP"],
        blendMenu: ["ZERO", "ONE", "SRC_COLOR", "ONE_MINUS_SRC_COLOR", "DST_COLOR", "ONE_MINUS_DST_COLOR", "SRC_ALPHA", "ONE_MINUS_SRC_ALPHA", "DST_ALPHA", "ONE_MINUS_DST_ALPHA", "CONSTANT_COLOR", "ONE_MINUS_CONSTANT_COLOR"],
        attrMenu: [
                { text: 'position', value: 'position' },
                { text: 'normal', value: 'normal' },
                { text: 'v', value: 'uv' },
                { text: 'tangent', value: 'tangent' },
                { text: 'color', value: 'color' }
        ],
        TRSTypeMenu: ["Pos", "Rot", "Scale"],
        playModeMenu: ['loop', 'play once'],
        animInfoMenu: ['current animation name', 'current time', 'duration', 'is playing', 'animation names'],
        clipPropMenu: ["startTime", "duration", "weight"],
        clipMode: ["normal", "additive"],
        targetTypeMenu: [
                { text: 'Skeleton', value: 'skeleton' },
                { text: 'Container', value: 'container' }
        ],
        lightmapParamMenu: ["hasLightmap", "lightmapIndex"],

        Inspector_GlobalType: [
                { text: "Shader", value: "shader" },
                { text: "Vao", value: "vao" },
                { text: "Fbo", value: "fbo" },
                { text: "Texture", value: "texture" },
                { text: "Stencil", value: "stencil" },
                { text: "Scene", value: "scene" },
                { text: "Node", value: "node" },
                { text: "Container", value: "container" },
                { text: "Timeline", value: "timeline" }
        ],
        Inspector_SceneType: [
                { text: "Container", value: "container" },
                { text: "Skeleton", value: "skeleton" },
                { text: "Animation", value: "animation" },
                { text: "Mesh", value: "mesh" },
                { text: "Material", value: "material" }
        ],
        Inspector_ContainerType: [
                { text: "Mesh", value: "mesh" },
                { text: "Skeleton", value: "skeleton" },
                { text: "Animation", value: "animation" },
                { text: "Material", value: "material" }
        ],
        Inspector_ContainerArrayType: [
                { text: "Mesh", value: "mesh" },
                { text: "Skeleton", value: "skeleton" }
        ],
};


export const EngineBlocks = [
        { blockType: "label", text: "Core" },
        { opcode: "gl_Init", blockType: "command", text: "Core.init" },
        { opcode: "gl_ResetResources", blockType: "command", text: "Core.resetAll" },
        { opcode: "gl_Present", blockType: "command", text: "Core.updateLayer" },

        { blockType: "label", text: "Shader" },
        { opcode: "Shader_Create", blockType: "reporter", text: "new Shader [NAME] [VS] [FS]", arguments: { NAME: { type: "string" }, VS: { type: "string" }, FS: { type: "string" } } },
        { opcode: "Shader_Use", blockType: "command", text: "Shader [INDEX] .use", arguments: { INDEX: { type: "number" } } },
        { opcode: "Shader_SetVec2", blockType: "command", text: "Shader [INDEX] .setVec2 [NAME] [X] [Y]", arguments: { INDEX: { type: "number" }, NAME: { type: "string" }, X: { type: "number" }, Y: { type: "number" } } },
        { opcode: "Shader_SetVec3", blockType: "command", text: "Shader [INDEX] .setVec3 [NAME] [X] [Y] [Z]", arguments: { INDEX: { type: "number" }, NAME: { type: "string" }, X: { type: "number" }, Y: { type: "number" }, Z: { type: "number" } } },
        { opcode: "Shader_SetVec4", blockType: "command", text: "Shader [INDEX] .setVec4 [NAME] [X] [Y] [Z] [W]", arguments: { INDEX: { type: "number" }, NAME: { type: "string" }, X: { type: "number", defaultValue: 0 }, Y: { type: "number", defaultValue: 0 }, Z: { type: "number", defaultValue: 0 }, W: { type: "number", defaultValue: 0 } } },
        { opcode: "Shader_SetMat4", blockType: "command", text: "Shader [INDEX] .setMat4 [NAME] [VAL]", arguments: { INDEX: { type: "number" }, NAME: { type: "string" }, VAL: { type: "string" } } },
        { opcode: "Shader_SetFloat", blockType: "command", text: "Shader [INDEX] .setFloat [NAME] [V]", arguments: { INDEX: { type: "number" }, NAME: { type: "string" }, V: { type: "number" } } },
        { opcode: "Shader_SetInt", blockType: "command", text: "Shader [INDEX] .setInt [NAME] [V]", arguments: { INDEX: { type: "number" }, NAME: { type: "string" }, V: { type: "number" } } },
        { opcode: "Shader_SetBool", blockType: "command", text: "Shader [INDEX] .setBool [NAME] [V]", arguments: { INDEX: { type: "number" }, NAME: { type: "string" }, V: { type: "number", defaultValue: 0 } } },

        { blockType: "label", text: "Framebuffer" },
        { opcode: "FBO_Create", blockType: "reporter", text: "new FBO [NAME]", arguments: { NAME: { type: "string" } } },
        { opcode: "FBO_Bind", blockType: "command", text: "FBO [INDEX] .bind", arguments: { INDEX: { type: "number", defaultValue: -1 } } },
        { opcode: "FBO_AttachTexture", blockType: "command", text: "FBO [INDEX] .attachTexture [TEX] [SLOT]", arguments: { INDEX: { type: "number" }, TEX: { type: "number" }, SLOT: { type: "string", menu: "fboSlotMenu" } } },
        { opcode: "FBO_AttachCubeTexture", blockType: "command", text: "FBO [INDEX] .attachCubemap [TEX] Face [FACE_INDEX] [SLOT]", arguments: { INDEX: { type: "number" }, TEX: { type: "number" }, FACE_INDEX: { type: "number" }, SLOT: { type: "string", menu: "fboSlotMenu" } } },
        { opcode: "FBO_Detach", blockType: "command", text: "FBO [INDEX] .detach [SLOT]", arguments: { INDEX: { type: "number" }, SLOT: { type: "string", menu: "fboSlotMenu" } } },
        { opcode: "Stencil_Create", blockType: "reporter", text: "new StencilBuffer [NAME] [W] [H]", arguments: { NAME: { type: "string" }, W: { type: "number" }, H: { type: "number" } } },
        { opcode: "FBO_AttachStencil", blockType: "command", text: "FBO [INDEX] .attachStencil [STENCIL_INDEX]", arguments: { INDEX: { type: "number" }, STENCIL_INDEX: { type: "number" } } },
        { opcode: "FBO_DetachStencil", blockType: "command", text: "FBO [INDEX] .detachStencil", arguments: { INDEX: { type: "number" } } },

        { blockType: "label", text: "Vertex Array Object" },
        { opcode: "VAO_CreateEmpty", blockType: "reporter", text: "new VAO [NAME]", arguments: { NAME: { type: "string" } } },
        { opcode: "VAO_CreateScreenQuad", blockType: "reporter", text: "new VAO [NAME] .setupQuad", arguments: { NAME: { type: "string", defaultValue: "screenQuad" } } },
        { opcode: "VAO_CreateCube", blockType: "reporter", text: "new VAO [NAME] .setupCube", arguments: { NAME: { type: "string", defaultValue: "cube" } } },
        { opcode: "VAO_CreateSphere", blockType: "reporter", text: "new VAO [NAME] .setupSphere [LAT] [LON]", arguments: { NAME: { type: "string", defaultValue: "Sphere" }, LAT: { type: "number", defaultValue: 16 }, LON: { type: "number", defaultValue: 16 } } },
        { opcode: "VAO_AddBuffer", blockType: "command", text: "VAO [INDEX] .addBuffer data [LIST] loc [LOC] size [SIZE] type [TYPE]", arguments: { INDEX: { type: "number", defaultValue: 0 }, LIST: { type: "string", menu: "listMenu" }, LOC: { type: "number", defaultValue: 0 }, SIZE: { type: "number", defaultValue: 3 }, TYPE: { type: "string", defaultValue: "GL_FLOAT", menu: "GLTypeMenu" } } },
        { opcode: "VAO_SetIndices", blockType: "command", text: "VAO [INDEX] .setIndices data [LIST] type [TYPE]", arguments: { INDEX: { type: "number", defaultValue: 0 }, LIST: { type: "string", menu: "listMenu" }, TYPE: { type: "string", defaultValue: "GL_UNSIGNED_SHORT", menu: "IndexTypeMenu" } } },
        { opcode: "VAO_Draw", blockType: "command", text: "VAO [INDEX] .draw count [COUNT] mode [MODE]", arguments: { INDEX: { type: "number" }, COUNT: { type: "number", defaultValue: -1 }, MODE: { type: "string", menu: "drawMode" } } },
        { opcode: "VAO_AddInstanceBuffer", blockType: "command", text: "VAO [INDEX] .addInstanceBuffer data [LIST] loc [LOC] size [SIZE] type [TYPE] divisor [DIVISOR]", arguments: { INDEX: { type: "number", defaultValue: 0 }, LIST: { type: "string", menu: "listMenu" }, LOC: { type: "number", defaultValue: 4 }, SIZE: { type: "number", defaultValue: 3 }, TYPE: { type: "string", defaultValue: "GL_FLOAT", menu: "GLTypeMenu" }, DIVISOR: { type: "number", defaultValue: 1 } } },
        { opcode: "VAO_AddInstanceMatrix4", blockType: "command", text: "VAO [INDEX] .addInstanceMatrix4 data [LIST] loc [LOC]", arguments: { INDEX: { type: "number", defaultValue: 0 }, LIST: { type: "string", menu: "listMenu" }, LOC: { type: "number", defaultValue: 4 } } },
        { opcode: "VAO_SetInstanceCount", blockType: "command", text: "VAO [INDEX] .setInstanceCount [COUNT]", arguments: { INDEX: { type: "number", defaultValue: 0 }, COUNT: { type: "number", defaultValue: 1 } } },
        { opcode: "VAO_SetDivisor", blockType: "command", text: "VAO [INDEX] .setDivisor loc [LOC] divisor [DIVISOR]", arguments: { INDEX: { type: "number", defaultValue: 0 }, LOC: { type: "number", defaultValue: 4 }, DIVISOR: { type: "number", defaultValue: 0 } } },
        { opcode: "VAO_DrawInstanced", blockType: "command", text: "VAO [INDEX] .drawInstanced count [COUNT] mode [MODE] instances [INSTANCES]", arguments: { INDEX: { type: "number" }, COUNT: { type: "number", defaultValue: -1 }, MODE: { type: "string", menu: "drawMode" }, INSTANCES: { type: "number", defaultValue: -1 } } },
        { opcode: "VAO_Destroy", blockType: "command", text: "VAO [INDEX] .destroy", arguments: { INDEX: { type: "number" } } },

        { blockType: "label", text: "Texture" },
        { opcode: "Texture_CreateEmpty", blockType: "reporter", text: "new Texture2D [NAME] [W] [H] [FORMAT]", arguments: { NAME: { type: "string", defaultValue: "texture2D" }, W: { type: "number", defaultValue: 256 }, H: { type: "number", defaultValue: 256 }, FORMAT: { type: "string", menu: "texTypeMenu", defaultValue: "RGBA8" } } },
        { opcode: "Texture_CreateEmptyCubemap", blockType: "reporter", text: "new TextureCube [NAME] [SIZE] [FORMAT]", arguments: { NAME: { type: "string", defaultValue: "cubemap" }, SIZE: { type: "number", defaultValue: 256 }, FORMAT: { type: "string", menu: "texTypeMenu", defaultValue: "RGBA8" } } },
        { opcode: "Texture_UpdateFromList", blockType: "command", text: "Texture [INDEX] .updateFromList data [LIST] format [TYPE]", arguments: { INDEX: { type: "number", defaultValue: 0 }, LIST: { type: "string", menu: "listMenu" }, TYPE: { type: "string", menu: "texUploadTypeMenu", defaultValue: "RGBA8" } } },
        { opcode: "Texture_Bind", blockType: "command", text: "Texture [INDEX] .bind [UNIT]", arguments: { INDEX: { type: "number" }, UNIT: { type: "number" } } },
        { opcode: "Texture_BindCube", blockType: "command", text: "TextureCube [INDEX] .bind [UNIT]", arguments: { INDEX: { type: "number" }, UNIT: { type: "number" } } },
        { opcode: "Texture_SetFilter", blockType: "command", text: "Texture [INDEX] .setFilter [MIN_MODE] [MAG_MODE]", arguments: { INDEX: { type: "number" }, MIN_MODE: { type: "string", menu: "filterMode", defaultValue: "LINEAR" }, MAG_MODE: { type: "string", menu: "filterMode", defaultValue: "LINEAR" } } },
        { opcode: "Texture_SetWrap", blockType: "command", text: "Texture [INDEX] .setWrap [MODE]", arguments: { INDEX: { type: "number" }, MODE: { type: "string", menu: "wrapMode", defaultValue: "REPEAT" } } },
        { opcode: "Texture_GenerateMipmap", blockType: "command", text: "Texture [INDEX] .generateMipmap", arguments: { INDEX: { type: "number" } } },

        { blockType: "label", text: "GL States" },
        { opcode: "gl_Clear", blockType: "command", text: "gl.clear [BIT]", arguments: { BIT: { type: "string", menu: "clearMenu" } } },
        { opcode: "gl_SetClearColor", blockType: "command", text: "gl.clearColor [R] [G] [B] [A]", arguments: { R: { type: "number" }, G: { type: "number" }, B: { type: "number" }, A: { type: "number" } } },
        { opcode: "ST_Enable", blockType: "command", text: "gl.enable [CAP]", arguments: { CAP: { type: "string", menu: "capMenu" } } },
        { opcode: "ST_Disable", blockType: "command", text: "gl.disable [CAP]", arguments: { CAP: { type: "string", menu: "capMenu" } } },
        { opcode: "ST_CullFace", blockType: "command", text: "gl.cullFace [MODE]", arguments: { MODE: { type: "string", menu: "faceMenu", defaultValue: "BACK" } } },
        { opcode: "ST_ColorMask", blockType: "command", text: "gl.colorMask [STATE]", arguments: { STATE: { type: "string", menu: "boolMenu" } } },
        { opcode: "ST_BlendFuncSeparate", blockType: "command", text: "gl.blendFuncSeparate [SRGB] [DRGB] [SA] [DA]", arguments: { SRGB: { type: "string", menu: "blendMenu", defaultValue: "ONE" }, DRGB: { type: "string", menu: "blendMenu", defaultValue: "ONE" }, SA: { type: "string", menu: "blendMenu", defaultValue: "ZERO" }, DA: { type: "string", menu: "blendMenu", defaultValue: "ONE" } } },
        { opcode: "ST_DepthMask", blockType: "command", text: "gl.depthMask [STATE]", arguments: { STATE: { type: "string", menu: "boolMenu", defaultValue: "true" } } },
        { opcode: "ST_DepthFunc", blockType: "command", text: "gl.depthFunc [FUNC]", arguments: { FUNC: { type: "string", menu: "funcMenu", defaultValue: "LESS" } } },
        { opcode: "ST_StencilMask", blockType: "command", text: "gl.stencilMask [MASK]", arguments: { MASK: { type: "number", defaultValue: 255 } } },
        { opcode: "ST_StencilOp", blockType: "command", text: "gl.stencilOp [FACE] fail [SF] zfail [DF] zpass [DP]", arguments: { FACE: { type: "string", menu: "faceMenu", defaultValue: "FRONT_AND_BACK" }, SF: { type: "string", menu: "opMenu", defaultValue: "KEEP" }, DF: { type: "string", menu: "opMenu", defaultValue: "KEEP" }, DP: { type: "string", menu: "opMenu", defaultValue: "KEEP" } } },
        { opcode: "ST_StencilFunc", blockType: "command", text: "gl.stencilFunc [FACE] [FUNC] ref [REF] mask [MASK]", arguments: { FACE: { type: "string", menu: "faceMenu", defaultValue: "FRONT_AND_BACK" }, FUNC: { type: "string", menu: "funcMenu", defaultValue: "ALWAYS" }, REF: { type: "number", defaultValue: 0 }, MASK: { type: "number", defaultValue: 255 } } },

        "---", "---"
];
