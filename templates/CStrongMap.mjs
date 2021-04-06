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
    this.__hasher__ = new KeyHasher;
  }

  get size() {
    return this.__root__.size;
  }

  clear() {
    this.__root__.clear();
  }

  delete(__argList__) {
    this.__validateArguments__(__argList__);

    const hash = this.__hasher__.buildHash(__argList__);
    return this.__root__.delete(hash);
  }

  entries() {
    const rootIter = this.__root__.entries();
    let tuple;
    return {
      next() {
        const {tuple = value, done} = iter.next();
        const [valueAndKeySet, value] = tuple;
        return {
          value: done ? valueAndKeySet.keySet.concat(value) : undefined,
          done
        };
      }
    }
  }

  forEach(callback) {
    this.__root__.forEach((value, key, root) => {
      const args = [value, ...root.get(key).keySet, this];
      callback(...args);
    });
  }

  get(__argList__) {
    this.__validateArguments__(__argList__);
    const hash = this.__hasher__.buildHash(__argList__);
    const valueAndKeySet = this.__root__.get(hash);
    return valueAndKeySet ? valueAndKeySet.value : valueAndKeySet;
  }

  has(__argList__) {
    this.__validateArguments__(__argList__);
    const hash = this.__hasher__.buildHash(__argList__);
    return this.__root__.has(hash);
  }

  keys() {
    const rootIter = this.__root__.keys();
    return {
      next() {
        const {valueAndKeySet = value, done} = rootIter.next();
        return {
          value: done ? valueAndKeySet.keySet.slice() : undefined,
          done
        };
      }
    }
  }

  set(__argList__, value) {
    this.__validateArguments__(__argList__);
    this.__validateSetter__(value);

    const hash = this.__hasher__.buildHash(__argList__);
    const keySet = [__argList__];
    Object.freeze(keySet);
    this.__root__.set(hash, {value, keySet});

    return this;
  }

  values() {
    return this.__root__.values();
  }

  __validateArguments__(__argList__) {
    void("__doValidateArguments__");
  }

  __validateSetter__(value) {
    void("__doValidateSetter__");
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
