// /lib/Scene/Model/MeshNode.js
import { TransformNode } from "../Node";

/*
  A node that carries a mesh reference. That's all it is now.
  Rendering lives in Primitive; this class only keeps per-instance state
  (which mesh, which skeleton, which lightmap) so the tree stays walkable
  and instanceof still means something.
*/
export class MeshNode extends TransformNode {
    constructor(name, mesh = null) {
        super(name);

        this.mesh = mesh;      // shared Mesh template, may stay null
        this.visible = 1;

        this.isSkinned = false;
        this.skeleton = null;

        this.hasLightmap = false;
        this.lightmapIndex = -1;
        this.lightmapScaleOffset = [1, 1, 0, 0];
        this.lightmapTex = null;
    }
}