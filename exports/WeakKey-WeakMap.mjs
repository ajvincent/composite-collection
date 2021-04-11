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

    this.__keyRoot__ = new WeakMap;
    this.__weakArgList__ = weakArgList.slice();
    this.__strongArgList__ = strongArgList.slice();
    this.__keyHasher__ = new KeyHasher(strongArgList);

    /** @type {Map<string, object} */
    this.__strongKeyToObject__ = new Map;

    Object.freeze(this);
  }

  /**
   * Get an unique key for an ordered set of weak and strong arguments.
   *
   * @param {void[]} weakArguments   The list of weak arguments.
   * @param {void[]} strongArguments The list of strong arguments.
   *
   * @returns {WeakSet?} The key if found, null if not.
   *
   * @public
   */
  getKey(weakArguments, strongArguments) {
    weakArguments = this.__fillWeakArguments__(weakArguments, strongArguments);
    if (!weakArguments)
      return null;

    const finalKey = weakArguments.pop();

    const finalMap = weakArguments.reduce((map, currentKey) => {
      if (!map.has(currentKey))
        map.set(currentKey, new WeakMap);
      return map.get(currentKey);
    }, this.__keyRoot__);

    if (!finalMap)
      return null;

    if (!finalMap.has(finalKey))
      finalMap.set(finalKey, Object.freeze({}));
    return finalMap.get(finalKey);
  }

  /**
   * Delete an unique key for an ordered set of weak and strong arguments.
   *
   * @param {void[]} weakArguments   The list of weak arguments.
   * @param {void[]} strongArguments The list of strong arguments.
   *
   * @returns {boolean} True if the key was deleted, false if the key wasn't found.
   *
   * @public
   */
  deleteKey(weakArguments, strongArguments) {
    weakArguments = this.__fillWeakArguments__(weakArguments, strongArguments);
    if (!weakArguments)
      return false;

    const finalKey = weakArguments.pop();

    const finalMap = weakArguments.reduce((map, currentKey) => {
      if (!map || !map.has(currentKey))
        return null;
      return map.get(currentKey);
    }, this.__keyRoot__);

    return finalMap ? finalMap.delete(finalKey) : false;
  }

  /**
   * 
   * @param {void[]} weakArguments
   * @param {void[]} strongArguments
   *
   * @returns {void[]?}
   * @private
   */
  __fillWeakArguments__(weakArguments, strongArguments) {
    if (weakArguments.length !== this.__weakArgList__.length)
      return null;
    if (strongArguments.length !== this.__strongArgList__.length)
      return null;

    weakArguments = weakArguments.slice();
    if (strongArguments.length) {
      weakArguments.push(this.__getStrongKey__(strongArguments));
    }

    return weakArguments;
  }

  /**
   * 
   * @param {void[]} strongArguments
   * @returns {Object}
   *
   * @private
   */
  __getStrongKey__(strongArguments) {
    const strongHash = this.__keyHasher__.buildHash(strongArguments);
    if (!this.__strongKeyToObject__.has(strongHash))
      this.__strongKeyToObject__.set(strongHash, {});
    return this.__strongKeyToObject__.get(strongHash);
  }
}
Object.freeze(WeakKeyComposer);
Object.freeze(WeakKeyComposer.prototype);
