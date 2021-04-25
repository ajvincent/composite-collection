/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import WeakKeyComposer from "./WeakKey-WeakMap.mjs"

export default class WeakMapOfWeakSets {
  constructor() {
    /**
     * @type {WeakMap<object, WeakMap<WeakKey, WeakSet<WeakKey>>>}
     * @note This is three levels.  The first level is the first weak argument.
     * The second level is the WeakKey.  The third level is the weak set.
     */
    this.__root__ = new WeakMap();

    /** @type {WeakKeyComposer} @private */
    this.__mapKeyComposer__ = new WeakKeyComposer(
      ["mapKey"], []
    );

    /** @type {WeakKeyComposer} @private */
    this.__setKeyComposer__ = new WeakKeyComposer(
      ["setKey"], []
    );

    /**
     * @type {WeakMap<WeakKey, Map<hash, Set<*>>>}
     * @const
     * @private
     */
    this.__weakKeyToStrongKeys__ = new WeakMap;
  }

  /**
   * Add a key set to this collection.
   *
   * @param {object} mapKey 
   * @param {object} setKey 
   *
   * @returns {WeakMapOfWeakSets} This collection.
   * @public
   */
  add(mapKey, setKey) {
    this.__requireValidKey__(mapKey, setKey);
    const __innerSet__ = this.__requireInnerSet__(mapKey);

    // level 3: inner WeakSet
    const __weakSetKey__ = this.__setKeyComposer__.getKey(
      [setKey], []
    );
    if (!this.__weakKeyToStrongKeys__.has(__weakSetKey__))
      this.__weakKeyToStrongKeys__.set(__weakSetKey__, new Set([]));

    __innerSet__.add(__weakSetKey__);
    return this;
  }

  /**
   * Add several sets to a map in this collection.
   *
   * @param {object} mapKey   
   * @param {Set[]}  __sets__ The sets to add.
   *
   * @returns {WeakMapOfWeakSets} This collection.
   * @public
   */
  addSets(mapKey, __sets__) {
    this.__requireValidMapKey__(mapKey);
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== 1) {
        throw new Error(`Set at index ${__index__} doesn't have exactly 1 set argument!`);
      }
      this.__requireValidKey__(mapKey, ...__set__);
      return __set__;
    });

    const __innerSet__ = this.__requireInnerSet__(mapKey);

    __array__.forEach(([setKey] = __set__) => {
      const __weakSetKey__ = this.__setKeyComposer__.getKey(
        [setKey], []
      );
      if (!this.__weakKeyToStrongKeys__.has(__weakSetKey__))
        this.__weakKeyToStrongKeys__.set(__weakSetKey__, new Set([]));

      __innerSet__.add(__weakSetKey__);
    });
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {object} mapKey 
   * @param {object} setKey 
   *
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(mapKey, setKey) {
    this.__requireValidKey__(mapKey, setKey);
    const __innerSet__ = this.__getExistingInnerSet__(mapKey);
    if (!__innerSet__)
      return false;

    if (!this.__setKeyComposer__.hasKey(
        [setKey], []
      ))
      return false;

    const __weakSetKey__ = this.__setKeyComposer__.getKey(
      [setKey], []
    );

    const __returnValue__ = this.__weakKeyToStrongKeys__.delete(__weakSetKey__);
    if (__returnValue__)
      this.__setKeyComposer__.deleteKey(
        [setKey], []
      );

    return __returnValue__;
  }

  /**
   * Delete all sets from the collection by the given map sequence.
   *
   * @param {object} mapKey 
   *
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  deleteSets(mapKey) {
    this.__requireValidMapKey__(mapKey);
    let __weakKeyMap__;

    // level 1:  first weak argument to weak map key
    {
      if (!this.__root__.has(mapKey)) {
        return false;
      }
      __weakKeyMap__ = this.__root__.get(mapKey);
    }

    // level 2:  weak map key to inner map
    {
      const __mapKey__ = this.__mapKeyComposer__.getKey(
        [mapKey], []
      );
      return __weakKeyMap__.delete(__mapKey__);
    }
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {object} mapKey 
   * @param {object} setKey 
   *
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(mapKey, setKey) {
    this.__requireValidKey__(mapKey, setKey);
    const __innerSet__ = this.__getExistingInnerSet__(mapKey);
    if (!__innerSet__)
      return false;

    if (!this.__setKeyComposer__.hasKey(
        [setKey], []
      ))
      return false;

    const __weakSetKey__ = this.__setKeyComposer__.getKey(
      [setKey], []
    );

    return __innerSet__.has(__weakSetKey__);
  }

  /**
   * Report if the collection has any sets for a map.
   *
   * @param {object} mapKey 
   * @param {object} setKey 
   *
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  hasSets(mapKey) {
    this.__requireValidMapKey__(mapKey);
    return Boolean(this.__getExistingInnerSet__(mapKey));
  }

  /**
   * Require an inner collection exist for the given map keys.
   *
   * @param {object} mapKey 
   *
   * @private
   */
  __requireInnerSet__(mapKey) {
    let __weakKeyMap__, __innerSet__;
    // level 1:  first weak argument to weak map key
    {
      if (!this.__root__.has(mapKey)) {
        this.__root__.set(mapKey, new WeakMap);
      }
      __weakKeyMap__ = this.__root__.get(mapKey);
    }

    // level 2:  weak map key to inner map
    {
      const __mapKey__ = this.__mapKeyComposer__.getKey(
        [mapKey], []
      );
      if (!__weakKeyMap__.has(__mapKey__)) {
        __weakKeyMap__.set(__mapKey__, new WeakSet);
      }
      __innerSet__ = __weakKeyMap__.get(__mapKey__);

      if (!this.__weakKeyToStrongKeys__.has(__mapKey__)) {
        this.__weakKeyToStrongKeys__.set(__mapKey__, new WeakSet([]));
      }

      return __innerSet__;
    }
  }

  /**
   * Get an existing inner collection for the given map keys.
   *
   * @param {object} mapKey 
   *
   * @returns {WeakMapOfWeakSets~InnerMap}
   * @private
   */
  __getExistingInnerSet__(mapKey) {
    let __weakKeyMap__;

    // level 1:  first weak argument to weak map key
    {
      __weakKeyMap__ = this.__root__.get(mapKey);
      if (!__weakKeyMap__)
        return undefined;
    }

    // level 2:  weak map key to inner map
    {
      const __mapKey__ = this.__mapKeyComposer__.getKey(
        [mapKey], []
      );

      return __weakKeyMap__.get(__mapKey__);
    }
  }

  /**
   * Throw if the key set is not valid.
   *
   * @param {object} mapKey 
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
   * @param {object} mapKey 
   * @param {object} setKey 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @private
   */
  __isValidKey__(mapKey, setKey) {
    return this.__isValidMapKey__(mapKey) &&
      this.__isValidSetKey__(setKey);
  }

  /**
   * Throw if the map key set is not valid.
   *
   * @param {object} mapKey 
   *
   * @throws for an invalid key set.
   * @private
   */
  __requireValidMapKey__(mapKey) {
    if (!this.__isValidMapKey__(mapKey))
      throw new Error("The ordered map key set is not valid!");
  }

  /**
   * Determine if a set of map keys is valid.
   *
   * @param {object} mapKey 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @private
   */
  __isValidMapKey__(mapKey) {
    if (!this.__mapKeyComposer__.isValidForKey([mapKey], []))
      return false;
    return true;
  }

  /**
   * Determine if a set of set keys is valid.
   *
   * @param {object} setKey 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @private
   */
  __isValidSetKey__(setKey) {
    if (!this.__setKeyComposer__.isValidForKey([setKey], []))
      return false;

    return true;
  }
}

Reflect.defineProperty(WeakMapOfWeakSets, Symbol.toStringTag, {
  value: "WeakMapOfWeakSets",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(WeakMapOfWeakSets);
Object.freeze(WeakMapOfWeakSets.prototype);
