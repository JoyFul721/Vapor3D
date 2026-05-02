import { Math3D } from './Math3D.js';

/**
 * 骨架类：管理模型的骨骼调色板 (Matrix Palette)
 * 
 * Local Matrix	节点相对于父节点的 TRS 合成矩阵
 * World Matrix	节点在场景中的绝对变换矩阵
 * Inverse Bind Matrix	逆绑定矩阵。将顶点从“T-Pose”下的模型空间转到骨骼的局部空间
 * Joint / Skin Matrix	蒙皮矩阵。worldMatrix * ibm。这是最终作用于顶点的矩阵
 * Matrix Palette	骨骼矩阵调色板。由一个模型下所有 jointMatrix 组成的扁平数组
 */



export class Skeleton {
    constructor(gl, id, joints, ibms) {
        this.gl = gl;
        this.id = id;
        this.joints = joints; // Node 数组
        this.inverseBindMatrices = ibms; // Float32Array
        this.numJoints = joints.length;

        // handler，Model 持有的仓库
        this.matrixPalette = new Float32Array(this.numJoints * 16);

        this.texture = gl.createTexture();
        const gl2 = this.gl;
        gl2.bindTexture(gl2.TEXTURE_2D, this.texture);

        // 宽4，向下延伸
        gl2.texImage2D(gl2.TEXTURE_2D, 0, gl2.RGBA32F, 4, this.numJoints, 0, gl2.RGBA, gl2.FLOAT, null);

        gl2.pixelStorei(gl2.UNPACK_FLIP_Y_WEBGL, false); 

        gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MIN_FILTER, gl2.NEAREST);
        gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MAG_FILTER, gl2.NEAREST);
        gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_WRAP_S, gl2.CLAMP_TO_EDGE);
        gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_WRAP_T, gl2.CLAMP_TO_EDGE);

        gl2.bindTexture(gl2.TEXTURE_2D, null);
    }

    updateCPU(globalWorldMatrixBuffer) {
        for (let i = 0; i < this.numJoints; i++) {
            const jointNode = this.joints[i];

            const offset = jointNode.worldMatrixIndex * 16;
            if (offset < 0) continue;

            const worldMat = globalWorldMatrixBuffer.subarray(offset, offset + 16);

            const ibm = this.inverseBindMatrices.subarray(i * 16, i * 16 + 16);

            // SkinMat = World * IBM
            const skinMat = Math3D.mat4_multiply(worldMat, ibm);

            // 存入当前 Model 持有的仓库
            this.matrixPalette.set(skinMat, i * 16);
        }
    }

    updateGPU() {
        const gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 4, this.numJoints, gl.RGBA, gl.FLOAT, this.matrixPalette);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    destroy() {
        if (this.texture) {
            this.gl.deleteTexture(this.texture);
            this.texture = null;
        }
        this.joints = [];
        this.inverseBindMatrices = null;
        this.matrixPalette = null;
    }
}