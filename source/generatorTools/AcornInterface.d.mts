declare const AcornInterface: {
  /**
   * Check if a string is a valid identifier.
   *
   * @param {string}    candidate The string to check
   * @returns {boolean} True if the string is an identifier.
   */
  isIdentifier(candidate: string): boolean;
  /**
   * Extract an abstract syntax tree from Acorn parsing a lambda function's source.
   *
   * @param {Function} fn The function to parse.
   * @returns {*[]} The source, parameters and body for the function.
   */
  getNormalFunctionAST(fn: Function): [string, {name: string}[], {start: number, end: number}];
};
export default AcornInterface;
