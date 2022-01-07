import {Parser} from 'acorn';
import stage3 from 'acorn-stage3';

import fs from "fs/promises";

/**
 * @param {string} pathToModule The module location in the file system.
 * @param {string} className    The class name we're looking for.
 * @returns {boolean} True if the class is defined inline in the module.
 */
export default async function hasClassInSource(pathToModule, className) {
  const source = await fs.readFile(pathToModule);
  const ast = Parser.extend(stage3).parse(
    source,
    {
      ecmaVersion: 2021,
      sourceType: "module",
    }
  );

  const classList = ast.body.filter(node => (node.type === "ClassDeclaration"));
  return classList.some(node => node.id.name === className);
}
