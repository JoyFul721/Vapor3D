// /handlers/Scene_h.js

import { Scene, TransformNode, Material } from "../lib/index.js";
import { Math3D } from "../lib/Tools/Math3D.js";

export class SceneHandlers {
    constructor(engineHandlers, registry) {
        this.engine = engineHandlers;
        engineHandlers.scene = this;
        this.registry = registry ?? engineHandlers.registry;

        this.scenesMap = new Map(); // NAME -> registry scene index
    }

    _get(type, index) {
        return this.registry?.get(type, Number(index)) ?? null;
    }

    // Detach an entry from the registry without destroying the object
    // scene-level destruction goes through registry.dispose
    _release(type, index) {
        const i = Number(index);
        const list = this.registry?.[type];
        const free = this.registry?._freeIndices?.[type];

        if (!list || !free || !list[i]) return;

        list[i] = null;
        if (!free.includes(i)) free.push(i);
    }

    _getScene(index) {
        return this._get("scenes", index);
    }

    _walkNodes(node, callback) {
        if (!node) return;
        callback(node);
        for (const child of node.children ?? []) this._walkNodes(child, callback);
    }

    _getTRS(node) {
        return [...node.position, ...node.quaternion, ...node.scale];
    }

    _applyTRS(node, trs) {
        const data = Math3D.TRS_parse(trs);
        if (!data) return;

        node.position = data.position;
        node.quaternion = Math3D.quat_fromEuler(...data.euler);
        node.scale = data.scale;
        node.setDirty();
    }



    /*
    Scene Management
    */
    Scene_Create({ NAME, MAXNODES }) {
        if (!this.engine.core) return -1;

        const scene = new Scene(NAME || "Main", MAXNODES || 8192, this.registry);
        const index = this.registry.allocate("scenes", scene);

        scene.registryIndex = index;
        this.scenesMap.set(NAME, index);
        return index;
    }

    /**
     * Destroy the scene instance and every resource it holds
     */
    async Scene_Destroy({ INDEX }) {
        const idx = Number(INDEX);
        const scene = this._getScene(idx);
        if (!scene) return;

        // Snapshot before destroy() clears these
        const containerIndices = [...scene.containerIndices];
        const nodeIndices = new Set();
        for (const node of scene.nodes) {
            if (node && node.registryIndex >= 0) nodeIndices.add(node.registryIndex);
        }

        await scene.destroy(); // detaches all containers + unregisters nodes

        // Destroy resources this scene held
        for (const containerIndex of containerIndices) {
            this.registry.dispose("containers", containerIndex);
        }
        // Node destroy is idempotent; containers may have already done some
        for (const nodeIndex of nodeIndices) {
            this.registry.dispose("nodes", nodeIndex);
        }

        // Destroy the Scene instance itself.
        this.registry.dispose("scenes", idx);

        for (const [name, value] of this.scenesMap) {
            if (value === idx) {
                this.scenesMap.delete(name);
                break;
            }
        }
    }

    /**
     * Detach everything the scene holds, without destroying any object
     */
    Scene_Clear({ INDEX }) {
        const scene = this._getScene(INDEX);
        if (!scene) return;

        for (const containerIndex of [...scene.containerIndices]) {
            scene.removeContainer(containerIndex);
        }
    }

    /**
     * Destroy all scenes and every resource they hold
     */
    async Scene_DestroyAll() {
        const indices = [...this.scenesMap.values()];
        for (const index of indices) {
            await this.Scene_Destroy({ INDEX: index });
        }
    }



    /*
     Node Transform
    */
    Scene_CreateNode({ NAME, SCENE_IDX, PARENT_NODE_IDX }) {
        const scene = this._getScene(Number(SCENE_IDX));
        if (!scene || scene._destroyed) return -1;

        const parentIndex = Number(PARENT_NODE_IDX);
        const parent = parentIndex === -1 ? scene.root : this._get("nodes", parentIndex);
        if (!parent) return -2;
        if (parent !== scene.root && parent.sceneIndex !== scene.registryIndex) return -1;

        const node = new TransformNode(NAME || `node_${scene.registryIndex}`);
        if (!scene.attachNode(node, parent)) return -3;

        return this.registry.allocate("nodes", node);
    }

    Scene_DestroyNode({ NODE_IDX }) {
        const node = this._get("nodes", NODE_IDX);
        if (!node) return;
        if (node.parent === null) return;

        // Collect the whole subtree before detaching
        const all = [];
        const stack = [node];
        while (stack.length) {
            const n = stack.pop();
            all.push(n);
            stack.push(...(n.children ?? []));
        }

        // Detach from scene
        this._getScene(node.sceneIndex)?.detachNode(node);

        // Destroy each node via registry
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
        const parent = parentIndex === -1 ? scene.root : this._get("nodes", parentIndex);
        if (!parent) return;
        if (child === scene.root || child === parent) return;

        // Guard against parent-child cycles
        let ancestor = parent;
        while (ancestor) {
            if (ancestor === child) return;
            ancestor = ancestor.parent;
        }

        child.parent?.removeChild(child);
        parent.addChild(child);

        // Re-register any node in the moved subtree that lost its slot
        this._walkNodes(child, (n) => {
            if (n.worldMatrixIndex === -1) scene.registerNode(n);
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
        if (!node) return "[]";
        return JSON.stringify(this._getTRS(node));
    }

    Scene_UpdateWorldMatrix({ INDEX }) {
        this._getScene(INDEX)?.update();
    }



    /*
    Container
    */
    Scene_GetContainerRootIndex({ INDEX }) {
        const container = this._get("containers", INDEX);
        if (!container) return -3;

        const ri = container.rootNode?.registryIndex;
        return (ri == null || ri < 0) ? -2 : ri;
    }

    Scene_AddContainer({ INDEX, CONTAINER_IDX }) {
        const scene = this._getScene(Number(INDEX));
        const containerIndex = Number(CONTAINER_IDX);
        const container = this._get("containers", containerIndex);

        if (!scene) return;
        if (!container?.rootNode) return;

        scene.addContainer(containerIndex);
    }

    Scene_RemoveContainer({ INDEX, CONTAINER_IDX }) {
        const scene = this._getScene(Number(INDEX));
        if (!scene) return;

        // Detach only
        scene.removeContainer(Number(CONTAINER_IDX));
    }

    Scene_GetContainerMeshCount({ INDEX }) {
        const container = this._get("containers", INDEX);
        if (!container) return -2;
        return container.meshes?.length ?? -1;
    }



    /*
    Skeleton
    */
    Scene_SkeletonGetJointCount({ INDEX }) {
        const skeleton = this._get("skeletons", INDEX);
        if (!skeleton) return -1;
        return skeleton.joints.length;
    }

    Scene_SkeletonGetJoint({ INDEX, NAME }) {
        const skeleton = this._get("skeletons", INDEX);
        const joint = skeleton?.joints?.find((j) => j.name === NAME);
        return joint?.registryIndex ?? -1;
    }

    Scene_SkeletonBindTexture({ INDEX, UNIT }) {
        if (!this.engine.core) return;

        const skeleton = this._get("skeletons", INDEX);
        const gl = this.engine.core.gl;

        gl.activeTexture(gl.TEXTURE0 + Number(UNIT));
        gl.bindTexture(gl.TEXTURE_2D, skeleton?.texture ?? null);
    }


    /**
     * MeshNode
     *
     * MeshNode is a thin instance wrapper that holds a mesh reference plus
     * per-node state (visible, skeleton, lightmap).
     * All geometry and material work happens on Primitive
     */
    Scene_MeshNodeGetPrimitive({ NODE_IDX, PRIM_IDX }) {
        const node = this._get("nodes", NODE_IDX);
        const prim = node?.mesh?.primitives?.[Number(PRIM_IDX)];
        return prim?.registryIndex ?? -1;
    }

    Scene_MeshNodeGetPrimitiveCount({ NODE_IDX }) {
        const node = this._get("nodes", NODE_IDX);
        return node?.mesh?.primitives?.length ?? 0;
    }

    Scene_MeshNodeGetSkeleton({ NODE_IDX }) {
        const node = this._get("nodes", NODE_IDX);
        const skel = node?.skeleton;
        return skel?.registryIndex ?? -1;
    }

    Scene_MeshNodeUploadMatrix({ NODE_IDX, UNIFORM } = {}) {
        if (!this.engine.core) return;

        const node = this._get("nodes", NODE_IDX);
        if (!node || node.worldMatrixIndex < 0) return;

        const scene = this._getScene(node.sceneIndex);
        const shader = this.engine.activeShader;
        if (!scene || !shader) return;

        const offset = node.worldMatrixIndex * 16;
        shader.setMat4(
            UNIFORM || "uModel",
            scene.worldMatrixBuffer.subarray(offset, offset + 16)
        );
    }

    Scene_MeshNodeIsVisible({ NODE_IDX }) {
        const node = this._get("nodes", NODE_IDX);
        if (!node) return 0;
        return node.visible;
    }

    Scene_MeshNodeSetVisible({ NODE_IDX, VISIBLE, RECURSIVE }) {
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
        for (const child of node.children ?? []) this._setVisibleTree(child, v);
    }

    Scene_MeshNodeGetLightmapParam({ NODE_IDX, PARAM }) {
        const node = this._get("nodes", NODE_IDX);
        if (!node) return PARAM === "hasLightmap" ? "0" : -1;

        switch (PARAM) {
            case "hasLightmap":
                return node.hasLightmap ? "1" : "0";
            case "lightmapIndex":
                return node.lightmapIndex ?? -1;
            default:
                return "";
        }
    }

    Scene_MeshNodeGetLightmapScaleOffsetComp({ NODE_IDX, COMP }) {
        const node = this._get("nodes", NODE_IDX);
        const s = node?.lightmapScaleOffset ?? [0, 0, 0, 0];

        switch (String(COMP).toUpperCase()) {
            case "X": return s[0];
            case "Y": return s[1];
            case "Z": return s[2];
            case "W": return s[3];
            default: return 0;
        }
    }



    /**
     * Primitive
     *
     * The actual draw unit.
     * one Primitive = one VAO + one Material.
     */
    Primitive_Draw({ PRIM_IDX, MODE } = {}) {
        const prim = this._get("primitives", PRIM_IDX);
        if (!prim) return;
        prim.draw(MODE);
    }

    Primitive_GetMaterial({ PRIM_IDX }) {
        const prim = this._get("primitives", PRIM_IDX);
        return prim?.material?.registryIndex ?? -1;
    }

    Primitive_SetMaterial({ PRIM_IDX, MAT_IDX }) {
        const prim = this._get("primitives", PRIM_IDX);
        if (!prim) {
            console.error(`Vapor3D: SetMaterial failed, primitive index ${PRIM_IDX} not found`);
            return;
        }
        const mat = this._get("materials", MAT_IDX);
        if (!mat) {
            console.error(`Vapor3D: SetMaterial failed, material index ${MAT_IDX} not found`);
            return;
        }
        prim.material = mat;
    }

    Primitive_GetVAO({ PRIM_IDX }) {
        const prim = this._get("primitives", PRIM_IDX);
        return prim?.vao?.registryIndex ?? -1;
    }



    /*
    Material
    */
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
        if (!mat) {
            console.warn(`Vapor3D: material index ${INDEX} not found`);
            return;
        }

        const texIdx = Number(TEX_IDX);
        if (texIdx < 0) {
            mat[TEX_TYPE] = null;
            return;
        }

        const tex = this._get("textures", texIdx);
        if (!tex) {
            console.warn(`Vapor3D: texture index ${texIdx} not found`);
            return;
        }
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
            mat.baseColor = [0, 1, 2, 3].map((i) => {
                const n = Number(arr[i] ?? 0);
                return Number.isFinite(n) ? n : 0;
            });
            // Keep sync with baseColor[3]. Just to make things easier for users
            mat.alpha = mat.baseColor[3];
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
