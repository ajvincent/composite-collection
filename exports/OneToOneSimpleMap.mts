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

class OneToOneSimpleMap<
  __V__ extends object
> extends WeakMap<__V__, __V__>
{
  /**
   * Bind two values together.
   *
   * @param {*} value_1 The value.
   * @param {*} value_2 The value.
   * @public
   */
  bindOneToOne(value_1: __V__, value_2: __V__) : void
  {
    const __hasValue1__  = this.has(value_1);
    const __hasValue2__  = this.has(value_2);

    if (__hasValue1__ && (this.get(value_2) !== value_1))
      throw new Error("value_1 mismatch!");
    if (__hasValue2__ && (this.get(value_1) !== value_2))
      throw new Error("value_2 mismatch!");
    if (!this.isValidValue(value_1))
      throw new Error("value_1 is not a valid value!");
    if (!this.isValidValue(value_2))
      throw new Error("value_2 is not a valid value!");

    if (!__hasValue1__)
      super.set(value_1, value_2);
    if (!__hasValue2__)
      super.set(value_2, value_1);
  }

  /**
   * Determine if a target value is an identity in this map.
   *
   * @param {*}       value           The value.
   * @param {boolean} allowNotDefined If true, treat the absence of the value as an identity.
   * @returns {boolean} True if the target value exists.
   * @public
   */
  hasIdentity(value: __V__, allowNotDefined: boolean) : boolean
  {
    if (!this.has(value)) {
      return Boolean(allowNotDefined);
    }
    // Beyond this point we should return true.
    const __other__ = this.get(value) as __V__;
    return this.get(__other__) === value;
  }

  /**
   * Determine if a value is valid.
   *
   * @param {*} value The value.
   * @returns {boolean} True if the value is valid.
   * @public
   */
  isValidValue(value: __V__) : boolean
  {
    return Object(value) === value;
  }

  set(key: __V__, value: __V__) : never
  {
    void(key);
    void(value);
    throw new Error("Not implemented, use .bindOneToOne(value_1, value_2);");
  }

  [Symbol.toStringTag] = "OneToOneSimpleMap";
}
    
Object.freeze(OneToOneSimpleMap);
Object.freeze(OneToOneSimpleMap.prototype);

export default OneToOneSimpleMap;
