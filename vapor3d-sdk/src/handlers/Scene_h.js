import { Scene } from '../lib/index.js';
import { Math3D } from '../lib/Math3D.js';

export class SceneHandlers {
    constructor(engineHandlers) {
        this.engine = engineHandlers;
        this.scenes = new Map(); // 存储场景实例的 Map
    }

    Scene_Create({ ID }) {
        if (this.scenes.has(ID)) {
            this.scenes.get(ID).destroy();
        }
        this.scenes.set(ID, new Scene(ID, 2048));
    }

    Scene_Destroy({ ID }) {
        const scene = this.scenes.get(ID);
        if (scene) {
            scene.destroy();
            this.scenes.delete(ID);
        }
    }

    Scene_Clear(args) {
        const { SCENE_ID } = args || {};

        if (SCENE_ID) {
            const scene = this.scenes.get(SCENE_ID);
            if (scene) {
                scene.destroy();
            }
        } else {
            this.scenes.forEach(scene => {
                if (scene && typeof scene.destroy === 'function') {
                    scene.destroy();
                }
            });
            this.scenes.clear();
        }
    }

    // ====================== Node ======================

    Scene_NodeSetTRS({ SCENE_ID, PATH, TRS }) {
        const scene = this.scenes.get(SCENE_ID);
        const node = scene?.getNodeByPath(PATH);
        if (!node) return;

        const data = Math3D.TRS_parse(TRS);
        if (!data) return;

        node.position = data.position;
        node.quaternion = Math3D.quat_fromEuler(...data.euler);
        node.scale = data.scale;

        node.setDirty(); // 触发矩阵重算
    }


    Scene_NodeSetParent({ SCENE_ID, CHILD_PATH, PARENT_PATH }) {
        const scene = this.scenes.get(SCENE_ID);
        if (!scene) return;

        const childNode = scene.getNodeByPath(CHILD_PATH);
        if (!childNode) {
            console.warn(`Vapor3D: Can't find child: ${CHILD_PATH}`);
            return;
        }

        let parentNode;
        // 如果父节点路径是 Root 或为空，则挂到场景根部
        if (!PARENT_PATH || PARENT_PATH.toLowerCase() === "root") {
            parentNode = scene.root;
        } else {
            parentNode = scene.getNodeByPath(PARENT_PATH);
        }

        if (!parentNode) {
            console.warn(`Vapor3D: Can't find parent ${PARENT_PATH}`);
            return;
        }

        parentNode.addChild(childNode);

        childNode.setDirty();

        console.log(`Vapor3D: Set parent successfully ${childNode.name} -> ${parentNode.name}`);
    }

    Scene_GetNodeMatrix({ SCENE_ID, PATH }) {
        const scene = this.scenes.get(SCENE_ID);
        const node = scene?.getNodeByPath(PATH);
        if (!node || node.worldMatrixIndex === -1) return "";

        const offset = node.worldMatrixIndex * 16;
        const mat = scene.worldMatrixBuffer.subarray(offset, offset + 16);

        return JSON.stringify(Array.from(mat));
    }

    Scene_NodeGetName({ SCENE_ID, MODEL, IDX }) {
        const scene = this.scenes.get(SCENE_ID);
        const node = scene?.getMeshNode(MODEL, Number(IDX));
        return node ? node.name : "Null";
    }

    Scene_UpdateWorldMatrix({ SCENE_ID }) {
        const scene = this.scenes.get(SCENE_ID);
        if (scene) {
            scene.update(); // 调用 this.root.updateWorldMatrix(null)
        }
    }

    // =================== Model Node ===================

    _getModalComp(scene, modelID) {
        const entity = scene?.entities.get(modelID);
        return entity?.getComponent('model');
    }

    // ====== Skeleton ======

    Scene_GetJointCount({ SCENE_ID, MODEL }) {
        const scene = this.scenes.get(SCENE_ID);
        const modelComp = this._getModalComp(scene, MODEL);
        const skel = modelComp?.flatSkeletons[0]; // 第一个
        return skel ? skel.numJoints : 0;
    }

    Scene_ModelSetJointTRS({ SCENE_ID, MODEL, IDX, TRS }) {
        const scene = this.scenes.get(SCENE_ID);
        const modelComp = this._getModalComp(scene, MODEL);
        const jointNode = modelComp?.flatSkeletons[0]?.joints[Number(IDX)];

        if (jointNode) {
            const data = Math3D.TRS_parse(TRS);
            if (!data) return;
            jointNode.position = data.position;
            jointNode.quaternion = Math3D.quat_fromEuler(...data.euler);
            jointNode.scale = data.scale;
            jointNode.setDirty();
        }
    }

    Scene_ModelJointIndexToName({ SCENE_ID, MODEL, IDX }) {
        const scene = this.scenes.get(SCENE_ID);
        const modelComp = this._getModalComp(scene, MODEL);
        const joint = modelComp?.flatSkeletons[0]?.joints[Number(IDX)];
        return joint ? joint.name : "Null";
    }

    Scene_ModelJointNameToIndex({ SCENE_ID, MODEL, NAME }) {
        const scene = this.scenes.get(SCENE_ID);
        const modelComp = this._getModalComp(scene, MODEL);
        const joints = modelComp?.flatSkeletons[0]?.joints;
        if (!joints) return -1;

        const targetName = String(NAME).trim();
        return joints.findIndex(j => j.name.trim() === targetName);
    }

    Scene_ModelBindSkeletonTex({ SCENE_ID, MODEL, UNIT }) {
        const scene = this.scenes.get(SCENE_ID);
        const modelComp = this._getModalComp(scene, MODEL);
        const skel = modelComp?.flatSkeletons[0];
        const gl = this.engine.core.gl;

        if (skel) {
            gl.activeTexture(gl.TEXTURE0 + Number(UNIT));
            gl.bindTexture(gl.TEXTURE_2D, skel.texture);
        } else {
            gl.activeTexture(gl.TEXTURE0 + Number(UNIT));
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }


    // ====== Mesh ======

    Scene_GetMeshCount({ SCENE_ID, MODEL }) {
        const scene = this.scenes.get(SCENE_ID);
        const modelComp = this._getModalComp(scene, MODEL);
        return modelComp ? modelComp.flatMeshes.length : 0;
    }

    Scene_MeshDraw({ SCENE_ID, MODEL, IDX, MODE }) {
        const scene = this.scenes.get(SCENE_ID);
        const modelComp = this._getModalComp(scene, MODEL);
        const meshNode = modelComp?.flatMeshes[Number(IDX)];

        const meshComp = meshNode?.getComponent('mesh');
        if (meshComp && meshNode.visible) {
            meshComp.mesh.vao.draw(MODE);
        }
    }

    Scene_MeshBindTex({ SCENE_ID, MODEL, IDX, TEX_TYPE, UNIT }) {
        const scene = this.scenes.get(SCENE_ID);
        const modelComp = this._getModalComp(scene, MODEL);
        const meshNode = modelComp?.flatMeshes[Number(IDX)];
        const meshComp = meshNode?.getComponent('mesh');

        if (meshComp) {
            const tex = meshComp.mesh.material[TEX_TYPE];
            if (tex) {
                tex.bind(UNIT);
            } else {
                const gl = this.engine.core.gl;
                gl.activeTexture(gl.TEXTURE0 + Number(UNIT));
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
        }
    }

    Scene_MeshTex_SetFilter({ SCENE_ID, MODEL, IDX, NAME, MIN_MODE, MAG_MODE }) {
        const scene = this.scenes.get(SCENE_ID);
        const modelComp = this._getModalComp(scene, MODEL);
        const meshNode = modelComp?.flatMeshes[Number(IDX)];
        const meshComp = meshNode?.getComponent('mesh');
        if (!meshComp) return;

        const tex = meshComp.mesh.material[NAME];

        if (tex) tex.setFilter(MIN_MODE, MAG_MODE)
    }

    Scene_MeshTex_SetWrap({ SCENE_ID, MODEL, IDX, NAME, MODE }) {
        const scene = this.scenes.get(SCENE_ID);
        const modelComp = this._getModalComp(scene, MODEL);
        const meshNode = modelComp?.flatMeshes[Number(IDX)];
        const meshComp = meshNode?.getComponent('mesh');

        const tex = meshComp.mesh.material[NAME];

        if (tex) {
            tex.setWrap("S", MODE);
            tex.setWrap("T", MODE);
        }
    }

    Scene_MeshGetParam({ SCENE_ID, MODEL, IDX, PARAM }) {
        const scene = this.scenes.get(SCENE_ID);
        const modelComp = this._getModalComp(scene, MODEL);
        const meshNode = modelComp?.flatMeshes[Number(IDX)];
        const meshComp = meshNode?.getComponent('mesh');

        if (!meshComp) return "";
        const val = meshComp.mesh.material[PARAM];
        return Array.isArray(val) ? JSON.stringify(val) : val;
    }
}