/**
 * @module source/CollectionConfiguration.mjs
 *
 * @fileoverview
 *
 * This defines a data structure for configuring a composite of Maps and Sets.
 */

import acorn from "acorn";

import ConfigurationStateGraphs from "./ConfigurationStateGraphs.mjs";

function getNormalFunctionAST(fn) {
  let source = fn.toString().replace(/^function\s*\(/, "function foo(");

  let astNode;
  try {
    astNode = acorn.parse(source).body[0];
  }
  catch (ex) {
    throw new Error("Acorn couldn't parse the function... why?");
  }

  if (astNode.type === "ExpressionStatement")
    astNode = astNode.expression;

  if ((astNode.type !== "ArrowFunctionExpression") &&
      (astNode.type !== "FunctionDeclaration"))
    throw new Error("Unsupported function type from acorn: " + astNode.type);

  if (astNode.generator)
    throw new Error("Generator functions are not allowed here!");

  if (astNode.async)
    throw new Error("Async functions are not allowed here!");

  return [source, astNode.params, astNode.body];
}

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
   * @param {string?}   argumentValidator A method to use for testing the argument.
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

    /** @public @readonly @type {string?} */
    this.argumentValidator = argumentValidator;

    Object.freeze(this);
  }
}
Object.freeze(CollectionType);
Object.freeze(CollectionType.prototype);

const PREDEFINED_TYPES = new Set(["WeakMap", "Map", "WeakSet", "Set"]);

/**
 * A configuration manager for a single composite collection.
 *
 * @public
 */
export default class CollectionConfiguration {
  /** @type {Map<string, Set<string>>} */
  #stateTransitionsGraph;

  /** @type {string} */
  #currentState = "start";

  /** @type {string} @readonly */
  #className;

  /** @type {string} @readonly */
  #collectionType;

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

  /** @type {CollectionType} */
  #valueCollectionType = null;

  /** @type {string?} */
  #fileoverview = null;

  #doStateTransition(nextState) {
    const validStates = this.#stateTransitionsGraph.get(this.#currentState);
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
   * Validate a function argument and return its body.
   *
   * @param argumentName The name of the function.
   * @param callback        The function.
   *
   * @private
   */
  #callbackArg(argumentName, callback, singleParamName, mayOmit = false) {
    if (typeof callback !== "function")
      throw new Error(`${argumentName} must be a function${mayOmit ? " or omitted" : ""}!`);

    const [source, params, body] = getNormalFunctionAST(callback);
    if ((params.length !== 1) || (params[0].name !== singleParamName))
      throw new Error(`${argumentName} must be a function with a single argument, "${singleParamName}"!`);

    return source.substring(body.start, body.end + 1);
  }

  #jsdocField(argumentName, value, mayOmit = false) {
    this.#stringArg(argumentName, value, mayOmit);
    if (value.includes("*/"))
      throw new Error(argumentName + " contains a comment that would end the JSDoc block!");
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
   * @param {string}  className The name of the class to define.
   * @param {string}  outerType One of "Map", "WeakMap", "Set", "WeakSet".
   * @param {string?} innerType One of "Set", "WeakSet", or null.
   * @constructor
   *
   * @note depending on how this develops, I may add a collectionType string argument.
   */
  constructor(className, outerType, innerType = null) {
    this.#identifierArg("className", className);
    if (PREDEFINED_TYPES.has(className))
      throw new Error(`You can't override the ${className} primordial!`);
    if (!className.endsWith("Map") && !className.endsWith("Set"))
      throw new Error(`The class name must end with "Map" or "Set"!`);

    switch (outerType) {
      case "Map":
        this.#collectionType = "Strong/Map";
        break;
      case "WeakMap":
        this.#collectionType = "Weak/Map";
        break;

      case "Set":
        this.#collectionType = "Strong/Set";
        break;
      case "WeakSet":
        this.#collectionType = "Weak/Set";
        break;

      default:
        throw new Error(`outerType must be a ${Array.from(PREDEFINED_TYPES).join(", ")}!`);
    }

    switch (innerType) {
      case null:
        break;
      case "Set":
        if (outerType.endsWith("Set"))
          throw new Error("outerType must be a Map or WeakMap when an innerType is not null!");
        this.#collectionType += "OfStrongSets";
        break;
      case "WeakSet":
        if (outerType.endsWith("Set"))
          throw new Error("outerType must be a Map or WeakMap when an innerType is not null!");
        this.#collectionType += "OfWeakSets";
        break;
      default:
        throw new Error("innerType must be a WeakSet, Set, or null!");
    }

    if (outerType.endsWith("Map")) {
      this.#stateTransitionsGraph = ConfigurationStateGraphs.get("Map");
      this.#doStateTransition("startMap");
    }
    else if (outerType.endsWith("Set")) {
      this.#stateTransitionsGraph = ConfigurationStateGraphs.get("Map");
      this.#doStateTransition("startSet");
    }
    else
      throw new Error(`The class name must end with "Map" or "Set"!`);

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
        collectionType: this.#collectionType,
        parameterToTypeMap: new Map(this.#parameterToTypeMap),
        weakMapKeys: this.#weakMapKeys.slice(),
        strongMapKeys: this.#strongMapKeys.slice(),
        weakSetElements: this.#weakSetElements.slice(),
        strongSetElements: this.#strongSetElements.slice(),
        valueType: this.#valueCollectionType,
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

      const validatorSource = (argumentValidator !== null) ?
        this.#callbackArg(
          "argumentValidator",
          argumentValidator,
          argumentName,
          true
        ) :
        null;

      if (this.#parameterToTypeMap.has(argumentName))
        throw new Error(`Argument name "${argumentName}" has already been defined!`);

      if (argumentName === "value")
        throw new Error(`The argument name "value" is reserved!`);

      /* A little explanation is in order.  Simply put, the compiler will need a set of variable names it can define
      which should only minimally reduce the set of variable names the user may need.  A double underscore at the
      start and the end of the argument name isn't too much to ask - and why would you have that for a function
      argument name anyway?
      */
      if (/^__.*__$/.test(argumentName))
        throw new Error("This module reserves variable names starting and ending with a double underscore for itself.");

      if (typeof holdWeak !== "boolean")
        throw new Error("holdWeak must be true or false!");

      const collectionType = new CollectionType(
        argumentName,
        holdWeak ? "WeakMap" : "Map",
        argumentType,
        description,
        validatorSource
      );
      this.#parameterToTypeMap.set(argumentName, collectionType);
  
      if (holdWeak)
        this.#weakMapKeys.push(argumentName);
      else
        this.#strongMapKeys.push(argumentName);
    });
  }

  /**
   * Define the value type for .set(), .add() calls.
   *
   * @type {string}    type        The value type.
   * @type {string}    description The description of the value.
   * @type {function?} validator   A function to validate the value.
   */
  setValueType(type, description, validator = null) {
    return this.#catchErrorState(() => {
      if (!this.#doStateTransition("hasValueFilter")) {
        this.#throwIfLocked();

        if (this.#currentState === "hasValueFilter")
          throw new Error("You can only set the value type once!");
        throw new Error("You can only call .setValueType() directly after calling .addMapKey()!");
      }

      this.#stringArg("type", type, false);
      this.#stringArg("description", description, false);
      const validatorSource = (validator !== null) ?
        this.#callbackArg("validator", validator, "value", true) :
        null;

      this.#valueCollectionType = new CollectionType(
        "value", "", type, description, validatorSource
      );
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
