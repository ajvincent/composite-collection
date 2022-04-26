import { BuildPromise, BuildPromiseSet } from "../utilities/BuildPromise.mjs";
export declare class GeneratorPromiseSet extends BuildPromiseSet {
    #private;
    constructor(owner: object, targetDir: string);
    get owner(): object;
    /**
     * @param {string} targetName The target name.
     * @returns {BuildPromise} The build promise.
     */
    get(targetName: string): BuildPromise;
    /**
     * @param {string} targetName The target name.
     * @returns {boolean} True if this is a known target.
     */
    has(targetName: string): boolean;
    /** @type {BuildPromise} @constant */
    get generatorsTarget(): BuildPromise;
    requireKeyHasher(): void;
    requireWeakKeyComposer(): void;
    runMain(): Promise<void>;
}
export declare class CodeGeneratorBase {
}
export declare const generatorToPromiseSet: WeakMap<CodeGeneratorBase, GeneratorPromiseSet>;
