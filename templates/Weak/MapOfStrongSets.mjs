import KeyHasher from "./KeyHasher.mjs"
import WeakKeyComposer from "./WeakKey-WeakMap.mjs"

/** @typedef {Map<hash, *[]>} __className__~InnerMap */

export default class __className__ {
  constructor() {
    this.__weakArgCount__ = 0;
    this.__strongArgCount__ = 0;

    /**
     * @type {WeakMap<object, WeakMap<WeakKey, __className__~InnerMap>>}
     * @note This is three levels.  The first level is the first weak argument.
     * The second level is the WeakKey.  The third level is the strong set.
     */
    this.__root__ = new WeakMap();

    /** @type {WeakKeyComposer} */
    this.__mapKeyComposer__ = new WeakKeyComposer(
      __weakMapArgNameList__, __strongMapArgNameList__
    );

    /**
     * @type {KeyHasher}
     * @private
     * @readonly
     */
    this.__keyHasher__ = new KeyHasher(__setArgNameList__);

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

    // level 3: inner map to set
    {
      const __setKeyHash__ = this.__keyHasher__.buildHash([__setArgList__]);
      if (!__innerMap__.has(__setKeyHash__)) {
        __innerMap__.set(__setKeyHash__, [__mapArgList__, __setArgList__]);
      }
    }

    return this;
  }

  addSets(__mapArgList__, __sets__) {
    this.__requireValidMapKey__(__mapArgList__);
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== this.__setArgCount__) {
        throw new Error(`Set at index ${__index__} doesn't have exactly ${this.__setArgCount__} set argument${
          this.__setArgCount__ > 1 ? "s" : ""
        }!`);
      }
      this.__requireValidKey__(__mapArgList__, ...__set__);
      return __set__;
    });

    const __innerMap__ = this.__requireInnerMap__(__mapArgList__);

    // level 3: inner map to set
    __array__.forEach(__set__ => {
      const __setKeyHash__ = this.__keyHasher__.buildHash(__set__);
      if (!__innerMap__.has(__setKeyHash__)) {
        __innerMap__.set(__setKeyHash__, [__mapArgList__, __set__]);
      }
    });

    return this;
  }

  delete(__mapArgList__, __setArgList__) {
    this.__requireValidKey__(__argList__);
    const __innerMap__ = this.__getExistingInnerMap__(__mapArgList__);
    if (!__innerMap__)
      return false;

    // level 3: inner map to set
    {
      const __setKeyHash__ = this.__keyHasher__.buildHash([__setArgList__]);
      return __innerMap__.delete(__setKeyHash__);
    }
  }

  deleteSet(__mapArgList__) {
    this.__requireValidMapKey__(__mapArgList__);
    let __weakKeyMap__, __innerMap__;

    // level 1:  first weak argument to weak map key
    {
      if (!this.__root__.has(__weakArg0__)) {
        return false;
      }
      __weakKeyMap__ = this.__mapKeyComposer__.get(__weakArg0__);
    }

    // level 2:  weak map key to inner map
    {
      const __mapKey__ = this.__mapKeyComposer__.getKey(
        __weakMapArgList__, __strongMapArgList__
      );
      return __weakKeyMap__.delete(__mapKey__);
    }
  }

  forEachSet(__mapArgList__, __callback__, __thisArg__) {
    this.__requireValidMapKey__(__mapArgList__);
    const __innerMap__ = this.__getExistingInnerMap__(__mapArgList__);
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
    );
  }

  getSizeOfSet(__mapArgList__) {
    this.__requireValidMapKey__(__mapArgList__);
    const __innerMap__ = this.__getExistingInnerMap__(__mapArgList__);
    if (!__innerMap__)
      return 0;

    return __innerMap__.size;
  }

  has(__mapArgList__, __setArgList__) {
    this.__requireValidKey__(__mapArgList__, __setArgList__);
    const __innerMap__ = this.__getExistingInnerMap__(__mapArgList__);
    if (!__innerMap__)
      return false;

    // level 3: inner map to set
    {
      const __setKeyHash__ = this.__keyHasher__.buildHash([__setArgList__]);
      return __innerMap__.has(__setKeyHash__);
    }
  }

  hasSet(__mapArgList__) {
    this.__requireValidMapKey__(__mapArgList__);
    return Boolean(this.__getExistingInnerMap__(__mapArgList__));
  }

  isValidKey(__mapArgList__, __setArgList__) {
    return this.__isValidKey__(__mapArgList__, __setArgList__);
  }

  valuesSet(__mapArgList__) {
    this.__requireValidMapKey__(__mapArgList__);
    const __innerMap__ = this.__getExistingInnerMap__(__mapArgList__);
    if (!__innerMap__)
      return {
        next() { return { value: undefined, done: true }}
      };

    return __innerMap__.values();
  }

  __requireInnerMap__(__mapArgList__) {
    let __weakKeyMap__, __innerMap__;
    // level 1:  first weak argument to weak map key
    {
      if (!this.__root__.has(__weakArg0__)) {
        this.__root__.set(__weakArg0__, new WeakMap);
      }
      __weakKeyMap__ = this.__mapKeyComposer__.get(__weakArg0__);
    }

    // level 2:  weak map key to inner map
    {
      const __mapKey__ = this.__mapKeyComposer__.getKey(
        __weakMapArgList__, __strongMapArgList__
      );
      if (!__weakKeyMap__.has(__mapKey__)) {
        __weakKeyMap__.set(__mapKey__, new Map);
      }
      __innerMap__ = __weakKeyMap__.get(__mapKey__);

      if (!this.__weakKeyToStrongKeys__.has(__mapKey__)) {
        this.__weakKeyToStrongKeys__.set(__mapKey__, new Set([__strongMapArgList__]));
      }

      return __innerMap__;
    }
  }

  __getExistingInnerMap__(__mapArgList__) {
    let __weakKeyMap__;

    // level 1:  first weak argument to weak map key
    {
      __weakKeyMap__ = this.__root__.get(__weakArg0__);
      if (!__weakKeyMap__)
        return undefined;
    }

    // level 2:  weak map key to inner map
    {
      const __mapKey__ = this.__mapKeyComposer__.getKey(
        __weakMapArgList__, __strongMapArgList__
      );

      return __weakKeyMap__.get(__mapKey__);
    }
  }

  __requireValidKey__(__mapArgList__, __setArgList__) {
    if (!this.__isValidKey__(__mapArgList__, __setArgList__))
      throw new Error("The ordered key set is not valid!");
  }

  __isValidKey__(__mapArgList__, __setArgList__) {
    return this.__isValidMapKey__(__mapArgList__) && this.__isValidSetKey(__setArgList__);
  }

  __requireValidMapKey__(__mapArgList__) {
    if (!this.__isValidMapKey__(__mapArgList__))
      throw new Error("The ordered map key set is not valid!");
  }

  __isValidMapKey__(__mapArgList__) {
    if (!this.__keyComposer__.isValidForKey(__weakMapArgList__, __strongMapArgList__))
      return false;
    return true;
  }

  __isValidSetKey(__setArgList__) {
    void(__setArgList__);
    return true;
  }
}
