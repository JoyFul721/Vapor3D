import { Scene } from '../lib/index.js';
import { Math3D } from '../lib/Tools/Math3D.js';

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
        this.scenes.set(ID, new Scene(ID, 8192));
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

    Scene_NodeSetTRS({ SCENE_ID, NODE_IDX, TRS }) {
        const scene = this.scenes.get(SCENE_ID);
        const node = scene.getNodeByIndex(NODE_IDX);
        if (!node) return;

        const data = Math3D.TRS_parse(TRS);
        if (!data) return;

        node.position = data.position;
        node.quaternion = Math3D.quat_fromEuler(...data.euler);
        node.scale = data.scale;
        node.setDirty();
    }

    Scene_NodeSetParent({ SCENE_ID, CHILD_NODE_IDX, PARENT_NODE_IDX }) {
        const scene = this.scenes.get(SCENE_ID);
        if (!scene) return;

        const childNode = scene.getNodeByIndex(CHILD_NODE_IDX);
        // PARENT_NODE_IDX 为 -1，表示挂载到 Scene Root
        const parentNode = (PARENT_NODE_IDX === -1) ? scene.root : scene.getNodeByIndex(PARENT_NODE_IDX);

        if (childNode && parentNode) {
            parentNode.addChild(childNode);
            childNode.setDirty();
        }
    }

    Scene_GetNodeMatrix({ SCENE_ID, NODE_IDX }) {
        const scene = this.scenes.get(SCENE_ID);
        const node = scene?.getNodeByIndex(NODE_IDX);
        if (!node || node.worldMatrixIndex === -1) return "[]";

        const offset = node.worldMatrixIndex * 16;
        const mat = scene.worldMatrixBuffer.subarray(offset, offset + 16);
        return JSON.stringify(Array.from(mat));
    }

    _getFlatTRS(node) {
        return [...node.position, ...node.quaternion, ...node.scale];
    }
    Scene_GetNodeTRS({ SCENE_ID, NODE_IDX }) {
        const scene = this.scenes.get(SCENE_ID);
        const node = scene?.getNodeByIndex(NODE_IDX);
        return node ? JSON.stringify(this._getFlatTRS(node)) : "[]";
    }

    Scene_UpdateWorldMatrix({ SCENE_ID }) {
        this.scenes.get(SCENE_ID)?.update();
    }

    // =================== AssetContainer (Model) ===================

    _getContainer(scene, modelID) {
        return scene?.containers.get(modelID);
    }

    Scene_GetModelRootIndex({ SCENE_ID, MODEL }) {
        const container = this._getContainer(this.scenes.get(SCENE_ID), MODEL);
        return container ? container.rootNode.worldMatrixIndex : -1;
    }

    // ====== Skeleton (via AssetContainer) ======

    Scene_GetJointNodeIndex({ SCENE_ID, MODEL, IDX }) {
        const container = this._getContainer(this.scenes.get(SCENE_ID), MODEL);
        const joint = container?.skeletons[0]?.joints[Number(IDX)];
        return joint ? joint.worldMatrixIndex : -1;
    }

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

    Scene_GetMeshNodeIndex({ SCENE_ID, MODEL, IDX }) {
        const container = this._getContainer(this.scenes.get(SCENE_ID), MODEL);
        const meshNode = container?.meshes[Number(IDX)];
        return meshNode ? meshNode.worldMatrixIndex : -1;
    }

    Scene_GetMeshCount({ SCENE_ID, MODEL }) {
        const container = this._getContainer(this.scenes.get(SCENE_ID), MODEL);
        return container ? container.meshes.length : 0;
    }

    Scene_MeshGetName({ SCENE_ID, MODEL, IDX }) {
        const container = this._getContainer(this.scenes.get(SCENE_ID), MODEL);
        return container?.meshes[Number(IDX)]?.name || "Null";
    }

    Scene_MeshDraw({ SCENE_ID, MODEL, IDX, MODE }) {
        const scene = this.scenes.get(SCENE_ID);
        const container = this._getContainer(scene, MODEL);
        const meshNode = container?.meshes[Number(IDX)];
        const shader = this.engine.activeShader;

        if (meshNode && shader && meshNode.worldMatrixIndex !== -1) { // 在 Scratch 用字符串传输矩阵太慢了

            const offset = meshNode.worldMatrixIndex * 16;
            const mat = scene.worldMatrixBuffer.subarray(offset, offset + 16);
            shader.setMat4("uModel", mat);

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

    Scene_MeshGetLightmapParam({ SCENE_ID, MODEL, IDX, PARAM }) {
        const container = this._getContainer(this.scenes.get(SCENE_ID), MODEL);
        const meshNode = container?.meshes[Number(IDX)];

        if (!meshNode) {
            return PARAM === "hasLightmap" ? "false" : -1;
        }

        switch (PARAM) {
            case "hasLightmap":
                return meshNode.hasLightmap ? "1" : "0";
            case "lightmapIndex":
                return meshNode.lightmapIndex !== undefined ? meshNode.lightmapIndex : -1;
            default:
                return "";
        }
    }

    Scene_MeshGetLightmapScaleOffsetComp({ SCENE_ID, MODEL, IDX, COMP }) {
        const container = this._getContainer(this.scenes.get(SCENE_ID), MODEL);
        const meshNode = container?.meshes[Number(IDX)];

        const so = meshNode?.lightmapScaleOffset ?? [0, 0, 0, 0];

        switch (COMP) {
            case "X": return so[0]; // Scale X
            case "Y": return so[1]; // Scale Y
            case "Z": return so[2]; // Offset X
            case "W": return so[3]; // Offset Y
        }
    }
    
}