import type { TemplateFunction } from "../generatorTools/TemplateGenerators.mjs";
import PreprocessorDefines from "../generatorTools/PreprocessorDefines.mjs";
export default class TypeScriptDefines extends PreprocessorDefines {
    #private;
    static registerGenerator(generator: TemplateFunction, supportsTypeScript: boolean): void;
    static get nonTypeScriptCount(): number;
    static moduleReadyForCoverage(generator: TemplateFunction): boolean;
    tsMapKeys: string[];
    tsSetKeys: string[];
    tsValueKey: string;
    tsGenericShortClass: string;
    tsGenericFullClass: string;
}
declare type primitive = string | number | boolean | undefined | null;
declare type DeepReadonly<T> = T extends primitive ? T : T extends Array<infer U> ? DeepReadonlyArray<U> : DeepReadonlyObject<T>;
interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {
}
declare type DeepReadonlyObject<T> = {
    readonly [P in keyof T]: DeepReadonly<T[P]>;
};
export declare type ReadonlyDefines = DeepReadonly<TypeScriptDefines>;
export {};
