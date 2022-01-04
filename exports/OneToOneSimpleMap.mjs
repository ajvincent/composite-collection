/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

class OneToOneSimpleMap {
  /** @constant */
  #baseMap = new WeakMap;

  /** @type {WeakMap<object, object>} @constant */
  #weakValueToInternalKeyMap = new WeakMap;

  /**
   * Bind two sets of keys and values together.
   *
   * @param {*} value_1 The value.
   * @param {*} value_2 The value.
   *
   * @public
   */
  bindOneToOne(value_1, value_2) {
    this.#requireValidValue("value_1", value_1);
    this.#requireValidValue("value_2", value_2);

    let key = this.#weakValueToInternalKeyMap.get(value_1);
    const __otherWeakKey__ = this.#weakValueToInternalKeyMap.get(value_2);
    if (!key) {
      key = __otherWeakKey__ || {};
    } else if (__otherWeakKey__ && (__otherWeakKey__ !== key)) {
      throw new Error("value_1 and value_2 are already in different one-to-one mappings!");
    }

    const __hasKeySet1__ = this.#baseMap.has(key);
    const __hasKeySet2__ = this.#baseMap.has(key);

    if (__hasKeySet1__ && (this.#baseMap.get(key) !== value_1))
      throw new Error("value_1 mismatch!");
    if (__hasKeySet2__ && (this.#baseMap.get(key) !== value_2))
      throw new Error("value_2 mismatch!");

    this.#weakValueToInternalKeyMap.set(value_1, key);
    this.#weakValueToInternalKeyMap.set(value_2, key);

    if (!__hasKeySet1__)
      this.#baseMap.set(key, value_1);

    if (!__hasKeySet2__)
      this.#baseMap.set(key, value_2);
  }

  /**
   * Delete a target value.
   *
   * @param {*} value The value.
   *
   * @returns {boolean} True if the target value was deleted.
   * @public
   */
  delete(value) {
    const key = this.#weakValueToInternalKeyMap.has(value);
    if (!key)
      return false;

    if (!this.#baseMap.has(key))
      return false;

    const __target__ = this.#baseMap.get(key);

    const __returnValue__ = this.#baseMap.delete(key);
    if (__returnValue__)
      this.#weakValueToInternalKeyMap.delete(__target__);
    return __returnValue__;
  }

  /**
   * Get a target value.
   *
   * @param {*} value The value.
   *
   * @returns {*} The target value.
   * @public
   */
  get(value) {
    const key = this.#weakValueToInternalKeyMap.get(value);
    return key ? this.#baseMap.get(key) : undefined;
  }

  /**
   * Determine if a target value exists.
   *
   * @param {*} value The value.
   *
   * @returns {boolean} True if the target value exists.
   * @public
   */
  has(value) {
    const key = this.#weakValueToInternalKeyMap.has(value);
    return key ? this.#baseMap.has(key) : false;
  }

  /**
   * Determine if a key is valid.
   *
   * @param {*} value The value.
   *
   * @returns {boolean} True if the key is valid.
   * @see the base map class for further constraints.
   * @public
   */
  isValidKey() {
    return this.#isValidKey();
  }

  #isValidKey() {
    const key = {};
    return this.#baseMap.isValidKey(key);
  }

  /**
   * Determine if a value is valid.
   *
   * @param {*} value The value.
   *
   * @returns {boolean} True if the value is valid.
   * @see the base map class for further constraints.
   * @public
   */
  isValidValue(value) {
    void value;
    return true;
    // configuration.valuesMustBeObjects: Object(value) === value;
    // baseConfiguration.valueType.argumentValidator: this.#baseMap.isValidValue(value);
  }

  #requireValidValue(argName, value) {
    if (!this.isValidValue(value))
      throw new Error(argName + " is not a valid value!");
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
