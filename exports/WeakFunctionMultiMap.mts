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

class WeakFunctionMultiMap<
  __MK0__ extends object,
  __SK0__
>
{
  /**
   * @type {WeakMap<object, Set<Function>>}
   * @constant
   * This is two levels. The first level is the map key.
   * The second level is the strong set.
   */
  #root: WeakMap<__MK0__, Set<__SK0__>> = new WeakMap();

  constructor(iterable? : [__MK0__, __SK0__][])
  {
    if (iterable) {
      for (let [key, mapFunction] of iterable) {
        this.add(key, mapFunction);
      }
    }
  }

  /**
   * Add a key set to this collection.
   *
   * @param {object}   key         The map key.
   * @param {Function} mapFunction The function.
   * @returns {WeakFunctionMultiMap} This collection.
   * @public
   */
  add(key: __MK0__, mapFunction: __SK0__) : this
  {
    this.#requireValidKey(key, mapFunction);

    const __innerSet__ = this.#requireInnerSet(key);
    __innerSet__.add(mapFunction);
    return this;
  }

  /**
   * Add several sets to a map in this collection.
   *
   * @param {object} key      The map key.
   * @param {Set[]}  __sets__ The sets to add.
   * @returns {WeakFunctionMultiMap} This collection.
   * @public
   */
  addSets(key: __MK0__, __sets__: [__SK0__][]) : this
  {
    this.#requireValidMapKey(key);
    __sets__.forEach(([mapFunction]) => {
      this.#requireValidKey(key, mapFunction);
    });

    const __innerSet__ = this.#requireInnerSet(key);
    __sets__.forEach(([mapFunction]) => __innerSet__.add(mapFunction));
    return this;
  }

  /**
   * Clear all sets from the collection for a given map keyset.
   *
   * @param {object} key The map key.
   * @public
   */
  clearSets(key: __MK0__) : void
  {
    this.#requireValidMapKey(key);
    const __innerSet__ = this.#root.get(key);
    if (!__innerSet__)
      return;

    __innerSet__.clear();
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {object}   key         The map key.
   * @param {Function} mapFunction The function.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(key: __MK0__, mapFunction: __SK0__) : boolean
  {
    this.#requireValidKey(key, mapFunction);
    const __innerSet__ = this.#root.get(key);
    if (!__innerSet__)
      return false;

    // level 2: inner map to set
    const __returnValue__ = __innerSet__.delete(mapFunction);

    if (__innerSet__.size === 0) {
      this.deleteSets(key);
    }

    return __returnValue__;
  }

  /**
   * Delete all sets from the collection by the given map sequence.
   *
   * @param {object} key The map key.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  deleteSets(key: __MK0__) : boolean
  {
    this.#requireValidMapKey(key);
    return this.#root.delete(key);
  }

  /**
   * Iterate over the keys under a map in this collection.
   *
   * @param {object}                                   key          The map key.
   * @param {__WeakFunctionMultiMap_ForEachCallback__} __callback__ A function to invoke for each iteration.
   * @param {object}                                   __thisArg__  Value to use as this when executing callback.
   * @public
   */
  forEachSet(
    key: __MK0__,
    __callback__: (
      key: __MK0__,
      mapFunction: __SK0__,
      __collection__: WeakFunctionMultiMap<__MK0__, __SK0__>
    ) => void,
    __thisArg__: unknown
  ) : void
  {
    this.#requireValidMapKey(key);
    const __innerSet__ = this.#root.get(key);
    if (!__innerSet__)
      return;

    __innerSet__.forEach(
      mapFunction => __callback__.apply(__thisArg__, [key, mapFunction, this])
    );
  }

  /**
   * An user-provided callback to .forEach().
   *
   * @callback __WeakFunctionMultiMap_ForEachCallback__
   * @param {object}               key            The map key.
   * @param {Function}             mapFunction    The function.
   * @param {WeakFunctionMultiMap} __collection__ This collection.
   */

  /**
   * Get the size of a particular set.
   *
   * @param {object} key The map key.
   * @returns {number} The set size.
   * @public
   */
  getSizeOfSet(key: __MK0__)
  {
    this.#requireValidMapKey(key);
    const __innerSet__ = this.#root.get(key);
    return __innerSet__?.size || 0;
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {object}   key         The map key.
   * @param {Function} mapFunction The function.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(key: __MK0__, mapFunction: __SK0__) : boolean
  {
    this.#requireValidKey(key, mapFunction);
    const __innerSet__ = this.#root.get(key);
    if (!__innerSet__)
      return false;

    return __innerSet__.has(mapFunction);
  }

  /**
   * Report if the collection has any sets for a map.
   *
   * @param {object} key The map key.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  hasSets(key: __MK0__) : boolean
  {
    this.#requireValidMapKey(key);
    return this.#root.has(key);
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object}   key         The map key.
   * @param {Function} mapFunction The function.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */
  isValidKey(key: __MK0__, mapFunction: __SK0__) : boolean
  {
    return this.#isValidKey(key, mapFunction);
  }

  /**
   * Yield the sets of the collection in a map.
   *
   * @param {object} key The map key.
   * @yields {*} The sets.
   * @public
   */
  * valuesSet(key: __MK0__) : Iterator<[__MK0__, __SK0__]>
  {
    this.#requireValidMapKey(key);

    const __innerSet__ = this.#root.get(key);
    if (!__innerSet__)
      return;

    const __outerIter__ = __innerSet__.values();
    for (let mapFunction of __outerIter__)
      yield [key, mapFunction];
  }

  /**
   * Require an inner collection exist for the given map keys.
   *
   * @param {object} key The map key.
   * @returns {WeakFunctionMultiMap~InnerMap} The inner collection.
   */
  #requireInnerSet(key: __MK0__) : Set<__SK0__>
  {
    let __rv__ = this.#root.get(key);
    if (!__rv__) {
      __rv__ = new Set;
      this.#root.set(key, __rv__);
    }
    return __rv__;
  }

  /**
   * Throw if the key set is not valid.
   *
   * @param {object}   key         The map key.
   * @param {Function} mapFunction The function.
   * @throws for an invalid key set.
   */
  #requireValidKey(key: __MK0__, mapFunction: __SK0__) : void
  {
    if (!this.#isValidKey(key, mapFunction))
      throw new Error("The ordered key set is not valid!");
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object}   key         The map key.
   * @param {Function} mapFunction The function.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidKey(key: __MK0__, mapFunction: __SK0__) : boolean
  {
    return this.#isValidMapKey(key) && this.#isValidSetKey(mapFunction);
  }

  /**
   * Throw if the map key set is not valid.
   *
   * @param {object} key The map key.
   * @throws for an invalid key set.
   */
  #requireValidMapKey(key: __MK0__) : void
  {
    if (!this.#isValidMapKey(key))
      throw new Error("The ordered map key set is not valid!");
  }

  /**
   * Determine if a set of map keys is valid.
   *
   * @param {object} key The map key.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidMapKey(key: __MK0__) : boolean
  {
    if (Object(key) !== key)
      return false;
    
    return true;
  }

  /**
   * Determine if a set of set keys is valid.
   *
   * @param {Function} mapFunction The function.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidSetKey(mapFunction: __SK0__) : boolean
  {
    void(mapFunction);

    {
    if (typeof mapFunction !== "function")
      return false;
  }
    return true;
  }

  [Symbol.toStringTag] = "WeakFunctionMultiMap";
}

Object.freeze(WeakFunctionMultiMap);
Object.freeze(WeakFunctionMultiMap.prototype);

export default WeakFunctionMultiMap;
