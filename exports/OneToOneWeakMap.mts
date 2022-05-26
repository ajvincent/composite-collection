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
 * Template: OneToOne/Map
 * @license MPL-2.0
 * @author Alexander J. Vincent <ajvincent@gmail.com>
 * @copyright © 2021-2022 Alexander J. Vincent
 */

import WeakWeakMap from "./WeakWeakMap.mjs"

class OneToOneWeakMap<
  __MK1__ extends object,
  __V__ extends object
>
{
  /** @constant */
  #baseMap = new WeakWeakMap<object, __MK1__, __V__>();

  /** @type {WeakMap<object, object>} @constant */
  #weakValueToInternalKeyMap: WeakMap<__V__, object> = new WeakMap;

  /**
   * Bind two sets of keys and values together.
   *
   * @param {object} key2_1  The second key.
   * @param {*}      value_1 The value.
   * @param {object} key2_2  The second key.
   * @param {*}      value_2 The value.
   * @public
   */
  bindOneToOne(key2_1: __MK1__, value_1: __V__, key2_2: __MK1__, value_2: __V__) : void
  {
    this.#requireValidKey("(key2_1)", key2_1);
    this.#requireValidValue("value_1", value_1);
    this.#requireValidKey("(key2_2)", key2_2);
    this.#requireValidValue("value_2", value_2);

    let key1 = this.#weakValueToInternalKeyMap.get(value_1);
    const __otherWeakKey__ = this.#weakValueToInternalKeyMap.get(value_2);
    if (!key1) {
      key1 = __otherWeakKey__ || {};
    }
    else if (__otherWeakKey__ && (__otherWeakKey__ !== key1)) {
      throw new Error("value_1 and value_2 are already in different one-to-one mappings!");
    }

    const __hasKeySet1__  = this.#baseMap.has(key1, key2_1);
    const __hasKeySet2__  = this.#baseMap.has(key1, key2_2);

    if (__hasKeySet1__ && (this.#baseMap.get(key1, key2_1) !== value_1))
      throw new Error("value_1 mismatch!");
    if (__hasKeySet2__ && (this.#baseMap.get(key1, key2_2) !== value_2))
      throw new Error("value_2 mismatch!");

    this.#weakValueToInternalKeyMap.set(value_1, key1);
    this.#weakValueToInternalKeyMap.set(value_2, key1);

    if (!__hasKeySet1__)
      this.#baseMap.set(key1, key2_1, value_1);

    if (!__hasKeySet2__)
      this.#baseMap.set(key1, key2_2, value_2);
  }

  /**
   * Delete a target value.
   *
   * @param {*}      value The value.
   * @param {object} key2  The second key.
   * @returns {boolean} True if the target value was deleted.
   * @public
   */
  delete(value: __V__, key2: __MK1__) : boolean
  {
    const key1 = this.#weakValueToInternalKeyMap.get(value);
    if (!key1)
      return false;

    const __target__ = this.#baseMap.get(key1, key2);
    if (!__target__)
      return false;

    const __returnValue__ = this.#baseMap.delete(key1, key2);
    if (__returnValue__)
      this.#weakValueToInternalKeyMap.delete(__target__);
    return __returnValue__;
  }

  /**
   * Get a target value.
   *
   * @param {*}      value The value.
   * @param {object} key2  The second key.
   * @returns {*} The target value.
   * @public
   */
  get(value: __V__, key2: __MK1__) : __V__ | undefined
  {
    const key1 = this.#weakValueToInternalKeyMap.get(value);
    return key1 ? this.#baseMap.get(key1, key2) : undefined;
  }

  /**
   * Determine if a target value exists.
   *
   * @param {*}      value The value.
   * @param {object} key2  The second key.
   * @returns {boolean} True if the target value exists.
   * @public
   */
  has(value: __V__, key2: __MK1__) : boolean
  {
    const key1 = this.#weakValueToInternalKeyMap.get(value);
    return key1 ? this.#baseMap.has(key1, key2) : false;
  }

  /**
   * Determine if a target value is an identity in this map.
   *
   * @param {*}       value           The value.
   * @param {object}  key2            The second key.
   * @param {boolean} allowNotDefined If true, treat the absence of the value as an identity.
   * @returns {boolean} True if the target value exists.
   * @public
   */
  hasIdentity(value: __V__, key2: __MK1__, allowNotDefined: boolean) : boolean
  {
    const key1 = this.#weakValueToInternalKeyMap.get(value);
    if (!key1) {
      return Boolean(allowNotDefined);
    }
    return this.#baseMap.get(key1, key2) === value;
  }

  /**
   * Determine if a key is valid.
   *
   * @param {object} key2 The second key.
   * @returns {boolean} True if the key is valid.
   * @see the base map class for further constraints.
   * @public
   */
  isValidKey(key2: __MK1__) : boolean
  {
    return this.#isValidKey(key2);
  }

  #isValidKey(key2: __MK1__) : boolean
  {
    const key1 = {};
    return this.#baseMap.isValidKey(key1, key2);
  }

  /**
   * Determine if a value is valid.
   *
   * @param {*} value The value.
   * @returns {boolean} True if the value is valid.
   * @see the base map class for further constraints.
   * @public
   */
  isValidValue(value: __V__) : boolean
  {
    return Object(value) === value;
  }

  #requireValidKey(__argNames__: string, key2: __MK1__) : void
  {
    if (!this.#isValidKey(key2))
      throw new Error("Invalid key tuple: " + __argNames__);
  }

  #requireValidValue(argName: string, value: __V__) : void
  {
    if (!this.isValidValue(value))
      throw new Error(argName + " is not a valid value!");
  }

  [Symbol.toStringTag] = "OneToOneWeakMap";
}
    
Object.freeze(OneToOneWeakMap);
Object.freeze(OneToOneWeakMap.prototype);

export default OneToOneWeakMap;
