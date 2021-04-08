import KeyHasher from "./KeyHasher.mjs";

/**
 * @typedef SoloStrongMap~valueAndKeySet
 * @property {void}   value  The actual value we store.
 * @property {void[]} keySet The set of keys we hashed.
 * @private
 */

export default class SoloStrongMap {
  constructor() {
    /**
     * @type {Map<string, SoloStrongMap~valueAndKeySet>}
     * @private
     * @readonly
     */
    this.__root__ = new Map;

    /**
     * @type {KeyHasher}
     */
    this.__hasher__ = new KeyHasher(["key"]);
  }

  /**
   * The number of elements in this map.
   * @type {number}
   * @public
   */
  get size() {
    return this.__root__.size;
  }

  /**
   * Clear the map.
   * @public
   */
  clear() {
    this.__root__.clear();
  }

  /**
   * Delete an element from the map by the given key sequence.
   * __argDescriptions__
   * __valueDescription__
   *
   * @returns {boolean} True if the item was found and deleted.
   * @public
   */
  delete(key) {
    const hash = this.__hasher__.buildHash([key]);
    return this.__root__.delete(hash);
  }

  /**
   * Return a new iterator for the key-value pairs of the map.
   *
   * @returns {Iterator<key, value>}
   * @public
   */
  entries() {
    return this.__wrapIterator__(
      valueAndKeySet => valueAndKeySet.keySet.concat(valueAndKeySet.value)
    );
  }

  /**
   * Iterate over the keys and values.
   *
   * @param {SoloStrongMap~ForEachCallback} callback A function to invoke for each key set.
   *
   * @public
   */
  forEach(callback) {
    this.__root__.forEach((valueAndKeySet, key, root) => {
      const args = valueAndKeySet.keySet.concat(this);
      args.unshift(valueAndKeySet.value);
      callback(...args);
    });
  }

  /**
   * @callback SoloStrongMap~ForEachCallback
   * __argDescriptions__
   * __valueDescription__
   * @param {SoloStrongMap} The map.
   */

  /**
   * Get a value for a key set.
   *
   * __argDescriptions__
   *
   * @returns {__valueType__?}
   * @public
   */
  get(key) {
    const hash = this.__hasher__.buildHash([key]);
    const valueAndKeySet = this.__root__.get(hash);
    return valueAndKeySet ? valueAndKeySet.value : valueAndKeySet;
  }

  /**
   * Report if the map has a value for a key set.
   *
   * __argDescriptions__
   *
   * @returns {boolean} True if the key set refers to a value.
   * @public
   */
  has(key) {
    const hash = this.__hasher__.buildHash([key]);
    return this.__root__.has(hash);
  }

  /**
   * Return a new iterator for the key sets of the map.
   *
   * @returns {Iterator<key>}
   * @public
   */
  keys() {
    return this.__wrapIterator__(
      valueAndKeySet => valueAndKeySet.keySet.slice()
    );
  }

  set(key, value) {
    const hash = this.__hasher__.buildHash([key]);
    const keySet = [key];
    Object.freeze(keySet);
    this.__root__.set(hash, {
      value,
      keySet
    });

    return this;
  }

  /**
   * Return a new iterator for the value of the map.
   *
   * @returns {Iterator<value>}
   * @public
   */
  values() {
    return this.__wrapIterator__(
      valueAndKeySet => valueAndKeySet.value
    );
  }

  /**
   * Bootstrap from the native Map's values() iterator to the kind of iterator we want.
   * @param {function} unpacker The transforming function for values.
   *
   * @returns {Iterator}
   * @private
   */
  __wrapIterator__(unpacker) {
    const rootIter = this.__root__.values();
    return {
      next() {
        const {
          value,
          done
        } = rootIter.next();
        return {
          value: done ? undefined : unpacker(value),
          done
        };
      }
    }
  }

  /**
   * Validate the arguments.
   *
   * __argDescriptions__
   */
}

SoloStrongMap[Symbol.iterator] = function() {
  return this.entries();
}

Reflect.defineProperty(SoloStrongMap, Symbol.toStringTag, {
  value: "SoloStrongMap",
  writable: false,
  enumerable: false,
  configurable: true
});
