/**
 * @module source/CollectionConfiguration.mjs
 * @file
 *
 * This defines a data structure for configuring a composite of Maps and Sets.
 */

import AcornInterface from "./generatorTools/AcornInterface.mjs";
import ConfigurationStateMachine from "./generatorTools/ConfigurationStateGraphs.mjs";
import CollectionType from "./generatorTools/CollectionType.mjs";

/** @readonly */
const PREDEFINED_TYPES = new Map([
  ["Map", "Strong/Map"],
  ["WeakMap", "Weak/Map"],
  ["Set", "Strong/Set"],
  ["WeakSet", "Weak/Set"],
  ["OneToOne", "OneToOne/Map"],
]);

/** @typedef {string} identifier */

/**
 * A configuration manager for a single composite collection.
 *
 * @public
 */
export default class CollectionConfiguration {
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

  /** @type {ConfigurationStateMachine} */
  #stateMachine;

  /**
   * Validate a string argument.
   *
   * @param {string}  argumentName The name of the argument.
   * @param {string}  value        The argument value.
   */
  #stringArg(argumentName, value) {
    if ((typeof value !== "string") || (value.length === 0))
      throw new Error(`${argumentName} must be a non-empty string!`);
  }

  /**
   * Validate an identifier as one we can safely inject into templates.
   *
   * @param {string}     argName     The name of the argument in this function's caller.  Used to describe exceptions.
   * @param {identifier} identifier  The identifier to insert into the generated code.
   * @throws
   */
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

    if (!AcornInterface.isIdentifier(identifier)) {
      throw new Error(`"${identifier}" is not a valid JavaScript identifier!`);
    }
  }

  /**
   * Verify a lambda function of one argument may be inserted directly in to generated code.
   *
   * @param {string}   argumentName    The name of the function.
   * @param {Function} callback        The function.
   * @param {string}   singleParamName The argument name to check.
   * @param {boolean}  mayOmit         True if the function may be omitted.
   * @returns {string} The body of the function.
   */
  #validatorArg(argumentName, callback, singleParamName, mayOmit = false) {
    if (typeof callback !== "function")
      throw new Error(`${argumentName} must be a function${mayOmit ? " or omitted" : ""}!`);

    const [source, params, body] = AcornInterface.getNormalFunctionAST(callback);
    if ((params.length !== 1) || (params[0].name !== singleParamName))
      throw new Error(`${argumentName} must be a function with a single argument, "${singleParamName}"!`);

    return source.substring(body.start, body.end + 1);
  }

  #jsdocField(argumentName, value) {
    this.#stringArg(argumentName, value);
    if (value.includes("*/"))
      throw new Error(argumentName + " contains a comment that would end the JSDoc block!");
  }

  /**
   * @param {identifier} className The name of the class to define.
   * @param {string}     outerType One of "Map", "WeakMap", "Set", "WeakSet".
   * @param {string?}    innerType One of "Set", "WeakSet", or null.
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

        /*
        There can't be a map of weak sets, because it's unclear when we would
        hold references to the map keys.  Try it as a thought experiment:  add
        two such sets, then delete one.  Should the map keys be held?
        What about after garbage collection removes the other set?
        */

      default:
        throw new Error("innerType must be a Set, or null!");
    }

    if (this.#collectionTemplate.includes("MapOf")) {
      this.#stateMachine = ConfigurationStateMachine.MapOfSets();
      this.#stateMachine.doStateTransition("startMapOfSets");
    }
    else if (outerType.endsWith("Map")) {
      this.#stateMachine = ConfigurationStateMachine.Map();
      this.#stateMachine.doStateTransition("startMap");
    }
    else if (outerType.endsWith("Set")) {
      this.#stateMachine = ConfigurationStateMachine.Set();
      this.#stateMachine.doStateTransition("startSet");
    }
    else if (outerType === "OneToOne") {
      this.#stateMachine = ConfigurationStateMachine.OneToOne();
      this.#stateMachine.doStateTransition("startOneToOne");
    }
    else {
      throw new Error("Internal error, not reachable");
    }

    this.#className = className;

    Reflect.preventExtensions(this);
  }

  /** @type {string} @package */
  get currentState() {
    return this.#stateMachine.currentState;
  }

  /**
   * A file overview to feed into the generated module.
   *
   * @type {string} fileOverview The overview.
   * @public
   */
  setFileOverview(fileOverview) {
    return this.#stateMachine.catchErrorState(() => {
      if (!this.#stateMachine.doStateTransition("fileOverview")) {
        this.#throwIfLocked();
        throw new Error("You may only define the file overview at the start of the configuration!");
      }
      this.#stringArg("fileOverview", fileOverview);
      this.#fileoverview = fileOverview;
    });
  }

  /**
   * Clone the configuration data for use in code generation.
   *
   * @returns {object} The configuration.
   * @package
   */
  __cloneData__() {
    return this.#stateMachine.catchErrorState(() => {
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

  /**
   * Set the module import lines.
   *
   * @param {string} lines The JavaScript code to inject.
   * @returns {void}
   */
  importLines(lines) {
    return this.#stateMachine.catchErrorState(() => {
      if (!this.#stateMachine.doStateTransition("importLines")) {
        this.#throwIfLocked();
        throw new Error("You may only define import lines at the start of the configuration or immediately after the file overview!");
      }
      this.#stringArg("lines", lines);
      this.#importLines = lines.toString().trim();
    });
  }

  /**
   * @typedef CollectionTypeOptions
   * @property {string?}   argumentType      A JSDoc-printable type for the argument.
   * @property {Function?} argumentValidator A method to use for testing the argument.
   */

  /**
   * Define a map key.
   *
   * @param {identifier}             argumentName The key name.
   * @param {string}                 description  The key description for JSDoc.
   * @param {boolean}                holdWeak     True if the collection should hold values for this key as weak references.
   * @param {CollectionTypeOptions?} options      Options for configuring generated code.
   * @returns {void}
   */
  addMapKey(argumentName, description, holdWeak, options = {}) {
    return this.#stateMachine.catchErrorState(() => {
      if (!this.#stateMachine.doStateTransition("mapKeys")) {
        this.#throwIfLocked();
        throw new Error("You must define map keys before calling .addSetElement(), .setValueType() or .lock()!");
      }

      const {
        argumentType = holdWeak ? "object" : "*",
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
   * @param {identifier}             argumentName The key name.
   * @param {string}                 description  The key description for JSDoc.
   * @param {boolean}                holdWeak     True if the collection should hold values for this key as weak references.
   * @param {CollectionTypeOptions?} options      Options for configuring generated code.
   * @returns {void}
   */
  addSetKey(argumentName, description, holdWeak, options = {}) {
    return this.#stateMachine.catchErrorState(() => {
      if (!this.#stateMachine.doStateTransition("setElements")) {
        this.#throwIfLocked();
        throw new Error("You must define set keys before calling .setValueType() or .lock()!");
      }

      const {
        argumentType = holdWeak ? "object" : "*",
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
    this.#jsdocField("argumentType", argumentType);
    this.#jsdocField("description", description);

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
   * @param {string}    type        The value type.
   * @param {string}    description The description of the value.
   * @param {Function?} validator   A function to validate the value.
   * @returns {void}
   */
  setValueType(type, description, validator = null) {
    return this.#stateMachine.catchErrorState(() => {
      if (!this.#stateMachine.doStateTransition("hasValueFilter")) {
        this.#throwIfLocked();

        if (this.#stateMachine.currentState === "hasValueFilter")
          throw new Error("You can only set the value type once!");
        throw new Error("You can only call .setValueType() directly after calling .addMapKey()!");
      }

      this.#stringArg("type", type);
      this.#stringArg("description", description);
      const validatorSource = (validator !== null) ?
        this.#validatorArg("validator", validator, "value", true) :
        null;

      this.#valueCollectionType = new CollectionType(
        "value", "Map", type, description, validatorSource
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
   * @typedef {object} oneToOneOptions
   * @property {string?} pathToBaseModule Indicates the import line for the base module's location.
   *                                      If this property isn't present, the CodeGenerator will
   *                                      create a complete inline copy of the base collection in the
   *                                      one-to-one map module.
   */

  /**
   * Configure this one-to-one map definition.
   *
   * @param {CollectionConfiguration | string} base    The underlying collection's configuration.
   * @param {identifier}                       key     The weak key name to reserve in the base collection for the one-to-one map's use.
   * @param {oneToOneOptions?}                 options For configuring the layout of the one-to-one module and dependencies.
   * @async
   * @returns {Promise<void>}
   */
  configureOneToOne(base, key, options = {}) {
    return this.#stateMachine.catchErrorAsync(async () => {
      if (!this.#stateMachine.doStateTransition("configureOneToOne")) {
        throw new Error("configureOneToOne can only be used for OneToOne collections, and exactly once!");
      }

      this.#identifierArg("privateKeyName", key);

      this.#oneToOneKeyName = key;

      let configData;
      if (base instanceof CollectionConfiguration) {
        if (base.currentState !== "locked") {
          /* We dare not modify the base configuration lest other code use it to generate a different file. */
          throw new Error("The base configuration must be locked!");
        }

        configData = base.__cloneData__();
        if ((configData.collectionTemplate === "Weak/Map") ||
            ((configData.collectionTemplate === "Solo/Map") && (configData.weakMapKeys.length > 0))) {
          this.#oneToOneBase = base;
          CollectionConfiguration.#oneToOneLockedPrivateKey(base, key);
        }
      }
      else if (typeof base === "string") {
        this.#oneToOneBase = await CollectionConfiguration.#getOneToOneBaseByString(base, key);
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

    __cloneData__: () => {
      return {
        className: "WeakMap",
        importLines: "",
        collectionTemplate: "",
        weakMapKeys: ["key"],
        parameterToTypeMap: new Map([
          ["key", new CollectionType("key", "WeakMap", "object", "The key.", "")],
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
    const weakKeys = baseConfiguration.__cloneData__().weakMapKeys;
    if (weakKeys.includes(privateKeyName))
      return;
    const names = weakKeys.map(name => `"${name}"`).join(", ");
    throw new Error(`Invalid weak key name for the base configuration.  Valid names are ${names}.`);
  }

  lock() {
    return this.#stateMachine.catchErrorState(() => {
      if (!this.#stateMachine.doStateTransition("locked"))
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
    if (this.#stateMachine.currentState === "locked") {
      throw new Error("You have already locked this configuration!");
    }
  }
}
Object.freeze(CollectionConfiguration);
Object.freeze(CollectionConfiguration.prototype);
