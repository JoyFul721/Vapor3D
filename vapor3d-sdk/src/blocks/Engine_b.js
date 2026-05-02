export const EngineMenus = {
        drawMode: ["TRIANGLES", "TRIANGLE_STRIP", "LINES", "POINTS"],
        pbrTexMenu: ["albedoTex", "normalTex", "ormTex", "emissiveTex"],
        pbrParamMenu: ["roughness", "metalness", "baseColor"],
        boolMenu: ["true", "false"],
        faceMenu: ["FRONT", "BACK", "FRONT_AND_BACK"],


        clearMenu: ["COLOR_BUFFER_BIT", "DEPTH_BUFFER_BIT", "STENCIL_BUFFER_BIT", "ALL"],
        drawMode: ["TRIANGLES", "TRIANGLE_STRIP", "LINES", "POINTS"],
        capMenu: ["DEPTH_TEST", "STENCIL_TEST", "BLEND", "CULL_FACE"],
        axisMenu: ["X", "Y", "Z"],
        v3OpMenu: ["+", "-", "mul"],
        v3CompMenu: ["X", "Y", "Z"],
        costumeMenu: { acceptReporters: true, items: "tex_getCostumes" },
        listMenu: { acceptReporters: true, items: "getAllLists" },
        texTypeMenu: [
                "RGB16F", "RGBA16F", "RGB32F", "RGB8", "RGBA8",
                "R11G11B10F", "R16F", "RG16F", "DEPTH24_STENCIL8", "DEPTH_COMPONENT24"
        ],
        fboSlotMenu: ["COLOR_ATTACHMENT0", "COLOR_ATTACHMENT1", "COLOR_ATTACHMENT2", "COLOR_ATTACHMENT3", "DEPTH_STENCIL_ATTACHMENT", "DEPTH_ATTACHMENT"],
        depthMenu: ["RBO", "TEXTURE", "NONE"],
        filterMode: ["NEAREST", "LINEAR", "NEAREST_MIPMAP_NEAREST", "LINEAR_MIPMAP_NEAREST", "NEAREST_MIPMAP_LINEAR", "LINEAR_MIPMAP_LINEAR"],
        // wrapAxis: ["S", "T"],
        wrapMode: ["REPEAT", "CLAMP_TO_EDGE", "MIRRORED_REPEAT"],
        boolMenu: ["true", "false"],
        funcMenu: ["NEVER", "LESS", "EQUAL", "LEQUAL", "GREATER", "NOTEQUAL", "GEQUAL", "ALWAYS"],
        opMenu: { acceptReporters: true, items: [{ text: "KEEP", value: "KEEP" }, { text: "ZERO", value: "ZERO" }, { text: "REPLACE", value: "REPLACE" }, { text: "INCR", value: "INCR" }, { text: "DECR", value: "DECR" }, { text: "INVERT", value: "INVERT" }, { text: "INCR_WRAP", value: "INCR_WRAP" }, { text: "DECR_WRAP", value: "DECR_WRAP" }] },
        faceMenu: { acceptReporters: true, items: [{ text: "FRONT", value: "FRONT" }, { text: "BACK", value: "BACK" }, { text: "FRONT_AND_BACK", value: "FRONT_AND_BACK" }] },
        blendMenu: ["ZERO", "ONE", "SRC_COLOR", "ONE_MINUS_SRC_COLOR", "DST_COLOR", "ONE_MINUS_DST_COLOR", "SRC_ALPHA", "ONE_MINUS_SRC_ALPHA", "DST_ALPHA", "ONE_MINUS_DST_ALPHA", "CONSTANT_COLOR", "ONE_MINUS_CONSTANT_COLOR"],
        attrMenu: [
                { text: 'position', value: 'position' },
                { text: 'normal', value: 'normal' },
                { text: 'v', value: 'uv' },
                { text: 'tangent', value: 'tangent' },
                { text: 'color', value: 'color' }
        ],
        TRSTypeMenu: { acceptReporters: true, items: [ { text: 'position', value: 'Pos' }, { text: 'rotation', value: 'Rot' }, { text: 'scale', value: 'Scale' } ] },
        AxisMenu: { acceptReporters: true, items: [ { text: 'X', value: 'X' }, { text: 'Y', value: 'Y' }, { text: 'Z', value: 'Z' } ] },
        playModeMenu: {
                acceptReporters: true,
                items: ['loop', 'play once']
        },
        animInfoMenu: {
                acceptReporters: true,
                items: ['current animation name', 'current time', 'duration', 'is playing', 'animation names']
        }
};


export const EngineBlocks = [
        { blockType: "label", text: "Core" },
        { opcode: "gl_Init", blockType: "command", text: "Core.init()" },
        { opcode: "gl_ResetResources", blockType: "command", text: "Core.resetAll()" },
        { opcode: "gl_Present", blockType: "command", text: "Core.updateLayer()" },

        { blockType: "label", text: "Shader" },
        { opcode: "Shader_Create", blockType: "command", text: "new Shader [ID] ([VS], [FS])", arguments: { ID: { type: "string" }, VS: { type: "string" }, FS: { type: "string" } } },
        { opcode: "Shader_Use", blockType: "command", text: "Shader [ID] .use()", arguments: { ID: { type: "string" } } },
        { opcode: "Shader_SetVec2", blockType: "command", text: "Shader [ID] .setVec2([NAME], [X] [Y])", arguments: { ID: { type: "string" }, NAME: { type: "string" }, X: { type: "number" }, Y: { type: "number" } } },
        { opcode: "Shader_SetVec3", blockType: "command", text: "Shader [ID] .setVec3([NAME], [X] [Y] [Z])", arguments: { ID: { type: "string" }, NAME: { type: "string" }, X: { type: "number" }, Y: { type: "number" }, Z: { type: "number" } } },
        { opcode: "Shader_SetVec4", blockType: "command", text: "Shader [ID] .setVec4([NAME], [X], [Y], [Z], [W])", arguments: { ID: { type: "string" }, NAME: { type: "string", defaultValue: "uVec" }, X: { type: "number", defaultValue: 0 }, Y: { type: "number", defaultValue: 0 }, Z: { type: "number", defaultValue: 0 }, W: { type: "number", defaultValue: 0 } } },
        { opcode: "Shader_SetMat4", blockType: "command", text: "Shader [ID] .setMat4([NAME], [VAL])", arguments: { ID: { type: "string" }, NAME: { type: "string" }, VAL: { type: "string" } } },
        { opcode: "Shader_SetFloat", blockType: "command", text: "Shader [ID] .setFloat([NAME], [V])", arguments: { ID: { type: "string" }, NAME: { type: "string" }, V: { type: "number" } } },
        { opcode: "Shader_SetInt", blockType: "command", text: "Shader [ID] .setInt([NAME], [V])", arguments: { ID: { type: "string" }, NAME: { type: "string" }, V: { type: "number" } } },
        { opcode: "Shader_SetBool", blockType: "command", text: "Shader [ID] .setBool([NAME], [V])", arguments: { ID: { type: "string" }, NAME: { type: "string" }, V: { type: "number", defaultValue: 0 } } },

        { blockType: "label", text: "Framebuffer" },
        { opcode: "FBO_Create", blockType: "command", text: "new FBO [ID] ()", arguments: { ID: { type: "string" } } },
        { opcode: "FBO_AttachTexture", blockType: "command", text: "FBO [ID] .attachTexture([TEX], [SLOT])", arguments: { ID: { type: "string" }, TEX: { type: "string" }, SLOT: { type: "string", menu: "fboSlotMenu" } } },
        { opcode: "FBO_AttachCubeTexture", blockType: "command", text: "FBO [ID] .attachCubemap([TEX], Face:[FACE_INDEX], [SLOT])", arguments: { ID: { type: "string" }, TEX: { type: "string" }, FACE_INDEX: { type: "number" }, SLOT: { type: "string", menu: "fboSlotMenu" } } },
        { opcode: "FBO_Bind", blockType: "command", text: "FBO [ID] .bind()", arguments: { ID: { type: "string", defaultValue: "null" } } },

        { blockType: "label", text: "Vertex Array Object" },
        { opcode: "VAO_CreateScreenQuad", blockType: "command", text: "VAO [ID] .setupQuad()", arguments: { ID: { type: "string", defaultValue: "screenQuad" } } },
        { opcode: "VAO_CreateCube", blockType: "command", text: "VAO [ID] .setupCube()", arguments: { ID: { type: "string", defaultValue: "cube" } } },
        { opcode: "VAO_CreateSphere", blockType: "command", text: "VAO [ID] .setupSphere([LAT], [LON])", arguments: { ID: { type: "string", defaultValue: "Sphere" }, LAT: { type: "number", defaultValue: 16 }, LON: { type: "number", defaultValue: 16 } } },
        { opcode: "VAO_Draw", blockType: "command", text: "VAO [ID] .draw(Count:[COUNT], [MODE])", arguments: { ID: { type: "string" }, COUNT: { type: "number", defaultValue: -1 }, MODE: { type: "string", menu: "drawMode" } } },
        { opcode: "VAO_Destroy", blockType: "command", text: "VAO [ID] .destroy()", arguments: { ID: { type: "string" } } },

        { blockType: "label", text: "Texture" },
        { opcode: "Texture_CreateEmpty", blockType: "command", text: "new Texture2D [NAME] ([W], [H], [FORMAT])", arguments: { NAME: { type: "string", defaultValue: "texture2D" }, W: { type: "number", defaultValue: 256 }, H: { type: "number", defaultValue: 256 }, FORMAT: { type: "string", menu: "texTypeMenu" } } },
        { opcode: "Texture_CreateEmptyCubemap", blockType: "command", text: "new TextureCube [NAME] ([SIZE], [FORMAT])", arguments: { NAME: { type: "string", defaultValue: "cubemap" }, SIZE: { type: "number", defaultValue: 256 }, FORMAT: { type: "string", menu: "texTypeMenu" } }},
        { opcode: "Texture_SetFilter", blockType: "command", text: "Texture [NAME] .setFilter([MIN_MODE], [MAG_MODE])", arguments: { NAME: { type: "string" }, MIN_MODE: { type: "string", menu: "filterMode", defaultValue: "LINEAR" }, MAG_MODE: { type: "string", menu: "filterMode", defaultValue: "LINEAR" } }},
        { opcode: "Texture_SetWrap", blockType: "command", text: "Texture [NAME] .setWrap([MODE])", arguments: { NAME: { type: "string" }, MODE: { type: "string", menu: "wrapMode", defaultValue: "REPEAT" } }},
        { opcode: "Texture_GenerateMipmap", blockType: "command", text: "Texture [NAME] .generateMipmap()", arguments: { NAME: { type: "string" } }},
        { opcode: "Texture_Bind", blockType: "command", text: "Texture [NAME] .bind([UNIT])", arguments: { NAME: { type: "string" }, UNIT: { type: "number" } } },
        { opcode: "Texture_BindCube", blockType: "command", text: "TextureCube [NAME] .bind([UNIT])", arguments: { NAME: { type: "string" }, UNIT: { type: "number" } } },

        { blockType: "label", text: "GL States" },
        { opcode: "gl_Clear", blockType: "command", text: "gl.clear([BIT])", arguments: { BIT: { type: "string", menu: "clearMenu" } } },
        { opcode: "gl_SetClearColor", blockType: "command", text: "gl.clearColor([R] [G] [B] [A])", arguments: { R: { type: "number" }, G: { type: "number" }, B: { type: "number" }, A: { type: "number" } } },
        { opcode: "ST_Enable", blockType: "command", text: "gl.enable([CAP])", arguments: { CAP: { type: "string", menu: "capMenu" } } },
        { opcode: "ST_Disable", blockType: "command", text: "gl.disable([CAP])", arguments: { CAP: { type: "string", menu: "capMenu" } } },
        { opcode: "ST_CullFace", blockType: "command", text: "gl.cullFace [MODE]", arguments: { MODE: { type: "string", menu: "faceMenu", defaultValue: "BACK" } } },
        { opcode: "ST_ColorMask", blockType: "command", text: "gl.colorMask [STATE]", arguments: { STATE: { type: "string", menu: "boolMenu" } } },
        { opcode: "ST_BlendFuncSeparate", blockType: "command", text: "gl.blendFuncSeparate [SRGB] [DRGB] [SA] [DA]", arguments: { SRGB: { type: "string", menu: "blendMenu", defaultValue: "ONE" }, DRGB: { type: "string", menu: "blendMenu", defaultValue: "ONE" }, SA: { type: "string", menu: "blendMenu", defaultValue: "ZERO" }, DA: { type: "string", menu: "blendMenu", defaultValue: "ONE" } } },
        { opcode: "ST_DepthMask", blockType: "command", text: "gl.depthMask [STATE]", arguments: { STATE: { type: "string", menu: "boolMenu", defaultValue: "true" } } },
        { opcode: "ST_DepthFunc", blockType: "command", text: "gl.depthFunc [FUNC]", arguments: { FUNC: { type: "string", menu: "funcMenu", defaultValue: "LESS" } } },
        { opcode: "ST_StencilMask", blockType: "command", text: "gl.stencilMask [MASK]", arguments: { MASK: { type: "number", defaultValue: 255 } } },
        { opcode: "ST_StencilOp", blockType: "command", text: "gl.stencilOp [FACE] fail [SF] zfail [DF] zpass [DP]", arguments: { FACE: { type: "string", menu: "faceMenu", defaultValue: "FRONT_AND_BACK" }, SF: { type: "string", menu: "opMenu", defaultValue: "KEEP" }, DF: { type: "string", menu: "opMenu", defaultValue: "KEEP" }, DP: { type: "string", menu: "opMenu", defaultValue: "KEEP" } } },
        { opcode: "ST_StencilFunc", blockType: "command", text: "gl.stencilFunc [FACE] [FUNC] ref [REF] mask [MASK]", arguments: { FACE: { type: "string", menu: "faceMenu", defaultValue: "FRONT_AND_BACK" }, FUNC: { type: "string", menu: "funcMenu", defaultValue: "ALWAYS" }, REF: { type: "number", defaultValue: 0 }, MASK: { type: "number", defaultValue: 255 } } },
        
        "---", "---",
];