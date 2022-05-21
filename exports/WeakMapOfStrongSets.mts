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

import { DefaultWeakMap } from "./keys/DefaultMap.mjs";

class WeakMapOfStrongSets<
  __MK0__ extends object,
  __SK0__
>
{
  /** @typedef {Set<*>} __WeakMapOfStrongSets_InnerMap__ */

  /**
   * @type {WeakMap<object, __WeakMapOfStrongSets_InnerMap__>}
   * @constant
   * This is two levels. The first level is the map key.
   * The second level is the strong set.
   */
  #root: DefaultWeakMap<__MK0__, Set<__SK0__>> = new DefaultWeakMap();

  constructor(iterable? : [__MK0__, __SK0__][])
  {
    if (iterable) {
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
  add(mapKey: __MK0__, setKey: __SK0__) : this
  {
    this.#requireValidKey(mapKey, setKey);

    const __innerSet__ = this.#root.getDefault(mapKey, () => new Set);
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
  addSets(mapKey: __MK0__, __sets__: [__SK0__][]) : this
  {
    this.#requireValidMapKey(mapKey);

    if (__sets__.length === 0)
      return this;
    __sets__.forEach(([setKey]) => {
      this.#requireValidKey(mapKey, setKey);
    });

    const __innerSet__ = this.#root.getDefault(mapKey, () => new Set);
    __sets__.forEach(([setKey]) => __innerSet__.add(setKey));
    return this;
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {object} mapKey The map key.
   * @param {*}      setKey The set key.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(mapKey: __MK0__, setKey: __SK0__) : boolean
  {
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
  deleteSets(mapKey: __MK0__) : boolean
  {
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
  forEachSet(
    mapKey: __MK0__,
    __callback__: (
      mapKey: __MK0__,
      setKey: __SK0__,
      __collection__: WeakMapOfStrongSets<__MK0__, __SK0__>
    ) => void,
    __thisArg__: unknown
  ) : void
  {
    this.#requireValidMapKey(mapKey);
    const __innerSet__ = this.#root.get(mapKey);
    if (!__innerSet__)
      return;

    __innerSet__.forEach(
      setKey => __callback__.apply(__thisArg__, [mapKey, setKey, this])
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
  getSizeOfSet(mapKey: __MK0__) : number
  {
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
  has(mapKey: __MK0__, setKey: __SK0__) : boolean
  {
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
  hasSets(mapKey: __MK0__) : boolean
  {
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
  isValidKey(mapKey: __MK0__, setKey: __SK0__) : boolean
  {
    return this.#isValidKey(mapKey, setKey);
  }

  /**
   * Yield the sets of the collection in a map.
   *
   * @param {object} mapKey The map key.
   * @yields {*} The sets.
   * @public
   */
  * valuesSet(mapKey: __MK0__) : Iterator<[__MK0__, __SK0__]>
  {
    this.#requireValidMapKey(mapKey);

    const __innerSet__ = this.#root.get(mapKey);
    if (!__innerSet__)
      return;

    const __outerIter__ = __innerSet__.values();
    for (let setKey of __outerIter__)
      yield [mapKey, setKey];
  }

  /**
   * Throw if the key set is not valid.
   *
   * @param {object} mapKey The map key.
   * @param {*}      setKey The set key.
   * @throws for an invalid key set.
   */
  #requireValidKey(mapKey: __MK0__, setKey: __SK0__) : void
  {
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
  #isValidKey(mapKey: __MK0__, setKey: __SK0__) : boolean
  {
    return this.#isValidMapKey(mapKey) && this.#isValidSetKey(setKey);
  }

  /**
   * Throw if the map key set is not valid.
   *
   * @param {object} mapKey The map key.
   * @throws for an invalid key set.
   */
  #requireValidMapKey(mapKey: __MK0__) : void
  {
    if (!this.#isValidMapKey(mapKey))
      throw new Error("The ordered map key set is not valid!");
  }

  /**
   * Determine if a set of map keys is valid.
   *
   * @param {object} mapKey The map key.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidMapKey(mapKey: __MK0__) : boolean
  {
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
  #isValidSetKey(setKey: __SK0__) : boolean
  {
    void(setKey);

    
    return true;
  }

  [Symbol.toStringTag] = "WeakMapOfStrongSets";
}

Object.freeze(WeakMapOfStrongSets);
Object.freeze(WeakMapOfStrongSets.prototype);

export default WeakMapOfStrongSets;
