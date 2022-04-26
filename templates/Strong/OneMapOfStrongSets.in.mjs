/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
export default function preprocess(defines, docs) {
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

  /** @type {Map<${defines.get("mapArgument0Type")}, Map<hash, *[]>>} @constant */
  #outerMap = new Map();

  /** @type {KeyHasher} @constant */
  #setHasher = new KeyHasher();

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
  getSizeOfSet(${defines.get("mapArgument0")}) {${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${defines.get("mapArgument0")})
    return __innerMap__?.size || 0;
  }

${docs.buildBlock("mapSize", 2)}
  get mapSize() {
    return this.#outerMap.size;
  }

${docs.buildBlock("add", 2)}
  add(${defines.get("mapArgument0")}, ${defines.get("setArgList")}) {${invokeValidate}
    if (!this.#outerMap.has(${defines.get("mapArgument0")}))
      this.#outerMap.set(${defines.get("mapArgument0")}, new Map);

    const __innerMap__ = this.#outerMap.get(${defines.get("mapArgument0")});

    const __setHash__ = this.#setHasher.getHash(${defines.get("setArgList")});
    if (!__innerMap__.has(__setHash__)) {
      __innerMap__.set(__setHash__, Object.freeze([${defines.get("argList")}]));
      this.#sizeOfAll++;
    }

    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.get("mapArgument0")}, __sets__) {${invokeMapValidate}
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.get("setCount")}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.get("setCount")} argument${
          defines.get("setCount") > 1 ? "s" : ""
        }!\`);
      }
      ${defines.has("invokeValidate") ? `this.#requireValidKey(${defines.get("mapArgument0")}, ...__set__);` : ""}

      return __set__;
    });

    if (!this.#outerMap.has(${defines.get("mapArgument0")}))
      this.#outerMap.set(${defines.get("mapArgument0")}, new Map);

    const __innerMap__ = this.#outerMap.get(${defines.get("mapArgument0")});
    const __mapArgs__ = [${defines.get("mapArgument0")}];

    __array__.forEach(__set__ => {
      const __setHash__ = this.#setHasher.getHash(...__set__);
      if (!__innerMap__.has(__setHash__)) {
        __innerMap__.set(__setHash__, Object.freeze(__mapArgs__.concat(__set__)));
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
  clearSets(${defines.get("mapArgument0")}) {${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerMap__)
      return;

    this.#sizeOfAll -= __innerMap__.size;
    __innerMap__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("mapArgument0")}, ${defines.get("setArgList")}) {${invokeValidate}
    const __innerMap__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerMap__)
      return false;

    const __setHash__ = this.#setHasher.getHashIfExists(${defines.get("setArgList")});
    if (!__setHash__ || !__innerMap__.has(__setHash__))
      return false;

    __innerMap__.delete(__setHash__);
    this.#sizeOfAll--;

    if (__innerMap__.size === 0) {
      this.#outerMap.delete(${defines.get("mapArgument0")});
    }

    return true;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.get("mapArgument0")}) {${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerMap__)
      return false;

    this.#outerMap.delete(${defines.get("mapArgument0")});
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
  forEachSet(${defines.get("mapArgument0")}, __callback__, __thisArg__) {${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("has", 2)}
  has(${defines.get("mapArgument0")}, ${defines.get("setArgList")}) {${invokeValidate}
    const __innerMap__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerMap__)
      return false;

    const __setHash__ = this.#setHasher.getHashIfExists(${defines.get("setArgList")});
    return __setHash__ ? __innerMap__.has(__setHash__) : false;
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.get("mapArgument0")}) {${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${defines.get("mapArgument0")})
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
  * valuesSet(${defines.get("mapArgument0")}) {${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerMap__)
      return;

    for (let __value__ of __innerMap__.values())
      yield __value__;
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
