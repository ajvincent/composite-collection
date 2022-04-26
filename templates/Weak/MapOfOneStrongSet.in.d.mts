import type { TemplateFunction } from "../sharedTypes.mjs";
/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
declare const preprocess: TemplateFunction;
export default preprocess;
