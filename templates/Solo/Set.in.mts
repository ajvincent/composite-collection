import type { ReadonlyDefines, JSDocGenerator, TemplateFunction } from "../sharedTypes.mjs";

/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess: TemplateFunction = function preprocess(defines: ReadonlyDefines, docs: JSDocGenerator) {
  let invokeValidate = "";
  if (defines.invokeValidate) {
    invokeValidate = `\n    this.#requireValidKey(${defines.argList});\n`;
  }

  const tsKey = defines.tsSetKeys[0];
  const tsType = defines.tsSetTypes[0];

  return `
${defines.importLines}

class ${defines.className}${defines.tsGenericFull} extends ${defines.weakSetElements.length ? "Weak" : ""}Set<${tsType}>
{
${defines.invokeValidate ? `
${docs.buildBlock("add", 2)}
  add(${tsKey}) : this
  {
    ${invokeValidate}
    return super.add(${defines.argList});
  }
` : ``}

${defines.validateArguments ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${tsKey}) : boolean
  {
    return this.#isValidKey(${defines.argList});
  }
` : ``}

${defines.invokeValidate ?
  `
${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${tsKey}) : void
  {
    if (!this.#isValidKey(${defines.argList}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${tsKey}) : boolean
  {
  ${defines.validateArguments}
    return true;
  }

` : ``}

  [Symbol.toStringTag] = "${defines.className}";
}

Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`;
}

export default preprocess;
