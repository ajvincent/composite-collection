/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 */

import KeyHasher from "./KeyHasher.mjs";

export default class StrongMapOfStrongSets {
  constructor() {
    /**
     * @type {Map<string, Map<hash, *[]>>}
     * @private
     * @const
     */
    this.__outerMap__ = new Map();

    /**
     * @type {KeyHasher}
     * @private
     * @const
     */
    this.__mapHasher__ = new KeyHasher(["mapKey"]);

    /**
     * @type {KeyHasher}
     * @private
     * @const
     */
    this.__setHasher__ = new KeyHasher(["setKey"]);

    /** @type {Number} @private */
    this.__sizeOfAll__ = 0;
  }

  get size() {
    return this.__sizeOfAll__;
  }

  getSizeOfSet(mapKey) {
    const [__innerMap__] = this.__getInnerMap__(mapKey);
    return __innerMap__ ? __innerMap__.size : 0;
  }

  get mapSize() {
    return this.__outerMap__.size;
  }

  add(mapKey, setKey) {
    const __mapHash__ = this.__mapHasher__.buildHash([mapKey]);
    if (!this.__outerMap__.has(__mapHash__))
      this.__outerMap__.set(__mapHash__, new Map);

    const __innerMap__ = this.__outerMap__.get(__mapHash__);

    const __setHash__ = this.__setHasher__.buildHash([setKey]);
    if (!__innerMap__.has(__setHash__)) {
      __innerMap__.set(__setHash__, Object.freeze([mapKey, setKey]));
      this.__sizeOfAll__++;
    }

    return this;
  }

  addSets(mapKey, __sets__) {
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== 1) {
        throw new Error(`Set at index ${__index__} doesn't have exactly 1 argument!`);
      }
      return __set__;
    });

    const __mapHash__ = this.__mapHasher__.buildHash([mapKey]);
    if (!this.__outerMap__.has(__mapHash__))
      this.__outerMap__.set(__mapHash__, new Map);

    const __innerMap__ = this.__outerMap__.get(__mapHash__);
    const __mapArgs__ = [mapKey];

    __array__.forEach(__set__ => {
      const __setHash__ = this.__setHasher__.buildHash(__set__);
      if (!__innerMap__.has(__setHash__)) {
        __innerMap__.set(__setHash__, Object.freeze(__mapArgs__.concat(__set__)));
        this.__sizeOfAll__++;
      }
    });
  }

  clear() {
    this.__outerMap__.clear();
    this.__sizeOfAll__ = 0;
  }

  delete(mapKey, setKey) {
    const [__innerMap__, __mapHash__] = this.__getInnerMap__(mapKey);
    if (!__innerMap__)
      return false;

    const __setHash__ = this.__setHasher__.buildHash([setKey]);
    if (!__innerMap__.has(__setHash__))
      return false;

    __innerMap__.delete(__setHash__);
    this.__sizeOfAll__--;

    if (__innerMap__.size === 0) {
      this.__outerMap__.delete(__mapHash__);
    }

    return true;
  }

  deleteSet(mapKey) {
    const [__innerMap__, __mapHash__] = this.__getInnerMap__(mapKey);
    if (!__innerMap__)
      return false;

    this.__outerMap__.delete(__mapHash__);
    this.__sizeOfAll__ -= __innerMap__.size;
    return true;
  }

  forEach(__callback__, __thisArg__) {
    this.__outerMap__.forEach(
      __innerMap__ => __innerMap__.forEach(
        __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
      )
    );
  }

  forEachSet(mapKey, __callback__, __thisArg__) {
    const [__innerMap__] = this.__getInnerMap__(mapKey);
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
    );
  }

  has(mapKey, setKey) {
    const [__innerMap__] = this.__getInnerMap__(mapKey);
    if (!__innerMap__)
      return false;

    const __setHash__ = this.__setHasher__.buildHash([setKey]);
    return __innerMap__.has(__setHash__);
  }

  hasSet(mapKey) {
    const [__innerMap__] = this.__getInnerMap__(mapKey);
    return Boolean(__innerMap__);
  }

  values() {
    const __outerIter__ = this.__outerMap__.values();
    let __innerIter__ = null;

    return {
      next() {
        while (true) {
          if (!__innerIter__) {
            const {
              value: __innerMap__,
              done
            } = __outerIter__.next();
            if (done)
              return {
                value: undefined,
                done
              };

            __innerIter__ = __innerMap__.values();
          }

          const rv = __innerIter__.next();
          if (rv.done)
            __innerIter__ = null;
          else
            return rv;
        }
      }
    };
  }

  valuesSet(mapKey) {
    const [__innerMap__] = this.__getInnerMap__(mapKey);
    if (!__innerMap__)
      return {
        next() {
          return {
            value: undefined,
            done: true
          }
        }
      };

    return __innerMap__.values();
  }

  /** @private */
  __getInnerMap__(...__mapArguments__) {
    const __hash__ = this.__mapHasher__.buildHash(__mapArguments__);
    return [this.__outerMap__.get(__hash__), __hash__] || [];
  }
}

StrongMapOfStrongSets[Symbol.iterator] = function() {
  return this.values();
}

Reflect.defineProperty(StrongMapOfStrongSets, Symbol.toStringTag, {
  value: "StrongMapOfStrongSets",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(StrongMapOfStrongSets);
Object.freeze(StrongMapOfStrongSets.prototype);
