/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import KeyHasher from "./keys/Hasher.mjs";
import WeakKeyComposer from "./keys/Composite.mjs";

/** @typedef {Map<hash, *[]>} WeakFunctionMultiMap~InnerMap */

class WeakFunctionMultiMap {
  /** @typedef {string} hash */
  /** @typedef {object} WeakKey */

  /**
   * @type {WeakMap<WeakKey, WeakFunctionMultiMap~InnerMap>}
   * @constant
   * @note This is two levels. The first level is the WeakKey.  The second level is the strong set.
   */
  #root = new WeakMap();

  /** @type {WeakKeyComposer} @constant */
  #mapKeyComposer = new WeakKeyComposer(
    ["key"], []
  );

  /** @type {KeyHasher} @constant */
  #setHasher = new KeyHasher(["mapFunction"]);

  constructor() {
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
   * @param {object}   key         The map key.
   * @param {Function} mapFunction The function.
   * @returns {WeakFunctionMultiMap} This collection.
   * @public
   */
  add(key, mapFunction) {
    this.#requireValidKey(key, mapFunction);
    const __innerMap__ = this.#requireInnerMap(key);

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHash(mapFunction);
    if (!__innerMap__.has(__setKeyHash__)) {
      __innerMap__.set(__setKeyHash__, [mapFunction]);
    }

    return this;
  }

  /**
   * Add several sets to a map in this collection.
   *
   * @param {object} key      The map key.
   * @param {Set[]}  __sets__ The sets to add.
   * @returns {WeakFunctionMultiMap} This collection.
   * @public
   */
  addSets(key, __sets__) {
    this.#requireValidMapKey(key);
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== 1) {
        throw new Error(`Set at index ${__index__} doesn't have exactly 1 set argument!`);
      }
      this.#requireValidKey(key, ...__set__);
      return __set__;
    });

    const __innerMap__ = this.#requireInnerMap(key);

    // level 2: inner map to set
    __array__.forEach(__set__ => {
      const __setKeyHash__ = this.#setHasher.getHash(...__set__);
      if (!__innerMap__.has(__setKeyHash__)) {
        __innerMap__.set(__setKeyHash__, __set__);
      }
    });

    return this;
  }

  /**
   * Clear all sets from the collection for a given map keyset.
   *
   * @param {object} key The map key.
   * @public
   */
  clearSets(key) {
    this.#requireValidMapKey(key);
    const __innerMap__ = this.#getExistingInnerMap(key);
    if (!__innerMap__)
      return;

    __innerMap__.clear();
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {object}   key         The map key.
   * @param {Function} mapFunction The function.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(key, mapFunction) {
    this.#requireValidKey(key, mapFunction);
    const __innerMap__ = this.#getExistingInnerMap(key);
    if (!__innerMap__)
      return false;

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHashIfExists(mapFunction);
    if (!__setKeyHash__)
      return false;
    const __returnValue__ = __innerMap__.delete(__setKeyHash__);

    if (__innerMap__.size === 0) {
      this.deleteSets(key);
    }

    return __returnValue__;
  }

  /**
   * Delete all sets from the collection by the given map sequence.
   *
   * @param {object} key The map key.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  deleteSets(key) {
    this.#requireValidMapKey(key);

    const __mapKey__ = this.#mapKeyComposer.getKeyIfExists(
      [key], []
    );

    return __mapKey__ ? this.#root.delete(__mapKey__) : false;
  }

  /**
   * Iterate over the keys under a map in this collection.
   *
   * @param {WeakFunctionMultiMap~ForEachCallback} callback A function to invoke for each iteration.
   * @public
   */
  forEachSet(key, __callback__, __thisArg__) {
    this.#requireValidMapKey(key);
    const __innerMap__ = this.#getExistingInnerMap(key);
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, [key, ...__keySet__, this])
    );
  }

  /**
   * @callback WeakFunctionMultiMap~ForEachCallback
   *
   * @param {object}               key            The map key.
   * @param {Function}             mapFunction    The function.
   * @param {WeakFunctionMultiMap} __collection__ This collection.
   */

  /**
   * Get the size of a particular set.
   *
   * @param {object} key The map key.
   * @returns {number} The set size.
   * @public
   */
  getSizeOfSet(key) {
    this.#requireValidMapKey(key);
    const __innerMap__ = this.#getExistingInnerMap(key);
    if (!__innerMap__)
      return 0;

    return __innerMap__.size;
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {object}   key         The map key.
   * @param {Function} mapFunction The function.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(key, mapFunction) {
    this.#requireValidKey(key, mapFunction);
    const __innerMap__ = this.#getExistingInnerMap(key);
    if (!__innerMap__)
      return false;

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHashIfExists(mapFunction);
    return __setKeyHash__ ? __innerMap__.has(__setKeyHash__) : false;
  }

  /**
   * Report if the collection has any sets for a map.
   *
   * @param {object}   key         The map key.
   * @param {Function} mapFunction The function.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  hasSets(key) {
    this.#requireValidMapKey(key);
    return Boolean(this.#getExistingInnerMap(key));
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object}   key         The map key.
   * @param {Function} mapFunction The function.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */
  isValidKey(key, mapFunction) {
    return this.#isValidKey(key, mapFunction);
  }

  /**
   * Yield the sets of the collection in a map.
   *
   * @yields {*} The sets.
   * @public
   */
  * valuesSet(key) {
    this.#requireValidMapKey(key);

    const __innerMap__ = this.#getExistingInnerMap(key);
    if (!__innerMap__)
      return;

    const __outerIter__ = __innerMap__.values();
    for (let __value__ of __outerIter__)
      yield [key, ...__value__];
  }

  /**
   * Require an inner collection exist for the given map keys.
   *
   * @param {object} key The map key.
   * @returns {WeakFunctionMultiMap~InnerMap} The inner collection.
   */
  #requireInnerMap(key) {
    const __mapKey__ = this.#mapKeyComposer.getKey(
      [key], []
    );
    if (!this.#root.has(__mapKey__)) {
      this.#root.set(__mapKey__, new Map);
    }
    return this.#root.get(__mapKey__);
  }

  /**
   * Get an existing inner collection for the given map keys.
   *
   * @param {object} key The map key.
   * @returns {WeakFunctionMultiMap~InnerMap?} The inner collection.
   */
  #getExistingInnerMap(key) {
    const __mapKey__ = this.#mapKeyComposer.getKeyIfExists(
      [key], []
    );

    return __mapKey__ ? this.#root.get(__mapKey__) : undefined;
  }

  /**
   * Throw if the key set is not valid.
   *
   * @param {object}   key         The map key.
   * @param {Function} mapFunction The function.
   * @throws for an invalid key set.
   */
  #requireValidKey(key, mapFunction) {
    if (!this.#isValidKey(key, mapFunction))
      throw new Error("The ordered key set is not valid!");
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object}   key         The map key.
   * @param {Function} mapFunction The function.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidKey(key, mapFunction) {
    return this.#isValidMapKey(key) && this.#isValidSetKey(mapFunction);
  }

  /**
   * Throw if the map key set is not valid.
   *
   * @param {object} key The map key.
   * @throws for an invalid key set.
   */
  #requireValidMapKey(key) {
    if (!this.#isValidMapKey(key))
      throw new Error("The ordered map key set is not valid!");
  }

  /**
   * Determine if a set of map keys is valid.
   *
   * @param {object} key The map key.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidMapKey(key) {
    if (!this.#mapKeyComposer.isValidForKey([key], []))
      return false;

    return true;
  }

  /**
   * Determine if a set of set keys is valid.
   *
   * @param {Function} mapFunction The function.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidSetKey(mapFunction) {
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

export default WeakFunctionMultiMap;
