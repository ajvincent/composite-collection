/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import WeakKeyComposer from "./keys/Composite.mjs";

class WeakStrongMap {
  /** @type {WeakKeyComposer} @constant */
  #keyComposer = new WeakKeyComposer(["weakKey"], ["strongKey"]);

  /**
  * The root map holding weak composite keys and values.
  *
  * @type {WeakMap<WeakKey, *>}
  *
  * @constant
  */
  #root = new WeakMap;

  constructor() {
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
    this.#requireValidKey(weakKey, strongKey);
    if (!this.#keyComposer.hasKey([weakKey], [strongKey]))
      return false;

    const __key__ = this.#keyComposer.getKey([weakKey], [strongKey]);
    this.#keyComposer.deleteKey([weakKey], [strongKey]);
    return this.#root.delete(__key__);
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
    this.#requireValidKey(weakKey, strongKey);
    if (!this.#keyComposer.hasKey([weakKey], [strongKey]))
      return undefined;

    const __key__ = this.#keyComposer.getKey([weakKey], [strongKey]);
    return this.#root.get(__key__);
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
    this.#requireValidKey(weakKey, strongKey);

    if (!this.#keyComposer.hasKey([weakKey], [strongKey]))
      return false;

    const __key__ = this.#keyComposer.getKey([weakKey], [strongKey]);
    if (!__key__)
      return false;
    return this.#root.has(__key__);
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
    return this.#isValidKey(weakKey, strongKey);
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
    this.#requireValidKey(weakKey, strongKey);

    const __key__ = this.#keyComposer.getKey([weakKey], [strongKey]);
    this.#root.set(__key__, value);
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
  #requireValidKey(weakKey, strongKey) {
    if (!this.#isValidKey(weakKey, strongKey))
      throw new Error("The ordered key set is not valid!");
  }

  /**
  * Determine if a set of keys is valid.
  *
  * @param {object} weakKey   
  * @param {*}      strongKey 
  *
  * @returns {boolean} True if the validation passes, false if it doesn't.
  */
  #isValidKey(weakKey, strongKey) {
    if (!this.#keyComposer.isValidForKey([weakKey], [strongKey]))
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

export default class __className__ {
  #baseMap = new WeakStrongMap;

  /** @type {WeakMap<object, object>} */
  #weakValueToInternalKeyMap = new WeakMap;

  /** @type {Map<*, object>} */
  /*
  #strongValueToInternalKeyMap = new Map;
  */

  /*
  #getValueMap(baseValue) {
    return Object(value) === value ?
           this.#weakValueToInternalKeyMap :
           this.#strongValueToInternalKeyMap;
  }
  */

  /*
  defines.get("getKeyMap") returns:
    "#strongValueToInternalKeyMap" if configuration.holdValuesStrongly
    "#weakValueToInternalKeyMap" if configuration.valuesMustBeObjects
    "#getValueMap(value)" otherwise
  */

  bindOneToOne(strongKey1, value1, strongKey2, value2) {
    this.#requireValidKey("(strongKey1)", strongKey1);
    this.#requireValidValue("value1", value1);
    this.#requireValidKey("(strongKey2)", strongKey2);
    this.#requireValidValue("value2", value2);

    if (this.#weakValueToInternalKeyMap.has(value2))
      throw new Error("value2 already has a bound key set!");

    let __weakKey__ = this.#weakValueToInternalKeyMap.get(value1);
    if (!__weakKey__) {
      __weakKey__ = {};
      this.#weakValueToInternalKeyMap.set(value1, __weakKey__);
    }

    const __hasKeySet1__  = this.#baseMap.has(__weakKey__, strongKey1),
          __hasKeySet2__  = this.#baseMap.has(__weakKey__, strongKey2),
          __matchValue1__ = this.#baseMap.get(__weakKey__, strongKey1) === value1,
          __matchValue2__ = this.#baseMap.get(__weakKey__, strongKey2) === value2;

    if (!__hasKeySet1__) {
      this.#baseMap.set(__weakKey__, strongKey1, value1);
    }
    else if (!__matchValue1__) {
      throw new Error("value1 mismatch!");
    }

    if (!__hasKeySet2__)
      this.#baseMap.set(__weakKey__, strongKey2, value2);
    else if (!__matchValue2__)
    {
      throw new Error("value2 mismatch!");
    }

    this.#weakValueToInternalKeyMap.set(value2, __weakKey__);
  }

  delete(value, strongKey) {
    const __weakKey__ = this.#weakValueToInternalKeyMap.has(value);
    if (!__weakKey__)
      return false;

    if (!this.#baseMap.has(__weakKey__, strongKey))
      return false;

    const __target__ = this.#baseMap.get(__weakKey__, strongKey);

    const __returnValue__ = this.#baseMap.delete(__weakKey__, strongKey);
    if (__returnValue__)
      this.#weakValueToInternalKeyMap.delete(__target__);
    return __returnValue__;
  }

  get(value, strongKey) {
    const __weakKey__ = this.#weakValueToInternalKeyMap.get(value);
    return __weakKey__ ? this.#baseMap.get(__weakKey__, strongKey) : undefined;
  }

  has(value, strongKey) {
    const __weakKey__ = this.#weakValueToInternalKeyMap.has(value);
    return __weakKey__ ? this.#baseMap.has(__weakKey__, strongKey) : false;
  }

  isValidKey(strongKey) {
    return this.#baseMap.isValidKey({}, strongKey);
  }

  isValidValue(value) {
    void value;
    return true;
    // configuration.valuesMustBeObjects: Object(value) === value;
    // baseConfiguration.valueType.argumentValidator: this.#baseMap.isValidValue(value);
  }

  #requireValidKey(__argNames__, strongKey) {
    if (!this.isValidKey(strongKey))
      throw new Error("Invalid key tuple: " + __argNames__);
  }

  #requireValidValue(argName, value) {
    if (!this.isValidValue(value))
      throw new Error(argName + " is not a valid value!");
  }
}

Reflect.defineProperty(__className__, Symbol.toStringTag, {
  value: "__className__",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(__className__);
Object.freeze(__className__.prototype);
