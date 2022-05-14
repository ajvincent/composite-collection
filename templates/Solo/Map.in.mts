import type { ReadonlyDefines, JSDocGenerator, TemplateFunction } from "../sharedTypes.mjs";
import TypeScriptDefines from "../../source/typescript-migration/TypeScriptDefines.mjs";

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

  return `
${defines.importLines}

class ${defines.className}${defines.tsGenericFull} extends ${defines.weakMapKeys.length ? "Weak" : ""}Map${
  "<" + defines.tsMapTypes.join(", ") + ", __V__>"
}
{
${defines.invokeValidate ? `
  delete(${defines.tsMapKeys.join(", ")}) : boolean
  {
    ${invokeValidate}
    return super.delete(${defines.argList});
  }

  get(${defines.tsMapKeys.join(", ")}) : __V__ | undefined
  {
    ${invokeValidate}
    return super.get(${defines.argList});
  }

  has(${defines.tsMapKeys.join(", ")}) : boolean
  {
    ${invokeValidate}
    return super.has(${defines.argList});
  }
` : ``}

${defines.validateArguments ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.tsMapKeys.join(", ")}) : boolean
  {
    return this.#isValidKey(${defines.argList});
  }

${
  defines.validateValue ? `
${docs.buildBlock("isValidValuePublic", 2)}
  isValidValue(value: __V__) : boolean
  {
    return this.#isValidValue(value);
  }
  ` : ``
  }

` : ``}

${defines.invokeValidate ? `
${docs.buildBlock("set", 2)}
  set(${defines.tsMapKeys.join(", ")}, value: __V__) : this
  {
    ${invokeValidate}
  ${
    defines.validateValue ? `
    if (!this.#isValidValue(value))
      throw new Error("The value is not valid!");
  ` : ``
  }
    return super.set(${defines.argList}, value);
  }
` : ``}

${defines.validateArguments ? `
${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.tsMapKeys.join(", ")}) : void
  {
    if (!this.#isValidKey(${defines.argList}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.argList.replace(/, /g, ": any, ")}) : boolean
  {
    ${defines.validateArguments}
    return true;
  }
` : ``}
${defines.validateValue ? `
${docs.buildBlock("isValidValuePrivate", 2)}
  #isValidValue(value: any) : boolean
  {
  ${defines.validateValue}
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
TypeScriptDefines.registerGenerator(preprocess, true);
