/** @public */
export default class CollectionType {
    argumentName;
    mapOrSetType;
    jsDocType;
    tsType;
    description;
    argumentValidator;
    /**
     * A simple data structure.
     *
     * @param {string}        argumentName      The name of the argument.
     * @param {string}        mapOrSetType      "Map", "Set", "WeakMap", "WeakSet".
     * @param {string}        jsDocType         A JSDoc-printable type for the argument.
     * @param {string}        tsType            A TypeScript type for the argument.
     * @param {string}        description       A JSDoc-printable description.
     * @param {string | null} argumentValidator A method to use for testing the argument.
     */
    constructor(argumentName, mapOrSetType, jsDocType, tsType, description, argumentValidator) {
        this.argumentName = argumentName.trim();
        this.mapOrSetType = mapOrSetType;
        this.jsDocType = jsDocType.trim();
        this.tsType = tsType.trim();
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