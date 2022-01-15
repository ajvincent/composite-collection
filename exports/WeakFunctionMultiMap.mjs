/**
 * @file
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

class WeakFunctionMultiMap {
  /**
   * @type {WeakMap<object, Set<*>>}
   * @constant
   * This is two levels. The first level is the map key.
   * The second level is the strong set.
   */
  #root = new WeakMap();

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
    const __innerSet__ = this.#requireInnerSet(key);

    __innerSet__.add(mapFunction);
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

    const __innerSet__ = this.#requireInnerSet(key);

    // level 2: inner map to set
    __array__.forEach(__set__ => __innerSet__.add(__set__[0]));

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
    const __innerSet__ = this.#root.get(key);
    if (!__innerSet__)
      return;

    __innerSet__.clear();
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
    const __innerSet__ = this.#root.get(key);
    if (!__innerSet__)
      return false;

    // level 2: inner map to set
    const __returnValue__ = __innerSet__.delete(mapFunction);

    if (__innerSet__.size === 0) {
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
    return this.#root.delete(key);
  }

  /**
   * Iterate over the keys under a map in this collection.
   *
   * @param {object}                               key          The map key.
   * @param {WeakFunctionMultiMap~ForEachCallback} __callback__ A function to invoke for each iteration.
   * @param {object}                               __thisArg__  Value to use as this when executing callback.
   * @public
   */
  forEachSet(key, __callback__, __thisArg__) {
    this.#requireValidMapKey(key);
    const __innerSet__ = this.#root.get(key);
    if (!__innerSet__)
      return;

    __innerSet__.forEach(
      __element__ => __callback__.apply(__thisArg__, [key, __element__, this])
    );
  }

  /**
   * An user-provided callback to .forEach().
   *
   * @callback WeakFunctionMultiMap~ForEachCallback
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
    const __innerSet__ = this.#root.get(key);
    return __innerSet__?.size || 0;
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
    const __innerSet__ = this.#root.get(key);
    if (!__innerSet__)
      return false;

    return __innerSet__.has(mapFunction);
  }

  /**
   * Report if the collection has any sets for a map.
   *
   * @param {object} key The map key.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  hasSets(key) {
    this.#requireValidMapKey(key);
    return this.#root.has(key);
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
   * @param {object} key The map key.
   * @yields {*} The sets.
   * @public
   */
  * valuesSet(key) {
    this.#requireValidMapKey(key);

    const __innerSet__ = this.#root.get(key);
    if (!__innerSet__)
      return;

    const __outerIter__ = __innerSet__.values();
    for (let __value__ of __outerIter__)
      yield [key, __value__];
  }

  /**
   * Require an inner collection exist for the given map keys.
   *
   * @param {object} key The map key.
   * @returns {WeakFunctionMultiMap~InnerMap} The inner collection.
   */
  #requireInnerSet(key) {
    if (!this.#root.has(key)) {
      this.#root.set(key, new Set);
    }
    return this.#root.get(key);
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
    if (Object(key) !== key)
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
