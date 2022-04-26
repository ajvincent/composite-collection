/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * @license MPL-2.0
 * @author Alexander J. Vincent <ajvincent@gmail.com>
 * @copyright © 2021-2022 Alexander J. Vincent
 * @file
 * This transforms multiple object keys into a "weak key" object.  The weak arguments
 * in WeakKeyComposer.prototype.getKey() are the only guarantees that the weak key
 * will continue to exist:  if one of the weak arguments is no longer reachable,
 * the weak key is subject to garbage collection.
 */
declare class WeakKey {
    constructor();
}
/**
 * The weak key composer.
 *
 * @public
 * @classdesc
 *
 * Each weak argument, through #keyFinalizer, holds a strong reference to finalizerKey.
 * #finalizerToPublic maps from finalizerKey to weakKey.
 * #weakKeyPropertyMap maps from weakKey to an instance of WeakKeyPropertyBag,
 *   which holds weak references to finalizerKey and weakKey.
 * #hashToPropertyMap maps from a hash to the same instance of WeakKeyPropertyBag.
 *
 * Shorthand:
 * weakArg => finalizerKey => weakKey => WeakKeyPropertyBag -> the same weakKey, the same finalizerKey, hash -> the same WeakKeyPropertyBag
 */
export default class WeakKeyComposer {
    #private;
    /**
     * @param {string[]} weakArgList   The list of weak argument names.
     * @param {string[]} strongArgList The list of strong argument names.
     */
    constructor(weakArgList: string[], strongArgList?: string[]);
    /**
     * Get an unique key for an ordered set of weak and strong arguments.  Create it if there isn't one.
     *
     * @param {object[]}  weakArguments   The list of weak arguments.
     * @param {any[]} strongArguments The list of strong arguments.
     * @returns {WeakKey} The key.
     * @public
     */
    getKey(weakArguments: object[], strongArguments: unknown[]): WeakKey;
    /**
     * Determine if an unique key for an ordered set of weak and strong arguments exists.
     *
     * @param {object[]}  weakArguments   The list of weak arguments.
     * @param {any[]} strongArguments The list of strong arguments.
     * @returns {boolean} True if the key exists.
     * @public
     */
    hasKey(weakArguments: object[], strongArguments: unknown[]): boolean;
    /**
     * Get the unique key for an ordered set of weak and strong arguments if it exists.
     *
     * @param {object[]}  weakArguments   The list of weak arguments.
     * @param {any[]} strongArguments The list of strong arguments.
     * @returns {WeakKey?} The WeakKey, or null if there isn't one already.
     * @public
     */
    getKeyIfExists(weakArguments: object[], strongArguments: unknown[]): WeakKey | null;
    /**
     * Delete an unique key for an ordered set of weak and strong arguments.
     *
     * @param {object[]}  weakArguments   The list of weak arguments.
     * @param {any[]} strongArguments The list of strong arguments.
     * @returns {boolean} True if the key was deleted, false if the key wasn't found.
     * @public
     */
    deleteKey(weakArguments: object[], strongArguments: unknown[]): boolean;
    /**
     * Determine if the set of arguments is valid to form a key.
     *
     * @param {object[]}  weakArguments   The list of weak arguments.
     * @param {any[]} strongArguments The list of strong arguments.
     * @returns {boolean} True if the arguments may lead to a WeakKey.
     */
    isValidForKey(weakArguments: object[], strongArguments: unknown[]): boolean;
}
export {};
