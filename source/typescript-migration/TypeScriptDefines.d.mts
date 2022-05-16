import type { TemplateFunction } from "../generatorTools/TemplateGenerators.mjs";
import PreprocessorDefines from "../generatorTools/PreprocessorDefines.mjs";
export default class TypeScriptDefines extends PreprocessorDefines {
    #private;
    static registerGenerator(generator: TemplateFunction, supportsTypeScript: boolean): void;
    static get nonTypeScriptCount(): number;
    static moduleReadyForCoverage(generator: TemplateFunction): boolean;
}
