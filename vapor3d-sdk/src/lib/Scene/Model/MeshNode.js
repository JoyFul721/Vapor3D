import { TransformNode } from "../Node";

export class MeshNode extends TransformNode {
    constructor(name, primitives = []) {
        super(name);
        this.name = name;
        this.primitives = primitives; // Primitive[]，一个 glTF mesh 的全部 draw call
        this.visible = 1;

        this.isSkinned = false;
        this.skeleton = null;

        this.hasLightmap = false;
        this.lightmapIndex = -1;
        this.lightmapScaleOffset = [1, 1, 0, 0];
        this.lightmapTex = null;
    }
}