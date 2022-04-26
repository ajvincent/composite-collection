import type { TemplateFunction } from "../sharedTypes.mjs";
/**
 * @param {Map}            defines  The preprocessor macros.
 * @param {JSDocGenerator} soloDocs Provides documentation for single key-value methods.
 * @param {JSDocGenerator} duoDocs  Provides documentation for .bindOneToOne().
 * @returns {string}                The generated source code.
 */
declare const preprocess: TemplateFunction;
export default preprocess;
