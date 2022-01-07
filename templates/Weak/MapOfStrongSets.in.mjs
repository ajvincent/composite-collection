/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
export default function preprocess(defines, docs) {
  return `
${defines.get("importLines")}

/** @typedef {Map<hash, *[]>} ${defines.get("className")}~InnerMap */

class ${defines.get("className")} {
  /**
   * @type {WeakMap<WeakKey, ${defines.get("className")}~InnerMap>}
   * @constant
   * @note This is two levels. The first level is the WeakKey.  The second level is the strong set.
   */
  #root = new WeakMap();

  /** @type {WeakKeyComposer} @constant */
  #mapKeyComposer = new WeakKeyComposer(
    ${defines.get("weakMapArgNameList")}, ${defines.get("strongMapArgNameList")}
  );

  /** @type {KeyHasher} @constant */
  #setHasher = new KeyHasher(${defines.get("setArgNameList")});

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
          defines.get("setCount") > 1 ? "s" : ""
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
    const __innerMap__ = this.#getExistingInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return;

    __innerMap__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerMap__ = this.#getExistingInnerMap(${defines.get("mapArgList")});
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
  deleteSets(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});

    const __mapKey__ = this.#mapKeyComposer.getKeyIfExists(
      [${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]
    );

    return __mapKey__ ? this.#root.delete(__mapKey__) : false;
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.get("mapArgList")}, __callback__, __thisArg__) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    const __innerMap__ = this.#getExistingInnerMap(${defines.get("mapArgList")});
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
    const __innerMap__ = this.#getExistingInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return 0;

    return __innerMap__.size;
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerMap__ = this.#getExistingInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return false;

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHashIfExists(${defines.get("setArgList")});
    return __setKeyHash__ ? __innerMap__.has(__setKeyHash__) : false;
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    return Boolean(this.#getExistingInnerMap(${defines.get("mapArgList")}));
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    return this.#isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
  }

${docs.buildBlock("valuesSet", 2)}
  valuesSet(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    const __innerMap__ = this.#getExistingInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return {
        next() { return { value: undefined, done: true }}
      };

    const __outerIter__ = __innerMap__.values();
    return {
      next() {
        let { value, done } = __outerIter__.next();
        if (done)
          return {value: undefined, done};

        value = [${defines.get("mapArgList")}, ...value];
        return { value, done };
      }
    }
  }

${docs.buildBlock("requireInnerCollectionPrivate", 2)}
  #requireInnerMap(${defines.get("mapArgList")}) {
    const __mapKey__ = this.#mapKeyComposer.getKey(
      [${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]
    );
    if (!this.#root.has(__mapKey__)) {
      this.#root.set(__mapKey__, new Map);
    }
    return this.#root.get(__mapKey__);
  }

${docs.buildBlock("getExistingInnerCollectionPrivate", 2)}
  #getExistingInnerMap(${defines.get("mapArgList")}) {
    const __mapKey__ = this.#mapKeyComposer.getKeyIfExists(
      [${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]
    );

    return __mapKey__ ? this.#root.get(__mapKey__) : undefined;
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    if (!this.#isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    return this.#isValidMapKey(${defines.get("mapArgList")}) && this.#isValidSetKey(${defines.get("setArgList")});
  }

${docs.buildBlock("requireValidMapKey", 2)}
  #requireValidMapKey(${defines.get("mapArgList")}) {
    if (!this.#isValidMapKey(${defines.get("mapArgList")}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  #isValidMapKey(${defines.get("mapArgList")}) {
    if (!this.#mapKeyComposer.isValidForKey([${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]))
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
