export class Material {
    constructor() {
        this.albedoTex = null;
        this.normalTex = null;
        this.ormTex = null;
        this.emissiveTex = null;
        this.baseColor = [1, 1, 1, 1];
        this.roughness = 1;
        this.metalness = 1;
        this.hasUV2 = false;
    }
}

export class Mesh {
    constructor(name, vao) {
        this.name = name;
        this.vao = vao;
        this.material = new Material();

        this.isSkinned = false;   // 蒙皮
        this.skeleton = null; // 引用
    }

    destroy() {
        if (this.vao) this.vao.destroy();
        this.skeleton = null; // 仅解除引用
    }
}