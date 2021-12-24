/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import WeakKeyComposer from "./WeakKey-WeakMap.mjs";

export default class WeakStrongSet {
  /** @type {WeakKeyComposer} @const */
  #keyComposer = new WeakKeyComposer(["weakKey"], ["strongKey"]);

  /**
   * @type {WeakMap<WeakKey, Set<*>>}
   * @const
   */
  #weakKeyToStrongKeys = new WeakMap;

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
   * @param {object} weakKey   
   * @param {*}      strongKey 
   *
   * @returns {WeakStrongSet} This collection.
   * @public
   */
  add(weakKey, strongKey) {
    this.#requireValidKey(weakKey, strongKey);

    const __key__ = this.#keyComposer.getKey([weakKey], [strongKey]);
    if (!__key__)
      return null;
    if (!this.#weakKeyToStrongKeys.has(__key__))
      this.#weakKeyToStrongKeys.set(__key__, new Set([strongKey]));

    return this;
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {object} weakKey   
   * @param {*}      strongKey 
   *
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(weakKey, strongKey) {
    this.#requireValidKey(weakKey, strongKey);

    if (!this.#keyComposer.hasKey([weakKey], [strongKey]))
      return false;

    const __key__ = this.#keyComposer.getKey([weakKey], [strongKey]);

    const __returnValue__ = this.#weakKeyToStrongKeys.delete(__key__);
    if (__returnValue__)
      this.#keyComposer.deleteKey([weakKey], [strongKey]);

    return __returnValue__;
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} weakKey   
   * @param {*}      strongKey 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */
  isValidKey(weakKey, strongKey) {
    return this.#isValidKey(weakKey, strongKey);
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {object} weakKey   
   * @param {*}      strongKey 
   *
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(weakKey, strongKey) {
    this.#requireValidKey(weakKey, strongKey);

    if (!this.#keyComposer.hasKey([weakKey], [strongKey]))
      return false;

    const __key__ = this.#keyComposer.getKey([weakKey], [strongKey]);

    return this.#weakKeyToStrongKeys.has(__key__);
  }

  /**
   * Throw if the key set is not valid.
   *
   * @param {object} weakKey   
   * @param {*}      strongKey 
   *
   * @throws for an invalid key set.
   */
  #requireValidKey(weakKey, strongKey) {
    if (!this.#isValidKey(weakKey, strongKey))
      throw new Error("The ordered key set is not valid!");
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} weakKey   
   * @param {*}      strongKey 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidKey(weakKey, strongKey) {
    if (!this.#keyComposer.isValidForKey([weakKey], [strongKey]))
      return false;

    return true;
  }
}

Reflect.defineProperty(WeakStrongSet, Symbol.toStringTag, {
  value: "WeakStrongSet",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(WeakStrongSet);
Object.freeze(WeakStrongSet.prototype);
