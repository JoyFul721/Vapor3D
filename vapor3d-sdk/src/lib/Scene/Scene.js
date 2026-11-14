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
        this.materialsMap = new Map();
        this.containerIndices = new Set();

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

    // materials now live on primitives, so every walk goes through node.mesh.primitives
    // nodes without a mesh are skipped.
    _forEachNodeMaterial(node, fn) {
        const prims = node?.mesh?.primitives;
        if (!prims) return;

        for (let i = 0; i < prims.length; i++) {
            const mat = prims[i]?.material;
            if (mat) fn(mat);
        }
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

    // 递归登记节点材质名到 materialsMap
    _setNodeMaterialMap(node) {
        if (!node) return;

        this._forEachNodeMaterial(node, (mat) => {
            if (mat.registryIndex != null && mat.registryIndex >= 0) {
                this._addToMap(this.materialsMap, mat.name, mat.registryIndex);
            }
        });

        for (const child of node.children ?? []) {
            this._setNodeMaterialMap(child);
        }
    }

    // 收集子树里用到的材质索引
    _collectMaterials(node, out) {
        if (!node) return;

        this._forEachNodeMaterial(node, (mat) => {
            if (mat.registryIndex != null && mat.registryIndex >= 0) out.add(mat.registryIndex);
        });

        for (const child of node.children ?? []) {
            this._collectMaterials(child, out);
        }
    }

    // 注销材质登记
    // runs after unregisterNode
    _releaseMaterials(indices) {
        if (!indices.size) return;

        const stillUsed = new Set();
        for (const node of this.nodes) {
            this._forEachNodeMaterial(node, (mat) => {
                if (mat.registryIndex != null && mat.registryIndex >= 0) stillUsed.add(mat.registryIndex);
            });
        }

        for (const idx of indices) {
            if (stillUsed.has(idx)) continue;
            const mat = this._get('materials', idx);
            this._removeFromMap(this.materialsMap, mat?.name, idx);
        }
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
        this._setNodeMaterialMap(node);
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

        const removedMaterials = new Set();
        this._collectMaterials(node, removedMaterials);

        node.parent?.removeChild(node);
        this.unregisterNode(node);
        this._clearNodeSceneIndex(node);
        this._releaseMaterials(removedMaterials);
        return true;
    }

    /*
    MatrixBuffer
    */
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


    /*
    Container
    */
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

    findMaterials(name) {
        return this.materialsMap.get(name) ?? new Set();
    }


    /*
    Update
    */
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


    /*
      Destroy
      no registryCache to drain anymore
      textures and VAOs are created once by the Loader and owned by the Registry
    */
    async destroy() {
        if (this._destroyed) return;
        this._destroyed = true;

        for (const index of [...this.containerIndices]) {
            this.removeContainer(index);
        }

        this.unregisterNode(this.root);

        this.containersMap.clear();
        this.skeletonsMap.clear();
        this.animationsMap.clear();
        this.materialsMap.clear();
        this.containerIndices.clear();

        this.nodes.length = 0;
        this._freeIndices.length = 0;
        this._nextIndex = 0;
    }
}