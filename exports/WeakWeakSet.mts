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

class WeakWeakSet<
  __SK0__ extends object,
  __SK1__ extends object
>
{
  // eslint-disable-next-line jsdoc/require-property
  /** @typedef {object} WeakKey */

  /** @type {WeakKeyComposer} @constant */
  #keyComposer = new WeakKeyComposer(["key1","key2"], []);

  /** @type {WeakSet<WeakKey>} @constant */
  #weakKeySet = new WeakSet;

  constructor(iterable? : [__SK0__,__SK1__][]) {
    if (iterable) {
      for (const [key1, key2] of iterable) {
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
  add(key1: __SK0__, key2: __SK1__) : this
  {
    this.#requireValidKey(key1, key2);

    const __key__ = this.#keyComposer.getKey([key1, key2], []);

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
  delete(key1: __SK0__, key2: __SK1__) : boolean
  {
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
  has(key1: __SK0__, key2: __SK1__) : boolean
  {
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
  isValidKey(key1: __SK0__, key2: __SK1__) : boolean
  {
    return this.#isValidKey(key1, key2);
  }

  /**
   * Throw if the key set is not valid.
   *
   * @param {object} key1 The first key.
   * @param {object} key2 The second key.
   * @throws for an invalid key set.
   */
  #requireValidKey(key1: __SK0__, key2: __SK1__) : void
  {
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
  #isValidKey(key1: __SK0__, key2: __SK1__) : boolean
  {
    if (!this.#keyComposer.isValidForKey([key1, key2], []))
      return false;

    return true;
  }

  [Symbol.toStringTag] = "WeakWeakSet";
}

Object.freeze(WeakWeakSet);
Object.freeze(WeakWeakSet.prototype);

export type ReadonlyWeakWeakSet<
  __SK0__ extends object,
  __SK1__ extends object
> =
  Pick<
    WeakWeakSet<__SK0__,__SK1__>,
    "has" | "isValidKey"
  >

export default WeakWeakSet;
