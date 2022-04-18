/**
 * @public
 */
export default class CollectionType {
  /**
   * A simple data structure.
   *
   * @param {string}    argumentName   The name of the argument.
   * @param {string}    mapOrSetType   "Map", "Set", "WeakMap", "WeakSet".
   * @param {string}    argumentType   A JSDoc-printable type for the argument.
   * @param {string}    description    A JSDoc-printable description.
   * @param {string?}   argumentValidator A method to use for testing the argument.
   */
  constructor(argumentName, mapOrSetType, argumentType, description, argumentValidator) {
    CollectionType.#validateString("argumentName", argumentName);
    if (!CollectionType.#mapOrSetTypes.has(mapOrSetType))
      throw new Error(`mapOrSetType must be "Map", "Set", "WeakMap", or "WeakSet"!`);
    CollectionType.#validateString("argumentType", argumentType);
    CollectionType.#validateString("description", description);

    /**
     * @public
     * @constant
     * @type {string}
     */
    this.argumentName = argumentName.trim();

    /**
     * @public
     * @constant
     * @type {string}
     */
    this.mapOrSetType = mapOrSetType;

    /**
     * @public
     * @constant
     * @type {string}
     */
    this.argumentType = argumentType.trim();

    /**
     * @public
     * @constant
     * @type {string}
     */
    this.description = description.trim();

    /**
     * @public
     * @constant
     * @type {string?}
     */
    this.argumentValidator = argumentValidator ? argumentValidator.trim() : null;

    Object.freeze(this);
  }

  get isMapArgument() {
    return this.mapOrSetType.endsWith("Map");
  }

  static #validateString(name, value) {
    if ((typeof value !== "string") || !value.trim())
      throw new Error(`${name} must be a non-empty string!`);
  }

  static #mapOrSetTypes = new Set(["Map", "Set", "WeakMap", "WeakSet"]);
}
Object.freeze(CollectionType);
Object.freeze(CollectionType.prototype);
