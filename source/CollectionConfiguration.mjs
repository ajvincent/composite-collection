/**
 * @module source/CollectionConfiguration.mjs
 *
 * @fileoverview
 *
 * This defines a data structure for configuring a composite of Maps and Sets.
 */

/**
 * @public
 */
class CollectionType {
  /**
   * A simple data structure.
   *
   * @param {string}    argumentName   The name of the argument.
   * @param {string}    mapOrSetType   The name of the map or set type.
   *                                   Map, Set, WeakMap, WeakSet, or something that inherits from it.
   * @param {string}    argumentType   A JSDoc-printable type for the argument.
   * @param {string}    description    A JSDoc-printable description.
   * @param {Function?} argumentValidator A method to use for testing the argument.
   */
  constructor(argumentName, mapOrSetType, argumentType, description, argumentValidator) {
    /** @public @readonly @type {string} */
    this.argumentName   = argumentName;

    /** @public @readonly @type {string} */
    this.mapOrSetType   = mapOrSetType;

    /** @public @readonly @type {string} */
    this.argumentType   = argumentType;

    /** @public @readonly @type {string} */
    this.description    = description;

    /** @public @readonly @type {Function?} */
    this.argumentValidator = argumentValidator;

    Object.freeze(this);
  }
}
Object.freeze(CollectionType);
Object.freeze(CollectionType.prototype);

/**
 * A configuration manager for a single composite collection.
 *
 * @public
 */
export default class CollectionConfiguration {
  /** @readonly */
  static #PREDEFINED_TYPES = new Set(["Map", "Set", "WeakMap", "WeakSet"]);

  /** @type {string[]} */
  #argumentNames = new Set();

  /** @type {string} */
  #className;

  /** @type {CollectionType[]} */
  #collectionTypes = [];

  /** @type {Function?} */
  #valueFilter = null;

  /** @type {string} */
  #valueJSDoc = null;

  /** @type {string?} */
  #fileoverview = null;

  /** @type {boolean} */
  #holdsWeak = false;

  /** @type {number} */
  #setCount = 0;

  /**
   * Validate a string argument.
   * @param {string}  argumentName The name of the argument.
   * @param {string}  value        The argument value.
   * @param {boolean} mayOmit      True if the caller may omit the argument.
   *
   * @private
   */
  #stringArg(argumentName, value, mayOmit = false) {
    if ((typeof value !== "string") || (value.length === 0))
      throw new Error(`${argumentName} must be a non-empty string${mayOmit ? " or omitted" : ""}!`);
  }

  #identifierArg(argName, identifier) {
    // XXX ajvincent When we have espree, use it to quickly check that the name is a valid identifier.
    this.#stringArg(argName, identifier);
  }

  /**
   * Validate a function argument.
   * @param argumentName The name of the function.
   * @param value        The function.
   *
   * @private
   */
  #functionArg(argumentName, value, mayOmit = false) {
    if (typeof value !== "function")
      throw new Error(`${argumentName} must be a function${mayOmit ? " or omitted" : ""}!`);
  }

  #jsdocField(argumentName, value, mayOmit = false) {
    this.#stringArg(argumentName, value, mayOmit);
    if (value.includes("*/"))
      throw new Error(argumentName + " contains a comment that would end the JSDoc block!");
    // XXX ajvincent More advanced JSDoc validation is a good idea.
  }

  /**
   * @param {string} className The name of the class to define.
   * @constructor
   */
  constructor(className) {
    this.#identifierArg("className", className);
    if (!className.endsWith("Map") && !className.endsWith("Set"))
      throw new Error(`The class name must end with "Map" or "Set"!`);
    if (CollectionConfiguration.#PREDEFINED_TYPES.has(className))
      throw new Error(`You can't override the ${className} primordial!`);

    this.#className = className;

    Reflect.preventExtensions(this);
  }

  /**
   * The name of the class.
   *
   * @type {string}
   * @public
   * @readonly
   */
  get className() {
    return this.#className;
  }

  /**
   * @returns {boolean}
   * @public
   */
  get holdsWeak() {
    return this.#holdsWeak;
  }

  /**
   * @returns {number}
   * @public
   */
  get setCount() {
    return this.#setCount;
  }

  /**
   * A file overview to feed into the generated module.
   * @type {string?}
   * @public
   */
  get fileOverview() {
    return this.#fileoverview;
  }
  set fileOverview(fileoverview) {
    this.#stringArg("fileOverview", fileoverview);
    if (this.#fileoverview)
      throw new Error("fileOverview has already been set!");
    this.#fileoverview = fileoverview;
  }

  /**
   * The collection types this instance already has.
   *
   * @returns {CollectionType[]}
   * @public
   */
  getCollectionTypes() {
    return this.#collectionTypes.slice();
  }

  /**
   * The argument names this instance already has.
   *
   * @returns {Set<string>}
   * @public
   */
  getArgumentNames() {
    return new Set(this.#argumentNames);
  }

  /**
   * @typedef CollectionTypeOptions
   * @property {string?}   argumentType      A JSDoc-printable type for the argument.
   * @property {string?}   description       A JSDoc-printable description.
   * @property {Function?} argumentValidator A method to use for testing the argument.
   */

  /**
   * Add a collection type argument.
   *
   * @param {string}    argumentName        The name of the argument.
   * @param {string}    mapOrSetType        The name of the map or set type.
   *                                        Map, Set, WeakMap, WeakSet, or something inheriting from one of them.
   * @param {CollectionTypeOptions} options Optional arguments providing more configuration
   */
  addCollectionType(argumentName, mapOrSetType, options = {}) {
    const {
      argumentType = null,
      description = null,
      argumentValidator = null
    } = options;

    this.#identifierArg("argumentName", argumentName);
    if (argumentType !== null)
      this.#jsdocField("argumentType", argumentType, true);
    if (description !== null)
      this.#jsdocField("description",  description, true);
    if (argumentValidator !== null)
      this.#functionArg("argumentValidator", argumentValidator, true);

    if (this.#argumentNames.has(argumentName))
      throw new Error(`Argument name "${argumentName}" has already been defined!`);

    if (argumentName === "value")
      throw new Error(`The argument name "value" is reserved!`);

    if (!CollectionConfiguration.#PREDEFINED_TYPES.has(mapOrSetType))
      throw new Error(`The map or set type must be one of "Map", "Set", "WeakMap" or "WeakSet"!`);

    if (mapOrSetType.startsWith("Weak"))
      this.#holdsWeak = true;
    if (mapOrSetType.endsWith("Set"))
      this.#setCount++;

    const collectionType = new CollectionType(
      argumentName,
      mapOrSetType,
      argumentType,
      description,
      argumentValidator
    );
    this.#collectionTypes.push(collectionType);

    this.#argumentNames.add(argumentName);
  }

  getValueFilter() {
    return [this.#valueFilter, this.#valueJSDoc];
  }

  /**
   * Define a final value filter for .set(), .add() calls.
   *
   * @param {Function} valueFilter
   * @param {string}   valueJSDoc
   */
  setValueFilter(valueFilter, valueJSDoc = null) {
    if (this.#valueFilter)
      throw new Error("You can only set the value filter once!");
    this.#functionArg("valueFilter", valueFilter);
    if (valueJSDoc !== null)
      this.#jsdocField("valueJSDoc", valueJSDoc, true);

    this.#valueFilter = valueFilter;
    this.#valueJSDoc = valueJSDoc;
  }
}
Object.freeze(CollectionConfiguration);
Object.freeze(CollectionConfiguration.prototype);
