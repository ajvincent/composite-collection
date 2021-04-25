/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import KeyHasher from "./KeyHasher.mjs";

export default class StrongStrongSet {
  constructor() {
    /**
     * Storage of the Set's contents for quick iteration in .values().  The values are always frozen arrays.
     *
     * @type {Map<hash, *[]>}
     *
     * @private
     * @const
     */
    this.__root__ = new Map;

    /**
     * @type {KeyHasher}
     * @private
     * @const
     */
    this.__hasher__ = new KeyHasher(["key1", "key2"]);
  }

  /**
   * The number of elements in this collection.
   *
   * @public
   * @const
   */
  get size() {
    return this.__root__.size;
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
    const hash = this.__hasher__.buildHash([key1, key2]);
    this.__root__.set(hash, Object.freeze([key1, key2]));
    return this;
  }

  /**
   * Clear the collection.
   *
   * @public
   */
  clear() {
    this.__root__.clear();
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
    const hash = this.__hasher__.buildHash([key1, key2]);
    return this.__root__.delete(hash);
  }

  /**
   * Iterate over the keys.
   *
   * @param {StrongStrongSet~ForEachCallback} callback A function to invoke for each iteration.
   *
   * @public
   */
  forEach(__callback__, __thisArg__) {
    this.__root__.forEach(valueSet => {
      __callback__.apply(__thisArg__, valueSet.concat(this));
    });
  }

  /**
   * @callback StrongStrongSet~ForEachCallback
   *
   * @param {*}               key1           
   * @param {*}               key2           
   * @param {StrongStrongSet} __collection__ This collection.
   *
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
    const hash = this.__hasher__.buildHash([key1, key2]);
    return this.__root__.has(hash);
  }

  /**
   * Return a new iterator for the values of the collection.
   *
   * @returns {Iterator<*>}
   * @public
   */
  values() {
    return this.__root__.values();
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
