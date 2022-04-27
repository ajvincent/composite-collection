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
 * @property {string?}   argumentType      A JSDoc-printable type for the argument.
 * @property {Function?} argumentValidator A method to use for testing the argument.
 */
class CollectionTypeOptions {
    argumentType;
    argumentValidator;
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
            const { argumentType = holdWeak ? "object" : "*", argumentValidator = null, } = options;
            this.#validateKey(argumentName, holdWeak, argumentType, description, argumentValidator);
            if (holdWeak && !this.#configurationData.collectionTemplate.startsWith("Weak/Map"))
                throw new Error("Strong maps cannot have weak map keys!");
            const validatorSource = (argumentValidator !== null) ?
                CollectionConfiguration.#validatorArg("argumentValidator", argumentValidator, argumentName, true) :
                null;
            const collectionType = new CollectionType(argumentName, holdWeak ? "WeakMap" : "Map", argumentType, description, validatorSource);
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
            const { argumentType = holdWeak ? "object" : "*", argumentValidator = null, } = options;
            this.#validateKey(argumentName, holdWeak, argumentType, description, argumentValidator);
            if (holdWeak && !/Weak\/?Set/.test(this.#configurationData.collectionTemplate))
                throw new Error("Strong sets cannot have weak set keys!");
            const validatorSource = (argumentValidator !== null) ?
                CollectionConfiguration.#validatorArg("argumentValidator", argumentValidator, argumentName, true) :
                null;
            const collectionType = new CollectionType(argumentName, holdWeak ? "WeakSet" : "Set", argumentType, description, validatorSource);
            this.#configurationData.defineArgument(collectionType);
        });
    }
    #validateKey(argumentName, holdWeak, argumentType, description, argumentValidator) {
        CollectionConfiguration.#identifierArg("argumentName", argumentName);
        CollectionConfiguration.#jsdocField("argumentType", argumentType);
        CollectionConfiguration.#jsdocField("description", description);
        if (argumentValidator !== null) {
            CollectionConfiguration.#validatorArg("argumentValidator", argumentValidator, argumentName, true);
        }
        if (this.#configurationData.parameterToTypeMap.has(argumentName))
            throw new Error(`Argument name "${argumentName}" has already been defined!`);
        if ((argumentName === "value") && !this.#configurationData.collectionTemplate.includes("Set"))
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
    setValueType(type, description, validator) {
        return this.#stateMachine.catchErrorState(() => {
            if (!this.#stateMachine.doStateTransition("hasValueFilter")) {
                this.#throwIfLocked();
                if (this.#stateMachine.currentState === "hasValueFilter")
                    throw new Error("You can only set the value type once!");
                throw new Error("You can only call .setValueType() directly after calling .addMapKey()!");
            }
            CollectionConfiguration.#stringArg("type", type);
            CollectionConfiguration.#stringArg("description", description);
            let validatorSource = null;
            if (validator) {
                validatorSource = CollectionConfiguration.#validatorArg("validator", validator, "value", true);
            }
            this.#configurationData.valueType = new CollectionType("value", "Map", type, description, validatorSource);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24ubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztHQUtHO0FBRUgsT0FBTyxjQUFjLE1BQU0scUNBQXFDLENBQUM7QUFDakUsT0FBTyxjQUFjLE1BQU0scUNBQXFDLENBQUM7QUFDakUsT0FBTyxpQkFBaUIsTUFBTSx3Q0FBd0MsQ0FBQztBQUN2RSxPQUFPLHlCQUF5QixNQUFNLGdEQUFnRCxDQUFDO0FBRXZGLGdCQUFnQjtBQUNoQixNQUFNLGdCQUFnQixHQUF3QixJQUFJLEdBQUcsQ0FBQztJQUNwRCxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUM7SUFDckIsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDO0lBQ3ZCLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQztJQUNyQixDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUM7SUFDdkIsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDO0NBQzdCLENBQUMsQ0FBQztBQVNIOzs7O0dBSUc7QUFDSCxNQUFNLHFCQUFxQjtJQUN6QixZQUFZLENBQVU7SUFDdEIsaUJBQWlCLENBQXFCO0NBQ3ZDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxlQUFlO0lBQ25CLGdCQUFnQixDQUFVO0NBQzNCO0FBRUQsbUNBQW1DO0FBRW5DOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsT0FBTyxPQUFPLHVCQUF1QjtJQUMxQywwQ0FBMEM7SUFDMUMsa0JBQWtCLENBQW9CO0lBRXRDLHdDQUF3QztJQUN4QyxhQUFhLENBQTRCO0lBRXpDLG1EQUFtRDtJQUVuRDs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBb0IsRUFBRSxLQUFhO1FBQ25ELElBQUksQ0FBQyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1lB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QUNsQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDbEg7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxjQUFjO1FBQ1osSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksS0FBSyxRQUFRLEVBQUU7WUFDaEQsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO1NBQ2hFO0lBQ0gsQ0FBQztDQUNGO0FBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBtb2R1bGUgc291cmNlL0NvbGxlY3Rpb25Db25maWd1cmF0aW9uLm1qc1xuICogQGZpbGVcbiAqXG4gKiBUaGlzIGRlZmluZXMgYSBkYXRhIHN0cnVjdHVyZSBmb3IgY29uZmlndXJpbmcgYSBjb21wb3NpdGUgb2YgTWFwcyBhbmQgU2V0cy5cbiAqL1xuXG5pbXBvcnQgQWNvcm5JbnRlcmZhY2UgZnJvbSBcIi4vZ2VuZXJhdG9yVG9vbHMvQWNvcm5JbnRlcmZhY2UubWpzXCI7XG5pbXBvcnQgQ29sbGVjdGlvblR5cGUgZnJvbSBcIi4vZ2VuZXJhdG9yVG9vbHMvQ29sbGVjdGlvblR5cGUubWpzXCI7XG5pbXBvcnQgQ29uZmlndXJhdGlvbkRhdGEgZnJvbSBcIi4vZ2VuZXJhdG9yVG9vbHMvQ29uZmlndXJhdGlvbkRhdGEubWpzXCI7XG5pbXBvcnQgQ29uZmlndXJhdGlvblN0YXRlTWFjaGluZSBmcm9tIFwiLi9nZW5lcmF0b3JUb29scy9Db25maWd1cmF0aW9uU3RhdGVNYWNoaW5lLm1qc1wiO1xuXG4vKiogQHJlYWRvbmx5ICovXG5jb25zdCBQUkVERUZJTkVEX1RZUEVTOiBNYXA8c3RyaW5nLCBzdHJpbmc+ID0gbmV3IE1hcChbXG4gIFtcIk1hcFwiLCBcIlN0cm9uZy9NYXBcIl0sXG4gIFtcIldlYWtNYXBcIiwgXCJXZWFrL01hcFwiXSxcbiAgW1wiU2V0XCIsIFwiU3Ryb25nL1NldFwiXSxcbiAgW1wiV2Vha1NldFwiLCBcIldlYWsvU2V0XCJdLFxuICBbXCJPbmVUb09uZVwiLCBcIk9uZVRvT25lL01hcFwiXSxcbl0pO1xuXG5pbXBvcnQgdHlwZSB7IE1hcE9yU2V0VHlwZSB9IGZyb20gXCIuL2dlbmVyYXRvclRvb2xzL0NvbGxlY3Rpb25UeXBlLm1qc1wiO1xuXG50eXBlIG91dGVyVHlwZSA9IE1hcE9yU2V0VHlwZSB8IFwiT25lVG9PbmVcIjtcbnR5cGUgaW5uZXJUeXBlID0gXCJTZXRcIiB8IG51bGw7XG50eXBlIEFyZ3VtZW50VmFsaWRhdG9yID0gKGFyZzogdW5rbm93bikgPT4gdW5rbm93bjtcbnR5cGUgT25lVG9PbmVCYXNlU3RyaW5nID0gXCJXZWFrTWFwXCIgfCBcImNvbXBvc2l0ZS1jb2xsZWN0aW9uL1dlYWtTdHJvbmdNYXBcIiB8IFwiY29tcG9zaXRlLWNvbGxlY3Rpb24vV2Vha1dlYWtNYXBcIjtcblxuLyoqXG4gKiBAdHlwZWRlZiBDb2xsZWN0aW9uVHlwZU9wdGlvbnNcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nP30gICBhcmd1bWVudFR5cGUgICAgICBBIEpTRG9jLXByaW50YWJsZSB0eXBlIGZvciB0aGUgYXJndW1lbnQuXG4gKiBAcHJvcGVydHkge0Z1bmN0aW9uP30gYXJndW1lbnRWYWxpZGF0b3IgQSBtZXRob2QgdG8gdXNlIGZvciB0ZXN0aW5nIHRoZSBhcmd1bWVudC5cbiAqL1xuY2xhc3MgQ29sbGVjdGlvblR5cGVPcHRpb25zIHtcbiAgYXJndW1lbnRUeXBlPzogc3RyaW5nO1xuICBhcmd1bWVudFZhbGlkYXRvcj86IEFyZ3VtZW50VmFsaWRhdG9yO1xufVxuXG4vKipcbiAqIEB0eXBlZGVmIHtvYmplY3R9IG9uZVRvT25lT3B0aW9uc1xuICogQHByb3BlcnR5IHtzdHJpbmc/fSBwYXRoVG9CYXNlTW9kdWxlIEluZGljYXRlcyB0aGUgaW1wb3J0IGxpbmUgZm9yIHRoZSBiYXNlIG1vZHVsZSdzIGxvY2F0aW9uLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIElmIHRoaXMgcHJvcGVydHkgaXNuJ3QgcHJlc2VudCwgdGhlIENvZGVHZW5lcmF0b3Igd2lsbFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZSBhIGNvbXBsZXRlIGlubGluZSBjb3B5IG9mIHRoZSBiYXNlIGNvbGxlY3Rpb24gaW4gdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25lLXRvLW9uZSBtYXAgbW9kdWxlLlxuICovXG5jbGFzcyBvbmVUb09uZU9wdGlvbnMge1xuICBwYXRoVG9CYXNlTW9kdWxlPzogc3RyaW5nO1xufVxuXG4vKiogQHR5cGVkZWYge3N0cmluZ30gaWRlbnRpZmllciAqL1xuXG4vKipcbiAqIEEgY29uZmlndXJhdGlvbiBtYW5hZ2VyIGZvciBhIHNpbmdsZSBjb21wb3NpdGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbGxlY3Rpb25Db25maWd1cmF0aW9uIHtcbiAgLyoqIEB0eXBlIHtDb25maWd1cmF0aW9uRGF0YX0gQGNvbnN0YW50ICovXG4gICNjb25maWd1cmF0aW9uRGF0YTogQ29uZmlndXJhdGlvbkRhdGE7XG5cbiAgLyoqIEB0eXBlIHtDb25maWd1cmF0aW9uU3RhdGVNYWNoaW5lfSAqL1xuICAjc3RhdGVNYWNoaW5lOiBDb25maWd1cmF0aW9uU3RhdGVNYWNoaW5lO1xuXG4gIC8vICNyZWdpb24gc3RhdGljIHZhbGlkYXRpb24gb2YgYXJndW1lbnQgcHJvcGVydGllc1xuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSBhIHN0cmluZyBhcmd1bWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9ICBhcmd1bWVudE5hbWUgVGhlIG5hbWUgb2YgdGhlIGFyZ3VtZW50LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gIHZhbHVlICAgICAgICBUaGUgYXJndW1lbnQgdmFsdWUuXG4gICAqL1xuICBzdGF0aWMgI3N0cmluZ0FyZyhhcmd1bWVudE5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZykgOiB2b2lkIHtcbiAgICBpZiAoKHR5cGVvZiB2YWx1ZSAhPT0gXCJzdHJpbmdcIikgfHwgKHZhbHVlLmxlbmd0aCA9PT0gMCkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7YXJndW1lbnROYW1lfSBtdXN0IGJlIGEgbm9uLWVtcHR5IHN0cmluZyFgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSBhbiBpZGVudGlmaWVyIGFzIG9uZSB3ZSBjYW4gc2FmZWx5IGluamVjdCBpbnRvIHRlbXBsYXRlcy5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9ICAgICBhcmdOYW1lICAgICBUaGUgbmFtZSBvZiB0aGUgYXJndW1lbnQgaW4gdGhpcyBmdW5jdGlvbidzIGNhbGxlci4gIFVzZWQgdG8gZGVzY3JpYmUgZXhjZXB0aW9ucy5cbiAgICogQHBhcmFtIHtpZGVudGlmaWVyfSBpZGVudGlmaWVyICBUaGUgaWRlbnRpZmllciB0byBpbnNlcnQgaW50byB0aGUgZ2VuZXJhdGVkIGNvZGUuXG4gICAqIEB0aHJvd3NcbiAgICovXG4gIHN0YXRpYyAjaWRlbnRpZmllckFyZyhhcmdOYW1lOiBzdHJpbmcsIGlkZW50aWZpZXI6IHN0cmluZykgOiB2b2lkIHtcbiAgICBDb2xsZWN0aW9uQ29uZmlndXJhdGlvbi4jc3RyaW5nQXJnKGFyZ05hbWUsIGlkZW50aWZpZXIpO1xuICAgIGlmIChpZGVudGlmaWVyICE9PSBpZGVudGlmaWVyLnRyaW0oKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihhcmdOYW1lICsgXCIgbXVzdCBub3QgaGF2ZSBsZWFkaW5nIG9yIHRyYWlsaW5nIHdoaXRlc3BhY2UhXCIpO1xuXG4gICAgLyogQSBsaXR0bGUgZXhwbGFuYXRpb24gaXMgaW4gb3JkZXIuICBTaW1wbHkgcHV0LCB0aGUgY29tcGlsZXIgd2lsbCBuZWVkIGEgc2V0IG9mIHZhcmlhYmxlIG5hbWVzIGl0IGNhbiBkZWZpbmVcbiAgICB3aGljaCBzaG91bGQgb25seSBtaW5pbWFsbHkgcmVkdWNlIHRoZSBzZXQgb2YgdmFyaWFibGUgbmFtZXMgdGhlIHVzZXIgbWF5IG5lZWQuICBBIGRvdWJsZSB1bmRlcnNjb3JlIGF0IHRoZVxuICAgIHN0YXJ0IGFuZCB0aGUgZW5kIG9mIHRoZSBhcmd1bWVudCBuYW1lIGlzbid0IHRvbyBtdWNoIHRvIGFzayAtIGFuZCB3aHkgd291bGQgeW91IGhhdmUgdGhhdCBmb3IgYSBmdW5jdGlvblxuICAgIGFyZ3VtZW50IG5hbWUgYW55d2F5P1xuICAgICovXG4gICAgaWYgKC9eX18uKl9fJC8udGVzdChpZGVudGlmaWVyKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoaXMgbW9kdWxlIHJlc2VydmVzIHZhcmlhYmxlIG5hbWVzIHN0YXJ0aW5nIGFuZCBlbmRpbmcgd2l0aCBhIGRvdWJsZSB1bmRlcnNjb3JlIGZvciBpdHNlbGYuXCIpO1xuXG4gICAgaWYgKCFBY29ybkludGVyZmFjZS5pc0lkZW50aWZpZXIoaWRlbnRpZmllcikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgXCIke2lkZW50aWZpZXJ9XCIgaXMgbm90IGEgdmFsaWQgSmF2YVNjcmlwdCBpZGVudGlmaWVyIWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZnkgYSBsYW1iZGEgZnVuY3Rpb24gb2Ygb25lIGFyZ3VtZW50IG1heSBiZSBpbnNlcnRlZCBkaXJlY3RseSBpbiB0byBnZW5lcmF0ZWQgY29kZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9ICAgYXJndW1lbnROYW1lICAgIFRoZSBuYW1lIG9mIHRoZSBmdW5jdGlvbi5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgICAgICAgIFRoZSBmdW5jdGlvbi5cbiAgICogQHBhcmFtIHtzdHJpbmd9ICAgc2luZ2xlUGFyYW1OYW1lIFRoZSBhcmd1bWVudCBuYW1lIHRvIGNoZWNrLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59ICBtYXlPbWl0ICAgICAgICAgVHJ1ZSBpZiB0aGUgZnVuY3Rpb24gbWF5IGJlIG9taXR0ZWQuXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBib2R5IG9mIHRoZSBmdW5jdGlvbi5cbiAgICovXG4gIHN0YXRpYyAjdmFsaWRhdG9yQXJnKFxuICAgIGFyZ3VtZW50TmFtZTogc3RyaW5nLFxuICAgIGNhbGxiYWNrOiBBcmd1bWVudFZhbGlkYXRvcixcbiAgICBzaW5nbGVQYXJhbU5hbWU6IHN0cmluZyxcbiAgICBtYXlPbWl0ID0gZmFsc2VcbiAgKSA6IHN0cmluZ1xuICB7XG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2FyZ3VtZW50TmFtZX0gbXVzdCBiZSBhIGZ1bmN0aW9uJHttYXlPbWl0ID8gXCIgb3Igb21pdHRlZFwiIDogXCJcIn0hYCk7XG5cbiAgICBjb25zdCBbc291cmNlLCBwYXJhbXMsIGJvZHldID0gQWNvcm5JbnRlcmZhY2UuZ2V0Tm9ybWFsRnVuY3Rpb25BU1QoY2FsbGJhY2spO1xuICAgIGlmICgocGFyYW1zLmxlbmd0aCAhPT0gMSkgfHwgKHBhcmFtc1swXS5uYW1lICE9PSBzaW5nbGVQYXJhbU5hbWUpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2FyZ3VtZW50TmFtZX0gbXVzdCBiZSBhIGZ1bmN0aW9uIHdpdGggYSBzaW5nbGUgYXJndW1lbnQsIFwiJHtzaW5nbGVQYXJhbU5hbWV9XCIhYCk7XG5cbiAgICByZXR1cm4gc291cmNlLnN1YnN0cmluZyhib2R5LnN0YXJ0LCBib2R5LmVuZCArIDEpO1xuICB9XG5cbiAgc3RhdGljICNqc2RvY0ZpZWxkKGFyZ3VtZW50TmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSA6IHZvaWQge1xuICAgIENvbGxlY3Rpb25Db25maWd1cmF0aW9uLiNzdHJpbmdBcmcoYXJndW1lbnROYW1lLCB2YWx1ZSk7XG4gICAgaWYgKHZhbHVlLmluY2x1ZGVzKFwiKi9cIikpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYXJndW1lbnROYW1lICsgXCIgY29udGFpbnMgYSBjb21tZW50IHRoYXQgd291bGQgZW5kIHRoZSBKU0RvYyBibG9jayFcIik7XG4gIH1cblxuICAvLyAjZW5kcmVnaW9uIHN0YXRpYyB2YWxpZGF0aW9uIG9mIGFyZ3VtZW50IHByb3BlcnRpZXNcblxuICAvLyAjcmVnaW9uIFRoZSBwcmltYXJ5IENvbGxlY3Rpb25Db25maWd1cmF0aW9uIHB1YmxpYyBBUEkgKGV4Y2x1ZGluZyBPbmVUb09uZSBhbmQgbG9jaygpKVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gIGNsYXNzTmFtZSBUaGUgbmFtZSBvZiB0aGUgY2xhc3MgdG8gZGVmaW5lLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gIG91dGVyVHlwZSBPbmUgb2YgXCJNYXBcIiwgXCJXZWFrTWFwXCIsIFwiU2V0XCIsIFwiV2Vha1NldFwiLCBcIk9uZVRvT25lXCIuXG4gICAqIEBwYXJhbSB7c3RyaW5nP30gaW5uZXJUeXBlIEVpdGhlciBcIlNldFwiIG9yIG51bGwuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBjbGFzc05hbWU6IHN0cmluZyxcbiAgICBvdXRlclR5cGU6IG91dGVyVHlwZSxcbiAgICBpbm5lclR5cGU6IGlubmVyVHlwZSA9IG51bGxcbiAgKVxuICB7XG4gICAgLyogVGhpcyBpcyBhIGRlZmVuc2l2ZSBtZWFzdXJlIGZvciBvbmUtdG8tb25lIGNvbmZpZ3VyYXRpb25zLCB3aGVyZSB0aGUgYmFzZSBjb25maWd1cmF0aW9uIG11c3QgYmUgZm9yIGEgV2Vha01hcC4gKi9cbiAgICBpZiAobmV3LnRhcmdldCAhPT0gQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24pXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgY2Fubm90IHN1YmNsYXNzIENvbGxlY3Rpb25Db25maWd1cmF0aW9uIVwiKTtcblxuICAgIENvbGxlY3Rpb25Db25maWd1cmF0aW9uLiNpZGVudGlmaWVyQXJnKFwiY2xhc3NOYW1lXCIsIGNsYXNzTmFtZSk7XG4gICAgaWYgKFBSRURFRklORURfVFlQRVMuaGFzKGNsYXNzTmFtZSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFlvdSBjYW4ndCBvdmVycmlkZSB0aGUgJHtjbGFzc05hbWV9IHByaW1vcmRpYWwhYCk7XG5cbiAgICBsZXQgdGVtcGxhdGUgPSBQUkVERUZJTkVEX1RZUEVTLmdldChvdXRlclR5cGUpO1xuICAgIGlmICghdGVtcGxhdGUpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYG91dGVyVHlwZSBtdXN0IGJlIG9uZSBvZiAke0FycmF5LmZyb20oUFJFREVGSU5FRF9UWVBFUy5rZXlzKCkpLmpvaW4oXCIsIFwiKX0hYCk7XG5cbiAgICBzd2l0Y2ggKGlubmVyVHlwZSkge1xuICAgICAgY2FzZSBudWxsOlxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcIlNldFwiOlxuICAgICAgICBpZiAoIW91dGVyVHlwZS5lbmRzV2l0aChcIk1hcFwiKSlcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvdXRlclR5cGUgbXVzdCBiZSBhIE1hcCBvciBXZWFrTWFwIHdoZW4gYW4gaW5uZXJUeXBlIGlzIG5vdCBudWxsIVwiKTtcbiAgICAgICAgdGVtcGxhdGUgKz0gXCJPZlN0cm9uZ1NldHNcIjtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgLypcbiAgICAgICAgVGhlcmUgY2FuJ3QgYmUgYSBtYXAgb2Ygd2VhayBzZXRzLCBiZWNhdXNlIGl0J3MgdW5jbGVhciB3aGVuIHdlIHdvdWxkXG4gICAgICAgIGhvbGQgcmVmZXJlbmNlcyB0byB0aGUgbWFwIGtleXMuICBUcnkgaXQgYXMgYSB0aG91Z2h0IGV4cGVyaW1lbnQ6ICBhZGRcbiAgICAgICAgdHdvIHN1Y2ggc2V0cywgdGhlbiBkZWxldGUgb25lLiAgU2hvdWxkIHRoZSBtYXAga2V5cyBiZSBoZWxkP1xuICAgICAgICBXaGF0IGFib3V0IGFmdGVyIGdhcmJhZ2UgY29sbGVjdGlvbiByZW1vdmVzIHRoZSBvdGhlciBzZXQ/XG4gICAgICAgICovXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImlubmVyVHlwZSBtdXN0IGJlIGEgU2V0LCBvciBudWxsIVwiKTtcbiAgICB9XG5cbiAgICBpZiAodGVtcGxhdGUuaW5jbHVkZXMoXCJNYXBPZlwiKSkge1xuICAgICAgdGhpcy4jc3RhdGVNYWNoaW5lID0gQ29uZmlndXJhdGlvblN0YXRlTWFjaGluZS5NYXBPZlNldHMoKTtcbiAgICAgIHRoaXMuI3N0YXRlTWFjaGluZS5kb1N0YXRlVHJhbnNpdGlvbihcInN0YXJ0TWFwT2ZTZXRzXCIpO1xuICAgIH1cbiAgICBlbHNlIGlmIChvdXRlclR5cGUuZW5kc1dpdGgoXCJNYXBcIikpIHtcbiAgICAgIHRoaXMuI3N0YXRlTWFjaGluZSA9IENvbmZpZ3VyYXRpb25TdGF0ZU1hY2hpbmUuTWFwKCk7XG4gICAgICB0aGlzLiNzdGF0ZU1hY2hpbmUuZG9TdGF0ZVRyYW5zaXRpb24oXCJzdGFydE1hcFwiKTtcbiAgICB9XG4gICAgZWxzZSBpZiAob3V0ZXJUeXBlLmVuZHNXaXRoKFwiU2V0XCIpKSB7XG4gICAgICB0aGlzLiNzdGF0ZU1hY2hpbmUgPSBDb25maWd1cmF0aW9uU3RhdGVNYWNoaW5lLlNldCgpO1xuICAgICAgdGhpcy4jc3RhdGVNYWNoaW5lLmRvU3RhdGVUcmFuc2l0aW9uKFwic3RhcnRTZXRcIik7XG4gICAgfVxuICAgIGVsc2UgaWYgKG91dGVyVHlwZSA9PT0gXCJPbmVUb09uZVwiKSB7XG4gICAgICB0aGlzLiNzdGF0ZU1hY2hpbmUgPSBDb25maWd1cmF0aW9uU3RhdGVNYWNoaW5lLk9uZVRvT25lKCk7XG4gICAgICB0aGlzLiNzdGF0ZU1hY2hpbmUuZG9TdGF0ZVRyYW5zaXRpb24oXCJzdGFydE9uZVRvT25lXCIpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludGVybmFsIGVycm9yLCBub3QgcmVhY2hhYmxlXCIpO1xuICAgIH1cblxuICAgIHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhID0gbmV3IENvbmZpZ3VyYXRpb25EYXRhKGNsYXNzTmFtZSwgdGVtcGxhdGUpO1xuICAgIHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLnNldENvbmZpZ3VyYXRpb24odGhpcyk7XG5cbiAgICBSZWZsZWN0LnByZXZlbnRFeHRlbnNpb25zKHRoaXMpO1xuICB9XG5cbiAgLyoqIEB0eXBlIHtzdHJpbmd9IEBwYWNrYWdlICovXG4gIGdldCBjdXJyZW50U3RhdGUoKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuI3N0YXRlTWFjaGluZS5jdXJyZW50U3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogQSBmaWxlIG92ZXJ2aWV3IHRvIGZlZWQgaW50byB0aGUgZ2VuZXJhdGVkIG1vZHVsZS5cbiAgICpcbiAgICogQHR5cGUge3N0cmluZ30gZmlsZU92ZXJ2aWV3IFRoZSBvdmVydmlldy5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgc2V0RmlsZU92ZXJ2aWV3KGZpbGVPdmVydmlldzogc3RyaW5nKSA6IHZvaWQge1xuICAgIHJldHVybiB0aGlzLiNzdGF0ZU1hY2hpbmUuY2F0Y2hFcnJvclN0YXRlKCgpID0+IHtcbiAgICAgIGlmICghdGhpcy4jc3RhdGVNYWNoaW5lLmRvU3RhdGVUcmFuc2l0aW9uKFwiZmlsZU92ZXJ2aWV3XCIpKSB7XG4gICAgICAgIHRoaXMuI3Rocm93SWZMb2NrZWQoKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG1heSBvbmx5IGRlZmluZSB0aGUgZmlsZSBvdmVydmlldyBhdCB0aGUgc3RhcnQgb2YgdGhlIGNvbmZpZ3VyYXRpb24hXCIpO1xuICAgICAgfVxuICAgICAgQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24uI3N0cmluZ0FyZyhcImZpbGVPdmVydmlld1wiLCBmaWxlT3ZlcnZpZXcpO1xuICAgICAgdGhpcy4jY29uZmlndXJhdGlvbkRhdGEuc2V0RmlsZU92ZXJ2aWV3KGZpbGVPdmVydmlldyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBtb2R1bGUgaW1wb3J0IGxpbmVzLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbGluZXMgVGhlIEphdmFTY3JpcHQgY29kZSB0byBpbmplY3QuXG4gICAqIEByZXR1cm5zIHt2b2lkfVxuICAgKi9cbiAgaW1wb3J0TGluZXMobGluZXM6IHN0cmluZykgOiB2b2lkIHtcbiAgICByZXR1cm4gdGhpcy4jc3RhdGVNYWNoaW5lLmNhdGNoRXJyb3JTdGF0ZSgoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuI3N0YXRlTWFjaGluZS5kb1N0YXRlVHJhbnNpdGlvbihcImltcG9ydExpbmVzXCIpKSB7XG4gICAgICAgIHRoaXMuI3Rocm93SWZMb2NrZWQoKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG1heSBvbmx5IGRlZmluZSBpbXBvcnQgbGluZXMgYXQgdGhlIHN0YXJ0IG9mIHRoZSBjb25maWd1cmF0aW9uIG9yIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBmaWxlIG92ZXJ2aWV3IVwiKTtcbiAgICAgIH1cbiAgICAgIENvbGxlY3Rpb25Db25maWd1cmF0aW9uLiNzdHJpbmdBcmcoXCJsaW5lc1wiLCBsaW5lcyk7XG4gICAgICB0aGlzLiNjb25maWd1cmF0aW9uRGF0YS5pbXBvcnRMaW5lcyA9IGxpbmVzLnRvU3RyaW5nKCkudHJpbSgpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlZmluZSBhIG1hcCBrZXkuXG4gICAqXG4gICAqIEBwYXJhbSB7aWRlbnRpZmllcn0gICAgICAgICAgICAgYXJndW1lbnROYW1lIFRoZSBrZXkgbmFtZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiAgVGhlIGtleSBkZXNjcmlwdGlvbiBmb3IgSlNEb2MuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgaG9sZFdlYWsgICAgIFRydWUgaWYgdGhlIGNvbGxlY3Rpb24gc2hvdWxkIGhvbGQgdmFsdWVzIGZvciB0aGlzIGtleSBhcyB3ZWFrIHJlZmVyZW5jZXMuXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvblR5cGVPcHRpb25zP30gb3B0aW9ucyAgICAgIE9wdGlvbnMgZm9yIGNvbmZpZ3VyaW5nIGdlbmVyYXRlZCBjb2RlLlxuICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICovXG4gIGFkZE1hcEtleShcbiAgICBhcmd1bWVudE5hbWU6IHN0cmluZyxcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nLFxuICAgIGhvbGRXZWFrOiBib29sZWFuLFxuICAgIG9wdGlvbnM6IENvbGxlY3Rpb25UeXBlT3B0aW9ucyA9IHt9XG4gICkgOiB2b2lkXG4gIHtcbiAgICByZXR1cm4gdGhpcy4jc3RhdGVNYWNoaW5lLmNhdGNoRXJyb3JTdGF0ZSgoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuI3N0YXRlTWFjaGluZS5kb1N0YXRlVHJhbnNpdGlvbihcIm1hcEtleXNcIikpIHtcbiAgICAgICAgdGhpcy4jdGhyb3dJZkxvY2tlZCgpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBkZWZpbmUgbWFwIGtleXMgYmVmb3JlIGNhbGxpbmcgLmFkZFNldEVsZW1lbnQoKSwgLnNldFZhbHVlVHlwZSgpIG9yIC5sb2NrKCkhXCIpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7XG4gICAgICAgIGFyZ3VtZW50VHlwZSA9IGhvbGRXZWFrID8gXCJvYmplY3RcIiA6IFwiKlwiLFxuICAgICAgICBhcmd1bWVudFZhbGlkYXRvciA9IG51bGwsXG4gICAgICB9ID0gb3B0aW9ucztcblxuICAgICAgdGhpcy4jdmFsaWRhdGVLZXkoYXJndW1lbnROYW1lLCBob2xkV2VhaywgYXJndW1lbnRUeXBlLCBkZXNjcmlwdGlvbiwgYXJndW1lbnRWYWxpZGF0b3IpO1xuICAgICAgaWYgKGhvbGRXZWFrICYmICF0aGlzLiNjb25maWd1cmF0aW9uRGF0YS5jb2xsZWN0aW9uVGVtcGxhdGUuc3RhcnRzV2l0aChcIldlYWsvTWFwXCIpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdHJvbmcgbWFwcyBjYW5ub3QgaGF2ZSB3ZWFrIG1hcCBrZXlzIVwiKTtcblxuICAgICAgY29uc3QgdmFsaWRhdG9yU291cmNlID0gKGFyZ3VtZW50VmFsaWRhdG9yICE9PSBudWxsKSA/XG4gICAgICAgIENvbGxlY3Rpb25Db25maWd1cmF0aW9uLiN2YWxpZGF0b3JBcmcoXG4gICAgICAgICAgXCJhcmd1bWVudFZhbGlkYXRvclwiLFxuICAgICAgICAgIGFyZ3VtZW50VmFsaWRhdG9yLFxuICAgICAgICAgIGFyZ3VtZW50TmFtZSxcbiAgICAgICAgICB0cnVlXG4gICAgICAgICkgOlxuICAgICAgICBudWxsO1xuXG4gICAgICBjb25zdCBjb2xsZWN0aW9uVHlwZSA9IG5ldyBDb2xsZWN0aW9uVHlwZShcbiAgICAgICAgYXJndW1lbnROYW1lLFxuICAgICAgICBob2xkV2VhayA/IFwiV2Vha01hcFwiIDogXCJNYXBcIixcbiAgICAgICAgYXJndW1lbnRUeXBlLFxuICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgdmFsaWRhdG9yU291cmNlXG4gICAgICApO1xuICAgICAgdGhpcy4jY29uZmlndXJhdGlvbkRhdGEuZGVmaW5lQXJndW1lbnQoY29sbGVjdGlvblR5cGUpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlZmluZSBhIHNldCBrZXkuXG4gICAqXG4gICAqIEBwYXJhbSB7aWRlbnRpZmllcn0gICAgICAgICAgICAgYXJndW1lbnROYW1lIFRoZSBrZXkgbmFtZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiAgVGhlIGtleSBkZXNjcmlwdGlvbiBmb3IgSlNEb2MuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgaG9sZFdlYWsgICAgIFRydWUgaWYgdGhlIGNvbGxlY3Rpb24gc2hvdWxkIGhvbGQgdmFsdWVzIGZvciB0aGlzIGtleSBhcyB3ZWFrIHJlZmVyZW5jZXMuXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvblR5cGVPcHRpb25zP30gb3B0aW9ucyAgICAgIE9wdGlvbnMgZm9yIGNvbmZpZ3VyaW5nIGdlbmVyYXRlZCBjb2RlLlxuICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICovXG4gIGFkZFNldEtleShcbiAgICBhcmd1bWVudE5hbWU6IHN0cmluZyxcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nLFxuICAgIGhvbGRXZWFrOiBib29sZWFuLFxuICAgIG9wdGlvbnM6IENvbGxlY3Rpb25UeXBlT3B0aW9ucyA9IHt9XG4gICkgOiB2b2lkXG4gIHtcbiAgICByZXR1cm4gdGhpcy4jc3RhdGVNYWNoaW5lLmNhdGNoRXJyb3JTdGF0ZSgoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuI3N0YXRlTWFjaGluZS5kb1N0YXRlVHJhbnNpdGlvbihcInNldEVsZW1lbnRzXCIpKSB7XG4gICAgICAgIHRoaXMuI3Rocm93SWZMb2NrZWQoKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3QgZGVmaW5lIHNldCBrZXlzIGJlZm9yZSBjYWxsaW5nIC5zZXRWYWx1ZVR5cGUoKSBvciAubG9jaygpIVwiKTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qge1xuICAgICAgICBhcmd1bWVudFR5cGUgPSBob2xkV2VhayA/IFwib2JqZWN0XCIgOiBcIipcIixcbiAgICAgICAgYXJndW1lbnRWYWxpZGF0b3IgPSBudWxsLFxuICAgICAgfSA9IG9wdGlvbnM7XG5cbiAgICAgIHRoaXMuI3ZhbGlkYXRlS2V5KGFyZ3VtZW50TmFtZSwgaG9sZFdlYWssIGFyZ3VtZW50VHlwZSwgZGVzY3JpcHRpb24sIGFyZ3VtZW50VmFsaWRhdG9yKTtcbiAgICAgIGlmIChob2xkV2VhayAmJiAhL1dlYWtcXC8/U2V0Ly50ZXN0KHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLmNvbGxlY3Rpb25UZW1wbGF0ZSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlN0cm9uZyBzZXRzIGNhbm5vdCBoYXZlIHdlYWsgc2V0IGtleXMhXCIpO1xuXG4gICAgICBjb25zdCB2YWxpZGF0b3JTb3VyY2UgPSAoYXJndW1lbnRWYWxpZGF0b3IgIT09IG51bGwpID9cbiAgICAgICAgQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24uI3ZhbGlkYXRvckFyZyhcbiAgICAgICAgICBcImFyZ3VtZW50VmFsaWRhdG9yXCIsXG4gICAgICAgICAgYXJndW1lbnRWYWxpZGF0b3IsXG4gICAgICAgICAgYXJndW1lbnROYW1lLFxuICAgICAgICAgIHRydWVcbiAgICAgICAgKSA6XG4gICAgICAgIG51bGw7XG5cbiAgICAgIGNvbnN0IGNvbGxlY3Rpb25UeXBlID0gbmV3IENvbGxlY3Rpb25UeXBlKFxuICAgICAgICBhcmd1bWVudE5hbWUsXG4gICAgICAgIGhvbGRXZWFrID8gXCJXZWFrU2V0XCIgOiBcIlNldFwiLFxuICAgICAgICBhcmd1bWVudFR5cGUsXG4gICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICB2YWxpZGF0b3JTb3VyY2VcbiAgICAgICk7XG4gICAgICB0aGlzLiNjb25maWd1cmF0aW9uRGF0YS5kZWZpbmVBcmd1bWVudChjb2xsZWN0aW9uVHlwZSk7XG4gICAgfSk7XG4gIH1cblxuICAjdmFsaWRhdGVLZXkoXG4gICAgYXJndW1lbnROYW1lOiBzdHJpbmcsXG4gICAgaG9sZFdlYWs6IGJvb2xlYW4sXG4gICAgYXJndW1lbnRUeXBlOiBzdHJpbmcsXG4gICAgZGVzY3JpcHRpb246IHN0cmluZyxcbiAgICBhcmd1bWVudFZhbGlkYXRvcjogQXJndW1lbnRWYWxpZGF0b3IgfCBudWxsXG4gICkgOiB2b2lkXG4gIHtcbiAgICBDb2xsZWN0aW9uQ29uZmlndXJhdGlvbi4jaWRlbnRpZmllckFyZyhcImFyZ3VtZW50TmFtZVwiLCBhcmd1bWVudE5hbWUpO1xuICAgIENvbGxlY3Rpb25Db25maWd1cmF0aW9uLiNqc2RvY0ZpZWxkKFwiYXJndW1lbnRUeXBlXCIsIGFyZ3VtZW50VHlwZSk7XG4gICAgQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24uI2pzZG9jRmllbGQoXCJkZXNjcmlwdGlvblwiLCBkZXNjcmlwdGlvbik7XG5cbiAgICBpZiAoYXJndW1lbnRWYWxpZGF0b3IgIT09IG51bGwpIHtcbiAgICAgIENvbGxlY3Rpb25Db25maWd1cmF0aW9uLiN2YWxpZGF0b3JBcmcoXG4gICAgICAgIFwiYXJndW1lbnRWYWxpZGF0b3JcIixcbiAgICAgICAgYXJndW1lbnRWYWxpZGF0b3IsXG4gICAgICAgIGFyZ3VtZW50TmFtZSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy4jY29uZmlndXJhdGlvbkRhdGEucGFyYW1ldGVyVG9UeXBlTWFwLmhhcyhhcmd1bWVudE5hbWUpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBcmd1bWVudCBuYW1lIFwiJHthcmd1bWVudE5hbWV9XCIgaGFzIGFscmVhZHkgYmVlbiBkZWZpbmVkIWApO1xuXG4gICAgaWYgKChhcmd1bWVudE5hbWUgPT09IFwidmFsdWVcIikgJiYgIXRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLmNvbGxlY3Rpb25UZW1wbGF0ZS5pbmNsdWRlcyhcIlNldFwiKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIGFyZ3VtZW50IG5hbWUgXCJ2YWx1ZVwiIGlzIHJlc2VydmVkIWApO1xuXG4gICAgaWYgKHR5cGVvZiBob2xkV2VhayAhPT0gXCJib29sZWFuXCIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJob2xkV2VhayBtdXN0IGJlIHRydWUgb3IgZmFsc2UhXCIpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlZmluZSB0aGUgdmFsdWUgdHlwZSBmb3IgLnNldCgpLCAuYWRkKCkgY2FsbHMuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSAgICB0eXBlICAgICAgICBUaGUgdmFsdWUgdHlwZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9ICAgIGRlc2NyaXB0aW9uIFRoZSBkZXNjcmlwdGlvbiBvZiB0aGUgdmFsdWUuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb24/fSB2YWxpZGF0b3IgICBBIGZ1bmN0aW9uIHRvIHZhbGlkYXRlIHRoZSB2YWx1ZS5cbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBzZXRWYWx1ZVR5cGUoXG4gICAgdHlwZTogc3RyaW5nLFxuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmcsXG4gICAgdmFsaWRhdG9yPzogQXJndW1lbnRWYWxpZGF0b3JcbiAgKSA6IHZvaWRcbiAge1xuICAgIHJldHVybiB0aGlzLiNzdGF0ZU1hY2hpbmUuY2F0Y2hFcnJvclN0YXRlKCgpID0+IHtcbiAgICAgIGlmICghdGhpcy4jc3RhdGVNYWNoaW5lLmRvU3RhdGVUcmFuc2l0aW9uKFwiaGFzVmFsdWVGaWx0ZXJcIikpIHtcbiAgICAgICAgdGhpcy4jdGhyb3dJZkxvY2tlZCgpO1xuXG4gICAgICAgIGlmICh0aGlzLiNzdGF0ZU1hY2hpbmUuY3VycmVudFN0YXRlID09PSBcImhhc1ZhbHVlRmlsdGVyXCIpXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IGNhbiBvbmx5IHNldCB0aGUgdmFsdWUgdHlwZSBvbmNlIVwiKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IGNhbiBvbmx5IGNhbGwgLnNldFZhbHVlVHlwZSgpIGRpcmVjdGx5IGFmdGVyIGNhbGxpbmcgLmFkZE1hcEtleSgpIVwiKTtcbiAgICAgIH1cblxuICAgICAgQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24uI3N0cmluZ0FyZyhcInR5cGVcIiwgdHlwZSk7XG4gICAgICBDb2xsZWN0aW9uQ29uZmlndXJhdGlvbi4jc3RyaW5nQXJnKFwiZGVzY3JpcHRpb25cIiwgZGVzY3JpcHRpb24pO1xuICAgICAgbGV0IHZhbGlkYXRvclNvdXJjZSA9IG51bGw7XG4gICAgICBpZiAodmFsaWRhdG9yKSB7XG4gICAgICAgIHZhbGlkYXRvclNvdXJjZSA9IENvbGxlY3Rpb25Db25maWd1cmF0aW9uLiN2YWxpZGF0b3JBcmcoXCJ2YWxpZGF0b3JcIiwgdmFsaWRhdG9yLCBcInZhbHVlXCIsIHRydWUpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiNjb25maWd1cmF0aW9uRGF0YS52YWx1ZVR5cGUgPSBuZXcgQ29sbGVjdGlvblR5cGUoXG4gICAgICAgIFwidmFsdWVcIiwgXCJNYXBcIiwgdHlwZSwgZGVzY3JpcHRpb24sIHZhbGlkYXRvclNvdXJjZVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vICNlbmRyZWdpb24gVGhlIGFjdHVhbCBDb2xsZWN0aW9uQ29uZmlndXJhdGlvbiBwdWJsaWMgQVBJLlxuXG4gIC8vICNyZWdpb24gT25lLXRvLW9uZSBtYXAgY29uZmlndXJhdGlvbiBhbmQgc3RhdGljIGhlbHBlcnMuXG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZSB0aGlzIG9uZS10by1vbmUgbWFwIGRlZmluaXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbkNvbmZpZ3VyYXRpb24gfCBzdHJpbmd9IGJhc2UgICAgVGhlIHVuZGVybHlpbmcgY29sbGVjdGlvbidzIGNvbmZpZ3VyYXRpb24uXG4gICAqIEBwYXJhbSB7aWRlbnRpZmllcn0gICAgICAgICAgICAgICAgICAgICAgIGtleSAgICAgVGhlIHdlYWsga2V5IG5hbWUgdG8gcmVzZXJ2ZSBpbiB0aGUgYmFzZSBjb2xsZWN0aW9uIGZvciB0aGUgb25lLXRvLW9uZSBtYXAncyB1c2UuXG4gICAqIEBwYXJhbSB7b25lVG9PbmVPcHRpb25zP30gICAgICAgICAgICAgICAgIG9wdGlvbnMgRm9yIGNvbmZpZ3VyaW5nIHRoZSBsYXlvdXQgb2YgdGhlIG9uZS10by1vbmUgbW9kdWxlIGFuZCBkZXBlbmRlbmNpZXMuXG4gICAqIEBhc3luY1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cbiAgICovXG4gIGNvbmZpZ3VyZU9uZVRvT25lKFxuICAgIGJhc2U6IENvbGxlY3Rpb25Db25maWd1cmF0aW9uIHwgT25lVG9PbmVCYXNlU3RyaW5nLFxuICAgIGtleTogc3RyaW5nLFxuICAgIG9wdGlvbnM6IG9uZVRvT25lT3B0aW9ucyA9IHt9XG4gICkgOiBQcm9taXNlPHZvaWQ+XG4gIHtcbiAgICByZXR1cm4gdGhpcy4jc3RhdGVNYWNoaW5lLmNhdGNoRXJyb3JBc3luYyhhc3luYyAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuI3N0YXRlTWFjaGluZS5kb1N0YXRlVHJhbnNpdGlvbihcImNvbmZpZ3VyZU9uZVRvT25lXCIpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImNvbmZpZ3VyZU9uZVRvT25lIGNhbiBvbmx5IGJlIHVzZWQgZm9yIE9uZVRvT25lIGNvbGxlY3Rpb25zLCBhbmQgZXhhY3RseSBvbmNlIVwiKTtcbiAgICAgIH1cblxuICAgICAgQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24uI2lkZW50aWZpZXJBcmcoXCJwcml2YXRlS2V5TmFtZVwiLCBrZXkpO1xuXG4gICAgICBsZXQgY29uZmlnRGF0YSwgcmV0cmlldmVkQmFzZTtcbiAgICAgIGlmIChiYXNlIGluc3RhbmNlb2YgQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgaWYgKGJhc2UuY3VycmVudFN0YXRlICE9PSBcImxvY2tlZFwiKSB7XG4gICAgICAgICAgLyogV2UgZGFyZSBub3QgbW9kaWZ5IHRoZSBiYXNlIGNvbmZpZ3VyYXRpb24gbGVzdCBvdGhlciBjb2RlIHVzZSBpdCB0byBnZW5lcmF0ZSBhIGRpZmZlcmVudCBmaWxlLiAqL1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBiYXNlIGNvbmZpZ3VyYXRpb24gbXVzdCBiZSBsb2NrZWQhXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uZmlnRGF0YSA9IENvbmZpZ3VyYXRpb25EYXRhLmNsb25lRGF0YShiYXNlKSBhcyBDb25maWd1cmF0aW9uRGF0YTtcbiAgICAgICAgaWYgKChjb25maWdEYXRhLmNvbGxlY3Rpb25UZW1wbGF0ZSA9PT0gXCJXZWFrL01hcFwiKSB8fFxuICAgICAgICAgICAgKChjb25maWdEYXRhLmNvbGxlY3Rpb25UZW1wbGF0ZSA9PT0gXCJTb2xvL01hcFwiKSAmJiAoY29uZmlnRGF0YS53ZWFrTWFwS2V5cy5sZW5ndGggPiAwKSkpIHtcbiAgICAgICAgICByZXRyaWV2ZWRCYXNlID0gYmFzZTtcbiAgICAgICAgICBDb2xsZWN0aW9uQ29uZmlndXJhdGlvbi4jb25lVG9PbmVMb2NrZWRQcml2YXRlS2V5KGJhc2UsIGtleSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHR5cGVvZiBiYXNlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJldHJpZXZlZEJhc2UgPSBhd2FpdCBDb2xsZWN0aW9uQ29uZmlndXJhdGlvbi4jZ2V0T25lVG9PbmVCYXNlQnlTdHJpbmcoYmFzZSwga2V5KTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFyZXRyaWV2ZWRCYXNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBiYXNlIGNvbmZpZ3VyYXRpb24gbXVzdCBiZSBhIFdlYWtNYXAgQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24sICdXZWFrTWFwJywgJ2NvbXBvc2l0ZS1jb2xsZWN0aW9uL1dlYWtTdHJvbmdNYXAnLCBvciAnY29tcG9zaXRlLWNvbGxlY3Rpb24vV2Vha1dlYWtNYXAnIVwiKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy4jY29uZmlndXJhdGlvbkRhdGEuc2V0T25lVG9PbmUoa2V5LCByZXRyaWV2ZWRCYXNlLCBvcHRpb25zKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBhc3luYyAjZ2V0T25lVG9PbmVCYXNlQnlTdHJpbmcoXG4gICAgYmFzZUNvbmZpZ3VyYXRpb246IE9uZVRvT25lQmFzZVN0cmluZyxcbiAgICBwcml2YXRlS2V5TmFtZTogc3RyaW5nXG4gICkgOiBQcm9taXNlPENvbGxlY3Rpb25Db25maWd1cmF0aW9uIHwgc3ltYm9sIHwgbnVsbD5cbiAge1xuICAgIGlmIChiYXNlQ29uZmlndXJhdGlvbiA9PT0gXCJXZWFrTWFwXCIpIHtcbiAgICAgIHJldHVybiBDb25maWd1cmF0aW9uRGF0YS5XZWFrTWFwQ29uZmlndXJhdGlvbjtcbiAgICB9XG5cbiAgICBpZiAoYmFzZUNvbmZpZ3VyYXRpb24gPT09IFwiY29tcG9zaXRlLWNvbGxlY3Rpb24vV2Vha1N0cm9uZ01hcFwiKSB7XG4gICAgICBjb25zdCBjb25maWcgPSAoYXdhaXQgaW1wb3J0KFwiLi9leHBvcnRzL1dlYWtTdHJvbmdNYXAubWpzXCIpKS5kZWZhdWx0O1xuICAgICAgQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24uI29uZVRvT25lTG9ja2VkUHJpdmF0ZUtleShjb25maWcsIHByaXZhdGVLZXlOYW1lKTtcbiAgICAgIHJldHVybiBjb25maWc7XG4gICAgfVxuXG4gICAgaWYgKGJhc2VDb25maWd1cmF0aW9uID09PSBcImNvbXBvc2l0ZS1jb2xsZWN0aW9uL1dlYWtXZWFrTWFwXCIpIHtcbiAgICAgIGNvbnN0IGNvbmZpZyA9IChhd2FpdCBpbXBvcnQoXCIuL2V4cG9ydHMvV2Vha1dlYWtNYXAubWpzXCIpKS5kZWZhdWx0O1xuICAgICAgQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24uI29uZVRvT25lTG9ja2VkUHJpdmF0ZUtleShjb25maWcsIHByaXZhdGVLZXlOYW1lKTtcbiAgICAgIHJldHVybiBjb25maWc7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBzdGF0aWMgI29uZVRvT25lTG9ja2VkUHJpdmF0ZUtleShcbiAgICBiYXNlQ29uZmlndXJhdGlvbjogQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24sXG4gICAgcHJpdmF0ZUtleU5hbWU6IHN0cmluZ1xuICApIDogdm9pZFxuICB7XG4gICAgY29uc3QgZGF0YSA9IENvbmZpZ3VyYXRpb25EYXRhLmNsb25lRGF0YShiYXNlQ29uZmlndXJhdGlvbikgYXMgQ29uZmlndXJhdGlvbkRhdGE7XG4gICAgY29uc3Qgd2Vha0tleXMgPSBkYXRhLndlYWtNYXBLZXlzO1xuICAgIGlmICh3ZWFrS2V5cy5pbmNsdWRlcyhwcml2YXRlS2V5TmFtZSkpXG4gICAgICByZXR1cm47XG4gICAgY29uc3QgbmFtZXMgPSB3ZWFrS2V5cy5tYXAobmFtZSA9PiBgXCIke25hbWV9XCJgKS5qb2luKFwiLCBcIik7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHdlYWsga2V5IG5hbWUgZm9yIHRoZSBiYXNlIGNvbmZpZ3VyYXRpb24uICBWYWxpZCBuYW1lcyBhcmUgJHtuYW1lc30uYCk7XG4gIH1cblxuICAvLyAjZW5kcmVnaW9uIE9uZS10by1vbmUgbWFwIGNvbmZpZ3VyYXRpb24gYW5kIHN0YXRpYyBoZWxwZXJzLlxuXG4gIGxvY2soKSA6IHZvaWQge1xuICAgIHJldHVybiB0aGlzLiNzdGF0ZU1hY2hpbmUuY2F0Y2hFcnJvclN0YXRlKCgpID0+IHtcbiAgICAgIGlmICghdGhpcy4jc3RhdGVNYWNoaW5lLmRvU3RhdGVUcmFuc2l0aW9uKFwibG9ja2VkXCIpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBkZWZpbmUgYSBtYXAga2V5IG9yIHNldCBlbGVtZW50IGZpcnN0IVwiKTtcblxuICAgICAgaWYgKHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLmNvbGxlY3Rpb25UZW1wbGF0ZSA9PT0gXCJPbmVUb09uZS9NYXBcIilcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICBpZiAodGhpcy4jY29uZmlndXJhdGlvbkRhdGEuY29sbGVjdGlvblRlbXBsYXRlLnN0YXJ0c1dpdGgoXCJXZWFrL01hcFwiKSAmJiAhdGhpcy4jY29uZmlndXJhdGlvbkRhdGEud2Vha01hcEtleXMubGVuZ3RoKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBIHdlYWsgbWFwIGtleXNldCBtdXN0IGhhdmUgYXQgbGVhc3Qgb25lIHdlYWsga2V5IVwiKTtcblxuICAgICAgaWYgKC9XZWFrXFwvP1NldC8udGVzdCh0aGlzLiNjb25maWd1cmF0aW9uRGF0YS5jb2xsZWN0aW9uVGVtcGxhdGUpICYmICF0aGlzLiNjb25maWd1cmF0aW9uRGF0YS53ZWFrU2V0RWxlbWVudHMubGVuZ3RoKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBIHdlYWsgc2V0IGtleXNldCBtdXN0IGhhdmUgYXQgbGVhc3Qgb25lIHdlYWsga2V5IVwiKTtcblxuICAgICAgbGV0IGFyZ0NvdW50ID0gdGhpcy4jY29uZmlndXJhdGlvbkRhdGEucGFyYW1ldGVyVG9UeXBlTWFwLnNpemU7XG4gICAgICBpZiAoYXJnQ291bnQgPT09IDApIHtcbiAgICAgICAgaWYgKCF0aGlzLiNjb25maWd1cmF0aW9uRGF0YS52YWx1ZVR5cGUpXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3RhdGUgbWFjaGluZSBlcnJvcjogIHdlIHNob3VsZCBoYXZlIHNvbWUgc3RlcHMgbm93IVwiKTtcbiAgICAgICAgYXJnQ291bnQrKztcbiAgICAgIH1cblxuICAgICAgaWYgKGFyZ0NvdW50ID09PSAxKSB7XG4gICAgICAgIC8vIFVzZSBhIHNvbG8gY29sbGVjdGlvbiB0ZW1wbGF0ZS5cbiAgICAgICAgdGhpcy4jY29uZmlndXJhdGlvbkRhdGEuY29sbGVjdGlvblRlbXBsYXRlID0gdGhpcy4jY29uZmlndXJhdGlvbkRhdGEuY29sbGVjdGlvblRlbXBsYXRlLnJlcGxhY2UoL15cXHcrL2csIFwiU29sb1wiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gICN0aHJvd0lmTG9ja2VkKCkgOiB2b2lkIHtcbiAgICBpZiAodGhpcy4jc3RhdGVNYWNoaW5lLmN1cnJlbnRTdGF0ZSA9PT0gXCJsb2NrZWRcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IGhhdmUgYWxyZWFkeSBsb2NrZWQgdGhpcyBjb25maWd1cmF0aW9uIVwiKTtcbiAgICB9XG4gIH1cbn1cbk9iamVjdC5mcmVlemUoQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24pO1xuT2JqZWN0LmZyZWV6ZShDb2xsZWN0aW9uQ29uZmlndXJhdGlvbi5wcm90b3R5cGUpO1xuIl19