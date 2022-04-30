import PreprocessorDefines from "../generatorTools/PreprocessorDefines.mjs";
export default class TypeScriptDefines extends PreprocessorDefines {
    static #generators = new WeakMap;
    static #count = 0;
    static registerGenerator(generator, supportsTypeScript) {
        if (this.#generators.has(generator))
            return;
        this.#generators.set(generator, supportsTypeScript);
        if (!supportsTypeScript)
            this.#count++;
    }
    static get nonTypeScriptCount() {
        return this.#count;
    }
    static moduleReadyForCoverage(generator) {
        return TypeScriptDefines.#generators.get(generator) || false;
    }
}
//# sourceMappingURL=TypeScriptDefines.mjs.map