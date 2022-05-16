import JSDocGenerator from "./JSDocGenerator.mjs";
import type { ReadonlyDefines } from "./PreprocessorDefines.mjs";
export declare type TemplateFunction = (defines: ReadonlyDefines, ...docGenerators: JSDocGenerator[]) => string;
/**
 * @type {Map<string, Function>}
 * @package
 */
declare const TemplateGenerators: Map<string, TemplateFunction>;
export default TemplateGenerators;
