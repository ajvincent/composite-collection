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

import WeakStrongMap from "./WeakStrongMap.mjs"

class OneToOneStrongMap<
  __MK1__,
  __V__ extends object
>
{
  /** @constant */
  #baseMap = new WeakStrongMap<object, __MK1__, __V__>();

  /** @type {WeakMap<object, object>} @constant */
  #weakValueToInternalKeyMap: WeakMap<__V__, object> = new WeakMap;

  /**
   * Bind two sets of keys and values together.
   *
   * @param {*}      strongKey_1 The strongly held key.
   * @param {object} value_1     The value.
   * @param {*}      strongKey_2 The strongly held key.
   * @param {object} value_2     The value.
   * @public
   */
  bindOneToOne(strongKey_1: __MK1__, value_1: __V__, strongKey_2: __MK1__, value_2: __V__) : void
  {
    this.#requireValidKey("(strongKey_1)", strongKey_1);
    this.#requireValidValue("value_1", value_1);
    this.#requireValidKey("(strongKey_2)", strongKey_2);
    this.#requireValidValue("value_2", value_2);

    let weakKey = this.#weakValueToInternalKeyMap.get(value_1);
    const __otherWeakKey__ = this.#weakValueToInternalKeyMap.get(value_2);
    if (!weakKey) {
      weakKey = __otherWeakKey__ || {};
    }
    else if (__otherWeakKey__ && (__otherWeakKey__ !== weakKey)) {
      throw new Error("value_1 and value_2 are already in different one-to-one mappings!");
    }

    const __hasKeySet1__  = this.#baseMap.has(weakKey, strongKey_1);
    const __hasKeySet2__  = this.#baseMap.has(weakKey, strongKey_2);

    if (__hasKeySet1__ && (this.#baseMap.get(weakKey, strongKey_1) !== value_1))
      throw new Error("value_1 mismatch!");
    if (__hasKeySet2__ && (this.#baseMap.get(weakKey, strongKey_2) !== value_2))
      throw new Error("value_2 mismatch!");

    this.#weakValueToInternalKeyMap.set(value_1, weakKey);
    this.#weakValueToInternalKeyMap.set(value_2, weakKey);

    if (!__hasKeySet1__)
      this.#baseMap.set(weakKey, strongKey_1, value_1);

    if (!__hasKeySet2__)
      this.#baseMap.set(weakKey, strongKey_2, value_2);
  }

  /**
   * Delete a target value.
   *
   * @param {object} value     The value.
   * @param {*}      strongKey The strongly held key.
   * @returns {boolean} True if the target value was deleted.
   * @public
   */
  delete(value: __V__, strongKey: __MK1__) : boolean
  {
    const weakKey = this.#weakValueToInternalKeyMap.get(value);
    if (!weakKey)
      return false;

    const __target__ = this.#baseMap.get(weakKey, strongKey);
    if (!__target__)
      return false;

    const __returnValue__ = this.#baseMap.delete(weakKey, strongKey);
    if (__returnValue__)
      this.#weakValueToInternalKeyMap.delete(__target__);
    return __returnValue__;
  }

  /**
   * Get a target value.
   *
   * @param {object} value     The value.
   * @param {*}      strongKey The strongly held key.
   * @returns {*} The target value.
   * @public
   */
  get(value: __V__, strongKey: __MK1__) : __V__ | undefined
  {
    const weakKey = this.#weakValueToInternalKeyMap.get(value);
    return weakKey ? this.#baseMap.get(weakKey, strongKey) : undefined;
  }

  /**
   * Determine if a target value exists.
   *
   * @param {object} value     The value.
   * @param {*}      strongKey The strongly held key.
   * @returns {boolean} True if the target value exists.
   * @public
   */
  has(value: __V__, strongKey: __MK1__) : boolean
  {
    const weakKey = this.#weakValueToInternalKeyMap.get(value);
    return weakKey ? this.#baseMap.has(weakKey, strongKey) : false;
  }

  /**
   * Determine if a target value is an identity in this map.
   *
   * @param {object}  value           The value.
   * @param {*}       strongKey       The strongly held key.
   * @param {boolean} allowNotDefined If true, treat the absence of the value as an identity.
   * @returns {boolean} True if the target value exists.
   * @public
   */
  hasIdentity(value: __V__, strongKey: __MK1__, allowNotDefined: boolean) : boolean
  {
    const weakKey = this.#weakValueToInternalKeyMap.get(value);
    if (!weakKey) {
      return Boolean(allowNotDefined);
    }
    return this.#baseMap.get(weakKey, strongKey) === value;
  }

  /**
   * Determine if a key is valid.
   *
   * @param {*} strongKey The strongly held key.
   * @returns {boolean} True if the key is valid.
   * @see the base map class for further constraints.
   * @public
   */
  isValidKey(strongKey: __MK1__) : boolean
  {
    return this.#isValidKey(strongKey);
  }

  #isValidKey(strongKey: __MK1__) : boolean
  {
    const weakKey = {};
    return this.#baseMap.isValidKey(weakKey, strongKey);
  }

  /**
   * Determine if a value is valid.
   *
   * @param {object} value The value.
   * @returns {boolean} True if the value is valid.
   * @see the base map class for further constraints.
   * @public
   */
  isValidValue(value: __V__) : boolean
  {
    return Object(value) === value;
  }

  #requireValidKey(__argNames__: string, strongKey: __MK1__) : void
  {
    if (!this.#isValidKey(strongKey))
      throw new Error("Invalid key tuple: " + __argNames__);
  }

  #requireValidValue(argName: string, value: __V__) : void
  {
    if (!this.isValidValue(value))
      throw new Error(argName + " is not a valid value!");
  }

  [Symbol.toStringTag] = "OneToOneStrongMap";
}
    
Object.freeze(OneToOneStrongMap);
Object.freeze(OneToOneStrongMap.prototype);

export default OneToOneStrongMap;
