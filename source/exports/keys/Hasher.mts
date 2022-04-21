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

import { DefaultMap, DefaultWeakMap } from "./DefaultMap.mjs";

type WeakRefMap = DefaultWeakMap<object, string>
type StrongRefMap = DefaultMap<unknown, string>

export default class KeyHasher {
  /** @type {number} */
  #hashCount = 0;

  /** @type {WeakMap<object, string>} @constant */
  #weakValueToHash: WeakRefMap = new DefaultWeakMap();

  /** @type {Map<*, string>} @constant */
  #strongValueToHash: StrongRefMap = new DefaultMap();

  /** @type {boolean} @constant */
  #sortKeys = false;

  #getMap(key: unknown) : WeakRefMap | StrongRefMap {
    return Object(key) === key ? this.#weakValueToHash : this.#strongValueToHash;
  }

  #requireKey(key: any) : string {
    const map = this.#getMap(key);
    return map.getDefault(key, () => (++this.#hashCount).toString(36));
  }

  /**
   * @param {boolean} sortKeys True if we should sort the keys we generate.
   */
  constructor(sortKeys = false) {
    if (new.target !== KeyHasher)
      throw new Error("You cannot subclass KeyHasher!");
    this.#sortKeys = Boolean(sortKeys);
    Object.freeze(this);
  }

  getHash(...args: unknown[]) : string {
    const rv = args.map(arg => this.#requireKey(arg));
    if (this.#sortKeys)
      rv.sort();
    return rv.join(",");
  }

  getHashIfExists(...args: any[]) : string {
    const values: string[] = [];
    const result = args.every(arg => {
      const rv = this.#getMap(arg).get(arg);
      if (rv)
        values.push(rv);
      return rv;
    });

    if (!result)
      return "";

    if (this.#sortKeys)
      values.sort();

    return values.join(",");
  }
}

Object.freeze(KeyHasher.prototype);
Object.freeze(KeyHasher);
