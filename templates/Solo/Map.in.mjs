/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    let invokeValidate = "";
    if (defines.invokeValidate) {
        invokeValidate = `\n    this.#requireValidKey(${defines.argList});\n`;
    }
    return `
${defines.importLines}

class ${defines.className} extends ${defines.weakMapKeys.length ? "Weak" : ""}Map {
${defines.invokeValidate ? `
  delete(${defines.argList}) {${invokeValidate}
    return super.delete(${defines.argList});
  }

  get(${defines.argList}) {${invokeValidate}
    return super.get(${defines.argList});
  }

  has(${defines.argList}) {${invokeValidate}
    return super.has(${defines.argList});
  }
` : ``}

${defines.validateArguments ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.argList}) {
    return this.#isValidKey(${defines.argList});
  }

${defines.validateValue ? `
${docs.buildBlock("isValidValuePublic", 2)}
  isValidValue(value) {
    return this.#isValidValue(value);
  }
  ` : ``}

` : ``}

${defines.invokeValidate ? `
${docs.buildBlock("set", 2)}
  set(${defines.argList}, value) {${invokeValidate}
  ${defines.validateValue ? `
    if (!this.#isValidValue(value))
      throw new Error("The value is not valid!");
  ` : ``}
    return super.set(${defines.argList}, value);
  }
` : ``}

${defines.validateArguments ? `
${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.argList}) {
    if (!this.#isValidKey(${defines.argList}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.argList}) {
${defines.validateArguments}
    return true;
  }
` : ``}
${defines.validateValue ? `
${docs.buildBlock("isValidValuePrivate", 2)}
  #isValidValue(value) {
    ${defines.validateValue}
    return true;
  }
  ` : ``}

  [Symbol.toStringTag] = "${defines.className}";
}

Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`;
};
export default preprocess;
//# sourceMappingURL=Map.in.mjs.map