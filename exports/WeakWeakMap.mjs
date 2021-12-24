/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import WeakKeyComposer from "./WeakKey-WeakMap.mjs";

export default class WeakWeakMap {
  /**
   * @type {WeakKeyComposer}
   * @const
   */
  #keyComposer = new WeakKeyComposer(["key1", "key2"], []);

  /**
   * The root map holding weak composite keys and values.
   *
   * @type {WeakMap<object, WeakMap<WeakKey, *>>}
   *
   * @const
   */
  #root = new WeakMap;

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.set(...entry);
      }
    }
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
    this.#requireValidKey(key1, key2);
    const __keyMap__ = this.#root.get(key1);
    if (!__keyMap__)
      return false;

    if (!this.#keyComposer.hasKey([key1, key2], []))
      return false;

    const __key__ = this.#keyComposer.getKey([key1, key2], []);
    this.#keyComposer.deleteKey([key1, key2], []);
    return __keyMap__.delete(__key__);
  }

  /**
   * Get a value for a key set.
   *
   * @param {object} key1 
   * @param {object} key2 
   *
   * @returns {*?} The value.  Undefined if it isn't in the collection.
   * @public
   */
  get(key1, key2) {
    this.#requireValidKey(key1, key2);
    const __keyMap__ = this.#root.get(key1);
    if (!__keyMap__)
      return undefined;

    if (!this.#keyComposer.hasKey([key1, key2], []))
      return undefined;

    const __key__ = this.#keyComposer.getKey([key1, key2], []);
    if (!__key__)
      return undefined;
    return __keyMap__.get(__key__);
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
    return this.#isValidKey(key1, key2);
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
    this.#requireValidKey(key1, key2);
    const __keyMap__ = this.#root.get(key1);
    if (!__keyMap__)
      return false;

    if (!this.#keyComposer.hasKey([key1, key2], []))
      return false;

    const __key__ = this.#keyComposer.getKey([key1, key2], []);
    if (!__key__)
      return false;
    return __keyMap__.has(__key__);
  }

  /**
   * Set a value for a key set.
   *
   * @param {object} key1  
   * @param {object} key2  
   * @param {*}      value The value.
   *
   * @returns {WeakWeakMap} This collection.
   * @public
   */
  set(key1, key2, value) {
    this.#requireValidKey(key1, key2);

    if (!this.#root.has(key1))
      this.#root.set(key1, new WeakMap);

    const __keyMap__ = this.#root.get(key1);
    const __key__ = this.#keyComposer.getKey([key1, key2], []);
    __keyMap__.set(__key__, value);
    return this;
  }

  /**
   * Throw if the key set is not valid.
   *
   * @param {object} key1 
   * @param {object} key2 
   *
   * @throws for an invalid key set.
   */
  #requireValidKey(key1, key2) {
    if (!this.#isValidKey(key1, key2))
      throw new Error("The ordered key set is not valid!");
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} key1 
   * @param {object} key2 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidKey(key1, key2) {
    if (!this.#keyComposer.isValidForKey([key1, key2], []))
      return false;

    return true;
  }

}

Reflect.defineProperty(WeakWeakMap, Symbol.toStringTag, {
  value: "WeakWeakMap",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(WeakWeakMap);
Object.freeze(WeakWeakMap.prototype);
