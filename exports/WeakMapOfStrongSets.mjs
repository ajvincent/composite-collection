/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import KeyHasher from "./keys/Hasher.mjs";
import WeakKeyComposer from "./keys/Composite.mjs";

/** @typedef {Map<hash, *[]>} WeakMapOfStrongSets~InnerMap */

export default class WeakMapOfStrongSets {
  /**
   * @type {WeakMap<WeakKey, WeakMapOfStrongSets~InnerMap>}
   * @constant
   * @note This is two levels. The first level is the WeakKey.  The second level is the strong set.
   */
  #root = new WeakMap();

  /** @type {WeakKeyComposer} @constant */
  #mapKeyComposer = new WeakKeyComposer(
    ["mapKey"], []
  );

  /** @type {KeyHasher} @constant */
  #setHasher = new KeyHasher(["setKey"]);

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.add(...entry);
      }
    }
  }

  /**
   * Add a key set to this collection.
   *
   * @param {object} mapKey 
   * @param {*}      setKey 
   *
   * @returns {WeakMapOfStrongSets} This collection.
   * @public
   */
  add(mapKey, setKey) {
    this.#requireValidKey(mapKey, setKey);
    const __innerMap__ = this.#requireInnerMap(mapKey);

    // level 2: inner map to set
    {
      const __setKeyHash__ = this.#setHasher.getHash(setKey);
      if (!__innerMap__.has(__setKeyHash__)) {
        __innerMap__.set(__setKeyHash__, [setKey]);
      }
    }

    return this;
  }

  /**
   * Add several sets to a map in this collection.
   *
   * @param {object} mapKey   
   * @param {Set[]}  __sets__ The sets to add.
   *
   * @returns {WeakMapOfStrongSets} This collection.
   * @public
   */
  addSets(mapKey, __sets__) {
    this.#requireValidMapKey(mapKey);
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== 1) {
        throw new Error(`Set at index ${__index__} doesn't have exactly 1 set argument!`);
      }
      this.#requireValidKey(mapKey, ...__set__);
      return __set__;
    });

    const __innerMap__ = this.#requireInnerMap(mapKey);

    // level 2: inner map to set
    __array__.forEach(__set__ => {
      const __setKeyHash__ = this.#setHasher.getHash(...__set__);
      if (!__innerMap__.has(__setKeyHash__)) {
        __innerMap__.set(__setKeyHash__, __set__);
      }
    });

    return this;
  }

  /**
   * Clear all sets from the collection for a given map keyset.
   *
   * @param {object} mapKey 
   *
   * @public
   */
  clearSets(mapKey) {
    this.#requireValidMapKey(mapKey);
    const __innerMap__ = this.#getExistingInnerMap(mapKey);
    if (!__innerMap__)
      return;

    __innerMap__.clear();
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {object} mapKey 
   * @param {*}      setKey 
   *
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(mapKey, setKey) {
    this.#requireValidKey(mapKey, setKey);
    const __innerMap__ = this.#getExistingInnerMap(mapKey);
    if (!__innerMap__)
      return false;

    // level 2: inner map to set
    if (!this.#setHasher.hasHash(setKey))
      return false;
    const __setKeyHash__ = this.#setHasher.getHash(setKey);
    const __returnValue__ = __innerMap__.delete(__setKeyHash__);

    if (__innerMap__.size === 0) {
      this.deleteSets(mapKey);
    }

    return __returnValue__;
  }

  /**
   * Delete all sets from the collection by the given map sequence.
   *
   * @param {object} mapKey 
   *
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  deleteSets(mapKey) {
    this.#requireValidMapKey(mapKey);

    if (!this.#mapKeyComposer.hasKey(
        [mapKey], []
      ))
      return false;

    const __mapKey__ = this.#mapKeyComposer.getKey(
      [mapKey], []
    );

    return this.#root.delete(__mapKey__);
  }

  /**
   * Iterate over the keys under a map in this collection.
   *
   * @param {WeakMapOfStrongSets~ForEachCallback} callback A function to invoke for each iteration.
   *
   * @public
   */
  forEachSet(mapKey, __callback__, __thisArg__) {
    this.#requireValidMapKey(mapKey);
    const __innerMap__ = this.#getExistingInnerMap(mapKey);
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, [mapKey, ...__keySet__, this])
    );
  }

  /**
   * @callback WeakMapOfStrongSets~ForEachCallback
   *
   * @param {object}              mapKey         
   * @param {*}                   setKey         
   * @param {WeakMapOfStrongSets} __collection__ This collection.
   */

  /**
   * The number of elements in a particular set.
   *
   * @param {object} mapKey 
   *
   * @public
   */
  getSizeOfSet(mapKey) {
    this.#requireValidMapKey(mapKey);
    const __innerMap__ = this.#getExistingInnerMap(mapKey);
    if (!__innerMap__)
      return 0;

    return __innerMap__.size;
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {object} mapKey 
   * @param {*}      setKey 
   *
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(mapKey, setKey) {
    this.#requireValidKey(mapKey, setKey);
    const __innerMap__ = this.#getExistingInnerMap(mapKey);
    if (!__innerMap__)
      return false;

    // level 2: inner map to set
    {
      if (!this.#setHasher.hasHash(setKey))
        return false;
      const __setKeyHash__ = this.#setHasher.getHash(setKey);
      return __innerMap__.has(__setKeyHash__);
    }
  }

  /**
   * Report if the collection has any sets for a map.
   *
   * @param {object} mapKey 
   * @param {*}      setKey 
   *
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  hasSets(mapKey) {
    this.#requireValidMapKey(mapKey);
    return Boolean(this.#getExistingInnerMap(mapKey));
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} mapKey 
   * @param {*}      setKey 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */
  isValidKey(mapKey, setKey) {
    return this.#isValidKey(mapKey, setKey);
  }

  /**
   * Return a new iterator for the sets of the collection in a map.
   *
   * @returns {Iterator<*>}
   * @public
   */
  valuesSet(mapKey) {
    this.#requireValidMapKey(mapKey);
    const __innerMap__ = this.#getExistingInnerMap(mapKey);
    if (!__innerMap__)
      return {
        next() {
          return {
            value: undefined,
            done: true
          }
        }
      };

    const __outerIter__ = __innerMap__.values();
    return {
      next() {
        let {
          value,
          done
        } = __outerIter__.next();
        if (done)
          return {
            value: undefined,
            done
          };

        value = [mapKey, ...value];
        return {
          value,
          done
        };
      }
    }
  }

  /**
   * Require an inner collection exist for the given map keys.
   *
   * @param {object} mapKey 
   */
  #requireInnerMap(mapKey) {
    const __mapKey__ = this.#mapKeyComposer.getKey(
      [mapKey], []
    );
    if (!this.#root.has(__mapKey__)) {
      this.#root.set(__mapKey__, new Map);
    }
    return this.#root.get(__mapKey__);
  }

  /**
   * Get an existing inner collection for the given map keys.
   *
   * @param {object} mapKey 
   *
   * @returns {WeakMapOfStrongSets~InnerMap}
   */
  #getExistingInnerMap(mapKey) {
    if (!this.#mapKeyComposer.hasKey(
        [mapKey], []
      ))
      return undefined;

    const __mapKey__ = this.#mapKeyComposer.getKey(
      [mapKey], []
    );

    return this.#root.get(__mapKey__);
  }

  /**
   * Throw if the key set is not valid.
   *
   * @param {object} mapKey 
   * @param {*}      setKey 
   *
   * @throws for an invalid key set.
   */
  #requireValidKey(mapKey, setKey) {
    if (!this.#isValidKey(mapKey, setKey))
      throw new Error("The ordered key set is not valid!");
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} mapKey 
   * @param {*}      setKey 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidKey(mapKey, setKey) {
    return this.#isValidMapKey(mapKey) && this.#isValidSetKey(setKey);
  }

  /**
   * Throw if the map key set is not valid.
   *
   * @param {object} mapKey 
   *
   * @throws for an invalid key set.
   */
  #requireValidMapKey(mapKey) {
    if (!this.#isValidMapKey(mapKey))
      throw new Error("The ordered map key set is not valid!");
  }

  /**
   * Determine if a set of map keys is valid.
   *
   * @param {object} mapKey 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidMapKey(mapKey) {
    if (!this.#mapKeyComposer.isValidForKey([mapKey], []))
      return false;

    return true;
  }

  /**
   * Determine if a set of set keys is valid.
   *
   * @param {*} setKey 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidSetKey(setKey) {
    void(setKey);

    return true;
  }
}

Reflect.defineProperty(WeakMapOfStrongSets, Symbol.toStringTag, {
  value: "WeakMapOfStrongSets",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(WeakMapOfStrongSets);
Object.freeze(WeakMapOfStrongSets.prototype);
