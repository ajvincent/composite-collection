import KeyHasher from "./Hasher.mjs"
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

// eslint-disable-next-line jsdoc/require-property
/** @typedef {object} WeakKey */
// eslint-disable-next-line jsdoc/require-property
/** @typedef {object} FinalizerKey */
/** @typedef {string} hash */

class WeakKey {

}
class FinalizerKey {

}
type hash = string;

/**
 * @private
 * @classdesc
 * Internally, there are two levels of keys:
 * finalizerKey is a frozen object which never leaves this module.
 * weakKey is the actual key we give to the caller.
 */
class WeakKeyPropertyBag {
  finalizerKeyRef: WeakRef<FinalizerKey>;
  weakKeyRef: WeakRef<WeakKey>;
  hash: hash;
  strongRefSet: Set<any> | undefined;
  strongRef: any;

  /**
   * @param {FinalizerKey} finalizerKey    The finalizer key for deleting the weak key object.
   * @param {WeakKey}      weakKey         The weak key object.
   * @param {hash}         hash            A hash of all the arguments from a KeyHasher.
   * @param {*[]}          strongArguments The list of strong arguments.
   */
  constructor(finalizerKey: FinalizerKey, weakKey: WeakKey, hash: hash, strongArguments: ReadonlyArray<any>) {
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
  #weakArgList: ReadonlyArray<string>;

  /** @type {string[]} @constant */
  #strongArgList: ReadonlyArray<string>;

  /** @type {KeyHasher} @constant */
  #keyHasher: KeyHasher;

  /** @constant */
  #keyFinalizer: FinalizationRegistry<FinalizerKey> = new FinalizationRegistry(
    (finalizerKey: FinalizerKey) => this.#deleteByFinalizerKey(finalizerKey)
  );

  #finalizerToPublic = new WeakMap<FinalizerKey, WeakKey>();

  /** @constant */
  #weakKeyPropertyMap: WeakMap<WeakKey, WeakKeyPropertyBag> = new WeakMap;

  #hashToPropertyMap: Map<hash, WeakKeyPropertyBag> = new Map;

  /**
   * @param weakArgList   The list of weak argument names.
   * @param strongArgList The list of strong argument names.
   */
  constructor(weakArgList: string[], strongArgList: string[] = []) {
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

    this.#keyHasher = new KeyHasher();

    Object.freeze(this);
  }

  /**
   * Get an unique key for an ordered set of weak and strong arguments.  Create it if there isn't one.
   *
   * @param weakArguments   The list of weak arguments.
   * @param strongArguments The list of strong arguments.
   * @returns {WeakKey} The key.
   * @public
   */
  getKey(weakArguments: object[], strongArguments: any[]): WeakKey | null {
    if (!this.isValidForKey(weakArguments, strongArguments))
      throw new Error("Argument lists do not form a valid key!");

    const hash = this.#keyHasher.getHash(...weakArguments.concat(strongArguments));

    let properties = this.#hashToPropertyMap.get(hash);
    if (properties) {
      return properties.weakKeyRef.deref() || null;
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
   * @param weakArguments   The list of weak arguments.
   * @param strongArguments The list of strong arguments.
   * @returns True if the key exists.
   * @public
   */
  hasKey(weakArguments: object[], strongArguments: any[]) : boolean {
    const fullArgList = weakArguments.concat(strongArguments);
    const hash = this.#keyHasher.getHashIfExists(...fullArgList);
    return hash ? this.#hashToPropertyMap.has(hash) : false;
  }

  /**
   * Get the unique key for an ordered set of weak and strong arguments if it exists.
   *
   * @param {*[]} weakArguments   The list of weak arguments.
   * @param {*[]} strongArguments The list of strong arguments.
   * @returns {WeakKey?} The WeakKey, or null if there isn't one already.
   * @public
   */
  getKeyIfExists(weakArguments: object[], strongArguments: any[]) : WeakKey | null {
    const hash = this.#keyHasher.getHashIfExists(...weakArguments, ...strongArguments);
    if (!hash)
      return null;
    const properties = this.#hashToPropertyMap.get(hash);
    if (!properties)
      return null;
    const result = properties.weakKeyRef.deref();
    return result || null;
  }

  /**
   * Delete an unique key for an ordered set of weak and strong arguments.
   *
   * @param weakArguments   The list of weak arguments.
   * @param strongArguments The list of strong arguments.
   * @returns True if the key was deleted, false if the key wasn't found.
   * @public
   */
  deleteKey(weakArguments: object[], strongArguments: any[]): boolean {
    void weakArguments;
    void strongArguments;

    const fullArgList = weakArguments.concat(strongArguments);

    const hash = this.#keyHasher.getHashIfExists(...fullArgList);
    if (!hash)
      return false;

    const properties = this.#hashToPropertyMap.get(hash);
    if (!properties)
      return false;

    const finalizerKey = properties.finalizerKeyRef.deref();
    if (!finalizerKey)
      return false;
    return this.#deleteByFinalizerKey(finalizerKey);
  }

  #deleteByFinalizerKey(finalizerKey: FinalizerKey) {
    const weakKey = this.#finalizerToPublic.get(finalizerKey);
    if (!weakKey)
      return false;

    const properties = this.#weakKeyPropertyMap.get(weakKey);
    if (!properties)
      return false;

    this.#keyFinalizer.unregister(finalizerKey);
    this.#finalizerToPublic.delete(finalizerKey);
    this.#weakKeyPropertyMap.delete(weakKey);
    this.#hashToPropertyMap.delete(properties.hash);

    return true;
  }

  /**
   * Determine if the set of arguments is valid to form a key.
   *
   * @param weakArguments   The list of weak arguments.
   * @param strongArguments The list of strong arguments.
   * @returns True if the arguments may lead to a WeakKey.
   */
  isValidForKey(weakArguments: object[], strongArguments: any[]): boolean {
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
