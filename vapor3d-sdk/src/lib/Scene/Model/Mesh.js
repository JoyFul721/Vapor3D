import { Material } from "./Material";

export class Mesh { // 模板，glTF 的 mesh 定义，可被多个 node 引用
    constructor(vao) {
        this.vao = vao;
        this.material = new Material();
    }
}