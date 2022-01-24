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

import KeyHasher from "./Hasher.mjs";

// eslint-disable-next-line jsdoc/require-property
/** @typedef {object} WeakKey */
// eslint-disable-next-line jsdoc/require-property
/** @typedef {object} FinalizerKey */
/** @typedef {string} hash */

/**
 * @private
 * @classdesc
 * Internally, there are two levels of keys:
 * finalizerKey is a frozen object which never leaves this module.
 * weakKey is the actual key we give to the caller.
 */
class WeakKeyPropertyBag {
  /**
   * @param {FinalizerKey} finalizerKey    The finalizer key for deleting the weak key object.
   * @param {WeakKey}      weakKey         The weak key object.
   * @param {hash}         hash            A hash of all the arguments from a KeyHasher.
   * @param {*[]}          strongArguments The list of strong arguments.
   */
  constructor(finalizerKey, weakKey, hash, strongArguments) {
    this.finalizerKeyRef = new WeakRef(finalizerKey);
    this.weakKeyRef = new WeakRef(weakKey);

    this.hash = hash;

    if (strongArguments.length > 1) {
      this.strongRefSet = new Set(strongArguments);
    }
    else if (strongArguments.length === 1) {
      this.strongRef = strongArguments[0];
    }
  }
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
 */
export default class WeakKeyComposer {
  /** @type {string[]} @constant */
  #weakArgList;

  /** @type {string[]} @constant */
  #strongArgList;

  /** @type {KeyHasher} @constant */
  #keyHasher;

  /** @type {FinalizationRegistry} @constant */
  #keyFinalizer = new FinalizationRegistry(
    finalizerKey => this.#deleteByFinalizerKey(finalizerKey)
  );

  /** @type {WeakMap<FinalizerKey, WeakKey>} */
  #finalizerToPublic = new WeakMap;

  /** @type {WeakMap<WeakKey, WeakKeyPropertyBag>} @constant */
  #weakKeyPropertyMap = new WeakMap;

  /** @type {Map<hash, WeakKeyPropertyBag>} */
  #hashToPropertyMap = new Map;

  /**
   * @param {string[]} weakArgList   The list of weak argument names.
   * @param {string[]} strongArgList The list of strong argument names.
   */
  constructor(weakArgList, strongArgList = []) {
    if (new.target !== WeakKeyComposer)
      throw new Error("You cannot subclass WeakKeyComposer!");
    if (!Array.isArray(weakArgList) || (weakArgList.length === 0))
      throw new Error("weakArgList must be a string array of at least one argument!");
    if (!Array.isArray(strongArgList))
      throw new Error("strongArgList must be a string array!");

    // require all arguments be unique strings
    {
      const allArgs = weakArgList.concat(strongArgList);
      if (!allArgs.every(arg => (typeof arg === "string") && (arg.length > 0)))
        throw new Error("weakArgList and strongArgList can only contain non-empty strings!");

      const argSet = new Set(allArgs);
      if (argSet.size !== allArgs.length)
        throw new Error("There is a duplicate argument among weakArgList and strongArgList!");
    }

    this.#weakArgList = weakArgList.slice();
    this.#strongArgList = strongArgList.slice();

    this.#keyHasher = new KeyHasher(weakArgList.concat(strongArgList));

    Object.freeze(this);
  }

  /**
   * Get an unique key for an ordered set of weak and strong arguments.  Create it if there isn't one.
   *
   * @param {*[]} weakArguments   The list of weak arguments.
   * @param {*[]} strongArguments The list of strong arguments.
   * @returns {WeakKey} The key.
   * @public
   */
  getKey(weakArguments, strongArguments) {
    if (!this.isValidForKey(weakArguments, strongArguments))
      throw new Error("Argument lists do not form a valid key!");

    const hash = this.#keyHasher.getHash(...weakArguments.concat(strongArguments));

    let properties = this.#hashToPropertyMap.get(hash);
    if (properties) {
      return properties.weakKeyRef.deref();
    }

    const finalizerKey = Object.freeze({});
    const weakKey = Object.freeze({});

    properties = new WeakKeyPropertyBag(finalizerKey, weakKey, hash, strongArguments);

    weakArguments.forEach(weakArg => this.#keyFinalizer.register(weakArg, finalizerKey, finalizerKey));
    this.#finalizerToPublic.set(finalizerKey, weakKey);
    this.#weakKeyPropertyMap.set(weakKey, properties);
    this.#hashToPropertyMap.set(hash, properties);

    return weakKey;
  }

  /**
   * Determine if an unique key for an ordered set of weak and strong arguments exists.
   *
   * @param {*[]} weakArguments   The list of weak arguments.
   * @param {*[]} strongArguments The list of strong arguments.
   * @returns {boolean} True if the key exists.
   * @public
   */
  hasKey(weakArguments, strongArguments) {
    const fullArgList = weakArguments.concat(strongArguments);

    if (!this.#keyHasher.hasHash(...fullArgList)) {
      return false;
    }

    const hash = this.#keyHasher.getHash(...fullArgList);
    return this.#hashToPropertyMap.has(hash);
  }

  /**
   * Get the unique key for an ordered set of weak and strong arguments if it exists.
   *
   * @param {*[]} weakArguments   The list of weak arguments.
   * @param {*[]} strongArguments The list of strong arguments.
   * @returns {WeakKey?} The WeakKey, or null if there isn't one already.
   * @public
   */
  getKeyIfExists(weakArguments, strongArguments) {
    let hash = this.#keyHasher.getHashIfExists(...weakArguments, ...strongArguments);
    if (!hash)
      return null;
    let properties = this.#hashToPropertyMap.get(hash);
    return properties ? properties.weakKeyRef.deref() : null;
  }

  /**
   * Delete an unique key for an ordered set of weak and strong arguments.
   *
   * @param {*[]} weakArguments   The list of weak arguments.
   * @param {*[]} strongArguments The list of strong arguments.
   * @returns {boolean} True if the key was deleted, false if the key wasn't found.
   * @public
   */
  deleteKey(weakArguments, strongArguments) {
    void weakArguments;
    void strongArguments;

    const fullArgList = weakArguments.concat(strongArguments);

    if (!this.#keyHasher.hasHash(...fullArgList)) {
      return false;
    }

    const hash = this.#keyHasher.getHash(...fullArgList);
    const properties = this.#hashToPropertyMap.get(hash);

    if (!properties)
      return false;

    const finalizerKey = properties.finalizerKeyRef.deref();
    return this.#deleteByFinalizerKey(finalizerKey);
  }

  #deleteByFinalizerKey(finalizerKey) {
    const weakKey = this.#finalizerToPublic.get(finalizerKey);
    if (!weakKey)
      return false;

    const properties = this.#weakKeyPropertyMap.get(weakKey);

    this.#keyFinalizer.unregister(finalizerKey);
    this.#finalizerToPublic.delete(finalizerKey);
    this.#weakKeyPropertyMap.delete(weakKey);
    this.#hashToPropertyMap.delete(properties.hash);

    return true;
  }

  /**
   * Determine if the set of arguments is valid to form a key.
   *
   * @param {*[]} weakArguments   The list of weak arguments.
   * @param {*[]} strongArguments The list of strong arguments.
   * @returns {boolean} True if the arguments may lead to a WeakKey.
   */
  isValidForKey(weakArguments, strongArguments) {
    if (weakArguments.length !== this.#weakArgList.length)
      return false;
    if (weakArguments.some(arg => Object(arg) !== arg))
      return false;
    if (strongArguments.length !== this.#strongArgList.length)
      return false;
    return true;
  }
}

Object.freeze(WeakKeyComposer);
Object.freeze(WeakKeyComposer.prototype);
