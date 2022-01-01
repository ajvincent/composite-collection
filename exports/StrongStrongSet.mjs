/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import KeyHasher from "./keys/Hasher.mjs";

export default class StrongStrongSet {
  /**
   * Storage of the Set's contents for quick iteration in .values().  The values are always frozen arrays.
   *
   * @type {Map<hash, *[]>}
   *
   * @constant
   */
  #root = new Map;

  /** @type {KeyHasher} @constant */
  #hasher = new KeyHasher(["key1", "key2"]);

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
   * @public
   * @constant
   */
  get size() {
    return this.#root.size;
  }

  /**
   * Add a key set to this collection.
   *
   * @param {*} key1 
   * @param {*} key2 
   *
   * @returns {StrongStrongSet} This collection.
   * @public
   */
  add(key1, key2) {
    const hash = this.#hasher.getHash(key1, key2);
    this.#root.set(hash, Object.freeze([key1, key2]));
    return this;
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
   * @param {*} key1 
   * @param {*} key2 
   *
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(key1, key2) {
    if (!this.#hasher.hasHash(key1, key2))
      return false;
    const hash = this.#hasher.getHash(key1, key2);
    return this.#root.delete(hash);
  }

  /**
   * Iterate over the keys.
   *
   * @param {StrongStrongSet~ForEachCallback} callback A function to invoke for each iteration.
   *
   * @public
   */
  forEach(__callback__, __thisArg__) {
    this.#root.forEach(valueSet => {
      __callback__.apply(__thisArg__, valueSet.concat(this));
    });
  }

  /**
   * @callback StrongStrongSet~ForEachCallback
   *
   * @param {*}               key1           
   * @param {*}               key2           
   * @param {StrongStrongSet} __collection__ This collection.
   */

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {*} key1 
   * @param {*} key2 
   *
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(key1, key2) {
    if (!this.#hasher.hasHash(key1, key2))
      return false;
    const hash = this.#hasher.getHash(key1, key2);
    return this.#root.has(hash);
  }

  /**
   * Return a new iterator for the values of the collection.
   *
   * @returns {Iterator<*>}
   * @public
   */
  values() {
    return this.#root.values();
  }

}

StrongStrongSet[Symbol.iterator] = function() {
  return this.values();
}

Reflect.defineProperty(StrongStrongSet, Symbol.toStringTag, {
  value: "StrongStrongSet",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(StrongStrongSet);
Object.freeze(StrongStrongSet.prototype);
