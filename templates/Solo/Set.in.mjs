/**
 * @param {Map} defines
 * @param {JSDocGenerator} docs
 * @returns {string}
 */
export default function preprocess(defines, docs) {
  let invokeValidate = "";
  if (defines.has("invokeValidate")) {
    invokeValidate = `\n    this.#requireValidKey(${defines.get("argList")});\n`;
  }

  return `
${defines.get("importLines")}

export default class ${defines.get("className")} extends ${defines.get("weakSetCount") ? "Weak" : ""}Set {
${defines.get("invokeValidate") ? `
${docs.buildBlock("add", 2)}
  add(${defines.get("argList")}) {${invokeValidate}
    return super.add(${defines.get("argList")});
  }
` : ``}

${defines.has("validateArguments") ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("argList")}) {
    return this.#isValidKey(${defines.get("argList")});
  }
` : ``}

${defines.has("invokeValidate") ?
  `
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
}

Reflect.defineProperty(${defines.get("className")}, Symbol.toStringTag, {
  value: "${defines.get("className")}",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`;
}
