export class InspectorHandlers {
    constructor(engineHandlers, sceneHandlers, registry) {
        this.engine = engineHandlers;
        this.sceneHandler = sceneHandlers;
        this.registry = registry ?? engineHandlers.registry;
    }

    _get(type, index) {
        const i = Number(index);
        if (!Number.isInteger(i) || i < 0) return null;
        return this.registry?.get(type, i) ?? null;
    }

    _find(map, name) {
        const value = map?.get(String(name));
        if (value == null) return -1;

        const indices = value instanceof Set || Array.isArray(value)
            ? value
            : [value];

        for (const index of indices) {
            const i = Number(index);
            if (Number.isInteger(i) && i >= 0) return i;
        }

        return -1;
    }

    _findGlobal(type, name) {
        const maps = {
            shader: this.engine.shadersMap,
            vao: this.engine.vaosMap,
            fbo: this.engine.fbosMap,
            texture: this.engine.texturesMap,
            stencil: this.engine.stencilBuffersMap,
            scene: this.sceneHandler.scenesMap,
            container: this.sceneHandler.containersMap
        };

        return this._find(maps[type], name);
    }

    Inspector_Find({ TYPE, NAME }) {
        return this._findGlobal(TYPE, NAME);
    }


    Inspector_SceneFind({ SCENE_INDEX, TYPE, NAME }) {
        const scene = this.registry.scenes[SCENE_INDEX];
        if (!scene) return -2;

        switch (TYPE) {
            case "container":
                return this._find(scene.containersMap, NAME);
            case "skeleton":
                return this._find(scene.skeletonsMap, NAME);
            case "animation":
                return this._find(scene.animationsMap, NAME);
            case "mesh":
                return this._findNodeInTree(scene.root, NAME);
            default:
                return -1;
        }
    }

    Inspector_ContainerFind({ CONTAINER_INDEX, TYPE, NAME }) {
        const container = this.registry.containers[CONTAINER_INDEX];
        if (!container) return -1;

        switch (TYPE) {
            case "mesh":
                return this._findNodeInTree(container.rootNode, NAME, true);
            case "skeleton":
                return this._findOwnedResource(container.skeletons, NAME);
            case "animation":
                return this._findOwnedResource(container.animations, NAME);
            default:
                return -1;
        }
    }

    Inspector_ContainerGet({ CONTAINER_INDEX, TYPE, RESOURCE_INDEX } = {}) {
        const container = this._get("containers", CONTAINER_INDEX);
        if (!container) return -1;
        const i = Number(RESOURCE_INDEX);
        if (!Number.isInteger(i) || i < 0) return -1;
        const obj = TYPE === "mesh" ? container.meshes?.[i] : TYPE === "skeleton" ? container.skeletons?.[i] : null;
        return Number.isInteger(obj?.registryIndex) && obj.registryIndex >= 0 ? obj.registryIndex : -1;
    }

    Inspector_ConsolePrint(){
        console.log(this);
        // console.log(this.engine.activeShader)
    }

    _findNodeInTree(root, name, meshOnly = false) {
        if (!root) return -1;

        const target = String(name);
        const stack = [root];

        while (stack.length) {
            const node = stack.pop();

            if (
                node.name === target &&
                (!meshOnly || node.isSkinned !== undefined && node.vao !== undefined)
            ) {
                return Number.isInteger(node.registryIndex)
                    ? node.registryIndex
                    : -1;
            }

            for (const child of node.children ?? []) {
                stack.push(child);
            }
        }

        return -1;
    }

    _findOwnedResource(resources, name) {
        if (!resources) return -1;

        for (const resource of resources) {
            if (resource?.name === String(name)) {
                return Number.isInteger(resource.registryIndex)
                    ? resource.registryIndex
                    : -1;
            }
        }

        return -1;
    }

    Inspector_MeshFind({ CONTAINER_INDEX, TYPE, NAME }) {
        return -1;
    }
}