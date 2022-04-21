/**
 * @typedef MethodTemplate
 * @property {boolean?}    isTypeDef          True if this is a type definition (no description, no returns)
 * @property {boolean?}    isProperty         True if this is a property definition (no returns).
 * @property {boolean?}    returnVoid         True if this is a method returning nothing.
 * @property {string}      description        The descrption of the method's purpose.
 * @property {string}      includeArgs        A flag to determine how public keys (and values) should be in the API.
 * @property {string[]?}   headers            JSDoc header lines before the parameter block.
 * @property {string[][]?} paramHeaders       Parameters from the template (not the user)
 * @property {string[][]?} paramFooters       Parameters from the template (not the user)
 * @property {string[]?}   footers            JSDoc footer lines after the parameters (and the return value).
 * @property {string?}     returnType         The return type for the specified function.
 * @property {string?}     returnDescription  A description of the return value to provide.
 * @property {boolean?}    isGenerator        If true, provides a 'yield' instead of a 'return'.
 * @see jsdoc-method-sets/default.mjs for typical objects.
 */
export default abstract class MethodTemplate {
  isTypeDef?: boolean;
  isProperty?: boolean;
  returnVoid?: boolean;
  description = "";
  includeArgs = "";
  headers?: string[];
  paramHeaders?: string[][];
  paramFooters?: string[][];
  footers?: string[];
  returnType?: string;
  returnDescription?: string;
  isGenerator?: boolean;
}

export type stringAndTemplate = [string, MethodTemplate];
