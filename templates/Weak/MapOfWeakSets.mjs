import WeakKeyComposer from "./WeakKey-WeakMap.mjs"

export default class __className__ {
  constructor() {
    /**
     * @type {WeakMap<object, WeakMap<WeakKey, WeakSet<WeakKey>>>}
     * @note This is three levels.  The first level is the first weak argument.
     * The second level is the WeakKey.  The third level is the weak set.
     */
    this.__root__ = new WeakMap();

    /** @type {WeakKeyComposer} */
    this.__mapKeyComposer__ = new WeakKeyComposer(
      __weakMapArgNameList__, __strongMapArgNameList__
    );

    /** @type {WeakKeyComposer} */
    this.__setKeyComposer__ = new WeakKeyComposer(
      __weakSetArgNameList__, __strongSetArgNameList__
    );

    /**
     * @type {WeakMap<WeakKey, Map<hash, Set<*>>>}
     * @const
     * @private
     */
    this.__weakKeyToStrongKeys__ = new WeakMap;
  }

  add(__mapArgList__, __setArgList__) {
    this.__requireValidKey__(__mapArgList__, __setArgList__);
    const __innerMap__ = this.__requireInnerMap__(__mapArgList__);

    // level 3: inner WeakSet
    const __weakSetKey__ = this.__setKeyComposer__.getKey(
      [__weakSetArgList__], [__strongSetArgList__]
    );
    if (!this.__weakKeyToStrongKeys__.has(__weakSetKey__))
      this.__weakKeyToStrongKeys__.set(__weakSetKey__, new Set([__strongSetArgList__]));

    __innerMap__.add(__weakSetKey__);
    return this;
  }

  addSets(__mapArgList__, __sets__) {
    this.__requireValidMapKey__(__mapArgList__);
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== __setArgCount__) {
        throw new Error(`Set at index ${__index__} doesn't have exactly ${defines.get("setArgCount")} set argument${
          __setArgCount__ > 1 ? "s" : ""
        }!`);
      }
      this.__requireValidKey__(__mapArgList__, ...__set__);
      return __set__;
    });

    const __innerMap__ = this.__requireInnerMap__(__mapArgList__);

    __array__.forEach(__set__ => {
      const __weakSetKey__ = this.__setKeyComposer__.getKey(
        [__weakSetArgList__], [__strongSetArgList__]
      );
      if (!this.__weakKeyToStrongKeys__.has(__weakSetKey__))
        this.__weakKeyToStrongKeys__.set(__weakSetKey__, new Set([__strongSetArgList__]));
  
      __innerMap__.add(__weakSetKey__);
    });
  }

  delete(__mapArgList__, __setArgList__) {
    this.__requireValidKey__(__mapArgList__, __setArgList__);
    const __innerMap__ = this.__getExistingInnerMap__(__mapArgList__);
    if (!__innerMap__)
      return false;

    if (!this.__setKeyComposer__.hasKey(
      [__weakSetArgList__], [__strongSetArgList__]
    ))
      return false;

    const __weakSetKey__ = this.__setKeyComposer__.getKey(
      [__weakSetArgList__], [__strongSetArgList__]
    );

    const __returnValue__ = this.__weakKeyToStrongKeys__.delete(__weakSetKey__);
    if (__returnValue__)
      this.__setKeyComposer__.deleteKey(
        [__weakSetArgList__], [__strongSetArgList__]
      );

    return __returnValue__;
  }

  deleteSets(__mapArgList__) {
    this.__requireValidMapKey__(__mapArgList__);
    /*
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
    */
  }

  has(__mapArgList__, __setArgList__) {
    this.__requireValidKey__(__mapArgList__, __setArgList__);
    const __innerMap__ = this.__getExistingInnerMap__(__mapArgList__);
    if (!__innerMap__)
      return false;

    if (!this.__setKeyComposer__.hasKey(
      [__weakSetArgList__], [__strongSetArgList__]
    ))
      return false;

    const __weakSetKey__ = this.__setKeyComposer__.getKey(
      [__weakSetArgList__], [__strongSetArgList__]
    );

    return __innerMap__.has(__weakSetKey__);
  }

  hasSets(__mapArgList__) {
    this.__requireValidMapKey__(__mapArgList__);
    /*
    return Boolean(this.__getExistingInnerMap__(${defines.get("mapArgList")}));
    */
  }

/*
${docs.buildBlock("requireInnerMapPrivate", 2)}
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

${docs.buildBlock("getExistingInnerMapPrivate", 2)}
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
  __requireValidKey__(${defines.get("argList")}) {
    if (!this.__isValidKey__(${defines.get("argList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  __isValidKey__(${defines.get("argList")}) {
    if (!this.__keyComposer__.isValidForKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]))
      return false;
${defines.get("validateArguments") || ""}
    return true;
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
    return true;
  }

${docs.buildBlock("isValidSetKeyPrivate", 2)}
  __isValidSetKey__(${defines.get("setArgList")}) {
    void(${defines.get("setArgList")});
    return true;
  }
*/
}
