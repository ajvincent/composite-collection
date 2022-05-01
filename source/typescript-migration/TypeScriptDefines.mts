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

  //#region public properties

  // TypeScript support
  // `key1: __MK1__`
  tsMapKeys:  string[] = [];

  // `key1: __SK1__`
  tsSetKeys : string[] = [];

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

  //#endregion
}

//#region readonly boilerplate
// Shamelessly copied from https://github.com/Microsoft/TypeScript/issues/13923
type primitive = string | number | boolean | undefined | null;
type DeepReadonly<T> =
  T extends primitive ? T :
  T extends Array<infer U> ? DeepReadonlyArray<U> :
  DeepReadonlyObject<T>

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>
}

export type ReadonlyDefines = DeepReadonly<TypeScriptDefines>;
//#endregion readonly boilerplate
