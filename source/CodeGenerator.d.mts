/**
 * @module source/CodeGenerator.mjs
 */
/** @typedef {string} identifier */
import CollectionConfiguration from "./CollectionConfiguration.mjs";
import CompileTimeOptions from "./CompileTimeOptions.mjs";
import { CodeGeneratorBase } from "./generatorTools/GeneratorPromiseSet.mjs";
/** @package */
export default class CodeGenerator extends CodeGeneratorBase {
    #private;
    /**
     * Stringify a list of keys into an argument name list suitable for macros.
     *
     * @param {string[]} keys The key names.
     * @returns {string} The serialized key names.
     */
    static buildArgNameList(keys: string[]): string;
    /**
     * @param {CollectionConfiguration} configuration  The configuration to use.
     * @param {string}                  targetPath     The directory to write the collection to.
     * @param {CompileTimeOptions}      compileOptions Flags from an owner which may override configurations.
     */
    constructor(configuration: CollectionConfiguration, targetPath: string, compileOptions?: CompileTimeOptions | object);
    /** @type {string} */
    get status(): string;
    /**
     * @public
     * @type {string}
     *
     * The generated code at this point.  Used in #buildOneToOneBase() by a parent CodeGenerator.
     */
    get generatedCode(): string;
    get requiresDefaultMap(): boolean;
    get requiresKeyHasher(): boolean;
    get requiresWeakKeyComposer(): boolean;
    run(): Promise<string>;
}
