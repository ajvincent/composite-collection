/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import WeakKeyComposer from "./WeakKey-WeakMap.mjs";


export default class WeakWeakSet {
  constructor() {
    /** @type {WeakKeyComposer} @const @private */
    this.__keyComposer__ = new WeakKeyComposer(["key1", "key2"], []);

    /**
     * @type {WeakSet<WeakKey>}
     * @const
     * @private
     */
    this.__weakKeySet__ = new WeakSet;


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
   * @param {object} key1 
   * @param {object} key2 
   *
   * @returns {WeakWeakSet} This collection.
   * @public
   */
  add(key1, key2) {
    this.__requireValidKey__(key1, key2);

    const __key__ = this.__keyComposer__.getKey([key1, key2], []);
    if (!__key__)
      return null;
    this.__weakKeySet__.add(__key__);

    return this;
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {object} key1 
   * @param {object} key2 
   *
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(key1, key2) {
    this.__requireValidKey__(key1, key2);

    if (!this.__keyComposer__.hasKey([key1, key2], []))
      return false;

    const __key__ = this.__keyComposer__.getKey([key1, key2], []);

    return this.__weakKeySet__.delete(__key__);
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} key1 
   * @param {object} key2 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */
  isValidKey(key1, key2) {
    return this.__isValidKey__(key1, key2);
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {object} key1 
   * @param {object} key2 
   *
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(key1, key2) {
    this.__requireValidKey__(key1, key2);

    if (!this.__keyComposer__.hasKey([key1, key2], []))
      return false;

    const __key__ = this.__keyComposer__.getKey([key1, key2], []);

    return this.__weakKeySet__.has(__key__);
  }

  /**
   * Throw if the key set is not valid.
   *
   * @param {object} key1 
   * @param {object} key2 
   *
   * @throws for an invalid key set.
   */
  __requireValidKey__(key1, key2) {
    if (!this.__isValidKey__(key1, key2))
      throw new Error("The ordered key set is not valid!");
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} key1 
   * @param {object} key2 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @private
   */
  __isValidKey__(key1, key2) {
    if (!this.__keyComposer__.isValidForKey([key1, key2], []))
      return false;

    return true;
  }
}

Reflect.defineProperty(WeakWeakSet, Symbol.toStringTag, {
  value: "WeakWeakSet",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(WeakWeakSet);
Object.freeze(WeakWeakSet.prototype);
