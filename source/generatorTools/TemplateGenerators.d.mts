import JSDocGenerator from "./JSDocGenerator.mjs";
import type { PreprocessorDefines } from "../CodeGenerator.mjs";
export declare type TemplateFunction = (defines: PreprocessorDefines, ...docs: JSDocGenerator[]) => string;
/**
 * @type {Map<string, Function>}
 * @package
 */
declare const TemplateGenerators: Map<string, TemplateFunction>;
export default TemplateGenerators;
