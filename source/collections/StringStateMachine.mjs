/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import KeyHasher from "./keys/Hasher.mjs";

export default class StringStateMachine {
  /**
   * Storage of the Set's contents for quick iteration in .values().  The values are always frozen arrays.
   *
   * @type {Map<hash, *[]>}
   *
   * @constant
   */
  #root = new Map;

  /** @type {KeyHasher} @constant */
  #hasher = new KeyHasher(["currentState", "nextState"]);

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.add(...entry);
      }
    }
  }

  /**
   * The number of elements in this collection.
   *
   * @public
   * @constant
   */
  get size() {
    return this.#root.size;
  }

  /**
   * Add a key set to this collection.
   *
   * @param {Function} currentState 
   * @param {Function} nextState    
   *
   * @returns {StringStateMachine} This collection.
   * @public
   */
  add(currentState, nextState) {
    this.#requireValidKey(currentState, nextState);

    const __hash__ = this.#hasher.getHash(currentState, nextState);
    this.#root.set(__hash__, Object.freeze([currentState, nextState]));
    return this;
  }

  /**
   * Clear the collection.
   *
   * @public
   */
  clear() {
    this.#root.clear();
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {Function} currentState 
   * @param {Function} nextState    
   *
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(currentState, nextState) {
    const __hash__ = this.#hasher.getHashIfExists(currentState, nextState);
    return __hash__ ? this.#root.delete(__hash__) : false;
  }

  /**
   * Iterate over the keys.
   *
   * @param {StringStateMachine~ForEachCallback} callback A function to invoke for each iteration.
   *
   * @public
   */
  forEach(__callback__, __thisArg__) {
    this.#root.forEach(valueSet => {
      __callback__.apply(__thisArg__, valueSet.concat(this));
    });
  }

  /**
   * @callback StringStateMachine~ForEachCallback
   *
   * @param {Function}           currentState   
   * @param {Function}           nextState      
   * @param {StringStateMachine} __collection__ This collection.
   */

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {Function} currentState 
   * @param {Function} nextState    
   *
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(currentState, nextState) {
    const __hash__ = this.#hasher.getHashIfExists(currentState, nextState);
    return __hash__ ? this.#root.has(__hash__) : false;
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {Function} currentState 
   * @param {Function} nextState    
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */
  isValidKey(currentState, nextState) {
    return this.#isValidKey(currentState, nextState);
  }

  /**
   * Return a new iterator for the values of the collection.
   *
   * @returns {Iterator<*>}
   * @public
   */
  values() {
    return this.#root.values();
  }

  /**
   * Throw if the key set is not valid.
   *
   * @param {Function} currentState 
   * @param {Function} nextState    
   *
   * @throws for an invalid key set.
   */
  #requireValidKey(currentState, nextState) {
    if (!this.#isValidKey(currentState, nextState))
      throw new Error("The ordered key set is not valid!");
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {Function} currentState 
   * @param {Function} nextState    
   *
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidKey(currentState, nextState) {
    {
      if (typeof currentState !== "string")
        return false;
    }

    {
      if (typeof nextState !== "string")
        return false;
    }
    return true;
  }

}

StringStateMachine[Symbol.iterator] = function() {
  return this.values();
}

Reflect.defineProperty(StringStateMachine, Symbol.toStringTag, {
  value: "StringStateMachine",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(StringStateMachine);
Object.freeze(StringStateMachine.prototype);
