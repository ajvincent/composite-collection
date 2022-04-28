/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * @file
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 * Template: Weak/Set
 * @license MPL-2.0
 * @author Alexander J. Vincent <ajvincent@gmail.com>
 * @copyright © 2021-2022 Alexander J. Vincent
 */

import WeakKeyComposer from "./keys/Composite.mjs";

class WeakWeakSet {
  // eslint-disable-next-line jsdoc/require-property
  /** @typedef {object} WeakKey */

  /** @type {WeakKeyComposer} @constant */
  #keyComposer = new WeakKeyComposer(["key1", "key2"], []);

  /** @type {WeakSet<WeakKey>} @constant */
  #weakKeySet = new WeakSet;

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let [key1, key2] of iterable) {
        this.add(key1, key2);
      }
    }
  }

  /**
   * Add a key set to this collection.
   *
   * @param {object} key1 The first key.
   * @param {object} key2 The second key.
   * @returns {WeakWeakSet} This collection.
   * @public
   */
  add(key1, key2) {
    this.#requireValidKey(key1, key2);

    const __key__ = this.#keyComposer.getKey([key1, key2], []);
    if (!__key__)
      return null;

    this.#weakKeySet.add(__key__);
    return this;
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {object} key1 The first key.
   * @param {object} key2 The second key.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(key1, key2) {
    this.#requireValidKey(key1, key2);

    const __key__ = this.#keyComposer.getKeyIfExists([key1, key2], []);
    if (!__key__)
      return false;

    const __returnValue__ = this.#weakKeySet.delete(__key__);
    this.#keyComposer.deleteKey([key1, key2], []);
    return __returnValue__;
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {object} key1 The first key.
   * @param {object} key2 The second key.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(key1, key2) {
    this.#requireValidKey(key1, key2);

    const __key__ = this.#keyComposer.getKeyIfExists([key1, key2], []);

    return __key__ ? this.#weakKeySet.has(__key__) : false;
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} key1 The first key.
   * @param {object} key2 The second key.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */
  isValidKey(key1, key2) {
    return this.#isValidKey(key1, key2);
  }

  /**
   * Throw if the key set is not valid.
   *
   * @param {object} key1 The first key.
   * @param {object} key2 The second key.
   * @throws for an invalid key set.
   */
  #requireValidKey(key1, key2) {
    if (!this.#isValidKey(key1, key2))
      throw new Error("The ordered key set is not valid!");
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} key1 The first key.
   * @param {object} key2 The second key.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidKey(key1, key2) {
    if (!this.#keyComposer.isValidForKey([key1, key2], []))
      return false;

    return true;
  }

  [Symbol.toStringTag] = "WeakWeakSet";
}

Object.freeze(WeakWeakSet);
Object.freeze(WeakWeakSet.prototype);

export default WeakWeakSet;
