/**
 *
 * @param {Map} defines
 * @param {JSDocGenerator} docs
 * @returns
 */
export default function preprocess(defines, docs) {
  return `
${defines.get("importLines")}

/** @typedef {Map<hash, *[]>} ${defines.get("className")}~InnerMap */

export default class ${defines.get("className")} {
  constructor() {
    /**
     * @type {WeakMap<object, WeakMap<WeakKey, ${defines.get("className")}~InnerMap>>}
     * @note This is three levels.  The first level is the first weak argument.
     * The second level is the WeakKey.  The third level is the strong set.
     */
    this.__root__ = new WeakMap();

    /** @type {WeakKeyComposer} @private */
    this.__mapKeyComposer__ = new WeakKeyComposer(
      ${defines.get("weakMapArgNameList")}, ${defines.get("strongMapArgNameList")}
    );

    /**
     * @type {KeyHasher}
     * @private
     * @const
     */
    this.__setHasher__ = new KeyHasher(${defines.get("setArgNameList")});

    /**
     * @type {WeakMap<WeakKey, Map<hash, Set<*>>>}
     * @const
     * @private
     */
    this.__weakKeyToStrongKeys__ = new WeakMap;

    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.add(...entry);
      }
    }
  }

${docs.buildBlock("add", 2)}
  add(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.__requireValidKey__(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerMap__ = this.__requireInnerMap__(${defines.get("mapArgList")});

    // level 3: inner map to set
    {
      const __setKeyHash__ = this.__setHasher__.buildHash([${defines.get("setArgList")}]);
      if (!__innerMap__.has(__setKeyHash__)) {
        __innerMap__.set(__setKeyHash__, [${defines.get("mapArgList")}, ${defines.get("setArgList")}]);
      }
    }

    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.get("mapArgList")}, __sets__) {
    this.__requireValidMapKey__(${defines.get("mapArgList")});
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.get("setArgCount")}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.get("setArgCount")} set argument${
          defines.get("setArgCount") > 1 ? "s" : ""
        }!\`);
      }
      this.__requireValidKey__(${defines.get("mapArgList")}, ...__set__);
      return __set__;
    });

    const __innerMap__ = this.__requireInnerMap__(${defines.get("mapArgList")});

    // level 3: inner map to set
    __array__.forEach(__set__ => {
      const __setKeyHash__ = this.__setHasher__.buildHash(__set__);
      if (!__innerMap__.has(__setKeyHash__)) {
        __innerMap__.set(__setKeyHash__, [${defines.get("mapArgList")}, ...__set__]);
      }
    });

    return this;
  }

${docs.buildBlock("clearSets", 2)}
  clearSets(${defines.get("mapArgList")}) {
    this.__requireValidMapKey__(${defines.get("mapArgList")});
    const __innerMap__ = this.__getExistingInnerMap__(${defines.get("mapArgList")});
    if (!__innerMap__)
      return;

    __innerMap__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.__requireValidKey__(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerMap__ = this.__getExistingInnerMap__(${defines.get("mapArgList")});
    if (!__innerMap__)
      return false;

    // level 3: inner map to set
    const __setKeyHash__ = this.__setHasher__.buildHash([${defines.get("setArgList")}]);
    const __returnValue__ = __innerMap__.delete(__setKeyHash__);

    if (__innerMap__.size === 0) {
      this.deleteSets(${defines.get("mapArgList")});
    }

    return __returnValue__;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.get("mapArgList")}) {
    this.__requireValidMapKey__(${defines.get("mapArgList")});
    let __weakKeyMap__;

    // level 1:  first weak argument to weak map key
    {
      if (!this.__root__.has(${defines.get("weakMapArgument0")})) {
        return false;
      }
      __weakKeyMap__ = this.__root__.get(${defines.get("weakMapArgument0")});
    }

    // level 2:  weak map key to inner map
    {
      const __mapKey__ = this.__mapKeyComposer__.getKey(
        [${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]
      );
      return __weakKeyMap__.delete(__mapKey__);
    }
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.get("mapArgList")}, __callback__, __thisArg__) {
    this.__requireValidMapKey__(${defines.get("mapArgList")});
    const __innerMap__ = this.__getExistingInnerMap__(${defines.get("mapArgList")});
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${defines.get("mapArgList")}) {
    this.__requireValidMapKey__(${defines.get("mapArgList")});
    const __innerMap__ = this.__getExistingInnerMap__(${defines.get("mapArgList")});
    if (!__innerMap__)
      return 0;

    return __innerMap__.size;
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.__requireValidKey__(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerMap__ = this.__getExistingInnerMap__(${defines.get("mapArgList")});
    if (!__innerMap__)
      return false;

    // level 3: inner map to set
    {
      const __setKeyHash__ = this.__setHasher__.buildHash([${defines.get("setArgList")}]);
      return __innerMap__.has(__setKeyHash__);
    }
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.get("mapArgList")}) {
    this.__requireValidMapKey__(${defines.get("mapArgList")});
    return Boolean(this.__getExistingInnerMap__(${defines.get("mapArgList")}));
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    return this.__isValidKey__(${defines.get("mapArgList")}, ${defines.get("setArgList")});
  }

${docs.buildBlock("valuesSet", 2)}
  valuesSet(${defines.get("mapArgList")}) {
    this.__requireValidMapKey__(${defines.get("mapArgList")});
    const __innerMap__ = this.__getExistingInnerMap__(${defines.get("mapArgList")});
    if (!__innerMap__)
      return {
        next() { return { value: undefined, done: true }}
      };

    return __innerMap__.values();
  }

${docs.buildBlock("requireInnerCollectionPrivate", 2)}
  __requireInnerMap__(${defines.get("mapArgList")}) {
    let __weakKeyMap__, __innerMap__;
    // level 1:  first weak argument to weak map key
    {
      if (!this.__root__.has(${defines.get("weakMapArgument0")})) {
        this.__root__.set(${defines.get("weakMapArgument0")}, new WeakMap);
      }
      __weakKeyMap__ = this.__root__.get(${defines.get("weakMapArgument0")});
    }

    // level 2:  weak map key to inner map
    {
      const __mapKey__ = this.__mapKeyComposer__.getKey(
        [${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]
      );
      if (!__weakKeyMap__.has(__mapKey__)) {
        __weakKeyMap__.set(__mapKey__, new Map);
      }
      __innerMap__ = __weakKeyMap__.get(__mapKey__);

      if (!this.__weakKeyToStrongKeys__.has(__mapKey__)) {
        this.__weakKeyToStrongKeys__.set(__mapKey__, new Set([${defines.get("strongMapArgList")}]));
      }

      return __innerMap__;
    }
  }

${docs.buildBlock("getExistingInnerCollectionPrivate", 2)}
  __getExistingInnerMap__(${defines.get("mapArgList")}) {
    let __weakKeyMap__;

    // level 1:  first weak argument to weak map key
    {
      __weakKeyMap__ = this.__root__.get(${defines.get("weakMapArgument0")});
      if (!__weakKeyMap__)
        return undefined;
    }

    // level 2:  weak map key to inner map
    {
      const __mapKey__ = this.__mapKeyComposer__.getKey(
        [${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]
      );

      return __weakKeyMap__.get(__mapKey__);
    }
  }

${docs.buildBlock("requireValidKey", 2)}
  __requireValidKey__(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    if (!this.__isValidKey__(${defines.get("mapArgList")}, ${defines.get("setArgList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  __isValidKey__(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    return this.__isValidMapKey__(${defines.get("mapArgList")}) && this.__isValidSetKey__(${defines.get("setArgList")});
  }

${docs.buildBlock("requireValidMapKey", 2)}
  __requireValidMapKey__(${defines.get("mapArgList")}) {
    if (!this.__isValidMapKey__(${defines.get("mapArgList")}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  __isValidMapKey__(${defines.get("mapArgList")}) {
    if (!this.__mapKeyComposer__.isValidForKey([${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]))
      return false;
    ${defines.get("validateMapArguments") || ""}
    return true;
  }

${docs.buildBlock("isValidSetKeyPrivate", 2)}
  __isValidSetKey__(${defines.get("setArgList")}) {
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
