/*
本质是一个映射管理器，方便用户跳过层级遍历直接查询到特定节点，由 Loader 实例化
*/
export class AssetContainer {
    constructor(name) {
        this.name = name;
        this.id = name;           // 历史遗留 统一用 name
        this.rootNode = null;     // glb 加载时所创建的节点
        this.meshes = [];         // 扁平 MeshNode 引用
        this.skeletons = [];      // 扁平 Skeleton 引用
        this.animations = new Map();

        this.registryIndex = -1;
    }

    dispose() {
        this.rootNode.destroy();
        this.meshes = []; // 存的是 Mesh 模板
        this.skeletons = [];
    }
}