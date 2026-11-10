/**
 * array wrapper for safely passing in Scratch
 * # NOTE: SafeArray are immutable objects
 */
export class SafeArray extends String {
    /**
     * the underlying array
     * @property array
     */
    _array;

    /**
     * @param {any[]} array
     * @param {string} arrayString
     */
    constructor(arrayString, array) {
        super(arrayString);
        this._array = Object.freeze(array);
    }

    /**
     * create the wrapped array from given array or string
     * @param {string|any[]} arrayOrString
     * @returns {SafeArray|null}
     */
    static create(arrayOrString) {
        switch (typeof arrayOrString) {
            case "string":
                return SafeArray.createWithString(arrayOrString);
            case "object": {
                return SafeArray.createWithArray(arrayOrString);
            }
            default:
                return null;
        }
    }

    /**
     * create SafeArray with string
     * @param {string} string
     * @returns {SafeArray}
     */
    static createWithString(string) {
        console.log("parse new SafeArray");
        try {
            const array = JSON.parse(string);
            return new SafeArray(string, array);
        } catch (e) {
            console.error("unable to parse array:", e);
            return null;
        }
    }

    /**
     * create SafeArray with the existing array
     * @param {any[]} array
     * @returns {SafeArray}
     */
    static createWithArray(array) {
        return new SafeArray(`[${array}]`, array);
    }

    get underlying() {
        return this._array;
    }
}
