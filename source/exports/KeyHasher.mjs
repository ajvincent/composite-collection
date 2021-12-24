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
   * @type {Number}
   */
  #hashCount = 0;

  /**
   * @type {WeakMap<Object>}
   * @const
   */
  #weakValueToHash = new WeakMap();

  /**
   * @type {Map<value>}
   * @const
   */
  #strongValueToHash = new Map();

  /**
   * @type {string[]}
   * @const
   */
  #argList;

  /**
   * @param {string[]} argList The list of keys.
   */
  constructor(argList) {
    if (new.target !== KeyHasher)
      throw new Error("You cannot subclass KeyHasher!");

    this.#argList = argList;

    // freeze when we can convert the above to private class fields.
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
    if (!Array.isArray(valueList) || (valueList.length !== this.#argList.length))
      return null;

    valueList.forEach((value, index) => {
      const key = this.#argList[index];

      const map = Object(value) === value ? this.#weakValueToHash : this.#strongValueToHash;
      if (!map.has(value))
        map.set(value, this.#hashCount++);

      rv[key] = map.get(value);
    });

    return JSON.stringify(rv);
  }
}
Object.freeze(KeyHasher);
Object.freeze(KeyHasher.prototype);
