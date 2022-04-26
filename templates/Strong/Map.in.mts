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
import KeyHasher from "./keys/Hasher.mjs";

class ${defines.get("className")} {
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
      for (let entry of iterable) {
        this.set(...entry);
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
  delete(${defines.get("argList")}) {${invokeValidate}
    const __hash__ = this.#hasher.getHashIfExists(${defines.get("argList")});
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
  get(${defines.get("argList")}) {${invokeValidate}
    const __hash__ = this.#hasher.getHashIfExists(${defines.get("argList")});
    if (!__hash__)
      return undefined;

    const valueAndKeySet = this.#root.get(__hash__);
    return valueAndKeySet?.value;
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("argList")}) {${invokeValidate}
    const __hash__ = this.#hasher.getHashIfExists(${defines.get("argList")});
    return __hash__ ? this.#root.has(__hash__) : false;
  }

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

${docs.buildBlock("keys", 2)}
  * keys() {
    for (let valueAndKeySet of this.#root.values())
      yield valueAndKeySet.keySet.slice();
  }

${docs.buildBlock("set", 2)}
  set(${defines.get("argList")}, value) {${
    invokeValidate
  }
${
  defines.has("validateValue") ? `
  if (!this.#isValidValue(value))
    throw new Error("The value is not valid!");
` : ``
}
    const __hash__ = this.#hasher.getHash(${defines.get("argList")});
    const __keySet__ = [${defines.get("argList")}];
    Object.freeze(__keySet__);
    this.#root.set(__hash__, {value, keySet: __keySet__});

    return this;
  }

${docs.buildBlock("values", 2)}
  * values() {
    for (let valueAndKeySet of this.#root.values())
      yield valueAndKeySet.value;
  }
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

  [Symbol.iterator]() {
    return this.entries();
  }

  [Symbol.toStringTag] = "${defines.get("className")}";
}

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`}

export default preprocess;
