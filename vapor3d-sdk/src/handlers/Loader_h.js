export class LoaderHandlers {
    constructor(engineHandlers, sceneHandlers) {
        this.engine = engineHandlers;
        this.sceneHandlers = sceneHandlers;
        this._loader = null;
    }

    _getLoader() {
        if (!this._loader) {
            const { Loader } = require('../lib/Loader.js');
            this._loader = new Loader(this.engine.core.gl);
        }
        return this._loader;
    }

    async Loader_load_glb({ SCENE_ID, NAME, U }) {
        const loader = this._getLoader();
        const targetScene = this.sceneHandlers.scenes.get(SCENE_ID);
        if (!loader || !targetScene) return;

        try {
            const { root, meshNodes } = await loader.loadGLB(U, targetScene, NAME);

            targetScene.addModel(NAME, root, meshNodes);

            console.log(root);

        } catch (e) {
            console.error("Vapor3D: GLB Load Error:", e);
        }
    }

    async Loader_load_texture_url({ NAME, U }) {
        const loader = this._getLoader();
        if (!loader) return;

        try {
            const tex = await loader.loadTexture(U);
            this.engine.textures.set(NAME, tex);
        } catch (e) {
            console.error("Vapor3D: Texture Load Error:", e);
        }
    }

    async Loader_load_texture_costume({ NAME, C }, util) {
        const loader = this._getLoader();
        if (!loader) return;

        const costume = util.target.sprite.costumes.find(c => c.name === C);
        if (costume) {
            try {
                const blob = new Blob([costume.asset.data]);
                const tex = await loader.loadTextureFromSource(blob);
                this.engine.textures.set(NAME, tex);
            } catch (e) {
                console.error("Vapor3D: Costume Load Error:", e);
            }
        }
    }

    async Loader_load_ktx_url({ NAME, U }) {
        const loader = this._getLoader();
        if (!loader) return;

        try {
            const tex = await loader.loadTextureKTX(U);
            this.engine.textures.set(NAME, tex);
        } catch (e) {
            console.error("Vapor3D: KTX Load Error:", e);
        }
    }

    Loader_get_status() {
        return this._loader ? "ready" : "idle";
    }
}