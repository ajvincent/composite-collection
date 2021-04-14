/** @module exports/KeyHasher.mjs */

/**
 * @fileoverview
 * This is a library meant to hash a composite map or set's keys into a
 * single string, easy and fast to generate.
 *
 * @package
 *
 * @note I'm not using private fields in this module yet, as Mozilla Firefox
 * doesn't support them at the time of this writing.
 */
export default class KeyHasher {
  /**
   * @param {string[]} argList The list of keys.
   */
  constructor(argList) {
    /**
     * @type {Number}
     * @private
     */
    this.__hashCount__ = 0;

    /**
     * @type {WeakMap<Object>}
     * @readonly
     * @private
     */
    this.__weakValueToHash__ = new WeakMap();

    /**
     * @type {Map<value>}
     * @readonly
     * @private
     */
    this.__strongValueToHash__ = new Map();

    /**
     * @type {string[]}
     * @private
     * @readonly
     */
    this.__argList__ = argList.slice();

    Object.seal(this);
  }

  /**
   * Build a hash of the key list.
   *
   * @param {*[]} valueList
   * @returns {string?}
   *
   * @public
   */
  buildHash(valueList) {
    const rv = {};
    if (!Array.isArray(valueList) || (valueList.length !== this.__argList__.length))
      return null;

    valueList.forEach((value, index) => {
      const key = this.__argList__[index];

      const map = Object(value) === value ? this.__weakValueToHash__ : this.__strongValueToHash__;
      if (!map.has(value))
        map.set(value, this.__hashCount__++);

      rv[key] = map.get(value);
    });

    return JSON.stringify(rv);
  }
}
Object.freeze(KeyHasher);
Object.freeze(KeyHasher.prototype);
