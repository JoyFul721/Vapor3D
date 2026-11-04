// /handlers/Scene_h.js

import { Scene } from "../lib/index.js";
import { Math3D } from "../lib/Tools/Math3D.js";

export class SceneHandlers {
    constructor(engineHandlers, registry) {
        this.engine = engineHandlers;
        engineHandlers.scene = this;
        this.registry = registry ?? engineHandlers.registry;

        this.scenesMap = new Map(); // Name -> registrySceneIndex

        this._debugTimer = 0;
    }

    _get(type, index) {
        return this.registry?.get(type, index) ?? null;
    }

    _release(type, index) {
        const i = Number(index);
        const list = this.registry?.[type];
        const free = this.registry?._freeIndices?.[type];

        if (!list || !free || !list[i]) return;

        list[i] = null;
        if (!free.includes(i)) free.push(i);
    }

    _getScene(index) { // 获取 Scene 实例
        return this._get("scenes", index);
    }

    _walkNodes(node, callback) {
        if (!node) return;
        callback(node);
        for (const child of node.children ?? []) {
            this._walkNodes(child, callback);
        }
    }

    _getTRS(node) {
        return [
            ...node.position,
            ...node.quaternion,
            ...node.scale
        ];
    }

    _applyTRS(node, trs) {
        const data = Math3D.TRS_parse(trs);
        if (!data) return;

        node.position = data.position;
        node.quaternion = Math3D.quat_fromEuler(...data.euler);
        node.scale = data.scale;
        node.setDirty();
    }

    // ====================== Scene Management ======================

    Scene_Create({ NAME }) {
        if (!this.engine.core) return -1;
        const scene = new Scene(NAME || "Main", 8192, this.registry);
        const index = this.registry.allocate("scenes", scene);
        
        scene.registryIndex = index;
        this.scenesMap.set(NAME, index);
        return index;
    }

    async Scene_ClearAll() {
        for (const [name, index] of [...this.scenesMap]) {
            const scene = this._getScene(index);
            if (scene) {
                this.Scene_Clear({ INDEX: index });
                await scene.destroy();
            }
            this.registry.dispose("scenes", index);
            this.scenesMap.delete(name);
        }
    }

    async Scene_Destroy({ INDEX }) {
        const scene = this._getScene(INDEX);
        if (!scene) return;

        await scene.destroy();

        this._release("scenes", INDEX);

        for (const [name, value] of this.scenesMap) {
            if (value === Number(INDEX)) {
                this.scenesMap.delete(name);
                break;
            }
        }
    }

    Scene_Clear({ INDEX }) {
        const scene = this._getScene(INDEX);
        if (!scene) return;

        for (const containerIndex of [...scene.containerIndices]) {
            this.Scene_RemoveContainer({
                INDEX,
                CONTAINER_IDX: containerIndex
            });
        }
    }

    // ====================== Node Transform ======================

    Scene_NodeSetTRS({ INDEX, NODE_IDX, TRS }) {
        const scene = this._getScene(INDEX);
        const node = scene?.getNodeByIndex(NODE_IDX);
        if (!node) return;

        this._applyTRS(node, TRS);
    }

    Scene_NodeSetParent({
        INDEX,
        CHILD_NODE_IDX,
        PARENT_NODE_IDX
    }) {
        const scene = this._getScene(INDEX);
        if (!scene) return;

        const child = scene.getNodeByIndex(CHILD_NODE_IDX);
        const parentIndex = Number(PARENT_NODE_IDX);
        const parent = parentIndex === -1
            ? scene.root
            : scene.getNodeByIndex(parentIndex);

        if (!child || !parent || child === scene.root || child === parent) {
            return;
        }

        // Prevent creating a parent-child cycle.
        let ancestor = parent;
        while (ancestor) {
            if (ancestor === child) return;
            ancestor = ancestor.parent;
        }

        child.parent?.removeChild(child);
        parent.addChild(child);

        if (child.worldMatrixIndex === -1) {
            scene.registerNode(child);
        }

        child.setDirty();
    }

    Scene_GetNodeMatrix({ INDEX, NODE_IDX }) {
        const scene = this._getScene(INDEX);
        const node = scene?.getNodeByIndex(NODE_IDX);

        if (!node || node.worldMatrixIndex === -1) return "[]";

        const offset = node.worldMatrixIndex * 16;
        const matrix = scene.worldMatrixBuffer.subarray(offset, offset + 16);

        return JSON.stringify(Array.from(matrix));
    }

    Scene_GetNodeTRS({ INDEX, NODE_IDX }) {
        const scene = this._getScene(INDEX);
        const node = scene?.getNodeByIndex(NODE_IDX);

        return node ? JSON.stringify(this._getTRS(node)) : "[]";
    }

    Scene_UpdateWorldMatrix({ INDEX }) {
        this._getScene(INDEX)?.update();
    }

    // ====================== Container ======================

    Scene_GetContainerRootIndex({ INDEX }) {
        const container = this._get("containers", INDEX);
        if (!container) return -2;
        return container.rootNode?.worldMatrixIndex ?? -1;
    }

    Scene_AddContainer({ INDEX, CONTAINER_IDX }) {
        const sceneIndex = Number(INDEX);
        const containerIndex = Number(CONTAINER_IDX);
        const scene = this._getScene(sceneIndex);
        const container = this._get("containers", containerIndex);

        if (!scene || !container?.rootNode) return;

        if (scene.containersMap.get(containerIndex) === container) return;

        // A mutable node tree belongs to one Scene at a time.
        if (container.rootNode.sceneIndex != null &&
            container.rootNode.sceneIndex !== sceneIndex) {
            return;
        }

        scene.addContainer(containerIndex);

        this._walkNodes(container.rootNode, node => {
            node.sceneIndex = sceneIndex;
        });
    }

    Scene_RemoveContainer({ INDEX, CONTAINER_IDX }) {
        const sceneIndex = Number(INDEX);
        const containerIndex = Number(CONTAINER_IDX);
        const scene = this._getScene(sceneIndex);

        if (!scene) return;

        const container = scene.containersMap.get(containerIndex);
        if (!container) return;

        // Clear Scene ownership before Scene.removeContainer disposes it.
        this._walkNodes(container.rootNode, node => {
            node.sceneIndex = null;
        });

        // Preserves the current Scene.removeContainer behavior:
        // detach, unregister nodes, and dispose the Container.
        scene.removeContainer(containerIndex);

        // The Container has been disposed, so release its Registry slot too.
        this._release("containers", containerIndex);
    }

    Scene_GetContainerMeshCount({ INDEX }) {
        const container = this._get("containers", INDEX);
        if (!container) return -2;
        return container.meshes?.length ?? -1;
    }

    // ====================== Skeleton ======================

    Scene_SkeletonGetJointCount({ INDEX }) {
        const skeleton = this._get("skeletons", INDEX);
        return skeleton?.numJoints ?? skeleton?.joints?.length ?? -1;
    }

    Scene_SkeletonSetJointTRS({ INDEX, NAME, TRS }) {
        const skeleton = this._get("skeletons", INDEX);
        const joint = skeleton?.joints?.find(j => j.name === NAME);
        if (!joint) return;
        this._applyTRS(joint, TRS);
    }

    Scene_SkeletonBindTexture({ INDEX, UNIT }) {
        if (!this.engine.core) return;
        const skeleton = this._get("skeletons", INDEX);
        const gl = this.engine.core.gl;

        gl.activeTexture(gl.TEXTURE0 + Number(UNIT));
        gl.bindTexture(gl.TEXTURE_2D, skeleton?.texture ?? null);
    }

    // ====================== MeshNode ======================

    Scene_MeshDraw({ INDEX, MODE } = {}) {
        if (!this.engine.core) return;
        const node = this._get("nodes", INDEX);
        if (!node || !node.visible || !node.vao || typeof node.draw !== "function" || node.worldMatrixIndex < 0) return;
        const scene = this._getScene(node.sceneIndex);
        const shader = this.engine.activeShader;
        if (!scene || !shader) return;
        const offset = node.worldMatrixIndex * 16;
        shader.setMat4("uModel", scene.worldMatrixBuffer.subarray(offset, offset + 16));
        
        // if (this._debugTimer++ % 60 === 0) console.log(node);
        node.draw(MODE);
    }

    Scene_MeshGetTexture({ INDEX, TEX_TYPE }) {
        const node = this._get("nodes", INDEX);
        const tex = node?.material?.[TEX_TYPE];
        return tex?.registryIndex ?? -1;
    }

    Scene_MeshGetParam({ INDEX, PARAM }) {
        const node = this._get("nodes", INDEX);
        if (!node) return "";

        const value = node.material?.[PARAM];
        if (value == null) return "";

        return Array.isArray(value) || ArrayBuffer.isView(value)
            ? JSON.stringify(Array.from(value))
            : value;
    }

    Scene_MeshGetLightmapParam({ INDEX, PARAM }) {
        const node = this._get("nodes", INDEX);

        if (!node) {
            return PARAM === "hasLightmap" ? "0" : -1;
        }

        switch (PARAM) {
            case "hasLightmap":
                return node.hasLightmap ? "1" : "0";
            case "lightmapIndex":
                return node.lightmapIndex ?? -1;
            default:
                return "";
        }
    }

    Scene_MeshGetLightmapScaleOffsetComp({ INDEX, COMP }) {
        const node = this._get("nodes", INDEX);
        const scaleOffset = node?.lightmapScaleOffset ?? [0, 0, 0, 0];

        switch (String(COMP).toUpperCase()) {
            case "X": return scaleOffset[0];
            case "Y": return scaleOffset[1];
            case "Z": return scaleOffset[2];
            case "W": return scaleOffset[3];
            default: return 0;
        }
    }
}