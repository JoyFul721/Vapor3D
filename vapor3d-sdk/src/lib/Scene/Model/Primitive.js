// /lib/Scene/Model/Primitive.js

/**
* The actual draw unit
* One glTF mesh primitive -> one Primitive
*
* Container -> Mesh -> Primitive
*/
export class Primitive {
    constructor(vao, material) {
        this.vao = vao;
        this.material = material;
        this.hasUV2 = false;

        this.registryIndex = -1;
    }

    draw(mode) {
        this.vao?.draw(mode);
    }
}