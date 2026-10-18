// /lib/Scene/Scene.js
import { TransformNode } from '../index.js';

export class Scene {
    constructor(name = 'Main', maxNodes = 8192, registry) {
        this.name = name;
        this.registry = registry;
        this.registryIndex = -1;

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

    _setNodeSceneIndex(node) { // 给 Node.sceneIndex 赋值
        if (!node) return;
        node.sceneIndex = this.registryIndex;
        for (const child of node.children ?? []) this._setNodeSceneIndex(child);
    }

    getNodeByIndex(idx) {
        const i = Number(idx);
        return Number.isInteger(i) && i >= 0 && i < this.nodes.length
            ? this.nodes[i] || null
            : null;
    }

    registerNode(node) {
        if (!node || node.worldMatrixIndex !== -1) return;

        const index = this._freeIndices.length
            ? this._freeIndices.pop()
            : this._nextIndex++;

        node.worldMatrixIndex = index;
        this.nodes[index] = node;

        for (const child of node.children) {
            this.registerNode(child);
        }
    }

    unregisterNode(node) {
        if (!node || node.worldMatrixIndex === -1) return;

        for (const child of node.children) {
            this.unregisterNode(child);
        }

        const index = node.worldMatrixIndex;
        this.nodes[index] = null;
        this._freeIndices.push(index);
        node.worldMatrixIndex = -1;
    }

    addContainer(index) {
        const containerIndex = Number(index);
        const container = this._get('containers', containerIndex);

        if (!container || this._destroyed) return false;
        if (this.containerIndices.has(containerIndex)) return true;
        if (container.rootNode.worldMatrixIndex !== -1) return false;

        this.root.addChild(container.rootNode);
        this.registerNode(container.rootNode);
        this._setNodeSceneIndex(container.rootNode);

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
        if (container.animations) {
            // Map,后期可能改成数组
            if (container.animations instanceof Map) {
                for (const [animName, animation] of container.animations) {
                    if (animation.registryIndex != null && animation.registryIndex >= 0) {
                        this._addToMap(this.animationsMap, animName, animation.registryIndex);
                    }
                }
            }
            else if (Array.isArray(container.animations)) {
                for (const animation of container.animations) {
                    if (animation.registryIndex != null && animation.registryIndex >= 0) {
                        this._addToMap(this.animationsMap, animation.name, animation.registryIndex);
                    }
                }
            }
        }
        /*
        if (container.meshes) {
            for (const meshNode of container.meshes) {
                if (meshNode.registryIndex != null && meshNode.registryIndex >= 0) {
                    // this._addToMap(this.meshNodesMap, meshNode.name, meshNode.registryIndex);
                }
            }
        }
        */

        return true;
    }

    removeContainer(index) {
        const containerIndex = Number(index);
        if (!this.containerIndices.has(containerIndex)) return false;

        const container = this._get('containers', containerIndex);

        if (container?.rootNode) {
            this.root.removeChild(container.rootNode);
            this.unregisterNode(container.rootNode);

            this._removeFromMap(
                this.containersMap,
                container.name,
                containerIndex
            );

            for (const skeleton of container.skeletons ?? []) {
                skeleton.sceneIndex = null;
                this._removeFromMap(
                    this.skeletonsMap,
                    skeleton.name,
                    skeleton.registryIndex
                );
            }

            for (const animation of container.animations ?? []) {
                this._removeFromMap(
                    this.animationsMap,
                    animation.name,
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
    }
}