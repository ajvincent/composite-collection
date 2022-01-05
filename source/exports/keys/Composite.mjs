/**
 * @fileoverview
 */

import KeyHasher from "./Hasher.mjs";

/* Two levels of keys:
 * finalizerKey is a frozen object which never leaves this module.
 * weakKey is the actual key we give to the caller.
 *
 * Each weak argument, through keyFinalizer, holds a strong reference to finalizerKey
 * finalizerKey, through finalizerToPublic, holds a strong reference to weakKey
 * weakKeyPropertyMap holds a strong reference to an instance of WeakKeyPropertyBag,
 *   which holds weak references to finalizerKey and weakKey.
 * hashToPropertyMap holds a strong reference to the same instance of WeakKeyPropertyBag.
 */

class WeakKeyPropertyBag {
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

export default class WeakKeyComposer {
  /** @typedef {object} WeakKey */
  /** @typedef {object} FinalizerKey */
  /** @typedef {string} hash */

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
  * Get an unique key for an ordered set of weak and strong arguments.
  *
  * @param {*[]} weakArguments   The list of weak arguments.
  * @param {*[]} strongArguments The list of strong arguments.
  *
  * @returns {WeakKey}
  *
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
  *
  * @returns {boolean} True if the key exists.
  *
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
   * @param {*[]} weakArguments   The list of weak arguments.
   * @param {*[]} strongArguments The list of strong arguments.
   *
   * @returns {WeakKey?}
   *
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
  *
  * @returns {boolean} True if the key was deleted, false if the key wasn't found.
  *
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
  * @param {*[]} weakArguments   The list of weak arguments.
  * @param {*[]} strongArguments The list of strong arguments.
  *
  * @returns {boolean}
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
