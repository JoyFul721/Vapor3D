/*
本质是一个映射管理器，方便用户跳过层级遍历直接查询到特定节点，由 Loader 实例化
*/
export class AssetContainer {
    constructor(name) {
        this.name = name;
        this.id = name; // legacy
        this.rootNode = null;
        this.meshes = [];        // gltf meshes array
        this.primitives = [];     // gltf primitives array
        this.skeletons = [];      // Skeletons array
        this.animations = new Map();

        this.registryIndex = -1;
    }

    // 只清本地引用。GPU 资源归 Registry
    dispose() {
        this.rootNode = null;
        this.meshes = [];
        this.skeletons = [];
        this.animations.clear();
    }
}