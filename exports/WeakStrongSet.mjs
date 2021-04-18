/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import WeakKeyComposer from "./WeakKey-WeakMap.mjs";

export default class WeakStrongSet {
  constructor() {
    /** @type {WeakKeyComposer} @const @private */
    this.__keyComposer__ = new WeakKeyComposer(["weakKey"], ["strongKey"]);

    /**
     * @type {WeakMap<WeakKey, Set<*>>}
     * @const
     * @private
     */
    this.__weakKeyToStrongKeys__ = new WeakMap;

    /**
     * @type {string[]}
     * @const
     * @private
     */
    this.__strongArgNames__ = ["strongKey"];
  }

  /**
   * Add a key set to this collection.
   *
   * @param {object} weakKey   
   * @param {*}      strongKey 
   *
   * @returns {WeakStrongSet} This collection.
   * @public
   */
  add(weakKey, strongKey) {
    this.__requireValidKey__(weakKey, strongKey);

    const __key__ = this.__keyComposer__.getKey([weakKey], [strongKey]);
    if (!__key__)
      return null;
    if (!this.__weakKeyToStrongKeys__.has(__key__))
      this.__weakKeyToStrongKeys__.set(__key__, new Set([strongKey]));

    return this;
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

    if (!this.__keyComposer__.hasKey([weakKey], [strongKey]))
      return false;

    const __key__ = this.__keyComposer__.getKey([weakKey], [strongKey]);

    const __returnValue__ = this.__weakKeyToStrongKeys__.delete(__key__);
    if (__returnValue__)
      this.__keyComposer__.deleteKey([weakKey], [strongKey]);

    return __returnValue__;
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

    if (!this.__keyComposer__.hasKey([weakKey], [strongKey]))
      return false;

    const __key__ = this.__keyComposer__.getKey([weakKey], [strongKey]);

    return this.__weakKeyToStrongKeys__.has(__key__);
  }

  /**
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

Reflect.defineProperty(WeakStrongSet, Symbol.toStringTag, {
  value: "WeakStrongSet",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(WeakStrongSet);
Object.freeze(WeakStrongSet.prototype);
