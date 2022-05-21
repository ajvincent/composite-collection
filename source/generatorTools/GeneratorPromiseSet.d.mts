import { BuildPromise, BuildPromiseSet } from "../utilities/BuildPromise.mjs";
import { RequiredWeakMap } from "../utilities/RequiredMap.mjs";
export declare class GeneratorPromiseSet extends BuildPromiseSet {
    #private;
    /** @type {BuildPromise} @constant */
    generatorsTarget: BuildPromise;
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
    runMain(): Promise<void>;
    scheduleTSC(targetModule: string): void;
    requireKeyHasher(): void;
    requireWeakKeyComposer(): void;
}
export declare class CodeGeneratorBase {
}
export declare const generatorToPromiseSet: RequiredWeakMap<CodeGeneratorBase, GeneratorPromiseSet>;
