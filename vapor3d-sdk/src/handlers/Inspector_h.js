// /handlers/Inspector_h.js

export class InspectorHandlers {
    constructor(engineHandlers, sceneHandlers, timelineHandler, registry) {
        this.engine = engineHandlers;
        this.sceneHandler = sceneHandlers;
        this.timelineHandler = timelineHandler;
        this.registry = registry ?? engineHandlers.registry;

        this._typeMap = {
            shader: this.engine.shadersMap,
            vao: this.engine.vaosMap,
            fbo: this.engine.fbosMap,
            texture: this.engine.texturesMap,
            stencil: this.engine.stencilBuffersMap,
            scene: this.sceneHandler.scenesMap,
            container: this.sceneHandler.containersMap,
            timeline: this.timelineHandler.timelinesMap
        };

       this._globalTypes = new Set([
            'shader', 'vao', 'fbo', 'texture', 'stencil',
            'scene', 'container', 'timeline'
        ]);
        this._sceneTypes = new Set([
            'container', 'skeleton', 'animation', 'material', 'meshNode'
        ]);
        this._containerTypes = new Set([
            'meshNode', 'skeleton', 'animation', 'material'
        ]);
        // fetched by index from a container.
        this._containerIndexTypes = new Set([
            'meshNode', 'skeleton'
        ]);
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

    /*
    Global find
    */
    Inspector_Find({ TYPE, NAME }) {
        if (!this._globalTypes.has(TYPE)) return -1;
        return this._find(this._typeMap[TYPE], NAME);
    }

    /*
    Scene scope
    */
    Inspector_SceneFind({ SCENE_INDEX, TYPE, NAME }) {
        const scene = this._get('scenes', SCENE_INDEX);
        if (!scene) return -2;
        if (!this._sceneTypes.has(TYPE)) return -1;

        switch (TYPE) {
            case 'container':
                return this._find(scene.containersMap, NAME);
            case 'skeleton':
                return this._find(scene.skeletonsMap, NAME);
            case 'animation':
                return this._find(scene.animationsMap, NAME);
            case 'material':
                return this._find(scene.materialsMap, NAME);
            case 'meshNode':
                return this._findNodeInTree(scene.root, NAME, true);
            default:
                return -1;
        }
    }

    /*
    Container scope by name
    */
    Inspector_ContainerFind({ CONTAINER_INDEX, TYPE, NAME }) {
        const container = this._get('containers', CONTAINER_INDEX);
        if (!container) return -1;
        if (!this._containerTypes.has(TYPE)) return -1;

        switch (TYPE) {
            case 'meshNode':
                return this._findNodeInTree(container.rootNode, NAME, true);
            case 'skeleton':
                return this._findOwnedResource(container.skeletons, NAME);
            case 'animation':
                return this._findOwnedResource(container.animations, NAME);
            case 'material':
                return this._findMeshMaterial(container.meshes, NAME);
            default:
                return -1;
        }
    }

    /*
    Container scope by index
    */
    Inspector_ContainerGet({ CONTAINER_INDEX, TYPE, RESOURCE_INDEX } = {}) {
        const container = this._get('containers', CONTAINER_INDEX);
        if (!container) return -1;
        if (!this._containerIndexTypes.has(TYPE)) return -1;

        const i = Number(RESOURCE_INDEX);
        if (!Number.isInteger(i) || i < 0) return -1;

        const obj = TYPE === 'meshNode'
            ? container.meshes?.[i]
            : TYPE === 'skeleton'
                ? container.skeletons?.[i]
                : null;

        return obj?.registryIndex >= 0 ? obj.registryIndex : -1;
    }



    Inspector_ConsolePrint() {
        console.log(this);
    }

    _findNodeInTree(root, name, meshOnly = false) {
        if (!root) return -1;

        const target = String(name);
        const stack = [root];

        while (stack.length) {
            const node = stack.pop();

            // A MeshNode is anything carrying a .mesh field
            // The Mesh itself stays internal
            if (
                node.name === target &&
                (!meshOnly || node.mesh !== undefined)
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

        const target = String(name);
        for (const resource of resources) {
            if (resource?.name === target) {
                return Number.isInteger(resource.registryIndex)
                    ? resource.registryIndex
                    : -1;
            }
        }

        return -1;
    }

    // container.meshes is MeshNode[]
    // walk each node's mesh.primitives to reach the materials
    // Mesh itself is a hop, not a lookup layer.
    _findMeshMaterial(meshNodes, name) {
        if (!meshNodes) return -1;

        const target = String(name);
        for (const meshNode of meshNodes) {
            for (const prim of meshNode?.mesh?.primitives ?? []) {
                const mat = prim?.material;
                if (mat?.name !== target) continue;

                const idx = mat.registryIndex;
                if (Number.isInteger(idx) && idx >= 0) return idx;
            }
        }

        return -1;
    }
}