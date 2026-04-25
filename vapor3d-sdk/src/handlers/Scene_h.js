import { Scene } from '../lib/index.js';

export class SceneHandlers {
    constructor(engineHandlers) {
        this.engine = engineHandlers;
        this.scenes = new Map(); // 存储场景实例的 Map
    }

    Scene_Create({ ID }) {
        if (this.scenes.has(ID)) {
            this.scenes.get(ID).destroy();
        }
        this.scenes.set(ID, new Scene(ID));
    }

    Scene_Destroy({ ID }) {
        const scene = this.scenes.get(ID);
        if (scene) {
            scene.destroy();
            this.scenes.delete(ID);
        }
    }

    Scene_Clear(args) {
        const { SCENE_ID } = args || {};

        if (SCENE_ID) {
            const scene = this.scenes.get(SCENE_ID);
            if (scene) {
                scene.destroy();
            }
        } else {
            this.scenes.forEach(scene => {
                if (scene && typeof scene.destroy === 'function') {
                    scene.destroy();
                }
            });
            this.scenes.clear();
        }
    }

    Scene_MeshDraw({ SCENE_ID, MODEL, IDX, MODE }) {
        const scene = this.scenes.get(SCENE_ID);
        const mesh = scene?.getModel(MODEL)?.getMesh(IDX);
        mesh?.vao.draw(MODE);
    }

    Scene_MeshBindTex({ SCENE_ID, MODEL, IDX, TEX_TYPE, UNIT }) {
        const scene = this.scenes.get(SCENE_ID);
        const mesh = scene?.getModel(MODEL)?.getMesh(IDX);
        if (!mesh) return;

        const tex = mesh.material[TEX_TYPE];
        if (tex) {
            tex.bind(UNIT);
        } else {
            const gl = this.engine.core.gl;
            gl.activeTexture(gl.TEXTURE0 + Number(UNIT));
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }

    /**
     * 获取指定场景中某个模型的参数
     */
    Scene_MeshGetParam({ SCENE_ID, MODEL, IDX, PARAM }) {
        const scene = this.scenes.get(SCENE_ID);
        const mesh = scene?.getModel(MODEL)?.getMesh(IDX);

        if (!mesh) return "";
        const val = mesh.material[PARAM];
        return Array.isArray(val) ? JSON.stringify(val) : val;
    }
    Scene_GetMeshCount({ SCENE_ID, MODEL }) {
        const scene = this.scenes.get(SCENE_ID);
        const model = scene?.getModel(MODEL);
        return model ? model.meshes.length : 0;
    }
    Scene_GetMeshName({ SCENE_ID, MODEL, IDX }) {
        const scene = this.scenes.get(SCENE_ID);
        const model = scene?.getModel(MODEL);
        const mesh = model ? model.getMesh(IDX) : null;
        return mesh ? mesh.name : "Null";
    }
}