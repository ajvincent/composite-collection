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
    /** @public @const @type {string} */
    this.argumentName   = argumentName;

    /**
     * @public
     * @const
     * @type {string}
     */
    this.mapOrSetType   = mapOrSetType;

    /** @public @const @type {string} */
    this.argumentType   = argumentType;

    /** @public @const @type {string} */
    this.description    = description;

    /** @public @const @type {string?} */
    this.argumentValidator = argumentValidator;

    Object.freeze(this);
  }

  get isMapArgument() {
    return this.mapOrSetType.endsWith("Map");
  }
}
Object.freeze(CollectionType);
Object.freeze(CollectionType.prototype);