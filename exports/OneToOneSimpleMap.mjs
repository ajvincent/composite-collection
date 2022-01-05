/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

class OneToOneSimpleMap extends WeakMap {
  /**
   * Bind two sets of keys and values together.
   *
   * @param {*} value_1 The value.
   * @param {*} value_2 The value.
   *
   * @public
   */
  bindOneToOne(value_1, value_2) {
    const __hasValue1__ = this.has(value_1);
    const __hasValue2__ = this.has(value_2);

    if (__hasValue1__ && (this.get(value_2) !== value_1))
      throw new Error("value_1 mismatch!");
    if (__hasValue2__ && (this.get(value_1) !== value_2))
      throw new Error("value_2 mismatch!");
    if (!this.isValidValue(value_1))
      throw new Error("value_1 is not a valid value!");
    if (!this.isValidValue(value_2))
      throw new Error("value_2 is not a valid value!");

    super.set(value_2, value_1);
    super.set(value_1, value_2);
  }

  /**
   * Determine if a value is valid.
   *
   * @param {*} value The value.
   *
   * @returns {boolean} True if the value is valid.
   * @public
   */
  isValidValue(value) {
    return Object(value) === value;
  }

  set() {
    throw new Error("Not implemented, use .bindOneToOne(value_1, value_2);");
  }
}

Reflect.defineProperty(OneToOneSimpleMap, Symbol.toStringTag, {
  value: "OneToOneSimpleMap",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(OneToOneSimpleMap);
Object.freeze(OneToOneSimpleMap.prototype);

export default OneToOneSimpleMap;
