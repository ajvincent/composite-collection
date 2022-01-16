/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
export default function preprocess(defines, docs) {
  let invokeValidate = "";
  if (defines.has("invokeValidate")) {
    invokeValidate = `\n    this.#requireValidKey(${defines.get("argList")});\n`;
  }

  return `
${defines.get("importLines")}
import KeyHasher from "./keys/Hasher.mjs";

class ${defines.get("className")} {
  /** @typedef {string} hash */

  ${docs.buildBlock("rootContainerSet", 4)}
  #root = new Map;

  /** @type {KeyHasher} @constant */
  #hasher = new KeyHasher(${defines.get("argNameList")});

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
  add(${defines.get("argList")}) {${invokeValidate}
    const __hash__ = this.#hasher.getHash(${defines.get("argList")});
    this.#root.set(__hash__, Object.freeze([${defines.get("argList")}]));
    return this;
  }

${docs.buildBlock("clear", 2)}
  clear() {
    this.#root.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("argList")}) {
    const __hash__ = this.#hasher.getHashIfExists(${defines.get("argList")});
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
  has(${defines.get("argList")}) {
    const __hash__ = this.#hasher.getHashIfExists(${defines.get("argList")});
    return __hash__ ? this.#root.has(__hash__) : false;
  }

${defines.has("validateArguments") ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("argList")}) {
    return this.#isValidKey(${defines.get("argList")});
  }
` : ``}

${docs.buildBlock("values", 2)}
  * values() {
    for (let __value__ of this.#root.values())
      yield __value__;
  }
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

${defines.get("className")}[Symbol.iterator] = function() {
  return this.values();
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
