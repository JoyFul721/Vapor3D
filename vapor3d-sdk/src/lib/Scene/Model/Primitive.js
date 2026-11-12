// /lib/Mesh/Primitive.js

/*
  The actual draw unit. 
  One glTF mesh primitive -> one Primitive.
*/
export class Primitive {
    constructor(vao, material) {
        this.vao = vao;
        this.material = material;

        this.registryIndex = -1;
    }

    draw(mode) {
        this.vao?.draw(mode);
    }
}