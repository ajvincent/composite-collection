import type { PreprocessorDefines, JSDocGenerator, TemplateFunction } from "../sharedTypes.mjs";

/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess: TemplateFunction = function preprocess(defines: PreprocessorDefines, docs: JSDocGenerator) {
  return `
${defines.get("importLines")}
import KeyHasher from "./keys/Hasher.mjs";

/** @typedef {Map<hash, *[]>} ${defines.get("className")}~InnerMap */

class ${defines.get("className")} {
  /** @typedef {string} hash */

  /**
   * @type {WeakMap<${defines.get("mapArgument0Type")}, ${defines.get("className")}~InnerMap>}
   * @constant
   * This is two levels. The first level is the map key.
   * The second level is the strong set.
   */
  #root = new WeakMap();

  /** @type {KeyHasher} @constant */
  #setHasher = new KeyHasher();

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.add(...entry);
      }
    }
  }

${docs.buildBlock("add", 2)}
  add(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerMap__ = this.#requireInnerMap(${defines.get("mapArgList")});

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHash(${defines.get("setArgList")});
    if (!__innerMap__.has(__setKeyHash__)) {
      __innerMap__.set(__setKeyHash__, [${defines.get("setArgList")}]);
    }

    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.get("mapArgList")}, __sets__) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.get("setCount")}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.get("setCount")} set argument${
          defines.get("setCount")! > 1 ? "s" : ""
        }!\`);
      }
      this.#requireValidKey(${defines.get("mapArgList")}, ...__set__);
      return __set__;
    });

    const __innerMap__ = this.#requireInnerMap(${defines.get("mapArgList")});

    // level 2: inner map to set
    __array__.forEach(__set__ => {
      const __setKeyHash__ = this.#setHasher.getHash(...__set__);
      if (!__innerMap__.has(__setKeyHash__)) {
        __innerMap__.set(__setKeyHash__, __set__);
      }
    });

    return this;
  }

${docs.buildBlock("clearSets", 2)}
  clearSets(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    const __innerMap__ = this.#root.get(${defines.get("mapArgument0")});
    __innerMap__?.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerMap__ = this.#root.get(${defines.get("mapArgument0")});
    if (!__innerMap__)
      return false;

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHashIfExists(${defines.get("setArgList")});
    if (!__setKeyHash__)
      return false;
    const __returnValue__ = __innerMap__.delete(__setKeyHash__);

    if (__innerMap__.size === 0) {
      this.deleteSets(${defines.get("mapArgList")});
    }

    return __returnValue__;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.get("mapArgument0")}) {
    this.#requireValidMapKey(${defines.get("mapArgument0")});
    return this.#root.delete(${defines.get("mapArgument0")});
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.get("mapArgList")}, __callback__, __thisArg__) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    const __innerMap__ = this.#root.get(${defines.get("mapArgument0")});
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, [${defines.get("mapArgList")}, ...__keySet__, this])
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    const __innerMap__ = this.#root.get(${defines.get("mapArgument0")});
    return __innerMap__?.size || 0;
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerMap__ = this.#root.get(${defines.get("mapArgument0")});
    if (!__innerMap__)
      return false;

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHashIfExists(${defines.get("setArgList")});
    return __setKeyHash__ ? __innerMap__.has(__setKeyHash__) : false;
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    return this.#root.has(${defines.get("mapArgument0")});
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    return this.#isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});

    const __innerMap__ = this.#root.get(${defines.get("mapArgument0")});
    if (!__innerMap__)
      return;

    const __outerIter__ = __innerMap__.values();
    for (let __value__ of __outerIter__)
      yield [${defines.get("mapArgList")}, ...__value__];
  }

${docs.buildBlock("requireInnerCollectionPrivate", 2)}
  #requireInnerMap(${defines.get("mapArgument0")}) {
    if (!this.#root.has(${defines.get("mapArgument0")})) {
      this.#root.set(${defines.get("mapArgument0")}, new Map);
    }
    return this.#root.get(${defines.get("mapArgument0")});
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    if (!this.#isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.get("mapArgument0")}, ${defines.get("setArgList")}) {
    return this.#isValidMapKey(${defines.get("mapArgument0")}) && this.#isValidSetKey(${defines.get("setArgList")});
  }

${docs.buildBlock("requireValidMapKey", 2)}
  #requireValidMapKey(${defines.get("mapArgument0")}) {
    if (!this.#isValidMapKey(${defines.get("mapArgument0")}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  #isValidMapKey(${defines.get("mapArgument0")}) {
    if (Object(${defines.get("mapArgument0")}) !== ${defines.get("mapArgument0")})
      return false;
    ${defines.get("validateMapArguments") || ""}
    return true;
  }

${docs.buildBlock("isValidSetKeyPrivate", 2)}
  #isValidSetKey(${defines.get("setArgList")}) {
    void(${defines.get("setArgList")});

    ${defines.get("validateSetArguments") || ""}
    return true;
  }

  [Symbol.toStringTag] = "${defines.get("className")}";
}

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`;
}

export default preprocess;
