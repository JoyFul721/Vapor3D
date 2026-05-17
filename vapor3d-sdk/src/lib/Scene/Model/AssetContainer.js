import { Timeline } from "../../index";
/*
本质是一个映射管理器，方便用户跳过层级遍历直接查询到特定节点
假如你要获取一个网格
积木表现为 scene(id).models(modelId).meshe[index]

实际会使用 Scene.container.get(modelId) 拿到对应的 container，container 可理解为单个 model，也可理解为每个 glb 加载后的节点
然后，再从拿到的 container 中去查询网格或者骨骼
*/
export class AssetContainer {
    constructor(id) {
        this.id = id;
        this.rootNode = null;     // glb 加载时所创建的节点
        this.meshes = [];         // 扁平 MeshNode 引用
        this.skeletons = [];      // 扁平 Skeleton 引用
        this.animations = new Map();
        this.timeline = new Timeline(); 
    }

    dispose() {
        this.rootNode.destroy();
        this.meshes = [];
        this.skeletons = [];
    }
}