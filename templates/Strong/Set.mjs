import KeyHasher from "./KeyHasher.mjs";

export default class __className__ {
  constructor() {
    /**
     * Storage of the Set's contents for quick iteration in .values().
     * The values are always frozen arrays.
     * @type {Map<hash, void[]}
     * @private
     * @readonly
     */
    this.__root__ = new Map;

    /**
     * @type {KeyHasher}
     * @private
     * @readonly
     */
    this.__hasher__ = new KeyHasher(__argNameList__);
  }

  get size() {
    return this.__root__.size;
  }

  add(__argList__) {
    const hash = this.__hasher__.buildHash(__argList__);
    this.__root__.set(hash, Object.freeze([__argList__]));
    return this;
  }

  clear() {
    this.__root__.clear();
  }

  delete(__argList__) {
    const hash = this.__hasher__.buildHash(__argList__);
    return this.__root__.delete(hash);
  }

  forEach(__callback__, __thisArg__) {
    this.__root__.forEach(valueSet => {
      __callback__.apply(__thisArg__, [valueSet, this]);
    });
  }

  has(__argList__) {
    const hash = this.__hasher__.buildHash(__argList__);
    return this.__root__.has(hash);
  }

  values() {
    return this.__root__.values();
  }
}

__className__[Symbol.iterator] = function() {
  return this.values();
}
