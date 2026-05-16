import { Math3D } from './Math3D.js';
import { Material } from './Mesh.js';

class Node {
    constructor(name = "unnamed") {
        this.name = name;
        this.parent = null;
        this.children = [];
    }

    addChild(child) {
        if (child === this) return;
        if (child.parent) child.parent.removeChild(child);
        child.parent = this;
        this.children.push(child);
    }

    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.parent = null;
        }
    }
}

export class TransformNode extends Node {
    constructor(name) {
        super(name);
        this.position = [0, 0, 0];
        this.quaternion = [0, 0, 0, 1];
        this.scale = [1, 1, 1];
        this.worldMatrixIndex = -1;
        this._dirty = true;
    }

    setDirty() {
        if (this._dirty) return;
        this._dirty = true;
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i] instanceof TransformNode) {
                this.children[i].setDirty();
            }
        }
    }

    updateWorldMatrix(parentMatrix, parentDirty, globalBuffer) {
        const isDirty = this._dirty || parentDirty;
        if (isDirty && this.worldMatrixIndex !== -1) {
            const local = Math3D.mat4_fromRTS(this.quaternion, this.position, this.scale);
            const world = Math3D.mat4_multiply(parentMatrix, local);
            globalBuffer.set(world, this.worldMatrixIndex * 16);
            this._dirty = false;
        }

        const myWorld = this.worldMatrixIndex !== -1 ?
            globalBuffer.subarray(this.worldMatrixIndex * 16, this.worldMatrixIndex * 16 + 16) : parentMatrix;

        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i] instanceof TransformNode) {
                this.children[i].updateWorldMatrix(myWorld, isDirty, globalBuffer);
            }
        }
    }
}

export class MeshNode extends TransformNode {
    constructor(name, vao) {
        super(name);
        this.vao = vao;
        this.material = new Material();
        this.visible = true;

        this.isSkinned = false;
        this.skeleton = null;
    }

    draw(mode) {
        if (this.visible && this.vao) {
            this.vao.draw(mode);
        }
    }
}