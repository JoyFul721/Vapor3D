// /lib/Loader/LoaderBase.js

import { Material } from '../Scene/Model/Material.js';
import { Texture2D } from '../Engine/Textures.js';
import { TransformNode } from '../Scene/Node.js';
import { AssetContainer } from '../Scene/Model/AssetContainer.js';

/**
 * Loaders 共用的模板操作
 */
export class LoaderBase {
    constructor(gl, registry) {
        this.gl = gl;
        this.registry = registry;
        this._textureCache = new Map();
        this._defaultMaterial = null;
    }

    reg(type, obj) {
        const index = this.registry.allocate(type, obj);
        obj.registryIndex = index;
        return index;
    }

    /**
     * 1x1 占位贴图
     */
    getValueTexture(key, r, g, b, a = 255) {
        if (this._textureCache.has(key)) return this._textureCache.get(key);

        const tex = new Texture2D(this.gl);
        tex.uploadData(1, 1, new Uint8Array([r, g, b, a]));
        this.reg('textures', tex);

        this._textureCache.set(key, tex);
        return tex;
    }

    /**
     * 没有材质的 primitive 共用同一个默认材质
     */
    getDefaultMaterial(name) {
        if (this._defaultMaterial) return this._defaultMaterial;

        const mat = new Material();
        mat.name = name ?? 'default';
        mat.baseColor = [1, 1, 1, 1];
        mat.alpha = 1;
        mat.roughness = 1;
        mat.metallic = 0;
        mat.albedoTex = this.getValueTexture('default_white', 255, 255, 255);
        mat.ormTex = this.getValueTexture('default_orm', 255, 255, 0);
        mat.normalTex = this.getValueTexture('default_normal', 128, 128, 255);
        mat.emissiveTex = this.getValueTexture('default_emissive', 0, 0, 0);

        this.reg('materials', mat);
        this._defaultMaterial = mat;
        return mat;
    }

    /**
     * 组装 AssetContainer 根节点、网格列表、骨架、动画表
     */
    buildContainer({ name, rootNode = null, meshes = [], skeletons = [], animations = null }) {
        const modelRoot = rootNode ?? new TransformNode(name);
        if (modelRoot.registryIndex === undefined || modelRoot.registryIndex < 0) {
            this.reg('nodes', modelRoot);
        }

        const container = new AssetContainer(name);
        container.rootNode = modelRoot;
        container.meshes = meshes;
        container.skeletons = skeletons;
        container.animations = animations ?? new Map();

        this.reg('containers', container);
        return container;
    }
}
