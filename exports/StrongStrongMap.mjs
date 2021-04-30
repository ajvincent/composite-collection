/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import KeyHasher from "./KeyHasher.mjs";

export default class StrongStrongMap {
  constructor() {
    /**
     * The root map holding keys and values.
     *
     * @type {Map<string, StrongStrongMap~valueAndKeySet>}
     *
     * @private
     * @const
     */
    this.__root__ = new Map;

    /**
     * @typedef StrongStrongMap~valueAndKeySet
     * @property {*}   value  The actual value we store.
     * @property {*[]} keySet The set of keys we hashed.
     *
     * @private
     * @const
     */

    /**
     * @type {KeyHasher}
     * @private
     * @const
     */
    this.__hasher__ = new KeyHasher(["key1", "key2"]);

    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.set(...entry);
      }
    }
  }

  /**
   * The number of elements in this collection.
   *
   * @public
   * @const
   */
  get size() {
    return this.__root__.size;
  }

  /**
   * Clear the collection.
   *
   * @public
   */
  clear() {
    this.__root__.clear();
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {*} key1 
   * @param {*} key2 
   *
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(key1, key2) {
    const hash = this.__hasher__.buildHash([key1, key2]);
    return this.__root__.delete(hash);
  }

  /**
   * Return a new iterator for the key-value pairs of the collection.
   *
   * @returns {Iterator<[key1, key2, value]>}
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
   * @param {StrongStrongMap~ForEachCallback} callback A function to invoke for each iteration.
   *
   * @public
   */
  forEach(callback, thisArg) {
    this.__root__.forEach((valueAndKeySet) => {
      const args = valueAndKeySet.keySet.concat(this);
      args.unshift(valueAndKeySet.value);
      callback.apply(thisArg, [...args]);
    });
  }

  /**
   * @callback StrongStrongMap~ForEachCallback
   *
   * @param {*}               value          The value.
   * @param {*}               key1           
   * @param {*}               key2           
   * @param {StrongStrongMap} __collection__ This collection.
   *
   */

  /**
   * Get a value for a key set.
   *
   * @param {*} key1 
   * @param {*} key2 
   *
   * @returns {*?} The value.  Undefined if it isn't in the collection.
   * @public
   */
  get(key1, key2) {
    const hash = this.__hasher__.buildHash([key1, key2]);
    const valueAndKeySet = this.__root__.get(hash);
    return valueAndKeySet ? valueAndKeySet.value : valueAndKeySet;
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {*} key1 
   * @param {*} key2 
   *
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(key1, key2) {
    const hash = this.__hasher__.buildHash([key1, key2]);
    return this.__root__.has(hash);
  }

  /**
   * Return a new iterator for the key sets of the collection.
   *
   * @returns {Iterator<[key1, key2]>}
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
   * @param {*} key1  
   * @param {*} key2  
   * @param {*} value The value.
   *
   * @returns {StrongStrongMap} This collection.
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
   * Return a new iterator for the values of the collection.
   *
   * @returns {Iterator<*>}
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
   * @returns {Iterator<*>}
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

StrongStrongMap[Symbol.iterator] = function() {
  return this.entries();
}

Reflect.defineProperty(StrongStrongMap, Symbol.toStringTag, {
  value: "StrongStrongMap",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(StrongStrongMap);
Object.freeze(StrongStrongMap.prototype);
