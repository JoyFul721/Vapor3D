// /lib/Registry/Registry.js

export class Registry {
    constructor() {
        // 存储对象实例的数组
        this.shaders = [];
        this.vaos = [];
        this.textures = [];
        this.fbos = [];
        this.stencilBuffers = [];
        this.nodes = [];
        this.scenes = [];
        this.containers = [];
        this.skeletons = [];
        this.animations = [];

        // 空闲索引栈
        this._freeIndices = {
            shaders: [], vaos: [], textures: [], fbos: [], stencilBuffers: [],
            nodes: [], scenes: [], containers: [], skeletons: [], animations: []
        };
    }

    /**
     * 分配资源并返回唯一索引
     */
    allocate(type, object) {
        const list = this[type];
        const freeStack = this._freeIndices[type];
        const index = freeStack.length > 0 ? freeStack.pop() : list.length;
        list[index] = object;
        if (object.registryIndex !== undefined) object.registryIndex = index;
        return index;
    }

 
    get(type, index) {
        return this[type][index] || null;
    }

    dispose(type, index) {
        const obj = this[type][index];
        if (obj) {
            if (typeof obj.destroy === 'function') {
                obj.destroy();
            }
            this[type][index] = null;
            this._freeIndices[type].push(index);
        }
    }

    clear() {
        for (const type of ['shaders', 'vaos', 'textures', 'fbos', 'stencilBuffers', 'nodes', 'scenes', 'containers', 'skeletons', 'animations']) {
            for (const obj of this[type]) obj?.destroy?.();
            this[type].length = 0;
            this._freeIndices[type] = [];
        }
    }
}