/**
 *
 * @param {Map} defines
 * @param {JSDocGenerator} docs
 * @returns {string}
 */
export default function preprocess(defines, docs) {
  let invokeValidate = "";
  if (defines.has("invokeValidate")) {
    invokeValidate = `\n    this.__requireValidKey__(${defines.get("argList")});\n`;
  }

  return `
${defines.get("importLines")}

export default class ${defines.get("className")} extends ${defines.get("weakMapCount") ? "Weak" : ""}Map {
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
    return this.__isValidKey__(${defines.get("argList")});
  }

${
  defines.has("validateValue") ? `
${docs.buildBlock("isValidValuePublic", 2)}
  isValidValue(value) {
    return this.__isValidValue__(value);
  }
  ` : ``
  }

` : ``}

${defines.has("invokeValidate") ? `
${docs.buildBlock("set", 2)}
  set(${defines.get("argList")}, value) {${invokeValidate}
  ${
    defines.has("validateValue") ? `
    if (!this.__isValidValue__(value))
      throw new Error("The value is not valid!");
  ` : ``
  }
    return super.set(${defines.get("argList")}, value);
  }
` : ``}

${defines.has("validateArguments") ? `
${docs.buildBlock("requireValidKey", 2)}
  __requireValidKey__(${defines.get("argList")}) {
    if (!this.__isValidKey__(${defines.get("argList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  __isValidKey__(${defines.get("argList")}) {
${defines.get("validateArguments")}
    return true;
  }
` : ``}
${defines.has("validateValue") ? `
${docs.buildBlock("isValidValuePrivate", 2)}
  __isValidValue__(value) {
    ${defines.get("validateValue")}
    return true;
  }
  ` : ``}
}

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`;
}
