/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import WeakKeyComposer from "./keys/Composite.mjs";

class WeakStrongSet {
  // eslint-disable-next-line jsdoc/require-property
  /** @typedef {object} WeakKey */

  /** @type {WeakKeyComposer} @constant */
  #keyComposer = new WeakKeyComposer(["weakKey"], ["strongKey"]);

  /** @type {WeakSet<WeakKey>} @constant */
  #weakKeySet = new WeakSet;

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
   * @param {object} weakKey   The weakly held key.
   * @param {*}      strongKey The strongly held key.
   * @returns {WeakStrongSet} This collection.
   * @public
   */
  add(weakKey, strongKey) {
    this.#requireValidKey(weakKey, strongKey);

    const __key__ = this.#keyComposer.getKey([weakKey], [strongKey]);
    if (!__key__)
      return null;

    this.#weakKeySet.add(__key__);
    return this;
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {object} weakKey   The weakly held key.
   * @param {*}      strongKey The strongly held key.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(weakKey, strongKey) {
    this.#requireValidKey(weakKey, strongKey);

    const __key__ = this.#keyComposer.getKeyIfExists([weakKey], [strongKey]);
    if (!__key__)
      return false;

    const __returnValue__ = this.#weakKeySet.delete(__key__);
    this.#keyComposer.deleteKey([weakKey], [strongKey]);
    return __returnValue__;
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {object} weakKey   The weakly held key.
   * @param {*}      strongKey The strongly held key.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(weakKey, strongKey) {
    this.#requireValidKey(weakKey, strongKey);

    const __key__ = this.#keyComposer.getKeyIfExists([weakKey], [strongKey]);

    return __key__ ? this.#weakKeySet.has(__key__) : false;
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} weakKey   The weakly held key.
   * @param {*}      strongKey The strongly held key.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */
  isValidKey(weakKey, strongKey) {
    return this.#isValidKey(weakKey, strongKey);
  }

  /**
   * Throw if the key set is not valid.
   *
   * @param {object} weakKey   The weakly held key.
   * @param {*}      strongKey The strongly held key.
   * @throws for an invalid key set.
   */
  #requireValidKey(weakKey, strongKey) {
    if (!this.#isValidKey(weakKey, strongKey))
      throw new Error("The ordered key set is not valid!");
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} weakKey   The weakly held key.
   * @param {*}      strongKey The strongly held key.
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

export default WeakStrongSet;
