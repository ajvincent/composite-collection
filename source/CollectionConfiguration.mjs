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

/** @readonly */
const PREDEFINED_TYPES = new Map([
  ["Map", "Strong/Map"],
  ["WeakMap", "Weak/Map"],
  ["Set", "Strong/Set"],
  ["WeakSet", "Weak/Set"],
  ["OneToOne", "OneToOne/Map"],
]);

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

  /** @type {string} @constant */
  #className;

  /** @type {string} @readonly */
  #collectionTemplate;

  /** @type {string} */
  #importLines = "";

  /** @type {Map<identifier, CollectionType>} @constant */
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

    /* A little explanation is in order.  Simply put, the compiler will need a set of variable names it can define
    which should only minimally reduce the set of variable names the user may need.  A double underscore at the
    start and the end of the argument name isn't too much to ask - and why would you have that for a function
    argument name anyway?
    */
    if (/^__.*__$/.test(identifier))
      throw new Error("This module reserves variable names starting and ending with a double underscore for itself.");

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

  async #catchErrorAsync(callback) {
    if (this.#currentState === "errored")
      throw new Error("This configuration is dead due to a previous error!");

    try {
      return await callback();
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
    /* This is a defensive measure for one-to-one configurations, where the base configuration must be for a WeakMap. */
    if (new.target !== CollectionConfiguration)
      throw new Error("You cannot subclass CollectionConfiguration!");

    this.#identifierArg("className", className);
    if (PREDEFINED_TYPES.has(className))
      throw new Error(`You can't override the ${className} primordial!`);

    this.#collectionTemplate = PREDEFINED_TYPES.get(outerType);
    if (!this.#collectionTemplate)
      throw new Error(`outerType must be one of ${Array.from(PREDEFINED_TYPES.keys()).join(", ")}!`);

    switch (innerType) {
      case null:
        break;

      case "Set":
        if (!outerType.endsWith("Map"))
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
    else if (outerType.endsWith("Set")) {
      this.#stateTransitionsGraph = ConfigurationStateGraphs.get("Set");
      this.#doStateTransition("startSet");
    }
    else if (outerType === "OneToOne") {
      this.#stateTransitionsGraph = ConfigurationStateGraphs.get("OneToOne");
      this.#doStateTransition("startOneToOne");
    }
    else {
      throw new Error("Internal error, not reachable");
    }

    this.#className = className;

    Reflect.preventExtensions(this);
  }

  get currentState() {
    return this.#currentState;
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

        /* OneToOne-specific fields */
        oneToOneKeyName: this.#oneToOneKeyName,
        oneToOneBase: this.#oneToOneBase,
        oneToOneOptions: this.#oneToOneOptions,
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

  /**
   * Define a map key.
   *
   * @param {string} argumentName
   * @param {boolean} holdWeak
   * @param {CollectionTypeOptions} options
   */
  addMapKey(argumentName, holdWeak, options = {}) {
    return this.#catchErrorState(() => {
      if (!this.#doStateTransition("mapKeys")) {
        this.#throwIfLocked();
        throw new Error("You must define map keys before calling .addSetElement(), .setValueType() or .lock()!");
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
   * Define a set key.
   *
   * @param {string} argumentName
   * @param {boolean} holdWeak
   * @param {CollectionTypeOptions} options
   * @returns 
   */
  addSetKey(argumentName, holdWeak, options = {}) {
    return this.#catchErrorState(() => {
      if (!this.#doStateTransition("setElements")) {
        this.#throwIfLocked();
        throw new Error("You must define set keys before calling .setValueType() or .lock()!");
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

  /*
  OneToOne-specific fields
   */
  #oneToOneKeyName = "";
  #oneToOneBase = null;
  #oneToOneOptions = null;

  /**
   * Configure this one-to-one map definition.
   *
   * @param {CollectionConfiguration | string} baseConfiguration
   * @param {string} privateKeyName
   * @param {object} options
   *
   * @async
   */
  configureOneToOne(baseConfiguration, privateKeyName, options = {}) {
    return this.#catchErrorAsync(async () => {
      if (!this.#doStateTransition("configureOneToOne")) {
        throw new Error("configureOneToOne can only be used for OneToOne collections, and exactly once!");
      }

      this.#identifierArg("privateKeyName", privateKeyName);

      this.#oneToOneKeyName = privateKeyName;

      let configData;
      if (baseConfiguration instanceof CollectionConfiguration) {
        if (baseConfiguration.currentState !== "locked") {
          /* We dare not modify the base configuration lest other code use it to generate a different file. */
          throw new Error("The base configuration must be locked!");
        }

        configData = baseConfiguration.cloneData();
        if ((configData.collectionTemplate === "Weak/Map") ||
            ((configData.collectionTemplate === "Solo/Map") && (configData.weakMapKeys.length > 0))) {
          this.#oneToOneBase = baseConfiguration;
          CollectionConfiguration.#oneToOneLockedPrivateKey(baseConfiguration, privateKeyName);
        }
      }
      else if (typeof baseConfiguration === "string") {
        this.#oneToOneBase = await CollectionConfiguration.#getOneToOneBaseByString(baseConfiguration, privateKeyName);
      }

      if (!this.#oneToOneBase) {
        throw new Error("The base configuration must be a WeakMap CollectionConfiguration, 'WeakMap', 'composite-collection/WeakStrongMap', or 'composite-collection/WeakWeakMap'!");
      }

      this.#oneToOneOptions = Object.freeze(JSON.parse(JSON.stringify(options)));
    });
  }

  static async #getOneToOneBaseByString(baseConfiguration, privateKeyName) {
    if (baseConfiguration === "WeakMap") {
      return CollectionConfiguration.#weakMapMockConfiguration;
    }

    if (baseConfiguration === "composite-collection/WeakStrongMap") {
      const config = (await import("./exports/WeakStrongMap.mjs")).default;
      CollectionConfiguration.#oneToOneLockedPrivateKey(config, privateKeyName);
      return config;
    }

    if (baseConfiguration === "composite-collection/WeakWeakMap") {
      const config = (await import("./exports/WeakWeakMap.mjs")).default;
      CollectionConfiguration.#oneToOneLockedPrivateKey(config, privateKeyName);
      return config;
    }

    return null;
  }

  static #weakMapMockConfiguration = Object.freeze({
    lock: () => null,

    cloneData: () => {
      return {
        className: "WeakMap",
        importLines: "",
        collectionTemplate: "",
        weakMapKeys: ["key"],
        parameterToTypeMap: new Map([
          ["key", new CollectionType("key", "", "object", "The key.", "")],
        ]),
        strongMapKeys: [],
        weakSetElements: [],
        strongSetElements: [],
        valueType: null,
        fileOverview: null,
        requiresKeyHasher: false,
        requiresWeakKey: false,
      };
    },
  })

  static #oneToOneLockedPrivateKey(baseConfiguration, privateKeyName) {
    const weakKeys = baseConfiguration.cloneData().weakMapKeys;
    if (weakKeys.includes(privateKeyName))
      return;
    const names = weakKeys.map(name => `"${name}"`).join(", ");
    throw new Error(`Invalid weak key name for the base configuration.  Valid names are ${names}.`);
  }

  lock() {
    return this.#catchErrorState(() => {
      if (!this.#doStateTransition("locked"))
        throw new Error("You must define a map key or set element first!");

      if (this.#collectionTemplate === "OneToOne/Map")
        return;

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
