import KeyHasher from "./KeyHasher.mjs";

export default class WeakKeyComposer {
  /** @type {WeakMap<object, Map<hash, WeakKey>>} @const */
  #keyOwner = new WeakMap;

  /** @type {string[]} @const */
  #weakArgList;

  /** @type {string[]} @const */
  #strongArgList;

  /** @type {KeyHasher} @const */
  #keyHasher;

  /** @type {WeakMap<WeakKey, WeakRef<object>} @const */
  #weakKeyToFirstWeak = new WeakMap;

  /** @type {WeakMap<WeakKey, hash>} @const */
  #weakKeyToHash = new WeakMap;

  /** @type {WeakMap<WeakKey, Set<*>>?} @const */
  #weakKeyToStrongRefs;

  /** @type {FinalizationRegistry} @const */
  #keyFinalizer = new FinalizationRegistry(
    weakKey => this.#deleteWeakKey(weakKey)
  );

  /** @type {WeakSet{object}} */
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
    this.#keyHasher = new KeyHasher(weakArgList.concat(strongArgList));
    this.#weakKeyToStrongRefs = strongArgList.length ? new WeakMap : null;

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

    if (!hashMap.has(hash)) {
      weakArguments.forEach(arg => {
        this.#keyFinalizer.register(arg, this, this);
      });

      const weakKey = Object.freeze({});

      this.#weakKeyToFirstWeak.set(weakKey, new WeakRef(weakArguments[0]));
      this.#weakKeyToHash.set(weakKey, hash);
      if (strongArguments.length) {
        this.#weakKeyToStrongRefs.set(weakKey, new Set(strongArguments));
      }
      hashMap.set(hash, weakKey);
    }

    return hashMap.get(hash);
  }

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
      this.#weakKeyToFirstWeak.delete(weakKey);
      hashMap.delete(hash);
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
    return this.#keyHasher.buildHash(weakArguments.concat(strongArguments));
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
    const firstKeyRef = this.#weakKeyToFirstWeak.get(weakKey);
    if (!firstKeyRef)
      return;
    const firstWeak = firstKeyRef.deref();
    if (!firstWeak)
      return;

    const hash = this.#weakKeyToHash.get(weakKey);
    this.#weakKeyToHash.delete(weakKey);
    this.#weakKeyToFirstWeak.delete(weakKey);

    const hashMap = this.#keyOwner.get(firstWeak);
    hashMap.delete(hash);
  }
}
Object.freeze(WeakKeyComposer);
Object.freeze(WeakKeyComposer.prototype);
