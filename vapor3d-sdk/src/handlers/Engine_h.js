import { Shader, VAO, Texture2D, TextureCube, Framebuffer, Utils } from '../lib/index.js';

export class EngineHandlers {
    constructor(Scratch) {
        this.vm = Scratch.vm;
        this.core = null;
        this.shaders = new Map();
        this.vaos = new Map();
        this.textures = new Map();
        this.fbos = new Map();
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


    gl_Init() {
        if (this.core) return;
        const { Core } = require('../lib/Core.js');
        this.core = new Core();
        const mainCanvas = this.vm.renderer.canvas;
        if (mainCanvas && mainCanvas.parentElement) {
            mainCanvas.after(this.core.canvas);
            this.core.resize(mainCanvas.width, mainCanvas.height);
        }
    }

    gl_ResetResources() {
        [this.shaders, this.vaos, this.textures, this.fbos].forEach(map => {
            map.forEach(obj => { if (obj && obj.destroy) obj.destroy(); });
            map.clear();
        });
    }

    gl_Present() {
        if (!this.core) return;
        this.core.resize(this.vm.renderer.canvas.width, this.vm.renderer.canvas.height);
        this.vm.runtime.requestRedraw();
        return new Promise(r => requestAnimationFrame(r));
    }

    Shader_Create({ ID, VS, FS }) {
        const shader = new Shader(this.core.gl, VS, FS);
        if (shader.program) this.shaders.set(ID, shader);
    }
    Shader_Use({ ID }) { this.shaders.get(ID)?.use(); }
    Shader_SetMat4({ ID, NAME, VAL }, util) {
        const mat = Utils.parseInput(VAL, util);
        if (mat) this.shaders.get(ID)?.setMat4(NAME, mat);
    }
    Shader_SetVec4({ ID, NAME, X, Y, Z, W }) { this.shaders.get(ID)?.setVec4(NAME, [Number(X), Number(Y), Number(Z), Number(W)]); }
    Shader_SetVec3({ ID, NAME, X, Y, Z }) { this.shaders.get(ID)?.setVec3(NAME, X, Y, Z); }
    Shader_SetVec2({ ID, NAME, X, Y }) { this.shaders.get(ID)?.setVec2(NAME, X, Y); }
    Shader_SetFloat({ ID, NAME, V }) { this.shaders.get(ID)?.setFloat(NAME, V); }
    Shader_SetInt({ ID, NAME, V }) { this.shaders.get(ID)?.setInt(NAME, V); }
    Shader_SetBool({ ID, NAME, V }) { this.shaders.get(ID)?.setInt(NAME, Boolean(Number(V)) ? 1 : 0); }

    FBO_Create({ ID }) { this.fbos.set(ID, new Framebuffer(this.core.gl)); }
    FBO_AttachTexture({ ID, TEX, SLOT }) {
        const fbo = this.fbos.get(ID);
        const tex = this.textures.get(TEX);
        if (fbo && tex) fbo.attachTexture(tex, SLOT);
    }
    FBO_AttachCubeTexture({ ID, TEX, FACE_INDEX, SLOT }) {
        const fbo = this.fbos.get(ID);
        const tex = this.textures.get(TEX);
        if (fbo && tex instanceof TextureCube) fbo.attachCubeFace(tex, FACE_INDEX, SLOT);
    }
    FBO_Bind({ ID }) {
        const fbo = this.fbos.get(ID);
        if (fbo) fbo.bind(this.core.canvas.width, this.core.canvas.height);
        else Framebuffer.bindScreen(this.core.gl, this.core.canvas.width, this.core.canvas.height);
    }

    VAO_CreateScreenQuad({ ID }) {
        this.vaos.set(ID, VAO.createScreenQuad(this.core.gl));
    }

    VAO_CreateCube({ ID }) {
        this.vaos.set(ID, VAO.createCube(this.core.gl));
    }

    VAO_CreateSphere({ ID, LAT, LON }) {
        this.vaos.set(ID, VAO.createSphere(this.core.gl, LAT, LON));
    }

    VAO_CreateEmpty({ ID }) { this.vaos.set(ID, new VAO(this.core.gl)); }

    VAO_Draw({ ID, COUNT, MODE }) {
        this.vaos.get(ID)?.draw(MODE, COUNT);
    }

    VAO_Destroy({ ID }) { this.vaos.get(ID)?.destroy(); this.vaos.delete(ID); }

    // Texture
    Texture_CreateEmpty({ NAME, W, H, FORMAT }) {
        const conf = Utils.getFormatConfig(this.core.gl, FORMAT);
        const tex = new Texture2D(this.core.gl);
        tex.uploadEmpty(W, H, conf.internal, conf.format, conf.type);
        this.textures.set(NAME, tex);
    }

    Texture_CreateEmptyCubemap({ NAME, SIZE, FORMAT }) {
        const conf = Utils.getFormatConfig(this.core.gl, FORMAT);
        const tex = new TextureCube(this.core.gl);
        tex.uploadEmpty(SIZE, conf.internal, conf.format, conf.type);
        this.textures.set(NAME, tex);
    }

    Texture_Bind({ NAME, UNIT }) { this.textures.get(NAME)?.bind(UNIT); }
    Texture_BindCube({ NAME, UNIT }) { this.textures.get(NAME)?.bind(UNIT); }

    Texture_SetFilter({ NAME, MIN_MODE, MAG_MODE }) {
        const tex = this.textures.get(NAME);
        if (tex) tex.setFilter(MIN_MODE, MAG_MODE);
    }
    Texture_SetWrap({ NAME, MODE }) {
        const tex = this.textures.get(NAME);
        if (tex) {
            tex.setWrap("S", MODE);
            tex.setWrap("T", MODE);
        }
    }
    Texture_GenerateMipmap({ NAME }) {
        this.textures.get(NAME)?.generateMipmap();
    }

    gl_Clear({ BIT }) { this.core?.clear(BIT); }
    gl_SetClearColor({ R, G, B, A }) { this.core?.setClearColor(R, G, B, A); }
    ST_Enable({ CAP }) { this.core?.enable(CAP); }
    ST_Disable({ CAP }) { this.core?.disable(CAP); }
    ST_CullFace({ MODE }) { this.core?.cullFace(MODE); }
    ST_ColorMask({ STATE }) {
        const b = STATE === "true";
        this.core?.colorMask(b, b, b, b);
    }

    ST_BlendFuncSeparate({ SRGB, DRGB, SA, DA }) {
        this.core?.blendFuncSeparate(SRGB, DRGB, SA, DA);
    }

    ST_DepthMask({ STATE }) { this.core?.depthMask(STATE === "true"); }
    ST_DepthFunc({ FUNC }) { this.core?.depthFunc(FUNC); }

    ST_StencilMask({ MASK }) {
        this.core?.stencilMask(parseInt(MASK) || 0xFF);
    }
    ST_StencilOp({ FACE, SF, DF, DP }) {
        this.core?.stencilOp(FACE, SF, DF, DP);
    }
    ST_StencilFunc({ FACE, FUNC, REF, MASK }) {
        this.core?.stencilFunc(FACE, FUNC, parseInt(REF) || 0, parseInt(MASK) || 0xFF);
    }
}