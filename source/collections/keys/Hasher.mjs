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
export default class KeyHasher {
    /** @type {number} */
    #hashCount = 0;
    /** @type {WeakMap<object, string>} @constant */
    #weakValueToHash = new DefaultWeakMap();
    /** @type {Map<*, string>} @constant */
    #strongValueToHash = new DefaultMap();
    /** @type {boolean} @constant */
    #sortKeys = false;
    #incrementer = () => {
        return (++this.#hashCount).toString(36);
    };
    #requireKey(key) {
        if (Object(key) === key) {
            return this.#weakValueToHash.getDefault(key, this.#incrementer);
        }
        return this.#strongValueToHash.getDefault(key, this.#incrementer);
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
    getHash(...args) {
        const rv = args.map(arg => this.#requireKey(arg));
        if (this.#sortKeys)
            rv.sort();
        return rv.join(",");
    }
    getHashIfExists(...args) {
        const values = [];
        const result = args.every(arg => {
            let rv;
            if (Object(arg) === arg)
                rv = this.#weakValueToHash.get(arg);
            else
                rv = this.#strongValueToHash.get(arg);
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
//# sourceMappingURL=Hasher.mjs.map