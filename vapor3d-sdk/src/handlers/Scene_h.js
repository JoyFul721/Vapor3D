import { Scene } from '../lib/index.js';
import { Math3D } from '../lib/Math3D.js';

export class SceneHandlers {
    constructor(engineHandlers) {
        this.engine = engineHandlers;
        this.scenes = new Map();
    }

    // ====================== Scene Management ======================

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
            if (scene) scene.destroy();
        } else {
            this.scenes.forEach(scene => scene?.destroy());
            this.scenes.clear();
        }
    }

    // ====================== Node Transform ======================

    Scene_NodeSetTRS({ SCENE_ID, PATH, TRS }) {
        const scene = this.scenes.get(SCENE_ID);
        const node = scene?.getNodeByPath(PATH);
        if (!node) return;

        const data = Math3D.TRS_parse(TRS);
        if (!data) return;

        node.position = data.position;
        node.quaternion = Math3D.quat_fromEuler(...data.euler);
        node.scale = data.scale;
        node.setDirty();
    }

    Scene_NodeSetParent({ SCENE_ID, CHILD_PATH, PARENT_PATH }) {
        const scene = this.scenes.get(SCENE_ID);
        if (!scene) return;

        const childNode = scene.getNodeByPath(CHILD_PATH);
        if (!childNode) return;

        let parentNode = (!PARENT_PATH || PARENT_PATH.toLowerCase() === "root")
            ? scene.root
            : scene.getNodeByPath(PARENT_PATH);

        if (parentNode) {
            parentNode.addChild(childNode);
            childNode.setDirty();
        }
    }

    Scene_GetNodeMatrix({ SCENE_ID, PATH }) {
        const scene = this.scenes.get(SCENE_ID);
        const node = scene?.getNodeByPath(PATH);
        if (!node || node.worldMatrixIndex === -1) return "";

        const offset = node.worldMatrixIndex * 16;
        const mat = scene.worldMatrixBuffer.subarray(offset, offset + 16);
        return JSON.stringify(Array.from(mat));
    }

    Scene_UpdateWorldMatrix({ SCENE_ID }) {
        this.scenes.get(SCENE_ID)?.update();
    }

    // =================== AssetContainer (Model) ===================

    _getContainer(scene, modelID) {
        return scene?.containers.get(modelID);
    }

    // ====== Skeleton (via AssetContainer) ======

    Scene_GetJointCount({ SCENE_ID, MODEL }) {
        const container = this._getContainer(this.scenes.get(SCENE_ID), MODEL);
        return container?.skeletons[0]?.numJoints || 0;
    }

    Scene_ModelSetJointTRS({ SCENE_ID, MODEL, IDX, TRS }) {
        const container = this._getContainer(this.scenes.get(SCENE_ID), MODEL);
        const jointNode = container?.skeletons[0]?.joints[Number(IDX)];

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
        const container = this._getContainer(this.scenes.get(SCENE_ID), MODEL);
        const joint = container?.skeletons[0]?.joints[Number(IDX)];
        return joint ? joint.name : "Null";
    }

    Scene_ModelJointNameToIndex({ SCENE_ID, MODEL, NAME }) {
        const container = this._getContainer(this.scenes.get(SCENE_ID), MODEL);
        const joints = container?.skeletons[0]?.joints;
        if (!joints) return -1;

        const targetName = String(NAME).trim();
        return joints.findIndex(j => j.name.trim() === targetName);
    }

    Scene_ModelBindSkeletonTex({ SCENE_ID, MODEL, UNIT }) {
        const container = this._getContainer(this.scenes.get(SCENE_ID), MODEL);
        const skel = container?.skeletons[0];
        const gl = this.engine.core.gl;

        gl.activeTexture(gl.TEXTURE0 + Number(UNIT));
        gl.bindTexture(gl.TEXTURE_2D, skel ? skel.texture : null);
    }

    // ====== Mesh (via AssetContainer.meshes) ======

    Scene_GetMeshCount({ SCENE_ID, MODEL }) {
        const container = this._getContainer(this.scenes.get(SCENE_ID), MODEL);
        return container ? container.meshes.length : 0;
    }

    Scene_NodeGetName({ SCENE_ID, MODEL, IDX }) {
        const container = this._getContainer(this.scenes.get(SCENE_ID), MODEL);
        return container?.meshes[Number(IDX)]?.name || "Null";
    }

    Scene_MeshDraw({ SCENE_ID, MODEL, IDX, MODE }) {
        const container = this._getContainer(this.scenes.get(SCENE_ID), MODEL);
        const meshNode = container?.meshes[Number(IDX)];
        if (meshNode) {
            meshNode.draw(MODE);
        }
    }

    Scene_MeshBindTex({ SCENE_ID, MODEL, IDX, TEX_TYPE, UNIT }) {
        const container = this._getContainer(this.scenes.get(SCENE_ID), MODEL);
        const meshNode = container?.meshes[Number(IDX)];

        if (meshNode) {
            const tex = meshNode.material[TEX_TYPE];
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
        const container = this._getContainer(this.scenes.get(SCENE_ID), MODEL);
        const meshNode = container?.meshes[Number(IDX)];
        const tex = meshNode?.material[NAME];
        if (tex) tex.setFilter(MIN_MODE, MAG_MODE);
    }

    Scene_MeshTex_SetWrap({ SCENE_ID, MODEL, IDX, NAME, MODE }) {
        const container = this._getContainer(this.scenes.get(SCENE_ID), MODEL);
        const meshNode = container?.meshes[Number(IDX)];
        const tex = meshNode?.material[NAME];
        if (tex) {
            tex.setWrap("S", MODE);
            tex.setWrap("T", MODE);
        }
    }

    Scene_MeshGetParam({ SCENE_ID, MODEL, IDX, PARAM }) {
        const container = this._getContainer(this.scenes.get(SCENE_ID), MODEL);
        const meshNode = container?.meshes[Number(IDX)];

        if (!meshNode) return "";
        const val = meshNode.material[PARAM];
        return Array.isArray(val) ? JSON.stringify(val) : val;
    }
}