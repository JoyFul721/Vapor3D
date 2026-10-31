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
        // this.vm.runtime.requestRedraw();
        // return new Promise(r => requestAnimationFrame(r)); // 这个可以蹭到 scratch vm 的锁帧效果
        // 但是，对于性能不够无法上 60 帧的项目，取消注释后会进入挂起死循环，整个编辑器未响应
    }

    // Shader
    Shader_Create({ NAME, VS, FS }) {
        const shader = new Shader(this.core.gl, VS, FS);
        if (!shader.program) return -1;
        const index = this.registry.allocate('shaders', shader);
        this.shadersMap.set(NAME, index);
        return index;
    }
    Shader_Use({ Index }) {
        const shader = this.registry.get('shaders', Index);
        if (shader) { shader.use(); this.activeShader = shader; }
    }
    Shader_SetMat4({ Index, NAME, VAL }, util) {
        const shader = this.registry.get('shaders', Index);
        if (!shader) return;
        const mat = Utils.parseInput(VAL, util);
        if (mat) shader.setMat4(NAME, ArrayBuffer.isView(mat) ? mat : new Float32Array(mat));
    }
    Shader_SetVec4({ Index, NAME, X, Y, Z, W }) { this.registry.get('shaders', Index)?.setVec4(NAME, X, Y, Z, W); }
    Shader_SetVec3({ Index, NAME, X, Y, Z }) { this.registry.get('shaders', Index)?.setVec3(NAME, X, Y, Z); }
    Shader_SetVec2({ Index, NAME, X, Y }) { this.registry.get('shaders', Index)?.setVec2(NAME, X, Y); }
    Shader_SetFloat({ Index, NAME, V }) { this.registry.get('shaders', Index)?.setFloat(NAME, V); }
    Shader_SetInt({ Index, NAME, V }) { this.registry.get('shaders', Index)?.setInt(NAME, V); }
    Shader_SetBool({ Index, NAME, V }) { this.registry.get('shaders', Index)?.setInt(NAME, Boolean(Number(V)) ? 1 : 0); }

    // Framebuffer
    FBO_Create({ NAME }) {
        const fbo = new Framebuffer(this.core.gl);
        const index = this.registry.allocate('fbos', fbo);
        this.fbosMap.set(NAME, index);
        return index;
    }
    FBO_AttachTexture({ Index, TEX, SLOT }) {
        const fbo = this.registry.get('fbos', Index);
        const tex = this.registry.get('textures', TEX);
        if (fbo && tex) fbo.attachTexture(tex, SLOT);
    }
    FBO_AttachCubeTexture({ Index, TEX, FACE_INDEX, SLOT }) {
        const fbo = this.registry.get('fbos', Index);
        const tex = this.registry.get('textures', TEX);
        if (fbo && tex instanceof TextureCube) fbo.attachCubeFace(tex, FACE_INDEX, SLOT);
    }
    FBO_Detach({ Index, SLOT }) { this.registry.get('fbos', Index)?.detach(SLOT); }

    Stencil_Create({ NAME, W, H }) {
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
    FBO_AttachStencil({ Index, STENCIL_INDEX }) {
        const fbo = this.registry.get('fbos', Index);
        const stencil = this.registry.get('stencilBuffers', STENCIL_INDEX);
        if (fbo && stencil) fbo.attachStencilBuffer(stencil);
    }
    FBO_DetachStencil({ Index }) { this.registry.get('fbos', Index)?.detachStencilBuffer(); }
    FBO_Bind({ Index }) {
        const fbo = this.registry.get('fbos', Index);
        if (fbo) fbo.bind(this.core.canvas.width, this.core.canvas.height);
        else Framebuffer.bindScreen(this.core.gl, this.core.canvas.width, this.core.canvas.height);
    }

    // VAO
    VAO_CreateEmpty({ NAME }) {
        const index = this.registry.allocate('vaos', new VAO(this.core.gl));
        this.vaosMap.set(NAME, index);
        return index;
    }
    VAO_AddBuffer({ Index, LIST, LOC, SIZE }) {
        const vao = this.registry.get('vaos', Index);
        if (!vao) return console.warn(`Vapor3D: VAO ${Index} not found`);

        const listData = this.getListData(LIST);
        if (!listData?.length) return console.warn(`Vapor3D: List "${LIST}" is empty or not found`);
        if (!Number.isInteger(SIZE) || SIZE < 1) return console.error(`Vapor3D: Invalid SIZE=${SIZE}`);
        if (listData.length % SIZE !== 0) return console.error(`Vapor3D: ${listData.length} items cannot be divided evenly by SIZE=${SIZE}`);
        const dataArray = new Float32Array(listData.map(Number));
        if (dataArray.some(v => !Number.isFinite(v))) return console.error(`Vapor3D: List "${LIST}" contains invalid numbers`);
        vao.addBuffer(dataArray, LOC, SIZE);
    }
    VAO_CreateScreenQuad({ NAME }) {
        const index = this.registry.allocate('vaos', VAO.createScreenQuad(this.core.gl));
        this.vaosMap.set(NAME, index);
        return index;
    }
    VAO_CreateCube({ NAME }) {
        const index = this.registry.allocate('vaos', VAO.createCube(this.core.gl));
        this.vaosMap.set(NAME, index);
        return index;
    }
    VAO_CreateSphere({ NAME, LAT, LON }) {
        const index = this.registry.allocate('vaos', VAO.createSphere(this.core.gl, LAT, LON));
        this.vaosMap.set(NAME, index);
        return index;
    }
    VAO_Draw({ Index, COUNT, MODE }) { this.registry.get('vaos', Index)?.draw(MODE, COUNT); }
    VAO_Destroy({ Index }) {
        const vao = this.registry.get('vaos', Index);
        if (!vao) return;
        vao.destroy?.();
        this.registry.vaos[Number(Index)] = null;
        for (const [name, value] of this.vaosMap) if (value === Number(Index)) this.vaosMap.delete(name);
    }

    // Texture
    // Scene 中的贴图也可用这类积木
    Texture_CreateEmpty({ NAME, W, H, FORMAT }) {
        const conf = Utils.getFormatConfig(this.core.gl, FORMAT);
        const tex = new Texture2D(this.core.gl);
        tex.uploadEmpty(W, H, conf.internal, conf.format, conf.type);
        const index = this.registry.allocate('textures', tex);
        this.texturesMap.set(NAME, index);
        return index;
    }
    Texture_CreateEmptyCubemap({ NAME, SIZE, FORMAT }) {
        const conf = Utils.getFormatConfig(this.core.gl, FORMAT);
        const tex = new TextureCube(this.core.gl);
        tex.uploadEmpty(SIZE, conf.internal, conf.format, conf.type);
        const index = this.registry.allocate('textures', tex);
        this.texturesMap.set(NAME, index);
        return index;
    }
    Texture_UpdateFromList({ Index, LIST, TYPE }) {
        const texture = this.registry.get('textures', Index);
        if (!texture) return console.warn(`Vapor3D: Texture ${Index} not found`);
        const list = this.getListData(LIST);
        if (!list) return console.warn(`Vapor3D: List "${LIST}" not found`);
        texture.updateFromList(list, TYPE);
    }
    Texture_Bind({ Index, UNIT }) { this.registry.get('textures', Index)?.bind(UNIT); }
    Texture_BindCube({ Index, UNIT }) { this.registry.get('textures', Index)?.bind(UNIT); }
    Texture_SetFilter({ Index, MIN_MODE, MAG_MODE }) { this.registry.get('textures', Index)?.setFilter(MIN_MODE, MAG_MODE); }
    Texture_SetWrap({ Index, MODE }) {
        const tex = this.registry.get('textures', Index);
        if (tex) { tex.setWrap('S', MODE); tex.setWrap('T', MODE); }
    }
    Texture_GenerateMipmap({ Index }) { this.registry.get('textures', Index)?.generateMipmap(); }

    // GL state
    gl_Clear({ BIT }) { this.core?.clear(BIT); }
    gl_SetClearColor({ R, G, B, A }) { this.core?.setClearColor(R, G, B, A); }
    ST_Enable({ CAP }) { this.core?.enable(CAP); }
    ST_Disable({ CAP }) { this.core?.disable(CAP); }
    ST_CullFace({ MODE }) { this.core?.cullFace(MODE); }
    ST_ColorMask({ STATE }) {
        const b = STATE === 'true';
        this.core?.colorMask(b, b, b, b);
    }
    ST_BlendFuncSeparate({ SRGB, DRGB, SA, DA }) { this.core?.blendFuncSeparate(SRGB, DRGB, SA, DA); }
    ST_DepthMask({ STATE }) { this.core?.depthMask(STATE === 'true'); }
    ST_DepthFunc({ FUNC }) { this.core?.depthFunc(FUNC); }
    ST_StencilMask({ MASK }) { this.core?.stencilMask(parseInt(MASK) || 0xFF); }
    ST_StencilOp({ FACE, SF, DF, DP }) { this.core?.stencilOp(FACE, SF, DF, DP); }
    ST_StencilFunc({ FACE, FUNC, REF, MASK }) { this.core?.stencilFunc(FACE, FUNC, parseInt(REF) || 0, parseInt(MASK) || 0xFF); }
}