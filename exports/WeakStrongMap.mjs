/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import KeyHasher from "./KeyHasher.mjs"
import WeakKeyComposer from "./WeakKey-WeakMap.mjs"


export default class WeakStrongMap {
  constructor() {
    this.__weakArgCount__ = 1;
    this.__strongArgCount__ = 1;

    /**
     * @type {KeyHasher}
     * @private
     * @const
     */
    this.__keyHasher__ = new KeyHasher(["weakKey", "strongKey"]);

    /**
     * @type {WeakKeyComposer}
     * @private
     * @const
     */
    this.__keyComposer__ = new WeakKeyComposer(["weakKey"], ["strongKey"]);

    /**
     * The root map holding weak composite keys and values.
     *
     * @type {WeakMap<object, WeakMap<WeakKey, *>>}
     *
     * @private
     * @const
     */
    this.__root__ = new WeakMap;

    /**
     * @type {WeakMap<WeakKey, Set<*>>}
     * @const
     * @private
     */
    this.__weakKeyToStrongKeys__ = new WeakMap;

    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.set(...entry);
      }
    }
  }


  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {object} weakKey   
   * @param {*}      strongKey 
   *
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(weakKey, strongKey) {
    this.__requireValidKey__(weakKey, strongKey);
    const __keyMap__ = this.__root__.get(weakKey);
    if (!__keyMap__)
      return false;

    if (!this.__keyComposer__.hasKey([weakKey], [strongKey]))
      return false;

    const __key__ = this.__keyComposer__.getKey([weakKey], [strongKey]);
    this.__keyComposer__.deleteKey([weakKey], [strongKey]);
    return __keyMap__.delete(__key__);
  }

  /**
   * Get a value for a key set.
   *
   * @param {object} weakKey   
   * @param {*}      strongKey 
   *
   * @returns {*?} The value.  Undefined if it isn't in the collection.
   * @public
   */
  get(weakKey, strongKey) {
    this.__requireValidKey__(weakKey, strongKey);
    const __keyMap__ = this.__root__.get(weakKey);
    if (!__keyMap__)
      return undefined;

    if (!this.__keyComposer__.hasKey([weakKey], [strongKey]))
      return undefined;

    const __key__ = this.__keyComposer__.getKey([weakKey], [strongKey]);
    if (!__key__)
      return undefined;
    return __keyMap__.get(__key__);
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} weakKey   
   * @param {*}      strongKey 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */
  isValidKey(weakKey, strongKey) {
    return this.__isValidKey__(weakKey, strongKey);
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {object} weakKey   
   * @param {*}      strongKey 
   *
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(weakKey, strongKey) {
    this.__requireValidKey__(weakKey, strongKey);
    const __keyMap__ = this.__root__.get(weakKey);
    if (!__keyMap__)
      return false;

    if (!this.__keyComposer__.hasKey([weakKey], [strongKey]))
      return false;

    const __key__ = this.__keyComposer__.getKey([weakKey], [strongKey]);
    if (!__key__)
      return false;
    return __keyMap__.has(__key__);
  }

  /**
   * Set a value for a key set.
   *
   * @param {object} weakKey   
   * @param {*}      strongKey 
   * @param {*}      value     The value.
   *
   * @returns {WeakStrongMap} This collection.
   * @public
   */
  set(weakKey, strongKey, value) {
    this.__requireValidKey__(weakKey, strongKey);
    if (!this.__root__.has(weakKey))
      this.__root__.set(weakKey, new WeakMap);

    const __keyMap__ = this.__root__.get(weakKey);
    const __key__ = this.__keyComposer__.getKey([weakKey], [strongKey]);
    if (!this.__weakKeyToStrongKeys__.has(__key__))
      this.__weakKeyToStrongKeys__.set(__key__, new Set([strongKey]));

    __keyMap__.set(__key__, value);
    return this;
  }

  /**
   * Throw if the key set is not valid.
   *
   * @param {object} weakKey   
   * @param {*}      strongKey 
   *
   * @throws for an invalid key set.
   */
  __requireValidKey__(weakKey, strongKey) {
    if (!this.__isValidKey__(weakKey, strongKey))
      throw new Error("The ordered key set is not valid!");
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} weakKey   
   * @param {*}      strongKey 
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @private
   */
  __isValidKey__(weakKey, strongKey) {
    if (!this.__keyComposer__.isValidForKey([weakKey], [strongKey]))
      return false;


    return true;
  }
}

Reflect.defineProperty(WeakStrongMap, Symbol.toStringTag, {
  value: "WeakStrongMap",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(WeakStrongMap);
Object.freeze(WeakStrongMap.prototype);
