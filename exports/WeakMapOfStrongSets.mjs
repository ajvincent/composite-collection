/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import KeyHasher from "./keys/Hasher.mjs";
import WeakKeyComposer from "./keys/Composite.mjs";

/** @typedef {Map<hash, *[]>} WeakMapOfStrongSets~InnerMap */

class WeakMapOfStrongSets {
  /** @typedef {string} hash */
  /** @typedef {object} WeakKey */

  /**
   * @type {WeakMap<WeakKey, WeakMapOfStrongSets~InnerMap>}
   * @constant
   * This is two levels. The first level is the WeakKey.
   * The second level is the strong set.
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
   * @param {object} mapKey The map key.
   * @param {*}      setKey The set key.
   * @returns {WeakMapOfStrongSets} This collection.
   * @public
   */
  add(mapKey, setKey) {
    this.#requireValidKey(mapKey, setKey);
    const __innerMap__ = this.#requireInnerMap(mapKey);

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHash(setKey);
    if (!__innerMap__.has(__setKeyHash__)) {
      __innerMap__.set(__setKeyHash__, [setKey]);
    }

    return this;
  }

  /**
   * Add several sets to a map in this collection.
   *
   * @param {object} mapKey   The map key.
   * @param {Set[]}  __sets__ The sets to add.
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
   * @param {object} mapKey The map key.
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
   * @param {object} mapKey The map key.
   * @param {*}      setKey The set key.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(mapKey, setKey) {
    this.#requireValidKey(mapKey, setKey);
    const __innerMap__ = this.#getExistingInnerMap(mapKey);
    if (!__innerMap__)
      return false;

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHashIfExists(setKey);
    if (!__setKeyHash__)
      return false;
    const __returnValue__ = __innerMap__.delete(__setKeyHash__);

    if (__innerMap__.size === 0) {
      this.deleteSets(mapKey);
    }

    return __returnValue__;
  }

  /**
   * Delete all sets from the collection by the given map sequence.
   *
   * @param {object} mapKey The map key.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  deleteSets(mapKey) {
    this.#requireValidMapKey(mapKey);

    const __mapKey__ = this.#mapKeyComposer.getKeyIfExists(
      [mapKey], []
    );

    return __mapKey__ ? this.#root.delete(__mapKey__) : false;
  }

  /**
   * Iterate over the keys under a map in this collection.
   *
   * @param {object}                              mapKey       The map key.
   * @param {WeakMapOfStrongSets~ForEachCallback} __callback__ A function to invoke for each iteration.
   * @param {object}                              __thisArg__  Value to use as this when executing callback.
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
   * An user-provided callback to .forEach().
   *
   * @callback WeakMapOfStrongSets~ForEachCallback
   * @param {object}              mapKey         The map key.
   * @param {*}                   setKey         The set key.
   * @param {WeakMapOfStrongSets} __collection__ This collection.
   */

  /**
   * Get the size of a particular set.
   *
   * @param {object} mapKey The map key.
   * @returns {number} The set size.
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
   * @param {object} mapKey The map key.
   * @param {*}      setKey The set key.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(mapKey, setKey) {
    this.#requireValidKey(mapKey, setKey);
    const __innerMap__ = this.#getExistingInnerMap(mapKey);
    if (!__innerMap__)
      return false;

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHashIfExists(setKey);
    return __setKeyHash__ ? __innerMap__.has(__setKeyHash__) : false;
  }

  /**
   * Report if the collection has any sets for a map.
   *
   * @param {object} mapKey The map key.
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
   * @param {object} mapKey The map key.
   * @param {*}      setKey The set key.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */
  isValidKey(mapKey, setKey) {
    return this.#isValidKey(mapKey, setKey);
  }

  /**
   * Yield the sets of the collection in a map.
   *
   * @param {object} mapKey The map key.
   * @yields {*} The sets.
   * @public
   */
  * valuesSet(mapKey) {
    this.#requireValidMapKey(mapKey);

    const __innerMap__ = this.#getExistingInnerMap(mapKey);
    if (!__innerMap__)
      return;

    const __outerIter__ = __innerMap__.values();
    for (let __value__ of __outerIter__)
      yield [mapKey, ...__value__];
  }

  /**
   * Require an inner collection exist for the given map keys.
   *
   * @param {object} mapKey The map key.
   * @returns {WeakMapOfStrongSets~InnerMap} The inner collection.
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
   * @param {object} mapKey The map key.
   * @returns {WeakMapOfStrongSets~InnerMap?} The inner collection.
   */
  #getExistingInnerMap(mapKey) {
    const __mapKey__ = this.#mapKeyComposer.getKeyIfExists(
      [mapKey], []
    );

    return __mapKey__ ? this.#root.get(__mapKey__) : undefined;
  }

  /**
   * Throw if the key set is not valid.
   *
   * @param {object} mapKey The map key.
   * @param {*}      setKey The set key.
   * @throws for an invalid key set.
   */
  #requireValidKey(mapKey, setKey) {
    if (!this.#isValidKey(mapKey, setKey))
      throw new Error("The ordered key set is not valid!");
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} mapKey The map key.
   * @param {*}      setKey The set key.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidKey(mapKey, setKey) {
    return this.#isValidMapKey(mapKey) && this.#isValidSetKey(setKey);
  }

  /**
   * Throw if the map key set is not valid.
   *
   * @param {object} mapKey The map key.
   * @throws for an invalid key set.
   */
  #requireValidMapKey(mapKey) {
    if (!this.#isValidMapKey(mapKey))
      throw new Error("The ordered map key set is not valid!");
  }

  /**
   * Determine if a set of map keys is valid.
   *
   * @param {object} mapKey The map key.
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
   * @param {*} setKey The set key.
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

export default WeakMapOfStrongSets;
