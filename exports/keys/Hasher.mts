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

  #incrementer: (() => string) = () => {
    return (++this.#hashCount).toString(36);
  }

  #requireKey(key: unknown) : string
  {
    if (Object(key) === key) {
      return this.#weakValueToHash.getDefault(key as object, this.#incrementer);
    }
    return this.#strongValueToHash.getDefault(key, this.#incrementer);
  }

  constructor()
  {
    if (new.target !== KeyHasher)
      throw new Error("You cannot subclass KeyHasher!");
    Object.freeze(this);
  }

  getHash(...args: unknown[]) : string
  {
    const rv = args.map(arg => this.#requireKey(arg));
    return rv.join(",");
  }

  getHashIfExists(...args: unknown[]) : string
  {
    const values: string[] = [];
    const result = args.every(arg => {
      let rv: string | undefined;
      if (Object(arg) === arg)
        rv = this.#weakValueToHash.get(arg as object);
      else
        rv = this.#strongValueToHash.get(arg);

      if (rv)
        values.push(rv);
      return rv;
    });

    return result ? values.join(",") : "";
  }
}

Object.freeze(KeyHasher.prototype);
Object.freeze(KeyHasher);
