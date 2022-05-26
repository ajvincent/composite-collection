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
 * Template: Strong/OneMapOfOneStrongSet
 * @license MPL-2.0
 * @author Alexander J. Vincent <ajvincent@gmail.com>
 * @copyright © 2021-2022 Alexander J. Vincent
 */

import { DefaultMap } from "./keys/DefaultMap.mjs";

class StrongMapOfStrongSets<
  __MK0__,
  __SK0__
>
{
  /** @typedef {Set<*>} __StrongMapOfStrongSets__InnerMap__ */

  /** @type {Map<*, __StrongMapOfStrongSets__InnerMap__>} @constant */
  #outerMap: DefaultMap<__MK0__, Set<__SK0__>> = new DefaultMap();

  /** @type {number} */
  #sizeOfAll = 0;

  constructor(iterable?: [__MK0__, __SK0__][]) {
    if (iterable) {
      for (let [mapKey, setKey] of iterable) {
        this.add(mapKey, setKey);
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
  get size() : number
  {
    return this.#sizeOfAll;
  }

  /**
   * Get the size of a particular set.
   *
   * @param {*} mapKey The map key.
   * @returns {number} The set size.
   * @public
   */
  getSizeOfSet(mapKey: __MK0__) : number
  {
    
    const __innerSet__ = this.#outerMap.get(mapKey)
    return __innerSet__?.size || 0;
  }

  /**
   * The number of maps in this collection.
   *
   * @returns {number} The map count.
   * @public
   * @constant
   */
  get mapSize() : number
  {
    return this.#outerMap.size;
  }

  /**
   * Add a key set to this collection.
   *
   * @param {*} mapKey The map key.
   * @param {*} setKey The set key.
   * @returns {StrongMapOfStrongSets} This collection.
   * @public
   */
  add(mapKey: __MK0__, setKey: __SK0__) : this
  {
    
    const __innerSet__ = this.#outerMap.getDefault(mapKey, () => new Set);
    if (!__innerSet__.has(setKey)) {
      __innerSet__.add(setKey);
      this.#sizeOfAll++;
    }

    return this;
  }

  /**
   * Add several sets to a map in this collection.
   *
   * @param {*}     mapKey   The map key.
   * @param {Set[]} __sets__ The sets to add.
   * @returns {StrongMapOfStrongSets} This collection.
   * @public
   */
  addSets(mapKey: __MK0__, __sets__: [__SK0__][]) : this
  {
    
    

    if (__sets__.length === 0)
      return this;

    const __innerSet__ = this.#outerMap.getDefault(mapKey, () => new Set);
    __sets__.forEach(([setKey]) =>  {
      if (!__innerSet__.has(setKey)) {
        __innerSet__.add(setKey);
        this.#sizeOfAll++;
      }
    });

    return this;
  }

  /**
   * Clear the collection.
   *
   * @public
   */
  clear() : void
  {
    this.#outerMap.clear();
    this.#sizeOfAll = 0;
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {*} mapKey The map key.
   * @param {*} setKey The set key.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(mapKey: __MK0__, setKey: __SK0__) : boolean
  {
    
    const __innerSet__ = this.#outerMap.get(mapKey)
    if (!__innerSet__)
      return false;

    if (!__innerSet__.has(setKey))
      return false;

    __innerSet__.delete(setKey);
    this.#sizeOfAll--;

    if (__innerSet__.size === 0) {
      this.#outerMap.delete(mapKey);
    }

    return true;
  }

  /**
   * Delete all sets from the collection by the given map sequence.
   *
   * @param {*} mapKey The map key.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  deleteSets(mapKey: __MK0__) : boolean
  {
    
    const __innerSet__ = this.#outerMap.get(mapKey)
    if (!__innerSet__)
      return false;

    this.#outerMap.delete(mapKey);
    this.#sizeOfAll -= __innerSet__.size;
    return true;
  }

  /**
   * Iterate over the keys.
   *
   * @param {__StrongMapOfStrongSets_ForEachCallback__} __callback__ A function to invoke for each iteration.
   * @param {object}                                    __thisArg__  Value to use as this when executing callback.
   * @public
   */
  forEach(
    __callback__: (
      mapKey: __MK0__,
      setKey: __SK0__,
      __collection__: StrongMapOfStrongSets<__MK0__, __SK0__>
    ) => void,
    __thisArg__: unknown
  ) : void
  {
    this.#outerMap.forEach(
      (__innerSet__, mapKey) => __innerSet__.forEach(
        setKey => __callback__.apply(__thisArg__, [mapKey, setKey, this])
      )
    );
  }

  /**
   * An user-provided callback to .forEach().
   *
   * @callback __StrongMapOfStrongSets_ForEachCallback__
   * @param {*}                     mapKey         The map key.
   * @param {*}                     setKey         The set key.
   * @param {StrongMapOfStrongSets} __collection__ This collection.
   */

  /**
   * Iterate over the map keys.
   *
   * @param {__StrongMapOfStrongSets_ForEachMapCallback__} __callback__ A function to invoke for each iteration.
   * @param {object}                                       __thisArg__  Value to use as this when executing callback.
   * @public
   */
  forEachMap(
    __callback__: (
      mapKey: __MK0__,
      __collection__: StrongMapOfStrongSets<__MK0__, __SK0__>
    ) => void,
    __thisArg__: unknown
  ) : void
  {
    for (let mapKey of this.#outerMap.keys()) {
      __callback__.apply(__thisArg__, [mapKey, this]);
    }
  }

  /**
   * An user-provided callback to .forEachMap().
   *
   * @callback __StrongMapOfStrongSets_ForEachMapCallback__
   * @param {*}                     mapKey         The map key.
   * @param {StrongMapOfStrongSets} __collection__ This collection.
   */

  /**
   * Iterate over the keys under a map in this collection.
   *
   * @param {*}                                         mapKey       The map key.
   * @param {__StrongMapOfStrongSets_ForEachCallback__} __callback__ A function to invoke for each iteration.
   * @param {object}                                    __thisArg__  Value to use as this when executing callback.
   * @public
   */
  forEachSet(
    mapKey: __MK0__,
    __callback__: (
      mapKey: __MK0__,
      setKey: __SK0__,
      __collection__: StrongMapOfStrongSets<__MK0__, __SK0__>
    ) => void,
    __thisArg__: unknown
  ): void
  {
    
    const __innerSet__ = this.#outerMap.get(mapKey)
    if (!__innerSet__)
      return;

    __innerSet__.forEach(
      setKey => __callback__.apply(__thisArg__, [mapKey, setKey, this])
    );
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {*} mapKey The map key.
   * @param {*} setKey The set key.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(mapKey: __MK0__, setKey: __SK0__) : boolean
  {
    
    const __innerSet__ = this.#outerMap.get(mapKey)
    if (!__innerSet__)
      return false;

    return __innerSet__.has(setKey);
  }

  /**
   * Report if the collection has any sets for a map.
   *
   * @param {*} mapKey The map key.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  hasSets(mapKey: __MK0__) : boolean
  {
    
    const __innerSet__ = this.#outerMap.get(mapKey)
    return Boolean(__innerSet__);
  }

  /**
   * Yield the values of the collection.
   *
   * @yields {*} The value.
   * @public
   */
  * values() : Iterator<[__MK0__, __SK0__]>
  {
    const __outerIter__ = this.#outerMap.entries();

    for (let [mapKey, __innerSet__] of __outerIter__) {
      for (let setKey of __innerSet__.values())
        yield [mapKey, setKey];
    }
  }

  /**
   * Yield the sets of the collection in a map.
   *
   * @param {*} mapKey The map key.
   * @yields {*} The sets.
   * @public
   */
  * valuesSet(mapKey: __MK0__) : Iterator<[__MK0__, __SK0__]>
  {
    
    const __innerSet__ = this.#outerMap.get(mapKey)
    if (!__innerSet__)
      return;

    for (let setKey of __innerSet__.values())
      yield [mapKey, setKey];
  }

  [Symbol.iterator]() : Iterator<[__MK0__, __SK0__]>
  {
    return this.values();
  }

  [Symbol.toStringTag] = "StrongMapOfStrongSets";
}

Object.freeze(StrongMapOfStrongSets);
Object.freeze(StrongMapOfStrongSets.prototype);

export default StrongMapOfStrongSets;
