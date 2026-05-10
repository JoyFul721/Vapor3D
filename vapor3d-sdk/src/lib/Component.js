// 挂载在 Node 下，可自由扩展

import { AnimationPlayer } from "./AnimationPlayer";

class Component {
    constructor() {
        this.node = null; // 由 addComponent 自动注入
        this.enabled = true;
    }
}

// Mesh
export class MeshComponent extends Component {
    constructor(mesh) {
        super();
        this.mesh = mesh;
    }
}

// Animation
export class AnimationComponent extends Component {
    constructor(animations) {
        super();
        this.player = new AnimationPlayer(animations);
    }
    update(dt) {
        if (this.enabled) this.player.update(dt);
    }
}

// Model
export class ModelComponent extends Component {
    constructor() {
        super();
        this.flatMeshes = []; // 只是展平索引，便于遍历，真正的继承关系 node 本来就有
        this.flatSkeletons = [];
    }
}