// glTF mesh.primitives

export class Primitive {
    constructor(vao, material) {
        this.vao = vao;
        this.material = material;

        this.hasUV2 = false;
    }
}