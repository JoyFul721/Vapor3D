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
        this.vao = vao; // 直接持有该 Mesh 独立的 VAO 实例
        this.material = new Material();
    }

    destroy() {
        if (this.vao) this.vao.destroy();
    }
}

export class Model {
    constructor(name) {
        this.name = name;
        this.meshes = [];
        this.textures = []; // 保存当前模型加载的所有纹理引用，便于销毁
    }

    addMesh(mesh) {
        this.meshes.push(mesh);
    }

    getMesh(index) {
        return this.meshes[index] || null;
    }

    destroy() {
        this.meshes.forEach(mesh => mesh.destroy());
        this.textures.forEach(tex => {
            if (tex && typeof tex.destroy === 'function') tex.destroy();
        });
        this.meshes = [];
        this.textures = [];
    }
}