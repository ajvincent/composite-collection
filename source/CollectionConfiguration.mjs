/**
 * @module source/CollectionConfiguration.mjs
 *
 * @fileoverview
 *
 * This defines a data structure for configuring a composite of Maps and Sets.
 */

import { parse } from "acorn";

import ConfigurationStateGraphs from "./ConfigurationStateGraphs.mjs";
import CollectionType from "./CollectionType.mjs";

function getNormalFunctionAST(fn) {
  let source = fn.toString().replace(/^function\s*\(/, "function foo(");

  let astNode, abort = false;
  try {
    const ast = parse(source, {
      ecmaVersion: 2021,
      onToken(t) {
        if ((t.type.keyword !== "throw") || (t.value !== "throw"))
          return;
        abort = true;
        throw new Error("Throw statements must not be in validator functions!");
      }
    });
    astNode = ast.body[0];
  }
  catch (ex) {
    throw abort ? ex : new Error("Acorn couldn't parse the function... why?");
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

  /** @type {string} @const */
  #className;

  /** @type {string} @readonly */
  #collectionTemplate;

  /** @type {string} */
  #importLines = "";

  /** @type {Map<identifier, CollectionType>} @const */
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

  /** @type {number} */
  #argCount = 0;

  #doStateTransition(nextState) {
    const mayTransition = this.#stateTransitionsGraph.has(this.#currentState, nextState);
    if (mayTransition)
      this.#currentState = nextState;
    return mayTransition;
  }

  /**
   * Validate a string argument.
   * @param {string}  argumentName The name of the argument.
   * @param {string}  value        The argument value.
   * @param {boolean} mayOmit      True if the caller may omit the argument.
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
        idToken = parse("let " + identifier, {ecmaVersion: 2021}).body[0].declarations[0].id.name;
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
   */
  #validatorArg(argumentName, callback, singleParamName, mayOmit = false) {
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
   */
  constructor(className, outerType, innerType = null) {
    this.#identifierArg("className", className);
    if (PREDEFINED_TYPES.has(className))
      throw new Error(`You can't override the ${className} primordial!`);

    switch (outerType) {
      case "Map":
        this.#collectionTemplate = "Strong/Map";
        break;
      case "WeakMap":
        this.#collectionTemplate = "Weak/Map";
        break;

      case "Set":
        this.#collectionTemplate = "Strong/Set";
        break;
      case "WeakSet":
        this.#collectionTemplate = "Weak/Set";
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
        this.#collectionTemplate += "OfStrongSets";
        break;
      case "WeakSet":
        /*
        There can't be a strong map of weak sets, because it's unclear when we would hold strong
        references to the strong map keys.  Try it as a thought experiment:  add two such sets,
        then delete one.  Should the map keys be held strongly?  What about after garbage collection
        removes the other set?
        */
        if (outerType !== "WeakMap")
          throw new Error("outerType must be a WeakMap when the innerType is a WeakSet!");
        this.#collectionTemplate += "OfWeakSets";
        break;
      default:
        throw new Error("innerType must be a WeakSet, Set, or null!");
    }

    if (this.#collectionTemplate.includes("MapOf")) {
      this.#stateTransitionsGraph = ConfigurationStateGraphs.get("MapOfSets");
      this.#doStateTransition("startMap");
    }
    else if (outerType.endsWith("Map")) {
      this.#stateTransitionsGraph = ConfigurationStateGraphs.get("Map");
      this.#doStateTransition("startMap");
    }
    else {
      this.#stateTransitionsGraph = ConfigurationStateGraphs.get("Set");
      this.#doStateTransition("startSet");
    }

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
        collectionTemplate: this.#collectionTemplate,
        importLines: this.#importLines,
        parameterToTypeMap: new Map(this.#parameterToTypeMap),
        weakMapKeys: this.#weakMapKeys.slice(),
        strongMapKeys: this.#strongMapKeys.slice(),
        weakSetElements: this.#weakSetElements.slice(),
        strongSetElements: this.#strongSetElements.slice(),
        valueType: this.#valueCollectionType,
        fileOverview: this.#fileoverview,
        requiresKeyHasher: this.#collectionTemplate.includes("Strong"),
        requiresWeakKey:   this.#collectionTemplate.includes("Weak"),
      }
    });
  }

  importLines(lines) {
    return this.#catchErrorState(() => {
      if (!this.#doStateTransition("importLines")) {
        this.#throwIfLocked();
        throw new Error("You may only define import lines at the start of the configuration!");
      }
      this.#importLines = lines.toString().trim();
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
        argumentType = holdWeak ? "object" : "*",
        description = null,
        argumentValidator = null,
      } = options;

      this.#validateKey(argumentName, holdWeak, argumentType, description, argumentValidator);
      if (holdWeak && !this.#collectionTemplate.startsWith("Weak/Map"))
        throw new Error("Strong maps cannot have weak map keys!");

      const validatorSource = (argumentValidator !== null) ?
        this.#validatorArg(
          "argumentValidator",
          argumentValidator,
          argumentName,
          true
        ) :
        null;

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

      this.#argCount++;
    });
  }

  /**
   * @typedef CollectionTypeOptions
   * @property {string?}   argumentType      A JSDoc-printable type for the argument.
   * @property {string?}   description       A JSDoc-printable description.
   * @property {Function?} argumentValidator A method to use for testing the argument.
   */
  addSetKey(argumentName, holdWeak, options = {}) {
    return this.#catchErrorState(() => {
      if (!this.#doStateTransition("setElements")) {
        this.#throwIfLocked();
        throw new Error("You must define set keys before calling .setValueFilter() or .lock()!");
      }

      const {
        argumentType = holdWeak ? "object" : "*",
        description = null,
        argumentValidator = null,
      } = options;

      this.#validateKey(argumentName, holdWeak, argumentType, description, argumentValidator);
      if (holdWeak && !/Weak\/?Set/.test(this.#collectionTemplate))
        throw new Error("Strong sets cannot have weak set keys!");

      const validatorSource = (argumentValidator !== null) ?
        this.#validatorArg(
          "argumentValidator",
          argumentValidator,
          argumentName,
          true
        ) :
        null;

      const collectionType = new CollectionType(
        argumentName,
        holdWeak ? "WeakSet" : "Set",
        argumentType,
        description,
        validatorSource
      );
      this.#parameterToTypeMap.set(argumentName, collectionType);

      if (holdWeak)
        this.#weakSetElements.push(argumentName);
      else
        this.#strongSetElements.push(argumentName);

      this.#argCount++;
    });
  }

  // XXX ajvincent JSDoc!
  addMapKeyTuple() {
    return this.#catchErrorState(() => {
      if (!this.#doStateTransition("mapTuple")) {
        this.#throwIfLocked();
        throw new Error("The .addMapTuple() method only applies to sequences, and only at the start or when importing modules!");
      }

      throw new Error("Not yet implemented");
      /*
      this.#argCount++;
      */
    });
  }

  // XXX ajvincent JSDoc!
  addSetKeyTuple() {
    return this.#catchErrorState(() => {
      if (!this.#doStateTransition("setTuple")) {
        this.#throwIfLocked();
        throw new Error("The .addSetTuple() method only applies to sequences, and only after all map steps!");
      }

      throw new Error("Not yet implemented");
      /*
      this.#argCount++;
      */
    });
  }

  #validateKey(argumentName, holdWeak, argumentType, description, argumentValidator) {
    this.#identifierArg("argumentName", argumentName);
    if (argumentType !== null)
      this.#jsdocField("argumentType", argumentType, true);
    if (description !== null)
      this.#jsdocField("description",  description, true);

    if (argumentValidator !== null) {
      this.#validatorArg(
        "argumentValidator",
        argumentValidator,
        argumentName,
        true
      );
    }

    if (this.#parameterToTypeMap.has(argumentName))
      throw new Error(`Argument name "${argumentName}" has already been defined!`);

    if ((argumentName === "value") && !this.#collectionTemplate.includes("Set"))
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
        this.#validatorArg("validator", validator, "value", true) :
        null;

      this.#valueCollectionType = new CollectionType(
        "value", "", type, description, validatorSource
      );

      if (this.#collectionTemplate.includes("Set")) {
        const holdWeak = /Weak\/?Set/.test(this.#collectionTemplate);
        if (holdWeak)
          this.#weakMapKeys.push("value");
        else
          this.#strongMapKeys.push("value");
      }
    });
  }

  lock() {
    return this.#catchErrorState(() => {
      if (!this.#doStateTransition("locked"))
        throw new Error("You must define a map key or set element first!");

      if (this.#collectionTemplate.startsWith("Weak/Map") && !this.#weakMapKeys.length)
        throw new Error("A weak map keyset must have at least one weak key!");

      if (/Weak\/?Set/.test(this.#collectionTemplate) && !this.#weakSetElements.length)
        throw new Error("A weak set keyset must have at least one weak key!");


      let argCount = this.#argCount;
      if (argCount === 0) {
        if (!this.#valueCollectionType)
          throw new Error("State machine error:  we should have some steps now!");
        argCount++;
      }

      if (argCount === 1) {
        // Use a solo collection template.
        this.#collectionTemplate = this.#collectionTemplate.replace(/^\w+/g, "Solo");
      }
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
