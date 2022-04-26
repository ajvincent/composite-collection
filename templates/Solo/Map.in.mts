import type { PreprocessorDefines, JSDocGenerator, TemplateFunction } from "../sharedTypes.mjs";

/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess: TemplateFunction = function preprocess(defines: PreprocessorDefines, docs: JSDocGenerator) {
  let invokeValidate = "";
  if (defines.has("invokeValidate")) {
    invokeValidate = `\n    this.#requireValidKey(${defines.get("argList")});\n`;
  }

  return `
${defines.get("importLines")}

class ${defines.get("className")} extends ${defines.get("weakMapCount") ? "Weak" : ""}Map {
${defines.has("invokeValidate") ? `
  delete(${defines.get("argList")}) {${invokeValidate}
    return super.delete(${defines.get("argList")});
  }

  get(${defines.get("argList")}) {${invokeValidate}
    return super.get(${defines.get("argList")});
  }

  has(${defines.get("argList")}) {${invokeValidate}
    return super.has(${defines.get("argList")});
  }
` : ``}

${defines.has("validateArguments") ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("argList")}) {
    return this.#isValidKey(${defines.get("argList")});
  }

${
  defines.has("validateValue") ? `
${docs.buildBlock("isValidValuePublic", 2)}
  isValidValue(value) {
    return this.#isValidValue(value);
  }
  ` : ``
  }

` : ``}

${defines.has("invokeValidate") ? `
${docs.buildBlock("set", 2)}
  set(${defines.get("argList")}, value) {${invokeValidate}
  ${
    defines.has("validateValue") ? `
    if (!this.#isValidValue(value))
      throw new Error("The value is not valid!");
  ` : ``
  }
    return super.set(${defines.get("argList")}, value);
  }
` : ``}

${defines.has("validateArguments") ? `
${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.get("argList")}) {
    if (!this.#isValidKey(${defines.get("argList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.get("argList")}) {
${defines.get("validateArguments")}
    return true;
  }
` : ``}
${defines.has("validateValue") ? `
${docs.buildBlock("isValidValuePrivate", 2)}
  #isValidValue(value) {
    ${defines.get("validateValue")}
    return true;
  }
  ` : ``}

  [Symbol.toStringTag] = "${defines.get("className")}";
}

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`;
}

export default preprocess;
