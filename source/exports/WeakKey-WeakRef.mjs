import KeyHasher from "./KeyHasher.mjs";

export default class WeakKeyComposer {
  /**
   * @param {string[]} weakArgList   The list of weak argument names.
   * @param {string[]} strongArgList The list of strong argument names.
   */
  constructor(weakArgList, strongArgList = []) {
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

    /** @type {WeakMap<object, Map<hash, WeakKey>>} @readonly @private */
    this.__keyOwner__ = new WeakMap;

    /** @type {string[]} @readonly @private */
    this.__weakArgList__ = weakArgList.slice();

    /** @type {string[]} @readonly @private */
    this.__strongArgList__ = strongArgList.slice();

    /** @type {KeyHasher} @readonly @private */
    this.__keyHasher__ = new KeyHasher(weakArgList.concat(strongArgList));

    /** @type {WeakMap<WeakKey, WeakRef<object>} @readonly @private */
    this.__weakKeyToFirstWeak__ = new WeakMap;

    /** @type {WeakMap<WeakKey, hash>} @readonly @private */
    this.__weakKeyToHash__ = new WeakMap;

    /** @type {WeakMap<WeakKey, Set<*>>?} @readonly @private */
    this.__weakKeyToStrongRefs__ = strongArgList.length ? new WeakMap : null;

    /** @type {FinalizationRegistry} @readonly @private */
    this.__keyFinalizer__ = new FinalizationRegistry(
      weakKey => this.__deleteWeakKey__(weakKey)
    );

    /** @type {WeakSet{object}} */
    this.__hasKeyParts__ = new WeakSet;

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
    const hash = this.__getHash__(weakArguments, strongArguments);
    if (!hash)
      return null;

    weakArguments.forEach(arg => this.__hasKeyParts__.add(arg));
    strongArguments.forEach(arg => {
      if (Object(arg) === arg)
        this.__hasKeyParts__.add(arg);
    });

    const firstWeak = weakArguments[0];
    if (!this.__keyOwner__.has(firstWeak)) {
      this.__keyOwner__.set(firstWeak, new Map);
    }
    const hashMap = this.__keyOwner__.get(firstWeak);

    if (!hashMap.has(hash)) {
      weakArguments.forEach(arg => {
        this.__keyFinalizer__.register(arg, this, this);
      });

      const weakKey = Object.freeze({});

      this.__weakKeyToFirstWeak__.set(weakKey, new WeakRef(weakArguments[0]));
      this.__weakKeyToHash__.set(weakKey, hash);
      if (strongArguments.length) {
        this.__weakKeyToStrongRefs__.set(weakKey, new Set(strongArguments));
      }
      hashMap.set(hash, weakKey);
    }

    return hashMap.get(hash);
  }

  hasKey(weakArguments, strongArguments) {
    if (weakArguments.some(arg => !this.__hasKeyParts__.has(arg)))
      return false;

    if (strongArguments.some(
      arg => (Object(arg) === arg) && !this.__hasKeyParts__.has(arg)
    ))
      return false;

    const firstWeak = weakArguments[0];
    if (!this.__keyOwner__.has(firstWeak)) {
      return false;
    }
    const hashMap = this.__keyOwner__.get(firstWeak);

    const hash = this.__getHash__(weakArguments, strongArguments);
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
    if (weakArguments.some(arg => !this.__hasKeyParts__.has(arg)))
      return false;

    if (strongArguments.some(
      arg => (Object(arg) === arg) && !this.__hasKeyParts__.has(arg)
    ))
      return false;

    const hash = this.__getHash__(weakArguments, strongArguments);
    if (!hash)
      return false;

    const firstWeak = weakArguments[0];
    if (!this.__keyOwner__.has(firstWeak))
      return false;

    const hashMap = this.__keyOwner__.get(firstWeak);
    const weakKey = hashMap.get(hash);
    if (weakKey) {
      this.__keyFinalizer__.unregister(weakKey);
      this.__weakKeyToFirstWeak__.delete(weakKey);
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
   * @private
   */
   __getHash__(weakArguments, strongArguments) {
    if (weakArguments.length !== this.__weakArgList__.length)
      return null;
    if (weakArguments.some(arg => Object(arg) !== arg))
      return null;
    if (strongArguments.length !== this.__strongArgList__.length)
      return null;
    return this.__keyHasher__.buildHash(weakArguments.concat(strongArguments));
  }

  /**
   * Delete all references to a given weak key.
   *
   * @param {Object} weakKey The key to delete.
   */
  __deleteWeakKey__(weakKey) {
    const firstKeyRef = this.__weakKeyToFirstWeak__.get(weakKey);
    if (!firstKeyRef)
      return;
    const firstWeak = firstKeyRef.deref();
    if (!firstWeak)
      return;

    const hash = this.__weakKeyToHash__.get(weakKey);
    this.__weakKeyToHash__.delete(weakKey);
    this.__weakKeyToFirstWeak__.delete(weakKey);

    const hashMap = this.__keyOwner__.get(firstWeak);
    hashMap.delete(hash);
  }
}
Object.freeze(WeakKeyComposer);
Object.freeze(WeakKeyComposer.prototype);
