/**
 * @module source/CollectionConfiguration.mjs
 *
 * @fileoverview
 *
 * This defines a data structure for configuring a composite of Maps and Sets.
 */

import acorn from "acorn";

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
  static #PREDEFINED_TYPES = new Set(["WeakMap", "Map", "WeakSet", "Set"]);

  static #STATE_TRANSITIONS = new Map([
    ["start", new Set([
      "startMap",
      /* not yet implemented
      "startSet",
      */
    ])],

    ["startMap", new Set([
      "mapKeys",
    ])],

    ["startSet", new Set([
      "setElements",
    ])],

    ["mapKeys", new Set([
      "mapKeys",
      "hasValueFilter",
      "locked",
    ])],

    ["setElements", new Set([
      "setElements",
      "locked",
    ])],

    ["hasValueFilter", new Set([
      "locked",
    ])],

    ["locked", new Set([
      "locked",
    ])],

    ["errored", new Set()],
  ]);

  /** @type {string} */
  #currentState = "start";

  /** @type {string} @readonly */
  #className;

  /** @type {Map<identifier, CollectionType>} @readonly */
  #parameterToTypeMap = new Map();

  /** @type {identifier[]} */
  #weakMapKeys = [];

  /** @type {identifier[]} */
  #strongMapKeys = [];

  /** @type {identifier[]} */
  #weakSetElements = [];

  /** @type {identifier[]} */
  #strongSetElements = [];

  /** @type {Function?} */
  #valueFilter = null;

  /** @type {string} */
  #valueJSDoc = null;

  /** @type {string?} */
  #fileoverview = null;

  #doStateTransition(nextState) {
    const validStates = CollectionConfiguration.#STATE_TRANSITIONS.get(this.#currentState);
    const mayTransition = validStates.has(nextState);
    if (mayTransition)
      this.#currentState = nextState;
    return mayTransition;
  }

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
    this.#stringArg(argName, identifier);
    if (identifier !== identifier.trim())
      throw new Error(argName + " must not have leading or trailing whitespace!");

    {
      let idToken;
      try {
        idToken = acorn.parse("let " + identifier).body[0].declarations[0].id.name;
      }
      catch (ex) {
        // do nothing
      }
      if (idToken !== identifier)
        throw new Error(`"${identifier}" is not a valid JavaScript identifier!`);
    }
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

  #catchErrorState(callback) {
    if (this.#currentState === "errored")
      throw new Error("This configuration is dead due to a previous error!");

    try {
      return callback();
    }
    catch (ex) {
      this.#currentState = "errored";
      throw ex;
    }
  }

  /**
   * @param {string} className The name of the class to define.
   * @constructor
   *
   * @note depending on how this develops, I may add a collectionType string argument.
   */
  constructor(className) {
    this.#identifierArg("className", className);
    if (CollectionConfiguration.#PREDEFINED_TYPES.has(className))
      throw new Error(`You can't override the ${className} primordial!`);

    if (className.endsWith("Map"))
      this.#doStateTransition("startMap");
    /*
    else if (className.endsWith("Set"))
      this.#doStateTransition("startSet");
    else
      throw new Error(`The class name must end with "Map" or "Set"!`);
    */
    else
      throw new Error(`The class name must end with "Map"!`);

    this.#className = className;

    Reflect.preventExtensions(this);
  }

  /**
   * A file overview to feed into the generated module.
   * @type {string?}
   * @public
   */
  setFileOverview(fileoverview) {
    return this.#catchErrorState(() => {
      this.#stringArg("fileoverview", fileoverview);
      if (this.#fileoverview)
        throw new Error("fileoverview has already been set!");
      this.#fileoverview = fileoverview;
    });
  }

  cloneData() {
    return this.#catchErrorState(() => {
      return {
        className: this.#className,
        parameterToTypeMap: new Map(this.#parameterToTypeMap),
        weakMapKeys: this.#weakMapKeys.slice(),
        strongMapKeys: this.#strongMapKeys.slice(),
        weakSetElements: this.#weakSetElements.slice(),
        strongSetElements: this.#strongSetElements.slice(),
        valueFilter: this.#valueFilter,
        valueJSDoc: this.#valueJSDoc,
        fileOverview: this.#fileoverview,
      }
    });
  }

  /**
   * @typedef CollectionTypeOptions
   * @property {string?}   argumentType      A JSDoc-printable type for the argument.
   * @property {string?}   description       A JSDoc-printable description.
   * @property {Function?} argumentValidator A method to use for testing the argument.
   */
  addMapKey(argumentName, holdWeak, options = {}) {
    return this.#catchErrorState(() => {
      if (!this.#doStateTransition("mapKeys")) {
        this.#throwIfLocked();
        throw new Error("You must define map keys before calling .addSetElement(), .setValueFilter() or .lock()!");
      }
  
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

      if (this.#parameterToTypeMap.has(argumentName))
        throw new Error(`Argument name "${argumentName}" has already been defined!`);
  
      if (argumentName === "value")
        throw new Error(`The argument name "value" is reserved!`);
      if (typeof holdWeak !== "boolean")
        throw new Error("holdWeak must be true or false!");
  
      const collectionType = new CollectionType(
        argumentName,
        holdWeak ? "WeakMap" : "Map",
        argumentType,
        description,
        argumentValidator
      );
      this.#parameterToTypeMap.set(argumentName, collectionType);
  
      if (holdWeak)
        this.#weakMapKeys.push(argumentName);
      else
        this.#strongMapKeys.push(argumentName);
    });
  }

  /**
   * Define a final value filter for .set(), .add() calls.
   *
   * @param {Function} valueFilter
   * @param {string}   valueJSDoc
   */
  setValueFilter(valueFilter, valueJSDoc = null) {
    return this.#catchErrorState(() => {
      if (!this.#doStateTransition("hasValueFilter")) {
        this.#throwIfLocked();
  
        if (this.#currentState === "hasValueFilter")
          throw new Error("You can only set the value filter once!");
        throw new Error("You can only call .setValueFilter() directly after calling .addMapKey()!");
      }

      this.#functionArg("valueFilter", valueFilter);
      if (valueJSDoc !== null)
        this.#jsdocField("valueJSDoc", valueJSDoc, true);
  
      this.#valueFilter = valueFilter;
      this.#valueJSDoc = valueJSDoc;
    });
  }

  lock() {
    return this.#catchErrorState(() => {
      if (!this.#doStateTransition("locked"))
        throw new Error("You must define a map key or set element first!");
    });
  }

  #throwIfLocked() {
    if (this.#currentState === "locked") {
      throw new Error("You have already locked this configuration!");
    }
  }
}
Object.freeze(CollectionConfiguration);
Object.freeze(CollectionConfiguration.prototype);
