/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import KeyHasher from "./KeyHasher.mjs"
import WeakKeyComposer from "./WeakKey-WeakMap.mjs"


/** @typedef {Map<hash, *[]>} WeakMapOfStrongSets~InnerMap */

export default class WeakMapOfStrongSets {
  constructor() {
    /**
     * @type {WeakMap<object, WeakMap<WeakKey, WeakMapOfStrongSets~InnerMap>>}
     * @note This is three levels.  The first level is the first weak argument.
     * The second level is the WeakKey.  The third level is the strong set.
     */
    this.__root__ = new WeakMap();

    /** @type {WeakKeyComposer} @private */
    this.__mapKeyComposer__ = new WeakKeyComposer(
      ["mapKey"], []
    );

    /**
     * @type {KeyHasher}
     * @private
     * @const
     */
    this.__setHasher__ = new KeyHasher(["setKey"]);

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

  /**
   * Add a key set to this collection.
   *
   * @param {object} mapKey 
   * @param {*}      setKey 
   *
   * @returns {WeakMapOfStrongSets} This collection.
   * @public
   */
  add(mapKey, setKey) {
    this.__requireValidKey__(mapKey, setKey);
    const __innerMap__ = this.__requireInnerMap__(mapKey);

    // level 3: inner map to set
    {
      const __setKeyHash__ = this.__setHasher__.buildHash([setKey]);
      if (!__innerMap__.has(__setKeyHash__)) {
        __innerMap__.set(__setKeyHash__, [mapKey, setKey]);
      }
    }

    return this;
  }

  /**
   * Add several sets to a map in this collection.
   *
   * @param {object} mapKey   
   * @param {Set[]}  __sets__ The sets to add.
   *
   * @returns {WeakMapOfStrongSets} This collection.
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

    const __innerMap__ = this.__requireInnerMap__(mapKey);

    // level 3: inner map to set
    __array__.forEach(__set__ => {
      const __setKeyHash__ = this.__setHasher__.buildHash(__set__);
      if (!__innerMap__.has(__setKeyHash__)) {
        __innerMap__.set(__setKeyHash__, [mapKey, ...__set__]);
      }
    });

    return this;
  }

  /**
   * Clear all sets from the collection for a given map keyset.
   *
   * @param {object} mapKey 
   *
   * @public
   */
  clearSets(mapKey) {
    this.__requireValidMapKey__(mapKey);
    const __innerMap__ = this.__getExistingInnerMap__(mapKey);
    if (!__innerMap__)
      return;

    __innerMap__.clear();
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {object} mapKey 
   * @param {*}      setKey 
   *
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(mapKey, setKey) {
    this.__requireValidKey__(mapKey, setKey);
    const __innerMap__ = this.__getExistingInnerMap__(mapKey);
    if (!__innerMap__)
      return false;

    // level 3: inner map to set
    const __setKeyHash__ = this.__setHasher__.buildHash([setKey]);
    const __returnValue__ = __innerMap__.delete(__setKeyHash__);

    if (__innerMap__.size === 0) {
      this.deleteSets(mapKey);
    }

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
   * Iterate over the keys under a map in this collection.
   *
   * @param {WeakMapOfStrongSets~ForEachCallback} callback A function to invoke for each iteration.
   *
   * @public
   */
  forEachSet(mapKey, __callback__, __thisArg__) {
    this.__requireValidMapKey__(mapKey);
    const __innerMap__ = this.__getExistingInnerMap__(mapKey);
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
    );
  }

  /**
   * @callback WeakMapOfStrongSets~ForEachCallback
   *
   * @param {object}              mapKey         
   * @param {*}                   setKey         
   * @param {WeakMapOfStrongSets} __collection__ This collection.
   *
   */

  /**
   * The number of elements in a particular set.
   *
   * @param {object} mapKey 
   *
   * @public
   */
  getSizeOfSet(mapKey) {
    this.__requireValidMapKey__(mapKey);
    const __innerMap__ = this.__getExistingInnerMap__(mapKey);
    if (!__innerMap__)
      return 0;

    return __innerMap__.size;
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {object} mapKey 
   * @param {*}      setKey 
   *
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(mapKey, setKey) {
    this.__requireValidKey__(mapKey, setKey);
    const __innerMap__ = this.__getExistingInnerMap__(mapKey);
    if (!__innerMap__)
      return false;

    // level 3: inner map to set
    {
      const __setKeyHash__ = this.__setHasher__.buildHash([setKey]);
      return __innerMap__.has(__setKeyHash__);
    }
  }

  /**
   * Report if the collection has any sets for a map.
   *
   * @param {object} mapKey 
   * @param {*}      setKey 
   *
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  hasSets(mapKey) {
    this.__requireValidMapKey__(mapKey);
    return Boolean(this.__getExistingInnerMap__(mapKey));
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} mapKey 
   * @param {*}      setKey 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */
  isValidKey(mapKey, setKey) {
    return this.__isValidKey__(mapKey, setKey);
  }

  /**
   * Return a new iterator for the sets of the collection in a map.
   *
   * @returns {Iterator<*>}
   * @public
   */
  valuesSet(mapKey) {
    this.__requireValidMapKey__(mapKey);
    const __innerMap__ = this.__getExistingInnerMap__(mapKey);
    if (!__innerMap__)
      return {
        next() {
          return {
            value: undefined,
            done: true
          }
        }
      };

    return __innerMap__.values();
  }

  /**
   * Require an inner collection exist for the given map keys.
   *
   * @param {object} mapKey 
   *
   * @private
   */
  __requireInnerMap__(mapKey) {
    let __weakKeyMap__, __innerMap__;
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
        __weakKeyMap__.set(__mapKey__, new Map);
      }
      __innerMap__ = __weakKeyMap__.get(__mapKey__);

      if (!this.__weakKeyToStrongKeys__.has(__mapKey__)) {
        this.__weakKeyToStrongKeys__.set(__mapKey__, new Set([]));
      }

      return __innerMap__;
    }
  }

  /**
   * Get an existing inner collection for the given map keys.
   *
   * @param {object} mapKey 
   *
   * @returns {WeakMapOfStrongSets~InnerMap}
   * @private
   */
  __getExistingInnerMap__(mapKey) {
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
   * @param {*}      setKey 
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
   * @param {*}      setKey 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @private
   */
  __isValidKey__(mapKey, setKey) {
    return this.__isValidMapKey__(mapKey) && this.__isValidSetKey__(setKey);
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
   * @param {*} setKey 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @private
   */
  __isValidSetKey__(setKey) {
    void(setKey);
    return true;
  }
}

Reflect.defineProperty(WeakMapOfStrongSets, Symbol.toStringTag, {
  value: "WeakMapOfStrongSets",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(WeakMapOfStrongSets);
Object.freeze(WeakMapOfStrongSets.prototype);
