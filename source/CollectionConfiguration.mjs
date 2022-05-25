/**
 * @module source/CollectionConfiguration.mjs
 * @file
 *
 * This defines a data structure for configuring a composite of Maps and Sets.
 */
import AcornInterface from "./generatorTools/AcornInterface.mjs";
import CollectionType from "./generatorTools/CollectionType.mjs";
import ConfigurationData from "./generatorTools/ConfigurationData.mjs";
import ConfigurationStateMachine from "./generatorTools/ConfigurationStateMachine.mjs";
/** @readonly */
const PREDEFINED_TYPES = new Map([
    ["Map", "Strong/Map"],
    ["WeakMap", "Weak/Map"],
    ["Set", "Strong/Set"],
    ["WeakSet", "Weak/Set"],
    ["OneToOne", "OneToOne/Map"],
]);
/**
 * @typedef CollectionTypeOptions
 * @property {string?}   jsDocType      A JSDoc-printable type for the argument.
 * @property {string?}   tsType         A TypeScript type for the argument.
 * @property {Function?} argumentValidator A method to use for testing the argument.
 */
class CollectionTypeOptions {
    jsDocType = "";
    tsType = "";
    argumentValidator = (arg) => void (arg);
}
/**
 * @typedef {object} oneToOneOptions
 * @property {string?} pathToBaseModule Indicates the import line for the base module's location.
 *                                      If this property isn't present, the CodeGenerator will
 *                                      create a complete inline copy of the base collection in the
 *                                      one-to-one map module.
 */
class oneToOneOptions {
    pathToBaseModule;
}
/** @typedef {string} identifier */
/**
 * A configuration manager for a single composite collection.
 *
 * @public
 */
export default class CollectionConfiguration {
    /** @type {ConfigurationData} @constant */
    #configurationData;
    /** @type {ConfigurationStateMachine} */
    #stateMachine;
    // #region static validation of argument properties
    /**
     * Validate a string argument.
     *
     * @param {string}  argumentName The name of the argument.
     * @param {string}  value        The argument value.
     */
    static #stringArg(argumentName, value) {
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
    static #identifierArg(argName, identifier) {
        CollectionConfiguration.#stringArg(argName, identifier);
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
    static #validatorArg(argumentName, callback, singleParamName, mayOmit = false) {
        if (typeof callback !== "function")
            throw new Error(`${argumentName} must be a function${mayOmit ? " or omitted" : ""}!`);
        const [source, params, body] = AcornInterface.getNormalFunctionAST(callback);
        if ((params.length !== 1) || (params[0].name !== singleParamName))
            throw new Error(`${argumentName} must be a function with a single argument, "${singleParamName}"!`);
        return source.substring(body.start, body.end + 1);
    }
    static #jsdocField(argumentName, value) {
        CollectionConfiguration.#stringArg(argumentName, value);
        if (value.includes("*/"))
            throw new Error(argumentName + " contains a comment that would end the JSDoc block!");
    }
    // #endregion static validation of argument properties
    // #region The primary CollectionConfiguration public API (excluding OneToOne and lock())
    /**
     * @param {string}  className The name of the class to define.
     * @param {string}  outerType One of "Map", "WeakMap", "Set", "WeakSet", "OneToOne".
     * @param {string?} innerType Either "Set" or null.
     */
    constructor(className, outerType, innerType = null) {
        /* This is a defensive measure for one-to-one configurations, where the base configuration must be for a WeakMap. */
        if (new.target !== CollectionConfiguration)
            throw new Error("You cannot subclass CollectionConfiguration!");
        CollectionConfiguration.#identifierArg("className", className);
        if (PREDEFINED_TYPES.has(className))
            throw new Error(`You can't override the ${className} primordial!`);
        let template = PREDEFINED_TYPES.get(outerType);
        if (!template)
            throw new Error(`outerType must be one of ${Array.from(PREDEFINED_TYPES.keys()).join(", ")}!`);
        switch (innerType) {
            case null:
                break;
            case "Set":
                if (!outerType.endsWith("Map"))
                    throw new Error("outerType must be a Map or WeakMap when an innerType is not null!");
                template += "OfStrongSets";
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
        if (template.includes("MapOf")) {
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
        this.#configurationData = new ConfigurationData(className, template);
        this.#configurationData.setConfiguration(this);
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
            CollectionConfiguration.#stringArg("fileOverview", fileOverview);
            this.#configurationData.setFileOverview(fileOverview);
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
            CollectionConfiguration.#stringArg("lines", lines);
            this.#configurationData.importLines = lines.toString().trim();
        });
    }
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
            const { jsDocType = holdWeak ? "object" : "*", tsType = holdWeak ? "object" : "unknown", argumentValidator = null, } = options;
            this.#validateKey(argumentName, holdWeak, jsDocType, tsType, description, argumentValidator);
            if (holdWeak && !this.#configurationData.collectionTemplate.startsWith("Weak/Map"))
                throw new Error("Strong maps cannot have weak map keys!");
            const validatorSource = (argumentValidator !== null) ?
                CollectionConfiguration.#validatorArg("argumentValidator", argumentValidator, argumentName, true) :
                null;
            const collectionType = new CollectionType(argumentName, holdWeak ? "WeakMap" : "Map", jsDocType, tsType, description, validatorSource);
            this.#configurationData.defineArgument(collectionType);
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
            const { jsDocType = holdWeak ? "object" : "*", tsType = holdWeak ? "object" : "unknown", argumentValidator = null, } = options;
            this.#validateKey(argumentName, holdWeak, jsDocType, tsType, description, argumentValidator);
            if (holdWeak && !/Weak\/?Set/.test(this.#configurationData.collectionTemplate))
                throw new Error("Strong sets cannot have weak set keys!");
            const validatorSource = (argumentValidator !== null) ?
                CollectionConfiguration.#validatorArg("argumentValidator", argumentValidator, argumentName, true) :
                null;
            const collectionType = new CollectionType(argumentName, holdWeak ? "WeakSet" : "Set", jsDocType, tsType, description, validatorSource);
            this.#configurationData.defineArgument(collectionType);
        });
    }
    #validateKey(argumentName, holdWeak, jsDocType, tsType, description, argumentValidator) {
        CollectionConfiguration.#identifierArg("argumentName", argumentName);
        CollectionConfiguration.#jsdocField("jsDocType", jsDocType);
        CollectionConfiguration.#stringArg("tsType", tsType);
        if (/^__.*__$/.test(tsType))
            throw new Error("This module reserves variable names starting and ending with a double underscore for itself.");
        CollectionConfiguration.#jsdocField("description", description);
        if (argumentValidator !== null) {
            CollectionConfiguration.#validatorArg("argumentValidator", argumentValidator, argumentName, true);
        }
        if (this.#configurationData.parameterToTypeMap.has(argumentName))
            throw new Error(`Argument name "${argumentName}" has already been defined!`);
        if ((argumentName === "value") &&
            !this.#configurationData.collectionTemplate.includes("Set"))
            throw new Error(`The argument name "value" is reserved!`);
        if (typeof holdWeak !== "boolean")
            throw new Error("holdWeak must be true or false!");
    }
    /**
     * Define the value type for .set(), .add() calls.
     *
     * @param {string}    description The description of the value.
     * @param {CollectionTypeOptions?} options      Options for configuring generated code.
     * @returns {void}
     */
    setValueType(description, options = {}) {
        return this.#stateMachine.catchErrorState(() => {
            if (!this.#stateMachine.doStateTransition("hasValueFilter")) {
                this.#throwIfLocked();
                if (this.#stateMachine.currentState === "hasValueFilter")
                    throw new Error("You can only set the value type once!");
                throw new Error("You can only call .setValueType() directly after calling .addMapKey()!");
            }
            const { jsDocType = "*", tsType = "unknown", argumentValidator = null, } = options;
            CollectionConfiguration.#stringArg("type", jsDocType);
            CollectionConfiguration.#stringArg("description", description);
            CollectionConfiguration.#identifierArg("tsType", tsType);
            let validatorSource = null;
            if (argumentValidator) {
                validatorSource = CollectionConfiguration.#validatorArg("validator", argumentValidator, "value", true);
            }
            this.#configurationData.valueType = new CollectionType("value", "Map", jsDocType, tsType, description, validatorSource);
        });
    }
    // #endregion The actual CollectionConfiguration public API.
    // #region One-to-one map configuration and static helpers.
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
            CollectionConfiguration.#identifierArg("privateKeyName", key);
            let configData, retrievedBase;
            if (base instanceof CollectionConfiguration) {
                if (base.currentState !== "locked") {
                    /* We dare not modify the base configuration lest other code use it to generate a different file. */
                    throw new Error("The base configuration must be locked!");
                }
                configData = ConfigurationData.cloneData(base);
                if ((configData.collectionTemplate === "Weak/Map") ||
                    ((configData.collectionTemplate === "Solo/Map") && (configData.weakMapKeys.length > 0))) {
                    retrievedBase = base;
                    CollectionConfiguration.#oneToOneLockedPrivateKey(base, key);
                }
            }
            else if (typeof base === "string") {
                retrievedBase = await CollectionConfiguration.#getOneToOneBaseByString(base, key);
            }
            if (!retrievedBase) {
                throw new Error("The base configuration must be a WeakMap CollectionConfiguration, 'WeakMap', 'composite-collection/WeakStrongMap', or 'composite-collection/WeakWeakMap'!");
            }
            this.#configurationData.setOneToOne(key, retrievedBase, options);
        });
    }
    static async #getOneToOneBaseByString(baseConfiguration, privateKeyName) {
        if (baseConfiguration === "WeakMap") {
            return ConfigurationData.WeakMapConfiguration;
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
    static #oneToOneLockedPrivateKey(baseConfiguration, privateKeyName) {
        const data = ConfigurationData.cloneData(baseConfiguration);
        const weakKeys = data.weakMapKeys;
        if (weakKeys.includes(privateKeyName))
            return;
        const names = weakKeys.map(name => `"${name}"`).join(", ");
        throw new Error(`Invalid weak key name for the base configuration.  Valid names are ${names}.`);
    }
    // #endregion One-to-one map configuration and static helpers.
    lock() {
        return this.#stateMachine.catchErrorState(() => {
            if (!this.#stateMachine.doStateTransition("locked"))
                throw new Error("You must define a map key or set element first!");
            if (this.#configurationData.collectionTemplate === "OneToOne/Map")
                return;
            if (this.#configurationData.collectionTemplate.startsWith("Weak/Map") && !this.#configurationData.weakMapKeys.length)
                throw new Error("A weak map keyset must have at least one weak key!");
            if (/Weak\/?Set/.test(this.#configurationData.collectionTemplate) && !this.#configurationData.weakSetElements.length)
                throw new Error("A weak set keyset must have at least one weak key!");
            let argCount = this.#configurationData.parameterToTypeMap.size;
            if (argCount === 0) {
                if (!this.#configurationData.valueType)
                    throw new Error("State machine error:  we should have some steps now!");
                argCount++;
            }
            if (argCount === 1) {
                // Use a solo collection template.
                this.#configurationData.collectionTemplate = this.#configurationData.collectionTemplate.replace(/^\w+/g, "Solo");
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
//# sourceMappingURL=CollectionConfiguration.mjs.map