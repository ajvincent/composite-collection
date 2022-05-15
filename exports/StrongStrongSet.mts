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
 * Template: Strong/Set
 * @license MPL-2.0
 * @author Alexander J. Vincent <ajvincent@gmail.com>
 * @copyright © 2021-2022 Alexander J. Vincent
 */

import KeyHasher from "./keys/Hasher.mjs";

type __StrongStrongSet_valueSet__<
  __SK0__,
  __SK1__
> = [
  __SK0__,
  __SK1__
];

class StrongStrongSet<
  __SK0__,
  __SK1__
>
{
  /** @typedef {string} hash */

  /**
   * @typedef __StrongStrongSet_valueAndKeySet__
   * @property {*}   value  The actual value we store.
   * @property {*[]} keySet The set of keys we hashed.
   */

  /**
   * Storage of the Set's contents for quick iteration in .values().  The values are always frozen arrays.
   *
   * @type {Map<hash, *[]>}
   * @constant
   */
  #root: Map<string, __StrongStrongSet_valueSet__<__SK0__, __SK1__>> = new Map;

  /** @type {KeyHasher} @constant */
  #hasher: KeyHasher = new KeyHasher();

  constructor(
    iterable?: [__SK0__,__SK1__][]
  )
  {
    if (iterable) {
      for (const [key1, key2] of iterable) {
        this.add(key1, key2);
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
  get size() : number {
    return this.#root.size;
  }

  /**
   * Add a key set to this collection.
   *
   * @param {*} key1 The first key.
   * @param {*} key2 The second key.
   * @returns {StrongStrongSet} This collection.
   * @public
   */
  add(key1: __SK0__, key2: __SK1__) : this
  {
    
    const __hash__ = this.#hasher.getHash(key1, key2);
    this.#root.set(__hash__, [key1, key2]);
    return this;
  }

  /**
   * Clear the collection.
   *
   * @public
   */
  clear() : void {
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
  delete(key1: __SK0__, key2: __SK1__) : boolean
  {
    const __hash__ = this.#hasher.getHashIfExists(key1, key2);
    return __hash__ ? this.#root.delete(__hash__) : false;
  }

  /**
   * An user-provided callback to .forEach().
   *
   * @callback __StrongStrongSet_ForEachCallback__
   * @param {*}               key1           The first key.
   * @param {*}               key2           The second key.
   * @param {StrongStrongSet} __collection__ This collection.
   */

  /**
   * Iterate over the keys.
   *
   * @param {__StrongStrongSet_ForEachCallback__} __callback__ A function to invoke for each iteration.
   * @param {object}                              __thisArg__  Value to use as this when executing callback.
   * @public
   */
  forEach(
    __callback__: (
      key1: __SK0__,
      key2: __SK1__,
      __collection__: StrongStrongSet<__SK0__, __SK1__>
    ) => void,
    __thisArg__: unknown
  ) : void
  {
    this.#root.forEach(valueSet => {
      const __args__: [__SK0__, __SK1__, this] = [
        ...valueSet,
        this
      ];
      __callback__.apply(__thisArg__, __args__);
    });
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {*} key1 The first key.
   * @param {*} key2 The second key.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(key1: __SK0__, key2: __SK1__) : boolean {
    const __hash__ = this.#hasher.getHashIfExists(key1, key2);
    return __hash__ ? this.#root.has(__hash__) : false;
  }

  /**
   * Yield the values of the collection.
   *
   * @yields {*} The value.
   * @public
   */
  * values() : Iterator<[__SK0__, __SK1__]>
  {
    for (let __value__ of this.#root.values()) {
      yield __value__;
    }
  }

  [Symbol.iterator]() : Iterator<[__SK0__, __SK1__]> {
    return this.values();
  }

  [Symbol.toStringTag] = "StrongStrongSet";
}

Object.freeze(StrongStrongSet);
Object.freeze(StrongStrongSet.prototype);

export default StrongStrongSet;
