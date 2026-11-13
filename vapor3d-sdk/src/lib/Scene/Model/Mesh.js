// /lib/Scene//Model/Mesh.js

/**
* Mirror of a glTF mesh entry. A bag of primitives.
* Several MeshNodes can point at the same Mesh
*/
export class Mesh {
    constructor(name = '') {
        this.name = name;
        this.primitives = [];

        this.registryIndex = -1;
    }
}