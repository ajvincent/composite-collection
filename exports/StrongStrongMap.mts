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
 * Template: Strong/Map
 * @license MPL-2.0
 * @author Alexander J. Vincent <ajvincent@gmail.com>
 * @copyright © 2021-2022 Alexander J. Vincent
 */

import KeyHasher from "./keys/Hasher.mjs";

/**
 * An user-provided callback to .forEach().
 *
 * @callback StrongStrongMap~ForEachCallback
 * @param {*}               value          The value.
 * @param {*}               key1           The first key.
 * @param {*}               key2           The second key.
 * @param {StrongStrongMap} __collection__ This collection.
 */
type __StrongStrongMap_forEachCallbackMap__<
  __MK0__ extends unknown,
  __MK1__ extends unknown,
  __V__ extends unknown
> = (
  value: __V__,
  key1: __MK0__,
  key2: __MK1__,
  __map__: StrongStrongMap<__MK0__, __MK1__, __V__>
) => void;

/**
 * @typedef StrongStrongMap~valueAndKeySet
 * @property {*}   value  The actual value we store.
 * @property {*[]} keySet The set of keys we hashed.
 */
type __StrongStrongMap_valueAndKeySet__<
  __MK0__ extends unknown,
  __MK1__ extends unknown,
  __V__ extends unknown
> = {
  value: __V__,
  keySet: [__MK0__, __MK1__]
};

class StrongStrongMap<
  __MK0__ extends unknown,
  __MK1__ extends unknown,
  __V__ extends unknown
> {
  /**
   * The root map holding keys and values.
   *
   * @type {Map<string, StrongStrongMap~valueAndKeySet>}
   * @constant
   */
  #root: Map<string, __StrongStrongMap_valueAndKeySet__<__MK0__, __MK1__, __V__>> = new Map;

  /**
   * @type {KeyHasher}
   * @constant
   */
  #hasher: KeyHasher = new KeyHasher();

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let [key1, key2, value] of iterable) {
        this.set(key1, key2, value);
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
  delete(key1: __MK0__,key2: __MK1__) : boolean {
    
    const __hash__ = this.#hasher.getHashIfExists(key1, key2);
    return __hash__ ? this.#root.delete(__hash__) : false;
  }

  /**
   * Yield the key-value tuples of the collection.
   *
   * @yields {*[]} The keys and values.
   * @public
   */
  * entries() : Iterator<[__MK0__, __MK1__, __V__]> {
    for (let valueAndKeySet of this.#root.values()) {
      yield [
        ...valueAndKeySet.keySet,
        valueAndKeySet.value
      ];
    }
  }

  /**
   * Iterate over the keys and values.
   *
   * @param {StrongStrongMap~ForEachCallback} callback A function to invoke for each iteration.
   * @param {object}                          thisArg  Value to use as this when executing callback.
   * @public
   */
  forEach(
    callback: __StrongStrongMap_forEachCallbackMap__<__MK0__, __MK1__, __V__>,
    thisArg: unknown
  ) : void
  {
    this.#root.forEach((valueAndKeySet) => {
      const args: [__V__, __MK0__, __MK1__, this] = [
        valueAndKeySet.value,
        ...valueAndKeySet.keySet,
        this
      ];
      callback.apply(thisArg, args);
    });
  }

  /**
   * Get a value for a key set.
   *
   * @param {*} key1 The first key.
   * @param {*} key2 The second key.
   * @returns {*?} The value.  Undefined if it isn't in the collection.
   * @public
   */
  get(key1: __MK0__,key2: __MK1__) : __V__ | undefined {
    
    const __hash__ = this.#hasher.getHashIfExists(key1, key2);
    if (!__hash__)
      return undefined;

    const valueAndKeySet = this.#root.get(__hash__);
    return valueAndKeySet?.value;
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {*} key1 The first key.
   * @param {*} key2 The second key.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(key1: __MK0__,key2: __MK1__) : boolean {
    
    const __hash__ = this.#hasher.getHashIfExists(key1, key2);
    return __hash__ ? this.#root.has(__hash__) : false;
  }

  /**
   * Yield the key sets of the collection.
   *
   * @yields {*[]} The key sets.
   * @public
   */
  * keys() : Iterator<[__MK0__, __MK1__]> {
    for (let valueAndKeySet of this.#root.values()) {
      const [key1, key2] : [__MK0__, __MK1__] = valueAndKeySet.keySet;
      yield [key1, key2];
    }
  }

  /**
   * Set a value for a key set.
   *
   * @param {*} key1  The first key.
   * @param {*} key2  The second key.
   * @param {*} value The value.
   * @returns {StrongStrongMap} This collection.
   * @public
   */
  set(key1: __MK0__,key2: __MK1__, value: __V__) : this {

    const __hash__ = this.#hasher.getHash(key1, key2);
    const __keySet__: [__MK0__, __MK1__] = [key1, key2];
    Object.freeze(__keySet__);
    this.#root.set(__hash__, {value, keySet: __keySet__});

    return this;
  }

  /**
   * Yield the values of the collection.
   *
   * @yields {*} The value.
   * @public
   */
  * values() : Iterator<__V__> {
    for (let valueAndKeySet of this.#root.values())
      yield valueAndKeySet.value;
  }

  [Symbol.iterator]() : Iterator<[__MK0__, __MK1__, __V__]> {
    return this.entries();
  }

  [Symbol.toStringTag] = "StrongStrongMap";
}

Object.freeze(StrongStrongMap);
Object.freeze(StrongStrongMap.prototype);

export default StrongStrongMap;
