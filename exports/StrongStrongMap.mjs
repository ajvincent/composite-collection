import KeyHasher from "composite-collection/KeyHasher";

export default class StrongStrongMap {
  constructor() {
    /**
     * The root map holding keys and values.
     *
     * @type {Map<string, StrongStrongMap~valueAndKeySet>}
     *
     * @private
     * @readonly
     */
    this.__root__ = new Map;

    /**
     * @typedef StrongStrongMap~valueAndKeySet
     * @property {void}   value  The actual value we store.
     * @property {void[]} keySet The set of keys we hashed.
     *
     * @private
     * @readonly
     */

    /**
     * @type {KeyHasher}
     */
    this.__hasher__ = new KeyHasher(["key1", "key2"]);
  }

  /**
   * The number of elements in this map.
   *
   * @public
   * @readonly
   */
  get size() {
    return this.__root__.size;
  }

  /**
   * Clear the map.
   *
   * @public
   */
  clear() {
    this.__root__.clear();
  }

  /**
   * Delete an element from the map by the given key sequence.
   *
   * @param {void} key1 
   * @param {void} key2 
   *
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(key1, key2) {
    const hash = this.__hasher__.buildHash([key1, key2]);
    return this.__root__.delete(hash);
  }

  /**
   * Return a new iterator for the key-value pairs of the map.
   *
   * @returns {Iterator<key1, key2, value>}
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
   * @param {StrongStrongMap~ForEachCallback} callback A function to invoke for each key set.
   *
   * @public
   */
  forEach(callback, thisArg) {
    this.__root__.forEach((valueAndKeySet, key, root) => {
      const args = valueAndKeySet.keySet.concat(this);
      args.unshift(valueAndKeySet.value);
      callback.apply(thisArg, [...args]);
    });
  }

  /**
   * @callback StrongStrongMap~ForEachCallback
   *
   * @param {void}            key1    
   * @param {void}            key2    
   * @param {StrongStrongMap} __map__ The map.
   *
   */

  /**
   * Get a value for a key set.
   *
   * @param {void} key1 
   * @param {void} key2 
   *
   * @returns {void?} The value.  Undefined if it isn't in the map.
   * @public
   */
  get(key1, key2) {
    const hash = this.__hasher__.buildHash([key1, key2]);
    const valueAndKeySet = this.__root__.get(hash);
    return valueAndKeySet ? valueAndKeySet.value : valueAndKeySet;
  }

  /**
   * Report if the map has a value for a key set.
   *
   * @param {void} key1 
   * @param {void} key2 
   *
   * @returns {boolean} True if the key set refers to a value in the map.
   * @public
   */
  has(key1, key2) {
    const hash = this.__hasher__.buildHash([key1, key2]);
    return this.__root__.has(hash);
  }

  /**
   * Return a new iterator for the key sets of the map.
   *
   * @returns {Iterator<key1, key2>}
   * @public
   */
  keys() {
    return this.__wrapIterator__(
      valueAndKeySet => valueAndKeySet.keySet.slice()
    );
  }

  /**
   * Set a value for a key set.
   *
   * @param {void} key1  
   * @param {void} key2  
   * @param {void} value The value to set.
   *
   * @returns {StrongStrongMap} This map.
   * @public
   */
  set(key1, key2, value) {
    const hash = this.__hasher__.buildHash([key1, key2]);
    const keySet = [key1, key2];
    Object.freeze(keySet);
    this.__root__.set(hash, {
      value,
      keySet
    });

    return this;
  }

  /**
   * Return a new iterator for the values of the map.
   *
   * @returns {Iterator<void>}
   * @public
   */
  values() {
    return this.__wrapIterator__(
      valueAndKeySet => valueAndKeySet.value
    );
  }

  /**
   * Bootstrap from the native Map's values() iterator to the kind of iterator we want.
   *
   * @param {function} unpacker The transforming function for values.
   *
   * @returns {Iterator<void>}
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
}

/**
 * Validate the arguments.
 *
 * @param {void} key1 
 * @param {void} key2 
 *
 * @private
 */


StrongStrongMap[Symbol.iterator] = function() {
  return this.entries();
}

Reflect.defineProperty(StrongStrongMap, Symbol.toStringTag, {
  value: "StrongStrongMap",
  writable: false,
  enumerable: false,
  configurable: true
});
