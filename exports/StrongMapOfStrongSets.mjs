/**
 * @file
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

class StrongMapOfStrongSets {
  /** @typedef {string} hash */

  /** @type {Map<*, Map<*, *[]>>} @constant */
  #outerMap = new Map();

  /** @type {number} */
  #sizeOfAll = 0;

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.add(...entry);
      }
    }
  }

  /**
   * The number of elements in this collection.
   *
   * @returns {number} The element count.
   * @public
   * @constant
   */
  get size() {
    return this.#sizeOfAll;
  }

  /**
   * Get the size of a particular set.
   *
   * @param {*} mapKey The map key.
   * @returns {number} The set size.
   * @public
   */
  getSizeOfSet(mapKey) {
    const __innerMap__ = this.#outerMap.get(mapKey)
    return __innerMap__?.size || 0;
  }

  /**
   * The number of maps in this collection.
   *
   * @returns {number} The map count.
   * @public
   * @constant
   */
  get mapSize() {
    return this.#outerMap.size;
  }

  /**
   * Add a key set to this collection.
   *
   * @param {*} mapKey The map key.
   * @param {*} setKey The set key.
   * @returns {StrongMapOfStrongSets} This collection.
   * @public
   */
  add(mapKey, setKey) {
    if (!this.#outerMap.has(mapKey))
      this.#outerMap.set(mapKey, new Map);

    const __innerMap__ = this.#outerMap.get(mapKey);

    if (!__innerMap__.has(setKey)) {
      __innerMap__.set(setKey, Object.freeze([mapKey, setKey]));
      this.#sizeOfAll++;
    }

    return this;
  }

  /**
   * Add several sets to a map in this collection.
   *
   * @param {*}     mapKey   The map key.
   * @param {Set[]} __sets__ The sets to add.
   * @returns {StrongMapOfStrongSets} This collection.
   * @public
   */
  addSets(mapKey, __sets__) {
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== 1) {
        throw new Error(`Set at index ${__index__} doesn't have exactly 1 argument!`);
      }

      return __set__;
    });

    if (!this.#outerMap.has(mapKey))
      this.#outerMap.set(mapKey, new Map);

    const __innerMap__ = this.#outerMap.get(mapKey);
    const __mapArgs__ = [mapKey];

    __array__.forEach(__set__ => {
      if (!__innerMap__.has(__set__[0])) {
        __innerMap__.set(__set__[0], Object.freeze(__mapArgs__.concat(__set__)));
        this.#sizeOfAll++;
      }
    });

    return this;
  }

  /**
   * Clear the collection.
   *
   * @public
   */
  clear() {
    this.#outerMap.clear();
    this.#sizeOfAll = 0;
  }

  /**
   * Clear all sets from the collection for a given map keyset.
   *
   * @param {*} mapKey The map key.
   * @public
   */
  clearSets(mapKey) {
    const __innerMap__ = this.#outerMap.get(mapKey)
    if (!__innerMap__)
      return;

    this.#sizeOfAll -= __innerMap__.size;
    __innerMap__.clear();
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {*} mapKey The map key.
   * @param {*} setKey The set key.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(mapKey, setKey) {
    const __innerMap__ = this.#outerMap.get(mapKey)
    if (!__innerMap__)
      return false;

    if (!__innerMap__.has(setKey))
      return false;

    __innerMap__.delete(setKey);
    this.#sizeOfAll--;

    if (__innerMap__.size === 0) {
      this.#outerMap.delete(mapKey);
    }

    return true;
  }

  /**
   * Delete all sets from the collection by the given map sequence.
   *
   * @param {*} mapKey The map key.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  deleteSets(mapKey) {
    const __innerMap__ = this.#outerMap.get(mapKey)
    if (!__innerMap__)
      return false;

    this.#outerMap.delete(mapKey);
    this.#sizeOfAll -= __innerMap__.size;
    return true;
  }

  /**
   * Iterate over the keys.
   *
   * @param {StrongMapOfStrongSets~ForEachCallback} __callback__ A function to invoke for each iteration.
   * @param {object}                                __thisArg__  Value to use as this when executing callback.
   * @public
   */
  forEach(__callback__, __thisArg__) {
    this.#outerMap.forEach(
      __innerMap__ => __innerMap__.forEach(
        __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
      )
    );
  }

  /**
   * Iterate over the keys under a map in this collection.
   *
   * @param {*}                                     mapKey       The map key.
   * @param {StrongMapOfStrongSets~ForEachCallback} __callback__ A function to invoke for each iteration.
   * @param {object}                                __thisArg__  Value to use as this when executing callback.
   * @public
   */
  forEachSet(mapKey, __callback__, __thisArg__) {
    const __innerMap__ = this.#outerMap.get(mapKey)
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
    );
  }

  /**
   * An user-provided callback to .forEach().
   *
   * @callback StrongMapOfStrongSets~ForEachCallback
   * @param {*}                     mapKey         The map key.
   * @param {*}                     setKey         The set key.
   * @param {StrongMapOfStrongSets} __collection__ This collection.
   */

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {*} mapKey The map key.
   * @param {*} setKey The set key.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(mapKey, setKey) {
    const __innerMap__ = this.#outerMap.get(mapKey)
    if (!__innerMap__)
      return false;

    return __innerMap__.has(setKey);
  }

  /**
   * Report if the collection has any sets for a map.
   *
   * @param {*} mapKey The map key.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  hasSets(mapKey) {
    const __innerMap__ = this.#outerMap.get(mapKey)
    return Boolean(__innerMap__);
  }

  /**
   * Yield the values of the collection.
   *
   * @yields {*} The value.
   * @public
   */
  * values() {
    const __outerIter__ = this.#outerMap.values();

    for (let __innerMap__ of __outerIter__) {
      for (let __value__ of __innerMap__.values())
        yield __value__;
    }
  }

  /**
   * Yield the sets of the collection in a map.
   *
   * @param {*} mapKey The map key.
   * @yields {*} The sets.
   * @public
   */
  * valuesSet(mapKey) {
    const __innerMap__ = this.#outerMap.get(mapKey)
    if (!__innerMap__)
      return;

    for (let __value__ of __innerMap__.values())
      yield __value__;
  }

}

StrongMapOfStrongSets[Symbol.iterator] = function() {
  return this.values();
}

Reflect.defineProperty(StrongMapOfStrongSets, Symbol.toStringTag, {
  value: "StrongMapOfStrongSets",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(StrongMapOfStrongSets);
Object.freeze(StrongMapOfStrongSets.prototype);

export default StrongMapOfStrongSets;
