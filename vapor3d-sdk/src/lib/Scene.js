import { Node } from './Node.js';

export class Scene {
    constructor(name = "Main", maxNodes = 2048) {
        this.name = name;
        this.root = new Node(name + "_Root");

        // 全局矩阵
        this.maxNodes = maxNodes;
        this.worldMatrixBuffer = new Float32Array(maxNodes * 16);

        this.nodes = []; // 存储所有注册到仓库的节点，方便按索引访问
        this._freeIndices = []; // 被删除节点留下的空位
        this._nextIndex = 0;
        this.registerNode(this.root);

        this.skeletons = new Set(); // 全局骨架注册表，解决 update 更新问题
        this.modelsMap = new Map();
        this.meshIndexMap = new Map(); // 展平的索引，方便 scratch 遍历，不然要 scene -> sampleModel -> head -> eyes 这样手动遍历  而且必须保留这个字典，这是一个复杂性守恒的坑

        this.registry = {
            vaos: new Map(),     // ID -> Promise<VAO>
            textures: new Map()  // ID -> Promise<Texture>
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
        // 更新所有 Node 的世界矩阵并写入 Scene 持有的仓库
        const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        this.root.updateWorldMatrix(identity, false, this.worldMatrixBuffer);

        // 遍历所有骨架，从仓库计算出蒙皮矩阵
        this.skeletons.forEach(skel => {
            skel.updateCPU(this.worldMatrixBuffer);
            skel.updateGPU();
        });
    }

    /**
     * @param {string} id 模型 ID
     * @param {Node} rootNode 该模型树的根节点
     * @param {Node[]} meshNodes 该模型内部所有带 Mesh 节点的扁平数组
     */
    addModel(id, rootNode, meshNodes) {
        if (this.modelsMap.has(id)) {
            this.removeModel(id);
        }
        this.root.addChild(rootNode);
        this.modelsMap.set(id, rootNode);
        this.meshIndexMap.set(id, meshNodes);

        this.registerNode(rootNode); 
    }
    removeModel(id) {
        const rootNode = this.modelsMap.get(id);
        if (rootNode) {
            const cleanup = (node) => {
                // 如果节点关联了骨架，从 Set 中销毁
                if (node.skeleton) {
                    this.removeSkeleton(node.skeleton);
                    node.skeleton.destroy();
                }
                for (const child of node.children) cleanup(child);
            };
            cleanup(rootNode);

            // 从场景树移除
            this.root.removeChild(rootNode);

            // 置空引用
            rootNode.destroy();

            this.modelsMap.delete(id);
            this.meshIndexMap.delete(id);
        }
    }

    addSkeleton(skeleton) {
        this.skeletons.add(skeleton);
    }

    removeSkeleton(skeleton) {
        this.skeletons.delete(skeleton);
    }


    getNodeByPath(path) {
        if (!path) return null;
        const parts = path.split('/');

        // 查找模型根节点
        let currentNode = this.modelsMap.get(parts[0]);
        if (!currentNode) {
            console.warn(`Vapor3D: Can't find model: "${parts[0]}" , path: ${path}`);
            return null;
        }

        if (parts.length === 1) return currentNode;

        for (let i = 1; i < parts.length; i++) {
            const targetName = parts[i];
            // 空格
            const nextNode = currentNode.children.find(child => child.name.trim() === targetName.trim());

            if (!nextNode) {
                console.warn(`Vapor3D: "${currentNode.name}" don't have child node "${targetName}"`);
                return null;
            }
            currentNode = nextNode;
        }

        return currentNode;
    }


    //For Scratch Scene(id).models(id).meshes(index).vao.draw
    getMeshNode(modelID, index) {
        const list = this.meshIndexMap.get(modelID);
        return list ? (list[index] || null) : null;
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