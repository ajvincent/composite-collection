import KeyHasher from "./KeyHasher.mjs";

export default class WeakKeyComposer {
  #keyRoot = new WeakMap;

  /** @type {string[]} */
  #weakArgList;

  /** @type {string[]} */
  #strongArgList;

  /** @type {KeyHasher} */
  #keyHasher;

  /** @type {WeakSet{object}} @readonly */
  #hasKeyParts = new WeakSet;

  /** @type {Map<string, WeakSet<*>>} @readonly */
  #strongKeyToObject = new Map;

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
    this.#keyHasher = new KeyHasher(strongArgList);

    /** @type {WeakSet{object}} */
    this.#hasKeyParts = new WeakSet;

    /** @type {Map<string, WeakSet<*>>} */
    this.#strongKeyToObject = new Map;

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
    const weakKeys = this.#fillWeakArguments(weakArguments, strongArguments);
    if (!weakKeys)
      return null;

    weakArguments.forEach(arg => this.#hasKeyParts.add(arg));
    strongArguments.forEach(arg => {
      if (Object(arg) === arg)
        this.#hasKeyParts.add(arg);
    });

    const finalKey = weakKeys.pop();

    const finalMap = weakKeys.reduce((map, currentKey) => {
      if (!map.has(currentKey))
        map.set(currentKey, new WeakMap);
      return map.get(currentKey);
    }, this.#keyRoot);

    if (!finalMap.has(finalKey))
      finalMap.set(finalKey, Object.freeze({}));
    return finalMap.get(finalKey);
  }

  hasKey(weakArguments, strongArguments) {
    if (weakArguments.some(arg => !this.#hasKeyParts.has(arg)))
      return false;

    if (strongArguments.some(
      arg => (Object(arg) === arg) && !this.#hasKeyParts.has(arg)
    ))
      return false;

    const weakKeys = this.#fillWeakArguments(weakArguments, strongArguments);
    if (!weakKeys)
      return false;

    const finalKey = weakKeys.pop();

    const finalMap = weakKeys.reduce((map, currentKey) => {
      if (!map || !map.has(currentKey))
        return null;
      return map.get(currentKey);
    }, this.#keyRoot);
    if (!finalMap)
      return false;

    return finalMap.has(finalKey);
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

    const weakKeys = this.#fillWeakArguments(weakArguments, strongArguments);
    if (!weakKeys)
      return false;

    const finalKey = weakKeys.pop();

    const finalMap = weakKeys.reduce((map, currentKey) => {
      if (!map || !map.has(currentKey))
        return null;
      return map.get(currentKey);
    }, this.#keyRoot);

    return finalMap ? finalMap.delete(finalKey) : false;
  }

  /**
   * 
   * @param {*[]} weakArguments
   * @param {*[]} strongArguments
   *
   * @returns {*[]?}
   */
  #fillWeakArguments(weakArguments, strongArguments) {
    if (!this.isValidForKey(weakArguments, strongArguments))
      return null;

    weakArguments = weakArguments.slice();
    if (strongArguments.length) {
      weakArguments.push(this.#getStrongKey(strongArguments));
    }

    return weakArguments;
  }

  /**
   * Determine if the set of arguments is valid to form a key.
   * @param {*[]} weakArguments   The list of weak arguments.
   * @param {*[]} strongArguments The list of strong arguments.
   *
   * @returns {boolean}
   * @public
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
   * 
   * @param {*[]} strongArguments
   * @returns {Object}
   */
  #getStrongKey(strongArguments) {
    const strongHash = this.#keyHasher.buildHash(strongArguments);
    if (!this.#strongKeyToObject.has(strongHash)) {
      let newSet = new WeakSet(strongArguments.filter(value => Object(value) === value));
      this.#strongKeyToObject.set(strongHash, newSet);
    }
    return this.#strongKeyToObject.get(strongHash);
  }
}
Object.freeze(WeakKeyComposer);
Object.freeze(WeakKeyComposer.prototype);
