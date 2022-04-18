import { BuildPromise, BuildPromiseSet } from "../utilities/BuildPromise.mjs";
void (BuildPromise); // necessary for type checking in eslint on the generated module
export class GeneratorPromiseSet extends BuildPromiseSet {
    #knownTargets = new Set;
    /**
     * @param {string} targetName The target name.
     * @returns {BuildPromise} The build promise.
     */
    get(targetName) {
        const rv = super.get(targetName);
        this.#knownTargets.add(targetName);
        return rv;
    }
    /**
     * @param {string} targetName The target name.
     * @returns {boolean} True if this is a known target.
     */
    has(targetName) {
        return this.#knownTargets.has(targetName);
    }
}
export class CodeGeneratorBase {
}
export const generatorToPromiseSet = new WeakMap;
//# sourceMappingURL=GeneratorPromiseSet.mjs.map