import JSDocGenerator from "./JSDocGenerator.mjs";
import type { PreprocessorDefines } from "../CodeGenerator.mjs";
export declare type TemplateFunction = (defines: PreprocessorDefines, ...docGenerators: JSDocGenerator[]) => string;
/**
 * @type {Map<string, Function>}
 * @package
 */
declare const TemplateGenerators: Map<string, TemplateFunction>;
export default TemplateGenerators;
