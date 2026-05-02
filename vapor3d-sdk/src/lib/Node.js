import { Math3D } from './Math3D.js';

export class Node {
    constructor(name = "unnamed") {
        this.name = name;
        this.parent = null;
        this.children = [];

        this.worldMatrixIndex = -1; // 仓库索引，-1 表示未注册到 Scene
        this._dirty = true;

        this.position = [0, 0, 0];
        this.quaternion = [0, 0, 0, 1];
        this.scale = [1, 1, 1];

        // 上面是 node 通用属性，下面是扩展
        // For Skeleton
        this.localMatrix = Math3D.mat4_identity();
        this.worldMatrix = Math3D.mat4_identity();
        // For Mesh
        this.mesh = null;
        this.visible = true;
        // For Animation
        this.animations = null;
        this.animationPlayer = null;
    }

    setDirty() {
        if (this._dirty) return;
        this._dirty = true;// 子节点的世界矩阵依赖于父节点
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].setDirty();
        }
    }

    addChild(child) {
        if (child === this) return; // 防自挂载

        // 防循环引用
        let p = this.parent;
        while (p) {
            if (p === child) {
                console.error("Vapor3D: Circular dependency detected!");
                return;
            }
            p = p.parent;
        }

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

    updateWorldMatrix(parentMatrix, parentDirty, globalBuffer) {
        const isDirty = this._dirty || parentDirty;

        if (isDirty && this.worldMatrixIndex !== -1) {
            // Loacl Matrix
            const local = Math3D.mat4_fromRTS(this.quaternion, this.position, this.scale);

            // World Matrix：parent * local
            const world = Math3D.mat4_multiply(parentMatrix, local);

            // 写入全局仓库
            const offset = this.worldMatrixIndex * 16;
            globalBuffer.set(world, offset);

            this._dirty = false;

            // 递归子节点
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].updateWorldMatrix(world, true, globalBuffer);
            }
        } else if (this.worldMatrixIndex !== -1) {
            const offset = this.worldMatrixIndex * 16;
            const myWorld = globalBuffer.subarray(offset, offset + 16);
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].updateWorldMatrix(myWorld, false, globalBuffer);
            }
        }
    }


    destroy() {
        this.parent = null;
        if (this.mesh) {
            this.mesh.destroy();
            this.mesh = null;
        }
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].destroy();
        }
        this.children = [];
    }
}