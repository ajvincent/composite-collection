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
 * Template: Weak/Map
 * @license MPL-2.0
 * @author Alexander J. Vincent <ajvincent@gmail.com>
 * @copyright © 2021-2022 Alexander J. Vincent
 */

import WeakKeyComposer from "./keys/Composite.mjs";
declare abstract class WeakKey {}

class WeakWeakMap<
  __MK0__ extends object,
  __MK1__ extends object,
  __V__
>
{
  // eslint-disable-next-line jsdoc/require-property
  /** @typedef {object} WeakKey */

  /** @type {WeakKeyComposer} @constant */
  #keyComposer = new WeakKeyComposer(["key1","key2"], []);

  /**
   * The root map holding weak composite keys and values.
   *
   * @type {WeakMap<WeakKey, *>}
   * @constant
   */
  #root: WeakMap<WeakKey, __V__> = new WeakMap;

  constructor(iterable?: [__MK0__, __MK1__, __V__][])
  {
    if (iterable) {
      for (const [key1, key2, value] of iterable) {
        this.set(key1, key2, value);
      }
    }
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {object} key1 The first key.
   * @param {object} key2 The second key.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(key1: __MK0__, key2: __MK1__) : boolean
  {
    this.#requireValidKey(key1, key2);
    const __key__ = this.#keyComposer.getKeyIfExists([key1, key2], []);
    if (!__key__)
      return false;

    this.#keyComposer.deleteKey([key1, key2], []);
    return this.#root.delete(__key__);
  }

  /**
   * Get a value for a key set.
   *
   * @param {object} key1 The first key.
   * @param {object} key2 The second key.
   * @returns {*?} The value.  Undefined if it isn't in the collection.
   * @public
   */
  get(key1: __MK0__, key2: __MK1__) : __V__ | undefined
  {
    this.#requireValidKey(key1, key2);
    const __key__ = this.#keyComposer.getKeyIfExists([key1, key2], []);
    return __key__ ? this.#root.get(__key__) : undefined;
  }

  /**
   * Provide a default value for .getDefault().
   *
   * @callback __WeakWeakMap_GetDefaultCallback__
   * @returns {*} The value.
   */

  /**
   * Guarantee a value for a key set.
   *
   * @param {object}                             key1        The first key.
   * @param {object}                             key2        The second key.
   * @param {__WeakWeakMap_GetDefaultCallback__} __default__ A function to provide a default value if necessary.
   * @returns {*} The value.
   * @public
   */
  getDefault(key1: __MK0__, key2: __MK1__, __default__: () => __V__) : __V__
  {
    this.#requireValidKey(key1, key2);
    const __key__ = this.#keyComposer.getKey([key1, key2], []);

    if (this.#root.has(__key__))
      return this.#root.get(__key__) as __V__;

    const value = __default__();
    this.#root.set(__key__, value);

    return value;
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {object} key1 The first key.
   * @param {object} key2 The second key.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(key1: __MK0__, key2: __MK1__) : boolean
  {
    this.#requireValidKey(key1, key2);

    const __key__ = this.#keyComposer.getKeyIfExists([key1, key2], []);
    return __key__ ? this.#root.has(__key__) : false;
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} key1 The first key.
   * @param {object} key2 The second key.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */
  isValidKey(key1: __MK0__, key2: __MK1__) : boolean
  {
    return this.#isValidKey(key1, key2);
  }

  /**
   * Set a value for a key set.
   *
   * @param {object} key1  The first key.
   * @param {object} key2  The second key.
   * @param {*}      value The value.
   * @returns {WeakWeakMap} This collection.
   * @public
   */
  set(key1: __MK0__, key2: __MK1__, value: __V__) : this
  {
    this.#requireValidKey(key1, key2);
    

    const __key__ = this.#keyComposer.getKey([key1, key2], []);
    this.#root.set(__key__, value);
    return this;
  }

  /**
   * Throw if the key set is not valid.
   *
   * @param {object} key1 The first key.
   * @param {object} key2 The second key.
   * @throws for an invalid key set.
   */
  #requireValidKey(key1: __MK0__, key2: __MK1__) : void
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
  #isValidKey(key1: __MK0__, key2: __MK1__) : boolean
  {
    if (!this.#keyComposer.isValidForKey([key1, key2], []))
      return false;

    return true;
  }

  [Symbol.toStringTag] = "WeakWeakMap";
}

Object.freeze(WeakWeakMap);
Object.freeze(WeakWeakMap.prototype);

export type ReadonlyWeakWeakMap<
  __MK0__ extends object,
  __MK1__ extends object,
  __V__
>
= Pick<
  WeakWeakMap<__MK0__, __MK1__, __V__>,
  "get" | "has" | "isValidKey"
>;

export default WeakWeakMap;
