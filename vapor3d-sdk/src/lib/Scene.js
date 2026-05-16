import { TransformNode } from './Node.js';

export class Scene {
    constructor(name = "Main", maxNodes = 2048) {
        this.name = name;

        // 全局矩阵仓库
        this.worldMatrixBuffer = new Float32Array(maxNodes * 16);
        this.nodes = [];
        this._freeIndices = [];
        this._nextIndex = 0;

        this.root = new TransformNode(name + "_Root");
        this.registerNode(this.root);

        // AssetContainer，可视为 models，这一版本中节点的变换&父子关系与资源查询（方便用户）解耦
        this.containers = new Map(); 

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

    addContainer(id, container) {
        if (this.containers.has(id)) this.removeContainer(id);

        this.containers.set(id, container);
        this.root.addChild(container.rootNode);
        this.registerNode(container.rootNode);
    }

    removeContainer(id) {
        const container = this.containers.get(id);
        if (!container) return;

        this.root.removeChild(container.rootNode);
        this.unregisterNode(container.rootNode);
        container.dispose();
        this.containers.delete(id);
    }

    update(dt) {

        const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        this.root.updateWorldMatrix(identity, false, this.worldMatrixBuffer);

    
        for (const container of this.containers.values()) {
            for (const skel of container.skeletons) {
                skel.updateCPU(this.worldMatrixBuffer);
                skel.updateGPU();
            }
        }
    }


    getNodeByPath(path) {
        if (!path) return null;

        // 根节点
        if (path.toLowerCase() === "root") return this.root;

        const parts = path.split('/');
        const containerID = parts[0].trim();

        // 第一层是 AssetContainer
        const container = this.containers.get(containerID);
        if (!container) {
            console.warn(`Vapor3D: Container "${containerID}" not found in path "${path}"`);
            return null;
        }

        let currentNode = container.rootNode;

        for (let i = 1; i < parts.length; i++) {
            const targetName = parts[i].trim();
            if (!targetName) continue;

            const nextNode = currentNode.children.find(child => child.name === targetName);

            if (!nextNode) {
                console.warn(`Vapor3D: Node "${targetName}" is not a child of "${currentNode.name}"`);
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