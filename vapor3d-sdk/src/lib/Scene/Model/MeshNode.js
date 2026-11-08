import { TransformNode } from "../Node";

export class MeshNode extends TransformNode {
    constructor(name, vao) {
        super(name);
        this.name = name;
        this.vao = vao;
        this.material = null;
        this.sourceMesh = null
        this.visible = 1;

        this.isSkinned = false;
        this.skeleton = null;


        this.hasLightmap = false;
        this.lightmapIndex = -1;
        this.lightmapScaleOffset = [1, 1, 0, 0];
        this.lightmapTex = null;
    }

    draw(mode) {
        if (this.visible && this.vao) {
            this.vao.draw(mode);
        }
    }
}