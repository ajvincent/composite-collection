/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import KeyHasher from "./keys/Hasher.mjs";

class StrongStrongMap {
  /**
   * @typedef StrongStrongMap~valueAndKeySet
   * @property {*}   value  The actual value we store.
   * @property {*[]} keySet The set of keys we hashed.
   */

  /**
   * The root map holding keys and values.
   *
   * @type {Map<string, StrongStrongMap~valueAndKeySet>}
   * @constant
   */
  #root = new Map;

  /**
   * @type {KeyHasher}
   * @constant
   */
  #hasher = new KeyHasher(["key1", "key2"]);

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.set(...entry);
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
    return this.#root.size;
  }

  /**
   * Clear the collection.
   *
   * @public
   */
  clear() {
    this.#root.clear();
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {*} key1 The first key.
   * @param {*} key2 The second key.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(key1, key2) {
    const __hash__ = this.#hasher.getHashIfExists(key1, key2);
    return __hash__ ? this.#root.delete(__hash__) : false;
  }

  /**
   * Yield the key-value tuples of the collection.
   *
   * @yields {*[]} The keys and values.
   * @public
   */
  * entries() {
    for (let valueAndKeySet of this.#root.values())
      yield valueAndKeySet.keySet.concat(valueAndKeySet.value);
  }

  /**
   * Iterate over the keys and values.
   *
   * @param {StrongStrongMap~ForEachCallback} callback A function to invoke for each iteration.
   * @param {object}                          thisArg  Value to use as this when executing callback.
   * @public
   */
  forEach(callback, thisArg) {
    this.#root.forEach((valueAndKeySet) => {
      const args = valueAndKeySet.keySet.concat(this);
      args.unshift(valueAndKeySet.value);
      callback.apply(thisArg, [...args]);
    });
  }

  /**
   * An user-provided callback to .forEach().
   *
   * @callback StrongStrongMap~ForEachCallback
   * @param {*}               value          The value.
   * @param {*}               key1           The first key.
   * @param {*}               key2           The second key.
   * @param {StrongStrongMap} __collection__ This collection.
   */

  /**
   * Get a value for a key set.
   *
   * @param {*} key1 The first key.
   * @param {*} key2 The second key.
   * @returns {*?} The value.  Undefined if it isn't in the collection.
   * @public
   */
  get(key1, key2) {
    const __hash__ = this.#hasher.getHashIfExists(key1, key2);
    if (!__hash__)
      return undefined;

    const valueAndKeySet = this.#root.get(__hash__);
    return valueAndKeySet?.value;
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {*} key1 The first key.
   * @param {*} key2 The second key.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(key1, key2) {
    const __hash__ = this.#hasher.getHashIfExists(key1, key2);
    return __hash__ ? this.#root.has(__hash__) : false;
  }

  /**
   * Yield the key sets of the collection.
   *
   * @yields {*[]} The key sets.
   * @public
   */
  * keys() {
    for (let valueAndKeySet of this.#root.values())
      yield valueAndKeySet.keySet.slice();
  }

  /**
   * Set a value for a key set.
   *
   * @param {*} key1  The first key.
   * @param {*} key2  The second key.
   * @param {*} value The value.
   * @returns {StrongStrongMap} This collection.
   * @public
   */
  set(key1, key2, value) {

    const __hash__ = this.#hasher.getHash(key1, key2);
    const __keySet__ = [key1, key2];
    Object.freeze(__keySet__);
    this.#root.set(__hash__, {
      value,
      keySet: __keySet__
    });

    return this;
  }

  /**
   * Yield the values of the collection.
   *
   * @yields {*} The value.
   * @public
   */
  * values() {
    for (let valueAndKeySet of this.#root.values())
      yield valueAndKeySet.value;
  }

}

StrongStrongMap[Symbol.iterator] = function() {
  return this.entries();
}

Reflect.defineProperty(StrongStrongMap, Symbol.toStringTag, {
  value: "StrongStrongMap",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(StrongStrongMap);
Object.freeze(StrongStrongMap.prototype);

export default StrongStrongMap;
