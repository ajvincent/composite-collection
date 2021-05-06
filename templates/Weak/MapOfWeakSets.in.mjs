/**
 *
 * @param {Map} defines
 * @param {JSDocGenerator} docs
 * @returns
 */
export default function preprocess(defines, docs) {
  return `
${defines.get("importLines")}

export default class ${defines.get("className")} {
  constructor() {
    /**
     * @type {WeakMap<object, WeakMap<WeakKey, WeakSet<WeakKey>>>}
     * @note This is three levels.  The first level is the first weak argument.
     * The second level is the WeakKey.  The third level is the weak set.
     */
    this.__root__ = new WeakMap();

    /** @type {WeakKeyComposer} @private */
    this.__mapKeyComposer__ = new WeakKeyComposer(
      ${defines.get("weakMapArgNameList")}, ${defines.get("strongMapArgNameList")}
    );

    /** @type {WeakKeyComposer} @private */
    this.__setKeyComposer__ = new WeakKeyComposer(
      ${defines.get("weakSetArgNameList")}, ${defines.get("strongSetArgNameList")}
    );

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
    const __innerSet__ = this.__requireInnerSet__(${defines.get("mapArgList")});

    // level 3: inner WeakSet
    const __weakSetKey__ = this.__setKeyComposer__.getKey(
      [${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]
    );
    if (!this.__weakKeyToStrongKeys__.has(__weakSetKey__))
      this.__weakKeyToStrongKeys__.set(__weakSetKey__, new Set([${defines.get("strongSetArgList")}]));

    __innerSet__.add(__weakSetKey__);
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

    const __innerSet__ = this.__requireInnerSet__(${defines.get("mapArgList")});

    __array__.forEach(__set__ => {
      const [${defines.get("setArgList")}] = __set__;
      const __weakSetKey__ = this.__setKeyComposer__.getKey(
        [${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]
      );
      if (!this.__weakKeyToStrongKeys__.has(__weakSetKey__))
        this.__weakKeyToStrongKeys__.set(__weakSetKey__, new Set([${defines.get("strongSetArgList")}]));
  
      __innerSet__.add(__weakSetKey__);
    });
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.__requireValidKey__(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerSet__ = this.__getExistingInnerSet__(${defines.get("mapArgList")});
    if (!__innerSet__)
      return false;

    if (!this.__setKeyComposer__.hasKey(
      [${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]
    ))
      return false;

    const __weakSetKey__ = this.__setKeyComposer__.getKey(
      [${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]
    );

    const __returnValue__ = this.__weakKeyToStrongKeys__.delete(__weakSetKey__);
    if (__returnValue__)
      this.__setKeyComposer__.deleteKey(
        [${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]
      );

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

${docs.buildBlock("has", 2)}
  has(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.__requireValidKey__(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerSet__ = this.__getExistingInnerSet__(${defines.get("mapArgList")});
    if (!__innerSet__)
      return false;

    if (!this.__setKeyComposer__.hasKey(
      [${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]
    ))
      return false;

    const __weakSetKey__ = this.__setKeyComposer__.getKey(
      [${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]
    );

    return __innerSet__.has(__weakSetKey__);
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.get("mapArgList")}) {
    this.__requireValidMapKey__(${defines.get("mapArgList")});
    return Boolean(this.__getExistingInnerSet__(${defines.get("mapArgList")}));
  }

${docs.buildBlock("requireInnerCollectionPrivate", 2)}
  __requireInnerSet__(${defines.get("mapArgList")}) {
    let __weakKeyMap__, __innerSet__;
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
        __weakKeyMap__.set(__mapKey__, new WeakSet);
      }
      __innerSet__ = __weakKeyMap__.get(__mapKey__);

      if (!this.__weakKeyToStrongKeys__.has(__mapKey__)) {
        this.__weakKeyToStrongKeys__.set(__mapKey__, new WeakSet([${defines.get("strongMapArgList")}]));
      }

      return __innerSet__;
    }
  }

${docs.buildBlock("getExistingInnerCollectionPrivate", 2)}
  __getExistingInnerSet__(${defines.get("mapArgList")}) {
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
  __requireValidKey__(${defines.get("argList")}) {
    if (!this.__isValidKey__(${defines.get("argList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  __isValidKey__(${defines.get("argList")}) {
    return this.__isValidMapKey__(${defines.get("mapArgList")}) &&
           this.__isValidSetKey__(${defines.get("setArgList")});
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
    if (!this.__setKeyComposer__.isValidForKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]))
      return false;

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
