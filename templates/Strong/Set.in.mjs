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
import KeyHasher from "./keys/Hasher.mjs";

class ${defines.className} {
  /** @typedef {string} hash */

  ${docs.buildBlock("rootContainerSet", 4)}
  #root = new Map;

  /** @type {KeyHasher} @constant */
  #hasher = new KeyHasher();

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.add(...entry);
      }
    }
  }

${docs.buildBlock("getSize", 2)}
  get size() {
    return this.#root.size;
  }

${docs.buildBlock("add", 2)}
  add(${defines.argList}) {${invokeValidate}
    const __hash__ = this.#hasher.getHash(${defines.argList});
    this.#root.set(__hash__, Object.freeze([${defines.argList}]));
    return this;
  }

${docs.buildBlock("clear", 2)}
  clear() {
    this.#root.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.argList}) {
    const __hash__ = this.#hasher.getHashIfExists(${defines.argList});
    return __hash__ ? this.#root.delete(__hash__) : false;
  }

${docs.buildBlock("forEachSet", 2)}
  forEach(__callback__, __thisArg__) {
    this.#root.forEach(valueSet => {
      __callback__.apply(__thisArg__, valueSet.concat(this));
    });
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("has", 2)}
  has(${defines.argList}) {
    const __hash__ = this.#hasher.getHashIfExists(${defines.argList});
    return __hash__ ? this.#root.has(__hash__) : false;
  }

${defines.validateArguments ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.argList}) {
    return this.#isValidKey(${defines.argList});
  }
` : ``}

${docs.buildBlock("values", 2)}
  * values() {
    for (let __value__ of this.#root.values())
      yield __value__;
  }
${defines.invokeValidate ?
        `
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

  [Symbol.iterator]() {
    return this.values();
  }

  [Symbol.toStringTag] = "${defines.className}";
}

Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`;
};
export default preprocess;
//# sourceMappingURL=Set.in.mjs.map