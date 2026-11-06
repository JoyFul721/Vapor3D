import { Shader, VAO, Texture2D, TextureCube, Framebuffer, Utils } from '../lib/index.js';

export class EngineHandlers {
    constructor(Scratch, registry) {
        this.vm = Scratch.vm;
        this.registry = registry;
        this.core = null;
        this.activeShader = null;

        this.scene = null;

        // 存储 name -> index 映射，用于 Inspector 查询
        this.shadersMap = new Map();
        this.vaosMap = new Map();
        this.texturesMap = new Map();
        this.fbosMap = new Map();
        this.stencilBuffersMap = new Map();
    }


    tex_getCostumes() {
        try {
            const target = this.vm.runtime.getEditingTarget();
            if (!target || !target.getCostumes) return ["NONE"];
            return target.getCostumes().map(c => c.name);
        } catch (e) {
            return ["NONE"];
        }
    }

    getAllLists() {
        try {
            const stage = this.vm.runtime.getTargetForStage();
            const editingTarget = this.vm.editingTarget || stage;
            const lists = ["NONE"];

            if (editingTarget && editingTarget.variables) {
                Object.values(editingTarget.variables)
                    .filter(v => v.type === 'list')
                    .forEach(v => lists.push(v.name));
            }
            if (stage && stage !== editingTarget && stage.variables) {
                Object.values(stage.variables)
                    .filter(v => v.type === 'list')
                    .forEach(v => {
                        if (!lists.includes(v.name)) lists.push(v.name);
                    });
            }
            return lists;
        } catch (e) {
            return ["NONE"];
        }
    }

    getListData(name) {
        // 还是无法获取私有列表数据
        const stage = this.vm.runtime.getTargetForStage();
        const target = this.vm.editingTarget;
        const list = Object.values(target?.variables || {}).find(v => v.type === 'list' && v.name === name)
            || Object.values(stage?.variables || {}).find(v => v.type === 'list' && v.name === name);
        return list?.value ?? null;
    }


    gl_Init() {
        if (this.core) return;
        const { Core } = require('../lib/Engine/Core.js');
        this.core = new Core();
        const mainCanvas = this.vm.renderer.canvas;
        if (mainCanvas && mainCanvas.parentElement) {
            mainCanvas.after(this.core.canvas);
            this.core.resize(mainCanvas.width, mainCanvas.height);
        }
    }

    gl_ResetResources() {
        for (const map of [this.shadersMap, this.vaosMap, this.texturesMap, this.fbosMap, this.stencilBuffersMap]) {
            map.clear();
        }
        this.activeShader = null;
        this.scene?.Scene_ClearAll();
        this.registry?.clear?.();
    }

    gl_Present() {
        if (!this.core) return;
        this.core.resize(this.vm.renderer.canvas.width, this.vm.renderer.canvas.height);
    }

    // Shader
    Shader_Create({ NAME, VS, FS }) {
        if (!this.core) return -1;
        const shader = new Shader(this.core.gl, VS, FS);
        if (!shader.program) return -1;
        const index = this.registry.allocate('shaders', shader);
        this.shadersMap.set(NAME, index);
        return index;
    }
    Shader_Use({ INDEX }) {
        const shader = this.registry.get('shaders', INDEX);
        if (!shader) return;
        shader.use();
        this.activeShader = shader;
    }
    Shader_SetMat4({ INDEX, NAME, VAL }, util) {
        const shader = this.registry.get('shaders', INDEX);
        if (!shader) return;
        const mat = Utils.parseInput(VAL, util);
        if (mat) shader.setMat4(NAME, ArrayBuffer.isView(mat) ? mat : new Float32Array(mat));
    }
    Shader_SetVec4({ INDEX, NAME, X, Y, Z, W }) {
        const shader = this.registry.get('shaders', INDEX);
        if (!shader) return;
        shader.setVec4(NAME, X, Y, Z, W);
    }
    Shader_SetVec3({ INDEX, NAME, X, Y, Z }) {
        const shader = this.registry.get('shaders', INDEX);
        if (!shader) return;
        shader.setVec3(NAME, X, Y, Z);
    }
    Shader_SetVec2({ INDEX, NAME, X, Y }) {
        const shader = this.registry.get('shaders', INDEX);
        if (!shader) return;
        shader.setVec2(NAME, X, Y);
    }
    Shader_SetFloat({ INDEX, NAME, V }) {
        const shader = this.registry.get('shaders', INDEX);
        if (!shader) return;
        shader.setFloat(NAME, V);
    }
    Shader_SetInt({ INDEX, NAME, V }) {
        const shader = this.registry.get('shaders', INDEX);
        if (!shader) return;
        shader.setInt(NAME, V);
    }
    Shader_SetBool({ INDEX, NAME, V }) {
        const shader = this.registry.get('shaders', INDEX);
        if (!shader) return;
        shader.setInt(NAME, Boolean(Number(V)) ? 1 : 0);
    }

    // Framebuffer
    FBO_Create({ NAME }) {
        if (!this.core) return -1;
        const fbo = new Framebuffer(this.core.gl);
        const index = this.registry.allocate('fbos', fbo);
        this.fbosMap.set(NAME, index);
        return index;
    }
    FBO_AttachTexture({ INDEX, TEX, SLOT }) {
        const fbo = this.registry.get('fbos', INDEX);
        const tex = this.registry.get('textures', TEX);
        if (!fbo || !tex) return;
        fbo.attachTexture(tex, SLOT);
    }
    FBO_AttachCubeTexture({ INDEX, TEX, FACE_INDEX, SLOT }) {
        const fbo = this.registry.get('fbos', INDEX);
        const tex = this.registry.get('textures', TEX);
        if (!fbo || !(tex instanceof TextureCube)) return;
        fbo.attachCubeFace(tex, FACE_INDEX, SLOT);
    }
    FBO_Detach({ INDEX, SLOT }) {
        const fbo = this.registry.get('fbos', INDEX);
        if (!fbo) return;
        fbo.detach(SLOT);
    }

    Stencil_Create({ NAME, W, H }) {
        if (!this.core) return -1;
        const gl = this.core.gl;
        const rb = gl.createRenderbuffer();
        if (!rb) return -1;
        gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.STENCIL_INDEX8, W, H);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        const index = this.registry.allocate('stencilBuffers', { id: rb, width: W, height: H });
        this.stencilBuffersMap.set(NAME, index);
        return index;
    }
    FBO_AttachStencil({ INDEX, STENCIL_INDEX }) {
        const fbo = this.registry.get('fbos', INDEX);
        const stencil = this.registry.get('stencilBuffers', STENCIL_INDEX);
        if (!fbo || !stencil) return;
        fbo.attachStencilBuffer(stencil);
    }
    FBO_DetachStencil({ INDEX }) {
        const fbo = this.registry.get('fbos', INDEX);
        if (!fbo) return;
        fbo.detachStencilBuffer();
    }
    FBO_Bind({ INDEX }) {
        if (!this.core) return;
        const fbo = this.registry.get('fbos', INDEX);
        if (fbo) fbo.bind(this.core.canvas.width, this.core.canvas.height);
        else Framebuffer.bindScreen(this.core.gl, this.core.canvas.width, this.core.canvas.height);
    }

    // VAO
    VAO_CreateEmpty({ NAME }) {
        if (!this.core) return -1;
        const index = this.registry.allocate('vaos', new VAO(this.core.gl));
        this.vaosMap.set(NAME, index);
        return index;
    }
    VAO_AddBuffer({ INDEX, LIST, LOC, SIZE, TYPE = "GL_FLOAT" }) {
        const vao = this.registry.get('vaos', INDEX);
        if (!vao) return console.warn(`Vapor3D: VAO ${INDEX} not found`);

        const listData = this.getListData(LIST);
        if (!listData?.length) return console.warn(`Vapor3D: List "${LIST}" is empty or not found`);
        if (!Number.isInteger(SIZE) || SIZE < 1) return console.error(`Vapor3D: Invalid SIZE=${SIZE}`);
        if (listData.length % SIZE !== 0) return console.error(`Vapor3D: ${listData.length} items cannot be divided evenly by SIZE=${SIZE}`);

        const typeInfo = Utils.getGLTypeConfig(vao.gl, TYPE);
        if (!typeInfo) return console.error(`Vapor3D: Invalid TYPE="${TYPE}"`);

        const numbers = listData.map(Number);
        if (numbers.some(v => !Number.isFinite(v))) return console.error(`Vapor3D: List "${LIST}" contains invalid numbers`);

        // 范围检查
        if (typeInfo.integer) {
            const bad = numbers.find(v => v < typeInfo.min || v > typeInfo.max);
            if (bad !== undefined) return console.error(`Vapor3D: Value ${bad} out of range for ${TYPE} (${typeInfo.min}..${typeInfo.max})`);
        }

        // 整数类型截断小数
        const values = typeInfo.integer ? numbers.map(v => Math.trunc(v)) : numbers;
        const dataArray = new typeInfo.ArrayType(values);
        vao.addBuffer(dataArray, LOC, SIZE, typeInfo.glType);
    }
    VAO_CreateScreenQuad({ NAME }) {
        if (!this.core) return -1;
        const index = this.registry.allocate('vaos', VAO.createScreenQuad(this.core.gl));
        this.vaosMap.set(NAME, index);
        return index;
    }
    VAO_CreateCube({ NAME }) {
        if (!this.core) return -1;
        const index = this.registry.allocate('vaos', VAO.createCube(this.core.gl));
        this.vaosMap.set(NAME, index);
        return index;
    }
    VAO_CreateSphere({ NAME, LAT, LON }) {
        if (!this.core) return -1;
        const index = this.registry.allocate('vaos', VAO.createSphere(this.core.gl, LAT, LON));
        this.vaosMap.set(NAME, index);
        return index;
    }
    VAO_Draw({ INDEX, COUNT, MODE }) {
        const vao = this.registry.get('vaos', INDEX);
        if (!vao) return;
        vao.draw(MODE, COUNT);
    }
    VAO_Destroy({ INDEX }) {
        const vao = this.registry.get('vaos', INDEX);
        if (!vao) return;
        vao.destroy?.();
        this.registry.vaos[Number(INDEX)] = null;
        for (const [name, value] of this.vaosMap) if (value === Number(INDEX)) this.vaosMap.delete(name);
    }

    // Texture
    // Scene 中的贴图也可用这类积木
    Texture_CreateEmpty({ NAME, W, H, FORMAT }) {
        if (!this.core) return -1;
        const conf = Utils.getFormatConfig(this.core.gl, FORMAT);
        const tex = new Texture2D(this.core.gl);
        tex.uploadEmpty(W, H, conf.internal, conf.format, conf.type);
        const index = this.registry.allocate('textures', tex);
        this.texturesMap.set(NAME, index);
        return index;
    }
    Texture_CreateEmptyCubemap({ NAME, SIZE, FORMAT }) {
        if (!this.core) return -1;
        const conf = Utils.getFormatConfig(this.core.gl, FORMAT);
        const tex = new TextureCube(this.core.gl);
        tex.uploadEmpty(SIZE, conf.internal, conf.format, conf.type);
        const index = this.registry.allocate('textures', tex);
        this.texturesMap.set(NAME, index);
        return index;
    }
    Texture_UpdateFromList({ INDEX, LIST, TYPE }) {
        const texture = this.registry.get('textures', INDEX);
        if (!texture) return;
        const list = this.getListData(LIST);
        if (!list) return;
        texture.updateFromList(list, TYPE);
    }
    Texture_Bind({ INDEX, UNIT }) {
        const tex = this.registry.get('textures', INDEX);
        if (!tex) return;
        tex.bind(UNIT);
    }
    Texture_BindCube({ INDEX, UNIT }) {
        const tex = this.registry.get('textures', INDEX);
        if (!tex) return;
        tex.bind(UNIT);
    }
    Texture_SetFilter({ INDEX, MIN_MODE, MAG_MODE }) {
        const tex = this.registry.get('textures', INDEX);
        if (!tex) return;
        tex.setFilter(MIN_MODE, MAG_MODE);
    }
    Texture_SetWrap({ INDEX, MODE }) {
        const tex = this.registry.get('textures', INDEX);
        if (!tex) return;
        tex.setWrap('S', MODE);
        tex.setWrap('T', MODE);
    }
    Texture_GenerateMipmap({ INDEX }) {
        const tex = this.registry.get('textures', INDEX);
        if (!tex) return;
        tex.generateMipmap();
    }

    // GL state
    gl_Clear({ BIT }) {
        if (!this.core) return;
        this.core.clear(BIT);
    }
    gl_SetClearColor({ R, G, B, A }) {
        if (!this.core) return;
        this.core.setClearColor(R, G, B, A);
    }
    ST_Enable({ CAP }) {
        if (!this.core) return;
        this.core.enable(CAP);
    }
    ST_Disable({ CAP }) {
        if (!this.core) return;
        this.core.disable(CAP);
    }
    ST_CullFace({ MODE }) {
        if (!this.core) return;
        this.core.cullFace(MODE);
    }
    ST_ColorMask({ STATE }) {
        if (!this.core) return;
        const b = STATE === 'true';
        this.core.colorMask(b, b, b, b);
    }
    ST_BlendFuncSeparate({ SRGB, DRGB, SA, DA }) {
        if (!this.core) return;
        this.core.blendFuncSeparate(SRGB, DRGB, SA, DA);
    }
    ST_DepthMask({ STATE }) {
        if (!this.core) return;
        this.core.depthMask(STATE === 'true');
    }
    ST_DepthFunc({ FUNC }) {
        if (!this.core) return;
        this.core.depthFunc(FUNC);
    }
    ST_StencilMask({ MASK }) {
        if (!this.core) return;
        this.core.stencilMask(parseInt(MASK) || 0xFF);
    }
    ST_StencilOp({ FACE, SF, DF, DP }) {
        if (!this.core) return;
        this.core.stencilOp(FACE, SF, DF, DP);
    }
    ST_StencilFunc({ FACE, FUNC, REF, MASK }) {
        if (!this.core) return;
        this.core.stencilFunc(FACE, FUNC, parseInt(REF) || 0, parseInt(MASK) || 0xFF);
    }
}