import { Node } from './Node.js';

export class Scene {
    constructor(name = "Main", maxNodes = 2048) {
        this.name = name;

        // 全局矩阵仓库
        this.worldMatrixBuffer = new Float32Array(maxNodes * 16);
        this.nodes = [];
        this._freeIndices = [];
        this._nextIndex = 0;

        this.root = new Node(name + "_Root");
        this.registerNode(this.root);

        
        // 通用实体注册表，以前专为 Model设计，本质是方便用户直接跳过复杂层级关系直接找到指定节点，比如model
        this.entities = new Map();

        // 资源注册表
        this.registry = {
            vaos: new Map(),
            textures: new Map()
        };
    }

    registerNode(node) {
        if (node.worldMatrixIndex !== -1) return;

        let index;
        if (this._freeIndices.length > 0) {
            index = this._freeIndices.pop();
        } else {
            index = this._nextIndex++;
        }

        node.worldMatrixIndex = index;
        this.nodes[index] = node;

        // 递归注册所有子节点
        for (let child of node.children) {
            this.registerNode(child);
        }
    }
    unregisterNode(node) {
        if (node.worldMatrixIndex === -1) return;

        this._freeIndices.push(node.worldMatrixIndex);
        this.nodes[node.worldMatrixIndex] = null;
        node.worldMatrixIndex = -1;

        for (let child of node.children) {
            this.unregisterNode(child);
        }
    }

    update() {
        const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        this.root.updateWorldMatrix(identity, false, this.worldMatrixBuffer);

        for (const entity of this.entities.values()) {
            const model = entity.getComponent('model');
            if (model && model.flatSkeletons) {
                for (const skel of model.flatSkeletons) {
                    skel.updateCPU(this.worldMatrixBuffer);
                    skel.updateGPU();
                }
            }
        }
    }

    addEntity(id, node) {
        if (this.entities.has(id)) this.removeEntity(id);

        this.entities.set(id, node);
        this.root.addChild(node);
        this.registerNode(node); // 分配矩阵索引
    }

    removeEntity(id) {
        const node = this.entities.get(id);
        if (!node) return;

        this.root.removeChild(node);
        this.unregisterNode(node); // 回收矩阵索引
        this.entities.delete(id);
        node.destroy();
    }


    getNodeByPath(path) {
        if (!path) return null;

        if (path.toLowerCase() === "root") return this.root;

        const parts = path.split('/');

        const entityID = parts[0].trim();
        let currentNode = this.entities.get(entityID);

        if (!currentNode) {
            currentNode = this.root.children.find(child => child.name === entityID);
            if (!currentNode) {
                console.warn(`Vapor3D: Can't find entity or root-node: "${entityID}"`);
                return null;
            }
        }

        if (parts.length === 1) return currentNode;

        for (let i = 1; i < parts.length; i++) {
            const targetName = parts[i].trim();
            if (!targetName) continue;

            const nextNode = currentNode.children.find(child => child.name.trim() === targetName);

            if (!nextNode) {
                console.warn(`Vapor3D: Node "${currentNode.name}" has no child named "${targetName}"`);
                return null;
            }
            currentNode = nextNode;
        }

        return currentNode;
    }


    // ================== Registry Map ==================

    async getOrCreateTexture(id, creator) {
        let promise = this.registry.textures.get(id);
        if (!promise) {
            promise = creator();
            this.registry.textures.set(id, promise);
        }
        return promise;
    }

    async getOrCreateVAO(id, creator) {
        let promise = this.registry.vaos.get(id);
        if (!promise) {
            promise = creator();
            this.registry.vaos.set(id, promise);
        }
        return promise;
    }

    async destroy() {
        // 销毁时，等待所有正在进行的 Promise 完成
        const allTextures = await Promise.all(this.registry.textures.values());
        allTextures.forEach(t => t && t.destroy());

        const allVaos = await Promise.all(this.registry.vaos.values());
        allVaos.forEach(v => v && v.destroy());

        this.registry.textures.clear();
        this.registry.vaos.clear();
    }
}