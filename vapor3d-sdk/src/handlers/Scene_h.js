// /handlers/Scene_h.js

import { Scene, TransformNode, Material } from "../lib/index.js";
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

    Scene_Create({ NAME, MAXNODES }) {
        if (!this.engine.core) return -1;
        const scene = new Scene(NAME || "Main", MAXNODES || 8192, this.registry);
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

    Scene_CreateNode({ NAME, SCENE_IDX, PARENT_NODE_IDX }) {
        const scene = this._getScene(Number(SCENE_IDX));
        if (!scene || scene._destroyed) return -1;

        const parentIndex = Number(PARENT_NODE_IDX);
        const parent = parentIndex === -1
            ? scene.root
            : this._get("nodes", parentIndex);
        if (!parent) return -2;

        if (parent !== scene.root && parent.sceneIndex !== scene.registryIndex) return -1;
        const node = new TransformNode(NAME || `node_${scene.registryIndex}`);

        if (!scene.attachNode(node, parent)) return -3;
        return this.registry.allocate("nodes", node);
    }

    Scene_DestroyNode({ NODE_IDX }) {
        const idx = Number(NODE_IDX);
        const node = this._get("nodes", idx);
        if (!node) return;
        if (node.parent === null) return;

        const all = [];
        const stack = [node];
        while (stack.length) {
            const n = stack.pop();
            all.push(n);
            stack.push(...(n.children ?? []));
        }

        // 回收矩阵
        this._getScene(node.sceneIndex)?.detachNode(node);

        // 注册表注销
        for (const n of all) {
            if (n.registryIndex >= 0) this.registry.dispose("nodes", n.registryIndex);
        }
    }

    Scene_NodeSetTRS({ NODE_IDX, TRS }) {
        const node = this._get("nodes", NODE_IDX);
        if (!node) return;
        this._applyTRS(node, TRS);
    }

    Scene_NodeSetParent({ CHILD_NODE_IDX, PARENT_NODE_IDX }) {
        const child = this._get("nodes", CHILD_NODE_IDX);
        if (!child) return;

        const scene = this._getScene(child.sceneIndex);
        if (!scene) return;

        const parentIndex = Number(PARENT_NODE_IDX);
        const parent = parentIndex === -1
            ? scene.root
            : this._get("nodes", parentIndex);

        if (!parent || child === scene.root || child === parent) return;

        // Prevent creating a parent-child cycle.
        let ancestor = parent;
        while (ancestor) {
            if (ancestor === child) return;
            ancestor = ancestor.parent;
        }

        child.parent?.removeChild(child);
        parent.addChild(child);

        // Register any unregistered nodes in the moved subtree
        this._walkNodes(child, node => {
            if (node.worldMatrixIndex === -1) {
                scene.registerNode(node);
            }
        });

        child.setDirty();
    }

    Scene_GetNodeMatrix({ NODE_IDX }) {
        const node = this._get("nodes", NODE_IDX);
        if (!node || node.worldMatrixIndex === -1) return "[]";

        const scene = this._getScene(node.sceneIndex);
        if (!scene) return "[]";

        const offset = node.worldMatrixIndex * 16;
        const matrix = scene.worldMatrixBuffer.subarray(offset, offset + 16);

        return JSON.stringify(Array.from(matrix));
    }

    Scene_GetNodeTRS({ NODE_IDX }) {
        const node = this._get("nodes", NODE_IDX);
        return node ? JSON.stringify(this._getTRS(node)) : "[]";
    }

    Scene_UpdateWorldMatrix({ INDEX }) {
        this._getScene(INDEX)?.update();
    }

    // ====================== Container ======================

    Scene_GetContainerRootIndex({ INDEX }) {
        const container = this._get("containers", INDEX);
        if (!container) return -3;

        const ri = container.rootNode?.registryIndex;
        // -1 在 SetParent 约定里表示 root，不能当成合法节点索引透出去
        return (ri == null || ri < 0) ? -2 : ri;
    }

    Scene_AddContainer({ INDEX, CONTAINER_IDX }) {
        const scene = this._getScene(Number(INDEX));
        const containerIndex = Number(CONTAINER_IDX);
        const container = this._get("containers", containerIndex);

        if (!scene || !container?.rootNode) return;

        scene.addContainer(containerIndex);
    }

    Scene_RemoveContainer({ INDEX, CONTAINER_IDX }) {
        const scene = this._getScene(Number(INDEX));
        if (!scene) return;

        // 仅摘除
        scene.removeContainer(Number(CONTAINER_IDX));
    }

    Scene_GetContainerMeshCount({ INDEX }) {
        const container = this._get("containers", INDEX);
        if (!container) return -2;
        return container.meshes?.length ?? -1;
    }

    // ====================== Skeleton ======================

    Scene_SkeletonGetJointCount({ INDEX }) {
        const skeleton = this._get("skeletons", INDEX);
        return skeleton ? skeleton.joints.length : -1;
    }

    Scene_SkeletonGetJoint({ INDEX, NAME }) {
        const skeleton = this._get("skeletons", INDEX);
        const joint = skeleton?.joints?.find(j => j.name === NAME);
        return joint?.registryIndex ?? -1;
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

    Scene_MeshIsVisible({ INDEX }) {
        const node = this._get("nodes", INDEX);
        if (!node) return 0;
        return node.visible;
    }

    Scene_MeshSetVisible({ NODE_IDX, VISIBLE, RECURSIVE }) {
        const node = this._get("nodes", NODE_IDX);
        if (!node) {
            console.error(`Vapor3D: SetVisible failed, node index ${NODE_IDX} not found`);
            return;
        }
        const v = Number(VISIBLE) === 1;
        if (String(RECURSIVE) === "true") {
            this._setVisibleTree(node, v);
        } else {
            node.visible = v;
        }
    }
    _setVisibleTree(node, v) {
        if (!node) return;

        node.visible = v;

        for (const child of node.children ?? []) {
            this._setVisibleTree(child, v);
        }
    }

    Scene_MeshGetTexture({ INDEX, TEX_TYPE }) { // legacy
        const node = this._get("nodes", INDEX);
        const tex = node?.material?.[TEX_TYPE];
        return tex?.registryIndex ?? -1;
    }

    Scene_MeshGetParam({ INDEX, PARAM }) { // legacy
        const node = this._get("nodes", INDEX);
        if (!node) return "";

        const value = node.material?.[PARAM];
        if (value == null) return "";

        return Array.isArray(value) || ArrayBuffer.isView(value)
            ? JSON.stringify(Array.from(value))
            : value;
    }

    Scene_MeshGetMaterial({ INDEX }) {
        const node = this._get("nodes", INDEX);
        return node?.material?.registryIndex ?? -1;
    }

    Scene_MeshSetMaterial({ NODE_IDX, MAT_IDX }) {
        const node = this._get("nodes", NODE_IDX);
        if (!node) {
            console.error(`Vapor3D: SetMaterial failed, node index ${NODE_IDX} not found`);
            return;
        }

        const mat = this._get("materials", MAT_IDX);
        if (!mat) {
            console.error(`Vapor3D: SetMaterial failed, material index ${MAT_IDX} not found`);
            return;
        }

        const template = node.sourceMesh;

        // 无模板节点：只改自身
        if (!template) {
            const oldMat = node.material;
            node.material = mat;
            this._get("scenes", node.sceneIndex)?.rebindMaterial(oldMat, mat);
            return;
        }

        // 有模板：改模板 + 所有共享该模板的节点
        template.material = mat;

        const nodes = this.registry.nodes ?? [];
        for (const other of nodes) {
            if (!other || other.sourceMesh !== template) continue;

            const oldMat = other.material;
            other.material = mat;
            this._get("scenes", other.sceneIndex)?.rebindMaterial(oldMat, mat);
        }
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

    // ====================== Material ======================

    Material_Create({ NAME }) {
        const mat = new Material();
        mat.name = NAME || "";
        return this.registry.allocate("materials", mat);
    }

    Material_GetTexture({ INDEX, TEX_TYPE }) {
        const mat = this._get("materials", INDEX);
        const tex = mat?.[TEX_TYPE];
        return tex?.registryIndex ?? -1;
    }

    Material_SetTexture({ INDEX, TEX_TYPE, TEX_IDX }) {
        const mat = this._get("materials", INDEX);
        if (!mat) return console.warn(`Vapor3D: material index ${INDEX} not found`);

        const texIdx = Number(TEX_IDX);
        if (texIdx < 0) {
            mat[TEX_TYPE] = null;
            return;
        }

        const tex = this._get("textures", texIdx);
        if (!tex) return console.warn(`Vapor3D: texture index ${texIdx} not found`);

        mat[TEX_TYPE] = tex;
    }

    Material_GetParam({ INDEX, PARAM }) {
        const mat = this._get("materials", INDEX);
        const value = mat?.[PARAM] ?? "";

        return Array.isArray(value) || ArrayBuffer.isView(value)
            ? JSON.stringify(Array.from(value))
            : value;
    }

    Material_SetParam({ INDEX, PARAM, VALUE }) {
        const mat = this._get("materials", INDEX);
        if (!mat) {
            console.error(`Vapor3D: SetParam failed, material index ${INDEX} not found.`);
            return;
        }

        if (PARAM === "baseColor") {
            let arr = VALUE;
            if (typeof arr === "string") {
                try { arr = JSON.parse(arr); } catch {
                    console.error(`Vapor3D: SetParam baseColor parse failed, value = "${VALUE}"`);
                    return;
                }
            }
            if (!Array.isArray(arr) && !ArrayBuffer.isView(arr)) {
                console.error(`Vapor3D: SetParam baseColor expects array, got ${typeof arr}`);
                return;
            }
            mat.baseColor = [0, 1, 2, 3].map(i => {
                const n = Number(arr[i] ?? 0);
                return Number.isFinite(n) ? n : 0;
            });
            return;
        }

        const n = Number(VALUE);
        if (!Number.isFinite(n)) {
            console.error(`Vapor3D: SetParam ${PARAM} expects number, got "${VALUE}"`);
            return;
        }
        mat[PARAM] = n;
    }
}