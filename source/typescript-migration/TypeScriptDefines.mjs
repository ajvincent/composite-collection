import PreprocessorDefines from "../generatorTools/PreprocessorDefines.mjs";
export default class TypeScriptDefines extends PreprocessorDefines {
    //#region static utility methods
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
        return TypeScriptDefines.#generators.get(generator) ?? false;
    }
    //#endregion static utility methods
    //#region public properties
    // TypeScript support
    // `key1: __MK1__`
    tsMapKeys = [];
    // `key1: __SK1__`
    tsSetKeys = [];
    // "value: __V__"
    tsValueKey = "";
    /* `GenericClass<__MK1__, __SK1__, __V__> */
    tsGenericShortClass = "";
    /* `GenericClass<
      __MK1__ extends object,
      __SK1__ extends unknown,
      __V__ extends unknown
    >` */
    tsGenericFullClass = "";
}
//#endregion readonly boilerplate
//# sourceMappingURL=TypeScriptDefines.mjs.map