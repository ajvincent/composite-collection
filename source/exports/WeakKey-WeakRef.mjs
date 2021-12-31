/**
 * @fileoverview
 *
 * This provides weak keys held directly by a tuple of the first weak argument and
 * a hash of the remaining arguments.  The keys themselves live in #keyOwner below.
 *
 * This only guarantees the existence of the weak keys by the first argument.
 * If the second or third weak argument is garbage-collected, how do we know to delete the
 * weak key it depends on?  The key finalizer registers each weak argument (except the first)
 * with the held value being the weak key.  When any of these weak arguments hits garbage
 * collection, #deleteWeakKey() steps in to clean up the (first weak argument, hash) tuple.
 *
 * The #weakKeyPropertyMap maps from the weak key to the first weak argument (a weak cycle), the
 * hash and to any strong arguments.
 *
 * Therefore, the WeakKeyComposer holds references:
 * - strongly to strong arguments strongly once via #weakKeyPropertyMap
 * - weakly to the first weak argument via #keyOwner
 * - weakly to other weak arguments via the key hasher
 * - weakly to the WeakKey, dependent on the existence of all weak arguments and on none of the strong arguments.
 */

import KeyHasher from "./KeyHasher.mjs";

class WeakKeyPropertyBag {
  /**
   * 
   * @param {object} firstWeak
   * @param {string|*} hash
   * @param {*[]} strongArguments
   */
  constructor(firstWeak, hash, strongArguments) {
    this.firstWeakRef = new WeakRef(firstWeak);
    this.hash = hash;
    if (strongArguments.length)
      this.strongReferences = new Set(strongArguments);
    Object.freeze(this);
  }
}
Object.freeze(WeakKeyPropertyBag);
Object.freeze(WeakKeyPropertyBag.prototype);

class WeakKeyComposer {
  /** @typedef {object} WeakKey */

  /** @type {WeakMap<object, Map<hash, WeakKey>>} @constant */
  #keyOwner = new WeakMap;

  /** @type {string[]} @constant */
  #weakArgList;

  /** @type {string[]} @constant */
  #strongArgList;

  /** @type {KeyHasher?} @constant */
  #keyHasher = null;

  /** @type {WeakMap<WeakKey, WeakKeyPropertyBag>} @constant */
  #weakKeyPropertyMap = new WeakMap;

  /** @type {FinalizationRegistry} @constant */
  #keyFinalizer = new FinalizationRegistry(
    weakKey => this.#deleteWeakKey(weakKey)
  );

  /**
   * A collection of objects we know about.  Useful as an optimization before hashing.
   * @type {WeakSet{object}}
   * @constant
   */
  #hasKeyParts = new WeakSet;

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

    if ((weakArgList.length > 1) || (strongArgList.length > 1))
      this.#keyHasher = new KeyHasher(weakArgList.slice(1).concat(strongArgList));

    Object.freeze(this);
  }

  /**
   * Get an unique key for an ordered set of weak and strong arguments.
   *
   * @param {*[]} weakArguments   The list of weak arguments.
   * @param {*[]} strongArguments The list of strong arguments.
   *
   * @returns {WeakSet?} The key if found, null if not.
   *
   * @public
   */
  getKey(weakArguments, strongArguments) {
    const hash = this.#getHash(weakArguments, strongArguments);
    if (!hash)
      return null;

    weakArguments.forEach(arg => this.#hasKeyParts.add(arg));
    strongArguments.forEach(arg => {
      if (Object(arg) === arg)
        this.#hasKeyParts.add(arg);
    });

    const firstWeak = weakArguments[0];
    if (!this.#keyOwner.has(firstWeak)) {
      this.#keyOwner.set(firstWeak, new Map);
    }
    const hashMap = this.#keyOwner.get(firstWeak);

    let weakKey = hashMap.get(hash);

    if (!weakKey) {
      weakKey = Object.freeze({});

      weakArguments.forEach(arg => {
        this.#keyFinalizer.register(arg, weakKey, weakKey);
      });

      const bag = new WeakKeyPropertyBag(firstWeak, hash, this.#keyHasher ? strongArguments : []);
      this.#weakKeyPropertyMap.set(weakKey, bag)
      hashMap.set(hash, weakKey);
    }

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
    if (weakArguments.some(arg => !this.#hasKeyParts.has(arg)))
      return false;

    if (strongArguments.some(
      arg => (Object(arg) === arg) && !this.#hasKeyParts.has(arg)
    ))
      return false;

    const firstWeak = weakArguments[0];
    if (!this.#keyOwner.has(firstWeak)) {
      return false;
    }
    const hashMap = this.#keyOwner.get(firstWeak);

    const hash = this.#getHash(weakArguments, strongArguments);
    if (!hash)
      return false;

    return hashMap.has(hash);
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
    if (weakArguments.some(arg => !this.#hasKeyParts.has(arg)))
      return false;

    if (strongArguments.some(
      arg => (Object(arg) === arg) && !this.#hasKeyParts.has(arg)
    ))
      return false;

    const hash = this.#getHash(weakArguments, strongArguments);
    if (!hash)
      return false;

    const firstWeak = weakArguments[0];
    if (!this.#keyOwner.has(firstWeak))
      return false;

    const hashMap = this.#keyOwner.get(firstWeak);
    const weakKey = hashMap.get(hash);
    if (weakKey) {
      this.#keyFinalizer.unregister(weakKey);
      this.#weakKeyPropertyMap.delete(weakKey);
      hashMap.delete(hash);

      if (hashMap.size === 0)
        this.#keyOwner.delete(firstWeak);
    }
    return Boolean(weakKey);
  }

  /**
   * Get an unique hash for an ordered set of weak and strong arguments.
   *
   * @param {*[]} weakArguments   The list of weak arguments.
   * @param {*[]} strongArguments The list of strong arguments.
   *
   * @returns {hash?} The generated hash.
   */
  #getHash(weakArguments, strongArguments) {
    if (!this.isValidForKey(weakArguments, strongArguments))
      return null;
    if (this.#keyHasher)
      return this.#keyHasher.buildHash(weakArguments.slice(1).concat(strongArguments));
    return strongArguments[0];
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

  /**
   * Delete all references to a given weak key.
   *
   * @param {Object} weakKey The key to delete.
   */
  #deleteWeakKey(weakKey) {
    const propertyBag = this.#weakKeyPropertyMap.get(weakKey);
    if (!propertyBag)
      return;

    const firstWeak = propertyBag.firstWeakRef.deref();
    if (!firstWeak)
      return;

    this.#weakKeyPropertyMap.delete(weakKey);

    const hashMap = this.#keyOwner.get(firstWeak);
    hashMap.delete(propertyBag.hash);

    if (hashMap.size === 0)
      this.#keyOwner.delete(firstWeak);
  }
}
Object.freeze(WeakKeyComposer);
Object.freeze(WeakKeyComposer.prototype);

export default WeakKeyComposer;