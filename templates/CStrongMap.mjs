import KeyHasher from "./KeyHasher.mjs";

/**
 * @typedef valueAndKeySet
 * @property {void}   value  The actual value we store.
 * @property {void[]} keySet The set of keys we hashed.
 */

export default class __className__ {
  constructor() {
    /**
     * @type {Map<string, valueAndKeySet>}
     * @private
     * @readonly
     */
    this.__root__ = new Map;

    /**
     * @type {KeyHasher}
     */
    this.__hasher__ = new KeyHasher(__argNameList__);
  }

  get size() {
    return this.__root__.size;
  }

  clear() {
    this.__root__.clear();
  }

  delete(__argList__) {
    this.__validateArguments__(__argList__);

    const hash = this.__hasher__.buildHash([__argList__]);
    return this.__root__.delete(hash);
  }

  entries() {
    return this.__wrapIterator__(
      valueAndKeySet => valueAndKeySet.keySet.concat(valueAndKeySet.value)
    );
  }

  forEach(callback) {
    this.__root__.forEach((valueAndKeySet, key, root) => {
      const args = valueAndKeySet.keySet.concat(this);
      args.unshift(valueAndKeySet.value);
      callback(...args);
    });
  }

  get(__argList__) {
    this.__validateArguments__(__argList__);
    const hash = this.__hasher__.buildHash([__argList__]);
    const valueAndKeySet = this.__root__.get(hash);
    return valueAndKeySet ? valueAndKeySet.value : valueAndKeySet;
  }

  has(__argList__) {
    this.__validateArguments__(__argList__);
    const hash = this.__hasher__.buildHash([__argList__]);
    return this.__root__.has(hash);
  }

  keys() {
    return this.__wrapIterator__(
      valueAndKeySet => valueAndKeySet.keySet.slice()
    );
  }

  set(__argList__, value) {
    this.__validateArguments__(__argList__);
    void("__doValidateValue__");

    const hash = this.__hasher__.buildHash([__argList__]);
    const keySet = [__argList__];
    Object.freeze(keySet);
    this.__root__.set(hash, {value, keySet});

    return this;
  }

  values() {
    return this.__wrapIterator__(
      valueAndKeySet => valueAndKeySet.value
    );
  }

  __wrapIterator__(unpacker) {
    const rootIter = this.__root__.values();
    return {
      next() {
        const {value, done} = rootIter.next();
        return {
          value: done ? undefined : unpacker(value),
          done
        };
      }
    }
  }

  __validateArguments__(__argList__) {
    void("__doValidateArguments__");
  }
}

__className__[Symbol.iterator] = function() {
  return this.entries();
}

Reflect.defineProperty(__className__, Symbol.toStringTag, {
  value: "__className__",
  writable: false,
  enumerable: false,
  configurable: true
});
