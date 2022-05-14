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
 * Template: Weak/Map
 * @license MPL-2.0
 * @author Alexander J. Vincent <ajvincent@gmail.com>
 * @copyright © 2021-2022 Alexander J. Vincent
 */
import WeakKeyComposer from "./keys/Composite.mjs";
class WeakStrongMap {
    // eslint-disable-next-line jsdoc/require-property
    /** @typedef {object} WeakKey */
    /** @type {WeakKeyComposer} @constant */
    #keyComposer = new WeakKeyComposer(["weakKey"], ["strongKey"]);
    /**
     * The root map holding weak composite keys and values.
     *
     * @type {WeakMap<WeakKey, *>}
     * @constant
     */
    #root = new WeakMap;
    constructor(iterable) {
        if (iterable) {
            for (let [weakKey, strongKey, value] of iterable) {
                this.set(weakKey, strongKey, value);
            }
        }
    }
    /**
     * Delete an element from the collection by the given key sequence.
     *
     * @param {object} weakKey   The weakly held key.
     * @param {*}      strongKey The strongly held key.
     * @returns {boolean} True if we found the value and deleted it.
     * @public
     */
    delete(weakKey, strongKey) {
        this.#requireValidKey(weakKey, strongKey);
        const __key__ = this.#keyComposer.getKeyIfExists([weakKey], [strongKey]);
        if (!__key__)
            return false;
        this.#keyComposer.deleteKey([weakKey], [strongKey]);
        return this.#root.delete(__key__);
    }
    /**
     * Get a value for a key set.
     *
     * @param {object} weakKey   The weakly held key.
     * @param {*}      strongKey The strongly held key.
     * @returns {*?} The value.  Undefined if it isn't in the collection.
     * @public
     */
    get(weakKey, strongKey) {
        this.#requireValidKey(weakKey, strongKey);
        const __key__ = this.#keyComposer.getKeyIfExists([weakKey], [strongKey]);
        return __key__ ? this.#root.get(__key__) : undefined;
    }
    /**
     * Report if the collection has a value for a key set.
     *
     * @param {object} weakKey   The weakly held key.
     * @param {*}      strongKey The strongly held key.
     * @returns {boolean} True if the key set refers to a value in the collection.
     * @public
     */
    has(weakKey, strongKey) {
        this.#requireValidKey(weakKey, strongKey);
        const __key__ = this.#keyComposer.getKeyIfExists([weakKey], [strongKey]);
        return __key__ ? this.#root.has(__key__) : false;
    }
    /**
     * Determine if a set of keys is valid.
     *
     * @param {object} weakKey   The weakly held key.
     * @param {*}      strongKey The strongly held key.
     * @returns {boolean} True if the validation passes, false if it doesn't.
     * @public
     */
    isValidKey(weakKey, strongKey) {
        return this.#isValidKey(weakKey, strongKey);
    }
    /**
     * Set a value for a key set.
     *
     * @param {object} weakKey   The weakly held key.
     * @param {*}      strongKey The strongly held key.
     * @param {*}      value     The value.
     * @returns {WeakStrongMap} This collection.
     * @public
     */
    set(weakKey, strongKey, value) {
        this.#requireValidKey(weakKey, strongKey);
        const __key__ = this.#keyComposer.getKey([weakKey], [strongKey]);
        this.#root.set(__key__, value);
        return this;
    }
    /**
     * Throw if the key set is not valid.
     *
     * @param {object} weakKey   The weakly held key.
     * @param {*}      strongKey The strongly held key.
     * @throws for an invalid key set.
     */
    #requireValidKey(weakKey, strongKey) {
        if (!this.#isValidKey(weakKey, strongKey))
            throw new Error("The ordered key set is not valid!");
    }
    /**
     * Determine if a set of keys is valid.
     *
     * @param {object} weakKey   The weakly held key.
     * @param {*}      strongKey The strongly held key.
     * @returns {boolean} True if the validation passes, false if it doesn't.
     */
    #isValidKey(weakKey, strongKey) {
        if (!this.#keyComposer.isValidForKey([weakKey], [strongKey]))
            return false;
        return true;
    }
    [Symbol.toStringTag] = "WeakStrongMap";
}
Object.freeze(WeakStrongMap);
Object.freeze(WeakStrongMap.prototype);
export default WeakStrongMap;
//# sourceMappingURL=WeakStrongMap.mjs.map