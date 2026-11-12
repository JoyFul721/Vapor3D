export class Material {
    constructor() {
        this.name = null; // Material 是由 Loader 实例化、Loader 命名、Scene 存入 materialsMap
        this.albedoTex = null;
        this.normalTex = null;
        this.ormTex = null;
        this.emissiveTex = null;
        this.baseColor = [1, 1, 1, 1];
        this.roughness = 1;
        this.metalness = 1;
        this.alpha = 1;

        this.registryIndex = -1;
    }

    destroy() {
        this.registryIndex = -1;
    }
}