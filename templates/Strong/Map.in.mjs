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
  ${docs.buildBlock("valueAndKeySet", 4)}

  ${docs.buildBlock("rootContainerMap", 4)}
  #root = new Map;

  /**
   * @type {KeyHasher}
   * @constant
   */
  #hasher = new KeyHasher();

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let [${defines.argList}, value] of iterable) {
        this.set(${defines.argList}, value);
      }
    }
  }

${docs.buildBlock("getSize", 2)}
  get size() {
    return this.#root.size;
  }

${docs.buildBlock("clear", 2)}
  clear() {
    this.#root.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.argList}) {${invokeValidate}
    const __hash__ = this.#hasher.getHashIfExists(${defines.argList});
    return __hash__ ? this.#root.delete(__hash__) : false;
  }

${docs.buildBlock("entries", 2)}
  * entries() {
    for (let valueAndKeySet of this.#root.values())
      yield valueAndKeySet.keySet.concat(valueAndKeySet.value);
  }

${docs.buildBlock("forEachMap", 2)}
  forEach(callback, thisArg) {
    this.#root.forEach((valueAndKeySet) => {
      const args = valueAndKeySet.keySet.concat(this);
      args.unshift(valueAndKeySet.value);
      callback.apply(thisArg, [...args]);
    });
  }

${docs.buildBlock("forEachCallbackMap", 2)}

${docs.buildBlock("get", 2)}
  get(${defines.argList}) {${invokeValidate}
    const __hash__ = this.#hasher.getHashIfExists(${defines.argList});
    if (!__hash__)
      return undefined;

    const valueAndKeySet = this.#root.get(__hash__);
    return valueAndKeySet?.value;
  }

${docs.buildBlock("has", 2)}
  has(${defines.argList}) {${invokeValidate}
    const __hash__ = this.#hasher.getHashIfExists(${defines.argList});
    return __hash__ ? this.#root.has(__hash__) : false;
  }

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

${docs.buildBlock("keys", 2)}
  * keys() {
    for (let valueAndKeySet of this.#root.values())
      yield valueAndKeySet.keySet.slice();
  }

${docs.buildBlock("set", 2)}
  set(${defines.argList}, value) {${invokeValidate}
${defines.validateValue ? `
  if (!this.#isValidValue(value))
    throw new Error("The value is not valid!");
` : ``}
    const __hash__ = this.#hasher.getHash(${defines.argList});
    const __keySet__ = [${defines.argList}];
    Object.freeze(__keySet__);
    this.#root.set(__hash__, {value, keySet: __keySet__});

    return this;
  }

${docs.buildBlock("values", 2)}
  * values() {
    for (let valueAndKeySet of this.#root.values())
      yield valueAndKeySet.value;
  }
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

  [Symbol.iterator]() {
    return this.entries();
  }

  [Symbol.toStringTag] = "${defines.className}";
}

Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`;
};
export default preprocess;
//# sourceMappingURL=Map.in.mjs.map