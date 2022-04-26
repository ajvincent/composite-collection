import type { PreprocessorDefines, JSDocGenerator, TemplateFunction } from "../sharedTypes.mjs";

/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess: TemplateFunction = function preprocess(defines: PreprocessorDefines, docs: JSDocGenerator) {
  let invokeValidate = "", invokeMapValidate = "";
  if (defines.has("invokeValidate")) {
    invokeValidate = `\n    this.#requireValidKey(${defines.get("argList")});\n`;
  }
  if (defines.has("validateMapArguments")) {
    invokeMapValidate = `\n    this.#requireValidMapKey(${defines.get("mapArgList")});\n`;
  }

  return `
${defines.get("importLines")}
import KeyHasher from "./keys/Hasher.mjs";

class ${defines.get("className")} {
  /** @typedef {string} hash */

  /** @type {Map<hash, Map<${defines.get("setArgument0Type")}, *[]>>} @constant */
  #outerMap = new Map();

  /** @type {KeyHasher} @constant */
  #mapHasher = new KeyHasher();

  /** @type {number} */
  #sizeOfAll = 0;

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
    return this.#sizeOfAll;
  }

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${defines.get("mapArgList")}) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.get("mapArgList")});
    return __innerMap__ ? __innerMap__.size : 0;
  }

${docs.buildBlock("mapSize", 2)}
  get mapSize() {
    return this.#outerMap.size;
  }

${docs.buildBlock("add", 2)}
  add(${defines.get("mapArgList")}, ${defines.get("setArgument0")}) {${invokeValidate}
    const __mapHash__ = this.#mapHasher.getHash(${defines.get("mapArgList")});
    if (!this.#outerMap.has(__mapHash__))
      this.#outerMap.set(__mapHash__, new Map);

    const __innerMap__ = this.#outerMap.get(__mapHash__);

    if (!__innerMap__.has(${defines.get("setArgument0")})) {
      __innerMap__.set(${defines.get("setArgument0")}, Object.freeze([${defines.get("argList")}]));
      this.#sizeOfAll++;
    }

    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.get("mapArgList")}, __sets__) {${invokeMapValidate}
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.get("setCount")}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.get("setCount")} argument${
          defines.get("setCount")! > 1 ? "s" : ""
        }!\`);
      }
      ${defines.has("invokeValidate") ? `this.#requireValidKey(${defines.get("mapArgList")}, ...__set__);` : ""}

      return __set__;
    });

    const __mapHash__ = this.#mapHasher.getHash(${defines.get("mapArgList")});
    if (!this.#outerMap.has(__mapHash__))
      this.#outerMap.set(__mapHash__, new Map);

    const __innerMap__ = this.#outerMap.get(__mapHash__);
    const __mapArgs__ = [${defines.get("mapArgList")}];

    __array__.forEach(__set__ => {
      if (!__innerMap__.has(__set__[0])) {
        __innerMap__.set(__set__[0], Object.freeze(__mapArgs__.concat(__set__)));
        this.#sizeOfAll++;
      }
    });

    return this;
  }

${docs.buildBlock("clear", 2)}
  clear() {
    this.#outerMap.clear();
    this.#sizeOfAll = 0;
  }

${docs.buildBlock("clearSets", 2)}
  clearSets(${defines.get("mapArgList")}) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return;

    this.#sizeOfAll -= __innerMap__.size;
    __innerMap__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {${invokeValidate}
    const [__innerMap__, __mapHash__] = this.#getInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return false;

    if (!__innerMap__.has(${defines.get("setArgument0")}))
      return false;

    __innerMap__.delete(${defines.get("setArgument0")});
    this.#sizeOfAll--;

    if (__innerMap__.size === 0) {
      this.#outerMap.delete(__mapHash__);
    }

    return true;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.get("mapArgList")}) {${invokeMapValidate}
    const [__innerMap__, __mapHash__] = this.#getInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return false;

    this.#outerMap.delete(__mapHash__);
    this.#sizeOfAll -= __innerMap__.size;
    return true;
  }

${docs.buildBlock("forEachSet", 2)}
  forEach(__callback__, __thisArg__) {
    this.#outerMap.forEach(
      __innerMap__ => __innerMap__.forEach(
        __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
      )
    );
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.get("mapArgList")}, __callback__, __thisArg__) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("has", 2)}
  has(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {${invokeValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return false;

    return __innerMap__.has(${defines.get("setArgument0")});
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.get("mapArgList")}) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.get("mapArgList")});
    return Boolean(__innerMap__);
  }

${defines.has("validateArguments") ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("argList")}) {
    return this.#isValidKey(${defines.get("argList")});
  }

  ` : ``}
${docs.buildBlock("values", 2)}
  * values() {
    const __outerIter__ = this.#outerMap.values();

    for (let __innerMap__ of __outerIter__) {
      for (let __value__ of __innerMap__.values())
        yield __value__;
    }
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${defines.get("mapArgList")}) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return;

    for (let __value__ of __innerMap__.values())
      yield __value__;
  }

  #getInnerMap(...__mapArguments__) {
    const __hash__ = this.#mapHasher.getHashIfExists(...__mapArguments__);
    return __hash__ ? [this.#outerMap.get(__hash__), __hash__] : [null];
  }

${defines.has("validateArguments") ? `
${docs.buildBlock("requireValidKey", 2)}
    #requireValidKey(${defines.get("argList")}) {
      if (!this.#isValidKey(${defines.get("argList")}))
        throw new Error("The ordered key set is not valid!");
    }

${docs.buildBlock("isValidKeyPrivate", 2)}
    #isValidKey(${defines.get("argList")}) {
      void(${defines.get("argList")});

      ${defines.get("validateArguments")}
      return true;
    }

  ` : ``}

${defines.has("validateMapArguments") ? `
${docs.buildBlock("requireValidMapKey", 2)}
  #requireValidMapKey(${defines.get("mapArgList")}) {
    if (!this.#isValidMapKey(${defines.get("mapArgList")}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  #isValidMapKey(${defines.get("mapArgList")}) {
    void(${defines.get("mapArgList")});

    ${defines.get("validateMapArguments") || ""}
    return true;
  }

  ` : ``}

  [Symbol.iterator]() {
    return this.values();
  }

  [Symbol.toStringTag] = "${defines.get("className")}";
}

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`}

export default preprocess;
