// /handlers/Loader_h.js

export class LoaderHandlers {
    constructor(engineHandlers, sceneHandlers) {
        this.engine = engineHandlers;
        this.sceneHandlers = sceneHandlers;
        this.registry = engineHandlers.registry;
        this._gltfLoader = null;
        this._castLoader = null;
    }

    _getLoader() {
        if (!this._gltfLoader) {
            const { Loader } = require('../lib/Loader/gltf/Loader.js');
            this._gltfLoader = new Loader(this.engine.core.gl, this.registry);
        }
        return this._gltfLoader;
    }

    _getCastLoader() {
        if (!this._castLoader) {
            const { CastLoader } = require('../lib/Loader/cast/CastLoader.js');
            this._castLoader = new CastLoader(this.engine.core.gl, this.registry);
        }
        return this._castLoader;
    }

    _attachContainer(container, targetScene) {
        if (!container?.rootNode) return -1;
        targetScene.addContainer(container.registryIndex);
        return container.registryIndex;
    }

    async Loader_load_glb({ SCENE_INDEX, NAME, U }) {
        const loader = this._getLoader();
        const targetScene = this.registry.get('scenes', SCENE_INDEX);
        if (!loader || !targetScene) return -2;
        
        try {
            const container = await loader.loadGLB(U, targetScene, NAME);
            const index = this._attachContainer(container, targetScene);
            if (index < 0) return -1;

            console.log(`Vapor3D: AssetContainer "${NAME}" plugged into Scene ${SCENE_INDEX}:`, container);
            return index;
        } catch (e) {
            console.error("Vapor3D: GLB Load Error:", e);
            return -1;
        }
    }

    /**
     * 含 modl 的 cast -> 构建 Container 并挂到 Scene，返回 Container Index
     * 只有 anim 的 cast -> 动画独立注册到 Scene，返回第一个动画的 Registry Index
     */
    async Loader_load_cast({ SCENE_INDEX, NAME, U }) {
        const loader = this._getCastLoader();
        const targetScene = this.registry.get('scenes', SCENE_INDEX);
        if (!loader || !targetScene) return -2;

        try {
            const result = await loader.loadCast(U, targetScene, NAME);
            if (!result) return -1;

            if (result.container) {
                const index = this._attachContainer(result.container, targetScene);
                if (index >= 0) {
                    console.log(`Vapor3D: AssetContainer "${NAME}" plugged into Scene ${SCENE_INDEX}:`, result.container);
                }
                return index;
            }

            for (const index of result.animations) targetScene.addAnimation(index);
            console.log(
                `Vapor3D: ${result.animations.length} animation(s) from "${U}" registered to Scene ${SCENE_INDEX}.`,
            );
            return result.animations[0] ?? -1;
        } catch (e) {
            console.error("Vapor3D: CAST Load Error:", e);
            return -1;
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
        const active = [];
        if (this._gltfLoader) active.push("glb");
        if (this._castLoader) active.push("cast");
        return active.length > 0 ? active.join("+") : "idle";
    }
}