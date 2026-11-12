// /lib/Scene/Scene.js

import { TransformNode } from '../index.js';

export class Scene {
    constructor(name = 'Main', maxNodes = 8192, registry) {
        this.name = name;
        this.registry = registry;
        this.registryIndex = -1;

        this.maxNodes = maxNodes;
        this.worldMatrixBuffer = new Float32Array(maxNodes * 16);
        this.nodes = [];
        this._freeIndices = [];
        this._nextIndex = 0;

        // name -> Registry Index
        this.containersMap = new Map();
        this.skeletonsMap = new Map();
        this.animationsMap = new Map();
        this.containerIndices = new Set();

        this.registryCache = {
            vaos: new Map(),
            textures: new Map()
        };

        this.root = new TransformNode(`${name}_Root`);
        this.registerNode(this.root);
        this._destroyed = false;
    }

    _get(type, index) {
        return this.registry?.get(type, Number(index)) ?? null;
    }

    _addToMap(map, name, index) {
        if (!name || index == null || index < 0) return;
        if (!map.has(name)) map.set(name, new Set());
        map.get(name).add(index);
    }

    _removeFromMap(map, name, index) {
        const indices = map.get(name);
        if (!indices) return;

        indices.delete(index);
        if (indices.size === 0) map.delete(name);
    }

    // 递归赋值 Node.sceneIndex
    _setNodeSceneIndex(node) {
        if (!node) return;
        node.sceneIndex = this.registryIndex;
        for (const child of node.children ?? []) this._setNodeSceneIndex(child);
    }

    // 递归清空 Node.sceneIndex
    _clearNodeSceneIndex(node) {
        if (!node) return;
        node.sceneIndex = -1;
        for (const child of node.children ?? []) this._clearNodeSceneIndex(child);
    }

    getNodeByIndex(idx) {
        const i = Number(idx);
        return Number.isInteger(i) && i >= 0 && i < this.nodes.length
            ? this.nodes[i] || null
            : null;
    }

    // 挂树
    // 断父 -> 接父 -> 新 sceneIndex -> 分配矩阵 -> Dirty
    attachNode(node, parent = this.root) {
        if (!node || this._destroyed) return false;
        if (!parent) return false;

        // 防跨域
        if (node.worldMatrixIndex !== -1 && node.sceneIndex !== this.registryIndex) {
            return false;
        }

        if (node.parent !== parent) {
            node.parent?.removeChild(node);
            parent.addChild(node);
        }

        this._setNodeSceneIndex(node);
        this.registerNode(node);
        node.setDirty?.();
        return true;
    }

    // 摘树
    // 断父 -> 回收矩阵 -> 清 sceneIndex
    // 只释放 scene 层，注册表索引由 registry.dispose 负责
    detachNode(node) {
        if (!node) return false;
        if (node.worldMatrixIndex === -1 && node.sceneIndex !== this.registryIndex) return false;

        node.parent?.removeChild(node);
        this.unregisterNode(node);
        this._clearNodeSceneIndex(node);
        return true;
    }

    // ====================== MatrixBuffer ======================

    registerNode(node) {
        if (!node) return;

        if (node.worldMatrixIndex === -1) {
            const index = this._freeIndices.length
                ? this._freeIndices.pop()
                : this._nextIndex++;

            node.worldMatrixIndex = index;
            this.nodes[index] = node;
        }

        for (const child of node.children ?? []) {
            this.registerNode(child);
        }
    }

    unregisterNode(node) {
        if (!node) return;

        for (const child of node.children ?? []) {
            this.unregisterNode(child);
        }

        if (node.worldMatrixIndex === -1) return;

        const index = node.worldMatrixIndex;
        this.nodes[index] = null;
        this._freeIndices.push(index);
        node.worldMatrixIndex = -1;
    }

    // ====================== Container ======================

    addContainer(index) {
        const containerIndex = Number(index);
        const container = this._get('containers', containerIndex);

        if (!container || this._destroyed) return false;
        if (this.containerIndices.has(containerIndex)) return true;
        if (!container.rootNode || container.rootNode.worldMatrixIndex !== -1) return false;

        if (!this.attachNode(container.rootNode)) return false;

        // 用于 Inspector 查询
        this.containerIndices.add(containerIndex);
        this._addToMap(this.containersMap, container.name, containerIndex);

        // 递归注册
        if (container.skeletons) {
            for (const skeleton of container.skeletons) {
                skeleton.sceneIndex = this.registryIndex;
                if (skeleton.registryIndex != null && skeleton.registryIndex >= 0) {
                    this._addToMap(this.skeletonsMap, skeleton.name, skeleton.registryIndex);
                }
            }
        }

        for (const [animName, animation] of container.animations) {
            if (animation.registryIndex != null && animation.registryIndex >= 0) {
                this._addToMap(this.animationsMap, animName, animation.registryIndex);
            }
        }

        return true;
    }

    removeContainer(index) {
        const containerIndex = Number(index);
        if (!this.containerIndices.has(containerIndex)) return false;

        const container = this._get('containers', containerIndex);

        if (container?.rootNode) {
            this.detachNode(container.rootNode);

            this._removeFromMap(
                this.containersMap,
                container.name,
                containerIndex
            );

            for (const skeleton of container.skeletons ?? []) {
                skeleton.sceneIndex = -1;
                this._removeFromMap(
                    this.skeletonsMap,
                    skeleton.name,
                    skeleton.registryIndex
                );
            }

            for (const [animName, animation] of container.animations) {
                this._removeFromMap(
                    this.animationsMap,
                    animName,
                    animation.registryIndex
                );
            }
        }

        this.containerIndices.delete(containerIndex);
        return true;
    }

    // 名称可能重复，所以查询结果是 Registry Index 的 Set
    findContainers(name) {
        return this.containersMap.get(name) ?? new Set();
    }

    findSkeletons(name) {
        return this.skeletonsMap.get(name) ?? new Set();
    }

    findAnimations(name) {
        return this.animationsMap.get(name) ?? new Set();
    }


    update(dt) {
        if (this._destroyed) return;

        const identity = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];

        this.root.updateWorldMatrix(
            identity,
            false,
            this.worldMatrixBuffer
        );

        for (const index of this.containerIndices) {
            const container = this._get('containers', index);

            for (const skeleton of container?.skeletons ?? []) {
                skeleton.updateCPU(this.worldMatrixBuffer);
                skeleton.updateGPU();
            }
        }
    }

    // ====================== 资源缓存 ======================

    async getOrCreateTexture(id, creator) {
        let promise = this.registryCache.textures.get(id);

        if (!promise) {
            promise = Promise.resolve().then(creator);
            this.registryCache.textures.set(id, promise);
        }

        return promise;
    }

    async getOrCreateVAO(id, creator) {
        let promise = this.registryCache.vaos.get(id);

        if (!promise) {
            promise = Promise.resolve().then(creator);
            this.registryCache.vaos.set(id, promise);
        }

        return promise;
    }

    async destroy() {
        if (this._destroyed) return;
        this._destroyed = true;

        for (const index of [...this.containerIndices]) {
            this.removeContainer(index);
        }

        this.unregisterNode(this.root);

        const cache = this.registryCache;
        this.registryCache = {
            vaos: new Map(),
            textures: new Map()
        };

        for (const map of [cache.textures, cache.vaos]) {
            const results = await Promise.allSettled(map.values());

            for (const result of results) {
                if (result.status === 'fulfilled') {
                    result.value?.destroy?.();
                }
            }

            map.clear();
        }

        this.containersMap.clear();
        this.skeletonsMap.clear();
        this.animationsMap.clear();
        this.containerIndices.clear();

        this.nodes.length = 0;
        this._freeIndices.length = 0;
        this._nextIndex = 0;
    }
}