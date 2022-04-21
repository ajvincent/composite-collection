var MapOrSetType;
(function (MapOrSetType) {
    MapOrSetType["Map"] = "Map";
    MapOrSetType["Set"] = "Set";
    MapOrSetType["WeakMap"] = "WeakMap";
    MapOrSetType["WeakSet"] = "WeakSet";
})(MapOrSetType || (MapOrSetType = {}));
/** @public */
export default class CollectionType {
    argumentName;
    mapOrSetType;
    argumentType;
    description;
    argumentValidator;
    /**
     * A simple data structure.
     *
     * @param {string}        argumentName   The name of the argument.
     * @param {string}        mapOrSetType   "Map", "Set", "WeakMap", "WeakSet".
     * @param {string}        argumentType   A JSDoc-printable type for the argument.
     * @param {string}        description    A JSDoc-printable description.
     * @param {string | null} argumentValidator A method to use for testing the argument.
     */
    constructor(argumentName, mapOrSetType, argumentType, description, argumentValidator) {
        this.argumentName = argumentName.trim();
        this.mapOrSetType = mapOrSetType;
        this.argumentType = argumentType.trim();
        this.description = description.trim();
        this.argumentValidator = argumentValidator ? argumentValidator.trim() : null;
        Object.freeze(this);
    }
    get isMapArgument() {
        return this.mapOrSetType.endsWith("Map");
    }
}
Object.freeze(CollectionType);
Object.freeze(CollectionType.prototype);
//# sourceMappingURL=CollectionType.mjs.map