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
 * Template: Weak/OneMapOfOneStrongSet
 * @license MPL-2.0
 * @author Alexander J. Vincent <ajvincent@gmail.com>
 * @copyright © 2021-2022 Alexander J. Vincent
 */

class WeakMapOfStrongSets {
  /**
   * @type {WeakMap<object, Set<*>>}
   * @constant
   * This is two levels. The first level is the map key.
   * The second level is the strong set.
   */
  #root = new WeakMap();

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let [mapKey, setKey] of iterable) {
        this.add(mapKey, setKey);
      }
    }
  }

  /**
   * Add a key set to this collection.
   *
   * @param {object} mapKey The map key.
   * @param {*}      setKey The set key.
   * @returns {WeakMapOfStrongSets} This collection.
   * @public
   */
  add(mapKey, setKey) {
    this.#requireValidKey(mapKey, setKey);
    const __innerSet__ = this.#requireInnerSet(mapKey);

    __innerSet__.add(setKey);
    return this;
  }

  /**
   * Add several sets to a map in this collection.
   *
   * @param {object} mapKey   The map key.
   * @param {Set[]}  __sets__ The sets to add.
   * @returns {WeakMapOfStrongSets} This collection.
   * @public
   */
  addSets(mapKey, __sets__) {
    this.#requireValidMapKey(mapKey);
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== 1) {
        throw new Error(`Set at index ${__index__} doesn't have exactly 1 set argument!`);
      }
      this.#requireValidKey(mapKey, ...__set__);
      return __set__;
    });

    const __innerSet__ = this.#requireInnerSet(mapKey);

    // level 2: inner map to set
    __array__.forEach(__set__ => __innerSet__.add(__set__[0]));

    return this;
  }

  /**
   * Clear all sets from the collection for a given map keyset.
   *
   * @param {object} mapKey The map key.
   * @public
   */
  clearSets(mapKey) {
    this.#requireValidMapKey(mapKey);
    const __innerSet__ = this.#root.get(mapKey);
    if (!__innerSet__)
      return;

    __innerSet__.clear();
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {object} mapKey The map key.
   * @param {*}      setKey The set key.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(mapKey, setKey) {
    this.#requireValidKey(mapKey, setKey);
    const __innerSet__ = this.#root.get(mapKey);
    if (!__innerSet__)
      return false;

    // level 2: inner map to set
    const __returnValue__ = __innerSet__.delete(setKey);

    if (__innerSet__.size === 0) {
      this.deleteSets(mapKey);
    }

    return __returnValue__;
  }

  /**
   * Delete all sets from the collection by the given map sequence.
   *
   * @param {object} mapKey The map key.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  deleteSets(mapKey) {
    this.#requireValidMapKey(mapKey);
    return this.#root.delete(mapKey);
  }

  /**
   * Iterate over the keys under a map in this collection.
   *
   * @param {object}                                  mapKey       The map key.
   * @param {__WeakMapOfStrongSets_ForEachCallback__} __callback__ A function to invoke for each iteration.
   * @param {object}                                  __thisArg__  Value to use as this when executing callback.
   * @public
   */
  forEachSet(mapKey, __callback__, __thisArg__) {
    this.#requireValidMapKey(mapKey);
    const __innerSet__ = this.#root.get(mapKey);
    if (!__innerSet__)
      return;

    __innerSet__.forEach(
      __element__ => __callback__.apply(__thisArg__, [mapKey, __element__, this])
    );
  }

  /**
   * An user-provided callback to .forEach().
   *
   * @callback __WeakMapOfStrongSets_ForEachCallback__
   * @param {object}              mapKey         The map key.
   * @param {*}                   setKey         The set key.
   * @param {WeakMapOfStrongSets} __collection__ This collection.
   */

  /**
   * Get the size of a particular set.
   *
   * @param {object} mapKey The map key.
   * @returns {number} The set size.
   * @public
   */
  getSizeOfSet(mapKey) {
    this.#requireValidMapKey(mapKey);
    const __innerSet__ = this.#root.get(mapKey);
    return __innerSet__?.size || 0;
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {object} mapKey The map key.
   * @param {*}      setKey The set key.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(mapKey, setKey) {
    this.#requireValidKey(mapKey, setKey);
    const __innerSet__ = this.#root.get(mapKey);
    if (!__innerSet__)
      return false;

    return __innerSet__.has(setKey);
  }

  /**
   * Report if the collection has any sets for a map.
   *
   * @param {object} mapKey The map key.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  hasSets(mapKey) {
    this.#requireValidMapKey(mapKey);
    return this.#root.has(mapKey);
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} mapKey The map key.
   * @param {*}      setKey The set key.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */
  isValidKey(mapKey, setKey) {
    return this.#isValidKey(mapKey, setKey);
  }

  /**
   * Yield the sets of the collection in a map.
   *
   * @param {object} mapKey The map key.
   * @yields {*} The sets.
   * @public
   */
  * valuesSet(mapKey) {
    this.#requireValidMapKey(mapKey);

    const __innerSet__ = this.#root.get(mapKey);
    if (!__innerSet__)
      return;

    const __outerIter__ = __innerSet__.values();
    for (let __value__ of __outerIter__)
      yield [mapKey, __value__];
  }

  /**
   * Require an inner collection exist for the given map keys.
   *
   * @param {object} mapKey The map key.
   * @returns {WeakMapOfStrongSets~InnerMap} The inner collection.
   */
  #requireInnerSet(mapKey) {
    if (!this.#root.has(mapKey)) {
      this.#root.set(mapKey, new Set);
    }
    return this.#root.get(mapKey);
  }

  /**
   * Throw if the key set is not valid.
   *
   * @param {object} mapKey The map key.
   * @param {*}      setKey The set key.
   * @throws for an invalid key set.
   */
  #requireValidKey(mapKey, setKey) {
    if (!this.#isValidKey(mapKey, setKey))
      throw new Error("The ordered key set is not valid!");
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} mapKey The map key.
   * @param {*}      setKey The set key.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidKey(mapKey, setKey) {
    return this.#isValidMapKey(mapKey) && this.#isValidSetKey(setKey);
  }

  /**
   * Throw if the map key set is not valid.
   *
   * @param {object} mapKey The map key.
   * @throws for an invalid key set.
   */
  #requireValidMapKey(mapKey) {
    if (!this.#isValidMapKey(mapKey))
      throw new Error("The ordered map key set is not valid!");
  }

  /**
   * Determine if a set of map keys is valid.
   *
   * @param {object} mapKey The map key.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidMapKey(mapKey) {
    if (Object(mapKey) !== mapKey)
      return false;

    return true;
  }

  /**
   * Determine if a set of set keys is valid.
   *
   * @param {*} setKey The set key.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidSetKey(setKey) {
    void(setKey);

    return true;
  }

  [Symbol.toStringTag] = "WeakMapOfStrongSets";
}

Object.freeze(WeakMapOfStrongSets);
Object.freeze(WeakMapOfStrongSets.prototype);

export default WeakMapOfStrongSets;
