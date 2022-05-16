import type { TemplateFunction } from "../generatorTools/TemplateGenerators.mjs";
import PreprocessorDefines from "../generatorTools/PreprocessorDefines.mjs";

export default class TypeScriptDefines extends PreprocessorDefines {
  //#region static utility methods
  static #generators: WeakMap<TemplateFunction, boolean> = new WeakMap;
  static #count = 0;

  static registerGenerator(generator: TemplateFunction, supportsTypeScript: boolean) : void {
    if (this.#generators.has(generator))
      return;
    this.#generators.set(generator, supportsTypeScript);

    if (!supportsTypeScript)
      this.#count++;
  }

  static get nonTypeScriptCount() : number {
    return this.#count;
  }

  static moduleReadyForCoverage(generator: TemplateFunction) : boolean {
    return TypeScriptDefines.#generators.get(generator) ?? false;
  }
  //#endregion static utility methods
}
