/**
 * @module source/CollectionConfiguration.mjs
 * @file
 *
 * This defines a data structure for configuring a composite of Maps and Sets.
 */
import type { MapOrSetType } from "./generatorTools/CollectionType.mjs";
declare type outerType = MapOrSetType | "OneToOne";
declare type innerType = "Set" | null;
declare type ArgumentValidator<T> = (arg: T) => false | void;
declare type OneToOneBaseString = "WeakMap" | "composite-collection/WeakStrongMap" | "composite-collection/WeakWeakMap";
/**
 * @typedef CollectionTypeOptions
 * @property {string?}   jsDocType      A JSDoc-printable type for the argument.
 * @property {string?}   tsType         A TypeScript type for the argument.
 * @property {Function?} argumentValidator A method to use for testing the argument.
 */
declare class CollectionTypeOptions {
    jsDocType: string;
    tsType: string;
    argumentValidator: ArgumentValidator<unknown>;
}
/**
 * @typedef {object} oneToOneOptions
 * @property {string?} pathToBaseModule Indicates the import line for the base module's location.
 *                                      If this property isn't present, the CodeGenerator will
 *                                      create a complete inline copy of the base collection in the
 *                                      one-to-one map module.
 */
declare class oneToOneOptions {
    pathToBaseModule?: string;
}
/** @typedef {string} identifier */
/**
 * A configuration manager for a single composite collection.
 *
 * @public
 */
export default class CollectionConfiguration {
    #private;
    /**
     * @param {string}  className The name of the class to define.
     * @param {string}  outerType One of "Map", "WeakMap", "Set", "WeakSet", "OneToOne".
     * @param {string?} innerType Either "Set" or null.
     */
    constructor(className: string, outerType: outerType, innerType?: innerType);
    /** @type {string} @package */
    get currentState(): string;
    /**
     * A file overview to feed into the generated module.
     *
     * @type {string} fileOverview The overview.
     * @public
     */
    setFileOverview(fileOverview: string): void;
    /**
     * Set the module import lines.
     *
     * @param {string} lines The JavaScript code to inject.
     * @returns {void}
     */
    importLines(lines: string): void;
    /**
     * Define a map key.
     *
     * @param {identifier}             argumentName The key name.
     * @param {string}                 description  The key description for JSDoc.
     * @param {boolean}                holdWeak     True if the collection should hold values for this key as weak references.
     * @param {CollectionTypeOptions?} options      Options for configuring generated code.
     * @returns {void}
     */
    addMapKey(argumentName: string, description: string, holdWeak: boolean, options?: Partial<CollectionTypeOptions>): void;
    /**
     * Define a set key.
     *
     * @param {identifier}             argumentName The key name.
     * @param {string}                 description  The key description for JSDoc.
     * @param {boolean}                holdWeak     True if the collection should hold values for this key as weak references.
     * @param {CollectionTypeOptions?} options      Options for configuring generated code.
     * @returns {void}
     */
    addSetKey(argumentName: string, description: string, holdWeak: boolean, options?: Partial<CollectionTypeOptions>): void;
    /**
     * Define the value type for .set(), .add() calls.
     *
     * @param {string}    description The description of the value.
     * @param {CollectionTypeOptions?} options      Options for configuring generated code.
     * @returns {void}
     */
    setValueType(description: string, options?: Partial<CollectionTypeOptions>): void;
    /**
     * Configure this one-to-one map definition.
     *
     * @param {CollectionConfiguration | string} base    The underlying collection's configuration.
     * @param {identifier}                       key     The weak key name to reserve in the base collection for the one-to-one map's use.
     * @param {oneToOneOptions?}                 options For configuring the layout of the one-to-one module and dependencies.
     * @async
     * @returns {Promise<void>}
     */
    configureOneToOne(base: CollectionConfiguration | OneToOneBaseString, key: string, options?: oneToOneOptions): Promise<void>;
    lock(): void;
}
export {};
