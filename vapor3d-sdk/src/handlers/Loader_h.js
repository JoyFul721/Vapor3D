// /handlers/Loader_h.js

export class LoaderHandlers {
    constructor(engineHandlers, sceneHandlers) {
        this.engine = engineHandlers;
        this.sceneHandlers = sceneHandlers;
        this.registry = engineHandlers.registry;
        this._loader = null;
    }

    _getLoader() {
        if (!this._loader) {
            const { Loader } = require('../lib/Loader/Loader.js');
            this._loader = new Loader(this.engine.core.gl, this.registry);
        }
        return this._loader;
    }

    async Loader_load_glb({ SCENE_INDEX, NAME, U }) {
        const loader = this._getLoader();
        const targetScene = this.registry.get('scenes', SCENE_INDEX);
        if (!loader || !targetScene) return;

        try {
            const container = await loader.loadGLB(U, targetScene, NAME);
            if (!container?.rootNode) return;

            targetScene.addContainer(container.registryIndex);

            console.log(`Vapor3D: AssetContainer "${NAME}" plugged into Scene ${SCENE_INDEX}:`, container);
        } catch (e) {
            console.error("Vapor3D: GLB Load Error:", e);
        }
    }

    async Loader_apply_lightmap_metadata({ SCENE_INDEX, CONTAINER_INDEX, JSON }) {
        const loader = this._getLoader();
        const container = this.registry.get('containers', CONTAINER_INDEX);
        if (!loader || !container) return;

        const count = loader.applyLightmapMetadata(container, JSON);
        if (count > 0) {
            console.log(`Vapor3D: Loader applied lightmap metadata to ${count} meshes.`);
        }
    }

    async Loader_load_texture_url({ NAME, U }) {
        const loader = this._getLoader();
        if (!loader) return -1;
        try {
            const tex = await loader.loadTexture(U);
            const index = this.registry.allocate('textures', tex);
            this.engine.texturesMap.set(NAME, index);
            return index;
        } catch (e) {
            console.error("Vapor3D: Texture Load Error:", e);
            return -1;
        }
    }

    async Loader_load_texture_costume({ NAME, C }, util) {
        const loader = this._getLoader();
        if (!loader) return -1;
        const costume = util.target.sprite.costumes.find(c => c.name === C);
        if (!costume) return -1;
        try {
            const tex = await loader.loadTextureFromSource(new Blob([costume.asset.data]));
            const index = this.registry.allocate('textures', tex);
            this.engine.texturesMap.set(NAME, index);
            return index;
        } catch (e) {
            console.error("Vapor3D: Costume Load Error:", e);
            return -1;
        }
    }

    async Loader_load_ktx_url({ NAME, U }) {
        const loader = this._getLoader();
        if (!loader) return -1;
        try {
            const tex = await loader.loadTextureKTX(U);
            const index = this.registry.allocate('textures', tex);
            this.engine.texturesMap.set(NAME, index);
            return index;
        } catch (e) {
            console.error("Vapor3D: KTX Load Error:", e);
            return -1;
        }
    }

    async Loader_load_hdr_url({ NAME, U }) {
        const loader = this._getLoader();
        if (!loader) return -1;
        try {
            const tex = await loader.loadHDRTexture(U);
            const index = this.registry.allocate('textures', tex);
            this.engine.texturesMap.set(NAME, index);
            return index;
        } catch (e) {
            console.error("Vapor3D: HDR Load Error:", e);
            return -1;
        }
    }

    Loader_get_status() {
        return this._loader ? "ready" : "idle";
    }
}