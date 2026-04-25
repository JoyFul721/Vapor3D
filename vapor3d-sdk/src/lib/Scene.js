export class Scene {
    constructor(name = "MainScene") {
        this.name = name;
        this.models = new Map();
        // this.lights = new Map();
    }

    addModel(id, model) {
        if (this.models.has(id)) {
            this.models.get(id).destroy();
        }
        this.models.set(id, model);
    }

    getModel(id) {
        return this.models.get(id) || null;
    }

    removeModel(id) {
        const model = this.models.get(id);
        if (model) {
            model.destroy();
            this.models.delete(id);
        }
    }

    destroy() {
        this.models.forEach(model => model.destroy());
        this.models.clear();
    }
}