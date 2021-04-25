import KeyHasher from "./KeyHasher.mjs";

export default class __className__ {
  constructor() {
    /**
     * @type {Map<string, Map<hash, *[]>>}
     */
    this.__outerMap__ = new Map();

    /**
     * @type {KeyHasher}
     * @private
     * @const
     */
    this.__mapHasher__ = new KeyHasher(__mapArgList__);

    /**
     * @type {KeyHasher}
     * @private
     * @const
     */
    this.__setHasher__ = new KeyHasher(__mapArgList__);

    /** @type {Number} @private */
    this.__sizeOfAll__ = 0;
  }

  get size() {
    return this.__sizeOfAll__;
  }

  getSizeOfSet(__mapArgList__) {
    const [__innerMap__] = this.__getInnerMap__(__mapArgList__);
    return __innerMap__ ? __innerMap__.size : 0;
  }

  get mapSize() {
    return this.__outerMap__.size;
  }

  add(__mapArgList__, __setArgList__) {
    const __mapHash__ = this.__mapHasher__.buildHash([__mapArgList__]);
    if (!this.__outerMap__.has(__mapHash__))
      this.__outerMap__.set(__mapHash__, new Map);

    const __innerMap__ = this.__outerMap__.get(__mapHash__);

    const __setHash__ = this.__setHasher__.buildHash([__setArgList__]);
    if (!__innerMap__.has(__setHash__)) {
      __innerMap__.set(__setHash__, Object.freeze([__argList__]));
      this.__sizeOfAll__++;
    }

    return this;
  }

  addSets(__mapArgList__, __sets__) {
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== __setArgCount__) {
        throw new Error(`Set at index ${__index__} doesn't have exactly ${__setArgCount__} arguments!`);
      }
      return __set__;
    });

    const __mapHash__ = this.__mapHasher__.buildHash([__mapArgList__]);
    if (!this.__outerMap__.has(__mapHash__))
      this.__outerMap__.set(__mapHash__, new Map);

    const __innerMap__ = this.__outerMap__.get(__mapHash__);
    __array__.forEach(__set__ => {
      const __setHash__ = this.__setHasher__.buildHash(__set__);
      if (!__innerMap__.has(__setHash__)) {
        __innerMap__.set(__setHash__, Object.freeze(__mapArgList__.concat(__set__)));
        this.__sizeOfAll__++;
      }
    });
  }

  clear() {
    this.__outerMap__.clear();
    this.__sizeOfAll__ = 0;
  }

  delete(__mapArgList__, __setArgList__) {
    const [__innerMap__, __mapHash__] = this.__getInnerMap__(__mapArgList__);
    if (!__innerMap__)
      return false;

    const __setHash__ = this.__setHasher__.buildHash([__setArgList__]);
    if (!__innerMap__.has(__setHash__))
      return false;

    __innerMap__.delete(__setHash__);
    this.__sizeOfAll__--;

    if (__innerMap__.size === 0) {
      this.__outerMap__.delete(__innerMap__);
    }

    return true;
  }

  deleteSets(__mapArgList__) {
    const [__innerMap__, __mapHash__] = this.__getInnerMap__(__mapArgList__);
    if (!__innerMap__)
      return false;

    this.__outerMap__.delete(__mapHash__);
    this.__sizeOfAll__ -= __innerMap__.size;
    return true;
  }

  forEach(__callback__) {
    this.__outerMap__.forEach(
      __innerMap__ => __innerMap__.forEach(
        __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
      )
    );
  }

  forEachSet(__mapArgList__, __callback__, __thisArg__) {
    const [__innerMap__] = this.__getInnerMap__(__mapArgList__);
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
    );
  }

  has(__mapArgList__, __setArgList__) {
    const [__innerMap__] = this.__getInnerMap__(__mapArgList__);
    if (!__innerMap__)
      return false;

    const __setHash__ = this.__setHasher__.buildHash([__setArgList__]);
    return __innerMap__.has(__setHash__);
  }

  hasSets(__mapArgList__) {
    const [__innerMap__] = this.__getInnerMap__(__mapArgList__);
    return Boolean(__innerMap__);
  }

  values() {
    const __outerIter__ = this.__outerMap__.values();
    let __innerIter__ = null;

    return {
      next() {
        while (true) {
          if (!__innerIter__) {
            const {value: __innerMap__, done} = __outerIter__.next();
            if (done)
              return {value: undefined, done};

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

  valuesSet(__mapArgList__) {
    const [__innerMap__] = this.__getInnerMap__(__mapArgList__);
    if (!__innerMap__)
      return {value: undefined, done: true};

    return __innerMap__.values();
  }

  __getInnerMap__(__mapArgList__) {
    const __hash__ = this.__mapHasher__.buildHash([__mapArgList__]);
    return [this.__outerMap__.get(__hash__), __hash__] || [];
  }
}

__className__[Symbol.iterator] = function() {
  return this.values();
}
