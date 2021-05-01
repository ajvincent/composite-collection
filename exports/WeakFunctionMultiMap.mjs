/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import KeyHasher from "./KeyHasher.mjs"
import WeakKeyComposer from "./WeakKey-WeakMap.mjs"

/** @typedef {Map<hash, *[]>} WeakFunctionMultiMap~InnerMap */

export default class WeakFunctionMultiMap {
  constructor() {
    /**
     * @type {WeakMap<object, WeakMap<WeakKey, WeakFunctionMultiMap~InnerMap>>}
     * @note This is three levels.  The first level is the first weak argument.
     * The second level is the WeakKey.  The third level is the strong set.
     */
    this.__root__ = new WeakMap();

    /** @type {WeakKeyComposer} @private */
    this.__mapKeyComposer__ = new WeakKeyComposer(
      ["key"], []
    );

    /**
     * @type {KeyHasher}
     * @private
     * @const
     */
    this.__setHasher__ = new KeyHasher(["mapFunction"]);

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
   * @param {object}   key         
   * @param {Function} mapFunction 
   *
   * @returns {WeakFunctionMultiMap} This collection.
   * @public
   */
  add(key, mapFunction) {
    this.__requireValidKey__(key, mapFunction);
    const __innerMap__ = this.__requireInnerMap__(key);

    // level 3: inner map to set
    {
      const __setKeyHash__ = this.__setHasher__.buildHash([mapFunction]);
      if (!__innerMap__.has(__setKeyHash__)) {
        __innerMap__.set(__setKeyHash__, [key, mapFunction]);
      }
    }

    return this;
  }

  /**
   * Add several sets to a map in this collection.
   *
   * @param {object} key      
   * @param {Set[]}  __sets__ The sets to add.
   *
   * @returns {WeakFunctionMultiMap} This collection.
   * @public
   */
  addSets(key, __sets__) {
    this.__requireValidMapKey__(key);
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== 1) {
        throw new Error(`Set at index ${__index__} doesn't have exactly 1 set argument!`);
      }
      this.__requireValidKey__(key, ...__set__);
      return __set__;
    });

    const __innerMap__ = this.__requireInnerMap__(key);

    // level 3: inner map to set
    __array__.forEach(__set__ => {
      const __setKeyHash__ = this.__setHasher__.buildHash(__set__);
      if (!__innerMap__.has(__setKeyHash__)) {
        __innerMap__.set(__setKeyHash__, [key, ...__set__]);
      }
    });

    return this;
  }

  /**
   * Clear all sets from the collection for a given map keyset.
   *
   * @param {object} key 
   *
   * @public
   */
  clearSets(key) {
    this.__requireValidMapKey__(key);
    const __innerMap__ = this.__getExistingInnerMap__(key);
    if (!__innerMap__)
      return;

    __innerMap__.clear();
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {object}   key         
   * @param {Function} mapFunction 
   *
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(key, mapFunction) {
    this.__requireValidKey__(key, mapFunction);
    const __innerMap__ = this.__getExistingInnerMap__(key);
    if (!__innerMap__)
      return false;

    // level 3: inner map to set
    const __setKeyHash__ = this.__setHasher__.buildHash([mapFunction]);
    const __returnValue__ = __innerMap__.delete(__setKeyHash__);

    if (__innerMap__.size === 0) {
      this.deleteSets(key);
    }

    return __returnValue__;
  }

  /**
   * Delete all sets from the collection by the given map sequence.
   *
   * @param {object} key 
   *
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  deleteSets(key) {
    this.__requireValidMapKey__(key);
    let __weakKeyMap__;

    // level 1:  first weak argument to weak map key
    {
      if (!this.__root__.has(key)) {
        return false;
      }
      __weakKeyMap__ = this.__root__.get(key);
    }

    // level 2:  weak map key to inner map
    {
      const __mapKey__ = this.__mapKeyComposer__.getKey(
        [key], []
      );
      return __weakKeyMap__.delete(__mapKey__);
    }
  }

  /**
   * Iterate over the keys under a map in this collection.
   *
   * @param {WeakFunctionMultiMap~ForEachCallback} callback A function to invoke for each iteration.
   *
   * @public
   */
  forEachSet(key, __callback__, __thisArg__) {
    this.__requireValidMapKey__(key);
    const __innerMap__ = this.__getExistingInnerMap__(key);
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
    );
  }

  /**
   * @callback WeakFunctionMultiMap~ForEachCallback
   *
   * @param {object}               key            
   * @param {Function}             mapFunction    
   * @param {WeakFunctionMultiMap} __collection__ This collection.
   *
   */

  /**
   * The number of elements in a particular set.
   *
   * @param {object} key 
   *
   * @public
   */
  getSizeOfSet(key) {
    this.__requireValidMapKey__(key);
    const __innerMap__ = this.__getExistingInnerMap__(key);
    if (!__innerMap__)
      return 0;

    return __innerMap__.size;
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {object}   key         
   * @param {Function} mapFunction 
   *
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(key, mapFunction) {
    this.__requireValidKey__(key, mapFunction);
    const __innerMap__ = this.__getExistingInnerMap__(key);
    if (!__innerMap__)
      return false;

    // level 3: inner map to set
    {
      const __setKeyHash__ = this.__setHasher__.buildHash([mapFunction]);
      return __innerMap__.has(__setKeyHash__);
    }
  }

  /**
   * Report if the collection has any sets for a map.
   *
   * @param {object}   key         
   * @param {Function} mapFunction 
   *
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  hasSets(key) {
    this.__requireValidMapKey__(key);
    return Boolean(this.__getExistingInnerMap__(key));
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object}   key         
   * @param {Function} mapFunction 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */
  isValidKey(key, mapFunction) {
    return this.__isValidKey__(key, mapFunction);
  }

  /**
   * Return a new iterator for the sets of the collection in a map.
   *
   * @returns {Iterator<*>}
   * @public
   */
  valuesSet(key) {
    this.__requireValidMapKey__(key);
    const __innerMap__ = this.__getExistingInnerMap__(key);
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
   * @param {object} key 
   *
   * @private
   */
  __requireInnerMap__(key) {
    let __weakKeyMap__, __innerMap__;
    // level 1:  first weak argument to weak map key
    {
      if (!this.__root__.has(key)) {
        this.__root__.set(key, new WeakMap);
      }
      __weakKeyMap__ = this.__root__.get(key);
    }

    // level 2:  weak map key to inner map
    {
      const __mapKey__ = this.__mapKeyComposer__.getKey(
        [key], []
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
   * @param {object} key 
   *
   * @returns {WeakFunctionMultiMap~InnerMap}
   * @private
   */
  __getExistingInnerMap__(key) {
    let __weakKeyMap__;

    // level 1:  first weak argument to weak map key
    {
      __weakKeyMap__ = this.__root__.get(key);
      if (!__weakKeyMap__)
        return undefined;
    }

    // level 2:  weak map key to inner map
    {
      const __mapKey__ = this.__mapKeyComposer__.getKey(
        [key], []
      );

      return __weakKeyMap__.get(__mapKey__);
    }
  }

  /**
   * Throw if the key set is not valid.
   *
   * @param {object}   key         
   * @param {Function} mapFunction 
   *
   * @throws for an invalid key set.
   */
  __requireValidKey__(key, mapFunction) {
    if (!this.__isValidKey__(key, mapFunction))
      throw new Error("The ordered key set is not valid!");
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object}   key         
   * @param {Function} mapFunction 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @private
   */
  __isValidKey__(key, mapFunction) {
    return this.__isValidMapKey__(key) && this.__isValidSetKey__(mapFunction);
  }

  /**
   * Throw if the map key set is not valid.
   *
   * @param {object} key 
   *
   * @throws for an invalid key set.
   * @private
   */
  __requireValidMapKey__(key) {
    if (!this.__isValidMapKey__(key))
      throw new Error("The ordered map key set is not valid!");
  }

  /**
   * Determine if a set of map keys is valid.
   *
   * @param {object} key 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @private
   */
  __isValidMapKey__(key) {
    if (!this.__mapKeyComposer__.isValidForKey([key], []))
      return false;

    return true;
  }

  /**
   * Determine if a set of set keys is valid.
   *
   * @param {Function} mapFunction 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @private
   */
  __isValidSetKey__(mapFunction) {
    void(mapFunction);

    {
      if (typeof mapFunction !== "function")
        return false;
    }
    return true;
  }
}

Reflect.defineProperty(WeakFunctionMultiMap, Symbol.toStringTag, {
  value: "WeakFunctionMultiMap",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(WeakFunctionMultiMap);
Object.freeze(WeakFunctionMultiMap.prototype);
