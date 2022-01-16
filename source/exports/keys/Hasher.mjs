/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * @license MPL-2.0
 * @author Alexander J. Vincent <ajvincent@gmail.com>
 * @copyright © 2021-2022 Alexander J. Vincent
 * @file
 * This hashes multiple keys into a string.  Unknown keys get new hash values if we need them.
 */
export default class KeyHasher {
  /** @type {number} */
  #hashCount = 0;

  /** @type {WeakMap<object, string>} @constant */
  #weakValueToHash = new WeakMap();

  /** @type {Map<*, string>} @constant */
  #strongValueToHash = new Map();

  #getMap(key) {
    return Object(key) === key ? this.#weakValueToHash : this.#strongValueToHash;
  }

  #requireKey(key) {
    const map = this.#getMap(key);
    if (!map.has(key))
      map.set(key, (++this.#hashCount).toString(36));
    return map.get(key);
  }

  constructor() {
    if (new.target !== KeyHasher)
      throw new Error("You cannot subclass KeyHasher!");
    Object.freeze(this);
  }

  getHash(...args) {
    return args.map(arg => this.#requireKey(arg)).join(",");
  }

  hasHash(...args) {
    return args.every(arg => this.#getMap(arg).has(arg));
  }

  getHashIfExists(...args) {
    const values = [];
    const result = args.every(arg => {
      const map = this.#getMap(arg);
      const rv = map.get(arg);
      values.push(rv);
      return rv;
    });
    return result ? values.join(",") : "";
  }
}

Object.freeze(KeyHasher.prototype);
Object.freeze(KeyHasher);
