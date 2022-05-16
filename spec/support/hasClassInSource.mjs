import {Parser} from 'acorn';
import fs from "fs/promises";

/**
 * @param {string} pathToModule The module location in the file system.
 * @param {string} className    The class name we're looking for.
 * @returns {boolean} True if the class is defined inline in the module.
 */
export default async function hasClassInSource(pathToModule, className) {
  const source = await fs.readFile(pathToModule);
  const ast = Parser.parse(
    source,
    {
      ecmaVersion: 2022,
      sourceType: "module",
    }
  );

  const classList = ast.body.filter(node => (node.type === "ClassDeclaration"));
  return classList.some(node => node.id.name === className);
}
