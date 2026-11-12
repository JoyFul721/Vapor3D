// /lib/Scene/Model/MeshNode.js

import { TransformNode } from "../Node";

/*
  Marked TransformNode
*/
export class MeshNode extends TransformNode {
    constructor(name, mesh = null) {
        super(name);

        this.mesh = mesh;      // shared Mesh template
        this.visible = 1;

        this.isSkinned = false;
        this.skeleton = null;

        this.hasLightmap = false;
        this.lightmapIndex = -1;
        this.lightmapScaleOffset = [1, 1, 0, 0];
        this.lightmapTex = null;
    }
}