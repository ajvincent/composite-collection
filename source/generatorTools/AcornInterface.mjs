import { parse } from "acorn";

const AcornInterface = {
  /**
   * Check if a string is a valid identifier.
   *
   * @param {string}    candidate The string to check
   * @returns {boolean} True if the string is an identifier.
   */
  isIdentifier(candidate) {
    let idToken = null;
    try {
      idToken = parse("let " + candidate, {ecmaVersion: 2021}).body[0].declarations[0].id.name;
    }
    catch (ex) {
      // do nothing
    }
    return idToken === candidate;
  },

  /**
   * Extract an abstract syntax tree from Acorn parsing a lambda function's source.
   *
   * @param {Function} fn The function to parse.
   * @returns {*[]} The source, parameters and body for the function.
   */
  getNormalFunctionAST(fn) {
    let source = fn.toString().replace(/^function\s*\(/, "function foo(");

    let astNode, abort = false;
    try {
      const ast = parse(source, {
        ecmaVersion: 2021,
        onToken(t) {
          if ((t.type.keyword !== "throw") || (t.value !== "throw"))
            return;
          abort = true;
          throw new Error("Throw statements must not be in validator functions!");
        }
      });
      astNode = ast.body[0];
    }
    catch (ex) {
      throw abort ? ex : new Error("Acorn couldn't parse the function... why?");
    }

    if (astNode.type === "ExpressionStatement")
      astNode = astNode.expression;

    if ((astNode.type !== "ArrowFunctionExpression") &&
        (astNode.type !== "FunctionDeclaration"))
      throw new Error("Unsupported function type from acorn: " + astNode.type);

    if (astNode.generator)
      throw new Error("Generator functions are not allowed here!");

    if (astNode.async)
      throw new Error("Async functions are not allowed here!");

    return [source, astNode.params, astNode.body];
  }
};

export default AcornInterface;
