/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    return `
${defines.importLines}
import KeyHasher from "./keys/Hasher.mjs";

/** @typedef {Map<hash, *[]>} ${defines.className}~InnerMap */

class ${defines.className} {
  /** @typedef {string} hash */

  /**
   * @type {WeakMap<${defines.mapArgument0Type}, ${defines.className}~InnerMap>}
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
  add(${defines.mapKeys.join(", ")}, ${defines.setKeys.join(", ")}) {
    this.#requireValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys.join(", ")});
    const __innerMap__ = this.#requireInnerMap(${defines.mapKeys.join(", ")});

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHash(${defines.setKeys.join(", ")});
    if (!__innerMap__.has(__setKeyHash__)) {
      __innerMap__.set(__setKeyHash__, [${defines.setKeys.join(", ")}]);
    }

    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.mapKeys.join(", ")}, __sets__) {
    this.#requireValidMapKey(${defines.mapKeys.join(", ")});
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.setKeys.length}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.setKeys.length} set argument${defines.setKeys.length > 1 ? "s" : ""}!\`);
      }
      this.#requireValidKey(${defines.mapKeys.join(", ")}, ...__set__);
      return __set__;
    });

    const __innerMap__ = this.#requireInnerMap(${defines.mapKeys.join(", ")});

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
  clearSets(${defines.mapKeys.join(", ")}) {
    this.#requireValidMapKey(${defines.mapKeys.join(", ")});
    const __innerMap__ = this.#root.get(${defines.mapKeys[0]});
    __innerMap__?.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.mapKeys.join(", ")}, ${defines.setKeys.join(", ")}) {
    this.#requireValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys.join(", ")});
    const __innerMap__ = this.#root.get(${defines.mapKeys[0]});
    if (!__innerMap__)
      return false;

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHashIfExists(${defines.setKeys.join(", ")});
    if (!__setKeyHash__)
      return false;
    const __returnValue__ = __innerMap__.delete(__setKeyHash__);

    if (__innerMap__.size === 0) {
      this.deleteSets(${defines.mapKeys.join(", ")});
    }

    return __returnValue__;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.mapKeys[0]}) {
    this.#requireValidMapKey(${defines.mapKeys[0]});
    return this.#root.delete(${defines.mapKeys[0]});
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.mapKeys.join(", ")}, __callback__, __thisArg__) {
    this.#requireValidMapKey(${defines.mapKeys.join(", ")});
    const __innerMap__ = this.#root.get(${defines.mapKeys[0]});
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, [${defines.mapKeys.join(", ")}, ...__keySet__, this])
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${defines.mapKeys.join(", ")}) {
    this.#requireValidMapKey(${defines.mapKeys.join(", ")});
    const __innerMap__ = this.#root.get(${defines.mapKeys[0]});
    return __innerMap__?.size || 0;
  }

${docs.buildBlock("has", 2)}
  has(${defines.mapKeys.join(", ")}, ${defines.setKeys.join(", ")}) {
    this.#requireValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys.join(", ")});
    const __innerMap__ = this.#root.get(${defines.mapKeys[0]});
    if (!__innerMap__)
      return false;

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHashIfExists(${defines.setKeys.join(", ")});
    return __setKeyHash__ ? __innerMap__.has(__setKeyHash__) : false;
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.mapKeys.join(", ")}) {
    this.#requireValidMapKey(${defines.mapKeys.join(", ")});
    return this.#root.has(${defines.mapKeys[0]});
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys.join(", ")}) {
    return this.#isValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys.join(", ")});
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${defines.mapKeys.join(", ")}) {
    this.#requireValidMapKey(${defines.mapKeys.join(", ")});

    const __innerMap__ = this.#root.get(${defines.mapKeys[0]});
    if (!__innerMap__)
      return;

    const __outerIter__ = __innerMap__.values();
    for (let __value__ of __outerIter__)
      yield [${defines.mapKeys.join(", ")}, ...__value__];
  }

${docs.buildBlock("requireInnerCollectionPrivate", 2)}
  #requireInnerMap(${defines.mapKeys[0]}) {
    if (!this.#root.has(${defines.mapKeys[0]})) {
      this.#root.set(${defines.mapKeys[0]}, new Map);
    }
    return this.#root.get(${defines.mapKeys[0]});
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys.join(", ")}) {
    if (!this.#isValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys.join(", ")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.mapKeys[0]}, ${defines.setKeys.join(", ")}) {
    return this.#isValidMapKey(${defines.mapKeys[0]}) && this.#isValidSetKey(${defines.setKeys.join(", ")});
  }

${docs.buildBlock("requireValidMapKey", 2)}
  #requireValidMapKey(${defines.mapKeys[0]}) {
    if (!this.#isValidMapKey(${defines.mapKeys[0]}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  #isValidMapKey(${defines.mapKeys[0]}) {
    if (Object(${defines.mapKeys[0]}) !== ${defines.mapKeys[0]})
      return false;
    ${defines.validateMapArguments || ""}
    return true;
  }

${docs.buildBlock("isValidSetKeyPrivate", 2)}
  #isValidSetKey(${defines.setKeys.join(", ")}) {
    void(${defines.setKeys.join(", ")});

    ${defines.validateSetArguments || ""}
    return true;
  }

  [Symbol.toStringTag] = "${defines.className}";
}

Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`;
};
export default preprocess;
//# sourceMappingURL=OneMapOfStrongSets.in.mjs.map