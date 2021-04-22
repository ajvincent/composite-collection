/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import KeyHasher from "./KeyHasher.mjs";
import WeakKeyComposer from "./WeakKey-WeakMap.mjs"

export default class StrongMapOfWeakSets {
  constructor() {
    /**
     * @type {Map<string, WeakSet<WeakKey>}
     * @private
     * @const
     */
    this.__outerMap__ = new Map();

    /**
     * @type {KeyHasher}
     * @private
     * @const
     */
    this.__mapHasher__ = new KeyHasher(["mapKey"]);

    /** @type {WeakKeyComposer} @const @private */
    this.__setKeyComposer__ = new WeakKeyComposer(["setKey"], []);
  }

  get mapSize() {
    return this.__outerMap__.size;
  }

  add(mapKey, setKey) {
    this.__requireValidKey__(mapKey, setKey);

    const __mapHash__ = this.__mapHasher__.buildHash([mapKey]);
    if (!this.__outerMap__.has(__mapHash__))
      this.__outerMap__.set(__mapHash__, new WeakSet);

    const __inner__ = this.__outerMap__.get(__mapHash__);

    const __setKey__ = this.__setKeyComposer__.getKey([setKey], []);

    __inner__.add(__setKey__);
    return this;
  }

  addSets(mapKey, __sets__) {
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== 1) {
        throw new Error(`Set at index ${__index__} doesn't have exactly 1 argument!`);
      }

      this.__requireValidKey__(mapKey, ...__set__);
      return __set__;
    });

    const __mapHash__ = this.__mapHasher__.buildHash([mapKey]);
    if (!this.__outerMap__.has(__mapHash__))
      this.__outerMap__.set(__mapHash__, new WeakSet);

    const __inner__ = this.__outerMap__.get(__mapHash__);
    __array__.forEach(__set__ => {
      const __setKey__ = this.__setKeyComposer__.getKey([setKey], []);

      __inner__.add(__setKey__);
    });

    return this;
  }

  clear() {
    this.__outerMap__.clear();
  }

  delete(mapKey, setKey) {
    this.__requireValidKey__(mapKey, setKey);

    const [__inner__, __mapHash__] = this.__getInner__(mapKey);
    if (!__inner__)
      return false;

    if (!this.__setKeyComposer__.hasKey([setKey], []))
      return false;

    const __key__ = this.__setKeyComposer__.getKey([setKey], []);

    return __inner__.delete(__key__);
  }

  deleteSet(mapKey) {
    const [__inner__, __mapHash__] = this.__getInner__(mapKey);
    if (!__inner__)
      return false;

    this.__outerMap__.delete(__mapHash__);
    return true;
  }

  has(mapKey, setKey) {
    this.__requireValidKey__(mapKey, setKey);

    const [__inner__, __mapHash__] = this.__getInner__(mapKey);
    if (!__inner__)
      return false;

    if (!this.__setKeyComposer__.hasKey([setKey], []))
      return false;

    const __key__ = this.__setKeyComposer__.getKey([setKey], []);

    return __inner__.has(__key__);
  }

  hasSet(mapKey) {
    const [__inner__] = this.__getInner__(mapKey);
    return Boolean(__inner__);
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {*}      mapKey 
   * @param {object} setKey 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */
  isValidKey(mapKey, setKey) {
    return this.__isValidKey__(mapKey, setKey);
  }

  /**
   * @param {*}      mapKey 
   * @param {object} setKey 
   *
   * @throws for an invalid key set.
   */
  __requireValidKey__(mapKey, setKey) {
    if (!this.__isValidKey__(mapKey, setKey))
      throw new Error("The ordered key set is not valid!");
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {*}      mapKey 
   * @param {object} setKey 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @private
   */
  __isValidKey__(mapKey, setKey) {
    void(mapKey);

    if (!this.__setKeyComposer__.isValidForKey([setKey], []))
      return false;

    return true;
  }

  /** @private */
  __getInner__(...__mapArguments__) {
    const __hash__ = this.__mapHasher__.buildHash(__mapArguments__);
    return [this.__outerMap__.get(__hash__), __hash__] || [];
  }
}

Reflect.defineProperty(StrongMapOfWeakSets, Symbol.toStringTag, {
  value: "StrongMapOfWeakSets",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(StrongMapOfWeakSets);
Object.freeze(StrongMapOfWeakSets.prototype);
