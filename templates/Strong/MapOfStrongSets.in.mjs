/**
 *
 * @param {Map} defines
 * @param {JSDocGenerator} docs
 * @returns
 */
export default function preprocess(defines, docs) {
  let invokeValidate = "";
  if (defines.has("invokeValidate")) {
    invokeValidate = `\n    this.__requireValidKey__(${defines.get("argList")});\n`;
  }

  return `import KeyHasher from "./KeyHasher.mjs";

export default class ${defines.get("className")} {
  constructor() {
    /**
     * @type {Map<hash, Map<hash, *[]>>}
     * @private
     * @const
     */
    this.__outerMap__ = new Map();

    /**
     * @type {KeyHasher}
     * @private
     * @const
     */
    this.__mapHasher__ = new KeyHasher(${defines.get("mapArgNameList")});

    /**
     * @type {KeyHasher}
     * @private
     * @const
     */
    this.__setHasher__ = new KeyHasher(${defines.get("setArgNameList")});

    /** @type {Number} @private */
    this.__sizeOfAll__ = 0;
  }

${docs.buildBlock("getSize", 2)}
  get size() {
    return this.__sizeOfAll__;
  }

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${defines.get("mapArgList")}) {
    const [__innerMap__] = this.__getInnerMap__(${defines.get("mapArgList")});
    return __innerMap__ ? __innerMap__.size : 0;
  }

${docs.buildBlock("mapSize", 2)}
  get mapSize() {
    return this.__outerMap__.size;
  }

${docs.buildBlock("add", 2)}
  add(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    const __mapHash__ = this.__mapHasher__.buildHash([${defines.get("mapArgList")}]);
    if (!this.__outerMap__.has(__mapHash__))
      this.__outerMap__.set(__mapHash__, new Map);

    const __innerMap__ = this.__outerMap__.get(__mapHash__);

    const __setHash__ = this.__setHasher__.buildHash([${defines.get("setArgList")}]);
    if (!__innerMap__.has(__setHash__)) {
      __innerMap__.set(__setHash__, Object.freeze([${defines.get("argList")}]));
      this.__sizeOfAll__++;
    }

    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.get("mapArgList")}, __sets__) {
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.get("setArgCount")}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.get("setArgCount")} argument${
          defines.get("setArgCount") > 1 ? "s" : ""
        }!\`);
      }
      return __set__;
    });

    const __mapHash__ = this.__mapHasher__.buildHash([${defines.get("mapArgList")}]);
    if (!this.__outerMap__.has(__mapHash__))
      this.__outerMap__.set(__mapHash__, new Map);

    const __innerMap__ = this.__outerMap__.get(__mapHash__);
    const __mapArgs__ = [${defines.get("mapArgList")}];

    __array__.forEach(__set__ => {
      const __setHash__ = this.__setHasher__.buildHash(__set__);
      if (!__innerMap__.has(__setHash__)) {
        __innerMap__.set(__setHash__, Object.freeze(__mapArgs__.concat(__set__)));
        this.__sizeOfAll__++;
      }
    });

    return this;
  }

${docs.buildBlock("clear", 2)}
  clear() {
    this.__outerMap__.clear();
    this.__sizeOfAll__ = 0;
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    const [__innerMap__, __mapHash__] = this.__getInnerMap__(${defines.get("mapArgList")});
    if (!__innerMap__)
      return false;

    const __setHash__ = this.__setHasher__.buildHash([${defines.get("setArgList")}]);
    if (!__innerMap__.has(__setHash__))
      return false;

    __innerMap__.delete(__setHash__);
    this.__sizeOfAll__--;

    if (__innerMap__.size === 0) {
      this.__outerMap__.delete(__mapHash__);
    }

    return true;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.get("mapArgList")}) {
    const [__innerMap__, __mapHash__] = this.__getInnerMap__(${defines.get("mapArgList")});
    if (!__innerMap__)
      return false;

    this.__outerMap__.delete(__mapHash__);
    this.__sizeOfAll__ -= __innerMap__.size;
    return true;
  }

${docs.buildBlock("forEachSet", 2)}
  forEach(__callback__, __thisArg__) {
    this.__outerMap__.forEach(
      __innerMap__ => __innerMap__.forEach(
        __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
      )
    );
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.get("mapArgList")}, __callback__, __thisArg__) {
    const [__innerMap__] = this.__getInnerMap__(${defines.get("mapArgList")});
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("has", 2)}
  has(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    const [__innerMap__] = this.__getInnerMap__(${defines.get("mapArgList")});
    if (!__innerMap__)
      return false;

    const __setHash__ = this.__setHasher__.buildHash([${defines.get("setArgList")}]);
    return __innerMap__.has(__setHash__);
  }

${docs.buildBlock("hasSet", 2)}
  hasSet(${defines.get("mapArgList")}) {
    const [__innerMap__] = this.__getInnerMap__(${defines.get("mapArgList")});
    return Boolean(__innerMap__);
  }

${docs.buildBlock("values", 2)}
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

${docs.buildBlock("valuesSet", 2)}
  valuesSet(${defines.get("mapArgList")}) {
    const [__innerMap__] = this.__getInnerMap__(${defines.get("mapArgList")});
    if (!__innerMap__)
      return {
        next() { return { value: undefined, done: true }}
      };

    return __innerMap__.values();
  }

  /** @private */
  __getInnerMap__(...__mapArguments__) {
    const __hash__ = this.__mapHasher__.buildHash(__mapArguments__);
    return [this.__outerMap__.get(__hash__), __hash__] || [];
  }
}

${defines.get("className")}[Symbol.iterator] = function() {
  return this.values();
}

Reflect.defineProperty(${defines.get("className")}, Symbol.toStringTag, {
  value: "${defines.get("className")}",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`};
