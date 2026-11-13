/**
* Scene -> Container
*/
export class AssetContainer {
    constructor(name) {
        this.name = name;
        this.id = name; // legacy
        this.rootNode = null;
        this.meshes = [];        // MeshNode array
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