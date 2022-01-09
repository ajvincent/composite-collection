/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import WeakStrongMap from "./WeakStrongMap.mjs";

class OneToOneStrongMap {
  /** @constant */
  #baseMap = new WeakStrongMap;

  /** @type {WeakMap<object, object>} @constant */
  #weakValueToInternalKeyMap = new WeakMap;

  /**
   * Bind two sets of keys and values together.
   *
   * @param {*} strongKey_1 The strongly held key.
   * @param {*} value_1     The value.
   * @param {*} strongKey_2 The strongly held key.
   * @param {*} value_2     The value.
   * @public
   */
  bindOneToOne(strongKey_1, value_1, strongKey_2, value_2) {
    this.#requireValidKey("(strongKey_1)", strongKey_1);
    this.#requireValidValue("value_1", value_1);
    this.#requireValidKey("(strongKey_2)", strongKey_2);
    this.#requireValidValue("value_2", value_2);

    let weakKey = this.#weakValueToInternalKeyMap.get(value_1);
    const __otherWeakKey__ = this.#weakValueToInternalKeyMap.get(value_2);
    if (!weakKey) {
      weakKey = __otherWeakKey__ || {};
    } else if (__otherWeakKey__ && (__otherWeakKey__ !== weakKey)) {
      throw new Error("value_1 and value_2 are already in different one-to-one mappings!");
    }

    const __hasKeySet1__ = this.#baseMap.has(weakKey, strongKey_1);
    const __hasKeySet2__ = this.#baseMap.has(weakKey, strongKey_2);

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
   * @param {*} value     The value.
   * @param {*} strongKey The strongly held key.
   * @returns {boolean} True if the target value was deleted.
   * @public
   */
  delete(value, strongKey) {
    const weakKey = this.#weakValueToInternalKeyMap.has(value);
    if (!weakKey)
      return false;

    if (!this.#baseMap.has(weakKey, strongKey))
      return false;

    const __target__ = this.#baseMap.get(weakKey, strongKey);

    const __returnValue__ = this.#baseMap.delete(weakKey, strongKey);
    if (__returnValue__)
      this.#weakValueToInternalKeyMap.delete(__target__);
    return __returnValue__;
  }

  /**
   * Get a target value.
   *
   * @param {*} value     The value.
   * @param {*} strongKey The strongly held key.
   * @returns {*} The target value.
   * @public
   */
  get(value, strongKey) {
    const weakKey = this.#weakValueToInternalKeyMap.get(value);
    return weakKey ? this.#baseMap.get(weakKey, strongKey) : undefined;
  }

  /**
   * Determine if a target value exists.
   *
   * @param {*} value     The value.
   * @param {*} strongKey The strongly held key.
   * @returns {boolean} True if the target value exists.
   * @public
   */
  has(value, strongKey) {
    const weakKey = this.#weakValueToInternalKeyMap.has(value);
    return weakKey ? this.#baseMap.has(weakKey, strongKey) : false;
  }

  /**
   * Determine if a key is valid.
   *
   * @param {*} strongKey The strongly held key.
   * @returns {boolean} True if the key is valid.
   * @see the base map class for further constraints.
   * @public
   */
  isValidKey(strongKey) {
    return this.#isValidKey(strongKey);
  }

  #isValidKey(strongKey) {
    const weakKey = {};
    return this.#baseMap.isValidKey(weakKey, strongKey);
  }

  /**
   * Determine if a value is valid.
   *
   * @param {*} value The value.
   * @returns {boolean} True if the value is valid.
   * @see the base map class for further constraints.
   * @public
   */
  isValidValue(value) {
    return Object(value) === value;
  }

  #requireValidKey(__argNames__, strongKey) {
    if (!this.#isValidKey(strongKey))
      throw new Error("Invalid key tuple: " + __argNames__);
  }

  #requireValidValue(argName, value) {
    if (!this.isValidValue(value))
      throw new Error(argName + " is not a valid value!");
  }
}

Reflect.defineProperty(OneToOneStrongMap, Symbol.toStringTag, {
  value: "OneToOneStrongMap",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(OneToOneStrongMap);
Object.freeze(OneToOneStrongMap.prototype);

export default OneToOneStrongMap;
