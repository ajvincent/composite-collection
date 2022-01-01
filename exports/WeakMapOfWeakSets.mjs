/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import WeakKeyComposer from "./keys/Composite.mjs";

export default class WeakMapOfWeakSets {
  /**
   * @type {WeakMap<WeakKey, WeakSet<WeakKey>>}
   * @note This is two levels.  The first level is the map's weak key.
   * The second level is the weak set of weak keys.
   */
  #root = new WeakMap();

  /** @type {WeakKeyComposer} */
  #mapKeyComposer = new WeakKeyComposer(
    ["mapKey"], []
  );

  /** @type {WeakKeyComposer} */
  #setKeyComposer = new WeakKeyComposer(
    ["setKey"], []
  );

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
   * @param {object} setKey 
   *
   * @returns {WeakMapOfWeakSets} This collection.
   * @public
   */
  add(mapKey, setKey) {
    this.#requireValidKey(mapKey, setKey);
    const __innerSet__ = this.#requireInnerSet(mapKey);

    // level 2: inner WeakSet
    const __weakSetKey__ = this.#setKeyComposer.getKey(
      [setKey], []
    );

    __innerSet__.add(__weakSetKey__);
    return this;
  }

  /**
   * Add several sets to a map in this collection.
   *
   * @param {object} mapKey   
   * @param {Set[]}  __sets__ The sets to add.
   *
   * @returns {WeakMapOfWeakSets} This collection.
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

    const __innerSet__ = this.#requireInnerSet(mapKey);

    __array__.forEach(__set__ => {
      const [setKey] = __set__;
      const __weakSetKey__ = this.#setKeyComposer.getKey(
        [setKey], []
      );

      __innerSet__.add(__weakSetKey__);
    });
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {object} mapKey 
   * @param {object} setKey 
   *
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(mapKey, setKey) {
    this.#requireValidKey(mapKey, setKey);
    const __innerSet__ = this.#getExistingInnerSet(mapKey);
    if (!__innerSet__)
      return false;

    if (!this.#setKeyComposer.hasKey(
        [setKey], []
      ))
      return false;

    const __returnValue__ = this.#setKeyComposer.deleteKey(
      [setKey], []
    );

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
   * Report if the collection has a value for a key set.
   *
   * @param {object} mapKey 
   * @param {object} setKey 
   *
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(mapKey, setKey) {
    this.#requireValidKey(mapKey, setKey);
    const __innerSet__ = this.#getExistingInnerSet(mapKey);
    if (!__innerSet__)
      return false;

    if (!this.#setKeyComposer.hasKey(
        [setKey], []
      ))
      return false;

    const __weakSetKey__ = this.#setKeyComposer.getKey(
      [setKey], []
    );

    return __innerSet__.has(__weakSetKey__);
  }

  /**
   * Report if the collection has any sets for a map.
   *
   * @param {object} mapKey 
   * @param {object} setKey 
   *
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  hasSets(mapKey) {
    this.#requireValidMapKey(mapKey);
    return Boolean(this.#getExistingInnerSet(mapKey));
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} mapKey 
   * @param {object} setKey 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */
  isValidKey(mapKey, setKey) {
    return this.#isValidKey(mapKey, setKey);
  }

  /**
   * Require an inner collection exist for the given map keys.
   *
   * @param {object} mapKey 
   */
  #requireInnerSet(mapKey) {
    const __mapKey__ = this.#mapKeyComposer.getKey(
      [mapKey], []
    );
    if (!this.#root.has(__mapKey__)) {
      this.#root.set(__mapKey__, new WeakSet);
    }
    return this.#root.get(__mapKey__);
  }

  /**
   * Get an existing inner collection for the given map keys.
   *
   * @param {object} mapKey 
   *
   * @returns {WeakMapOfWeakSets~InnerMap}
   */
  #getExistingInnerSet(mapKey) {
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
   * @param {object} setKey 
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
   * @param {object} setKey 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidKey(mapKey, setKey) {
    return this.#isValidMapKey(mapKey) &&
      this.#isValidSetKey(setKey);
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
   * @param {object} setKey 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidSetKey(setKey) {
    if (!this.#setKeyComposer.isValidForKey([setKey], []))
      return false;

    return true;
  }
}

Reflect.defineProperty(WeakMapOfWeakSets, Symbol.toStringTag, {
  value: "WeakMapOfWeakSets",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(WeakMapOfWeakSets);
Object.freeze(WeakMapOfWeakSets.prototype);
