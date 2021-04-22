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
import WeakKeyComposer from "./WeakKey-WeakMap.mjs"

export default class ${defines.get("className")} {
  constructor() {
    /**
     ${
      defines.get("strongSetCount") ?
    `* @type {Map<string, WeakMap<WeakKey, Set<*>>}` :
    `* @type {Map<string, WeakSet<WeakKey>}`
}
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

    /** @type {WeakKeyComposer} @const @private */
    this.__setKeyComposer__ = new WeakKeyComposer(${
      defines.get("weakSetArgNameList")
    }, ${
      defines.get("strongSetArgNameList")
    });
  }

  add(${defines.get("argList")}) {
    this.__requireValidKey__(${defines.get("argList")});

    const __mapHash__ = this.__mapHasher__.buildHash([${defines.get("mapArgList")}]);
    if (!this.__outerMap__.has(__mapHash__))
      this.__outerMap__.set(__mapHash__, new ${defines.get("strongSetCount") ? "WeakMap" : "WeakSet"});

    const __inner__ = this.__outerMap__.get(__mapHash__);

    const __setKey__ = this.__setKeyComposer__.getKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]);
${
  defines.get("strongSetCount") ? `
    if (!__inner__.has(__setKey__))
      __inner__.set(__setKey__, new Set([${defines.get("strongSetArgList")}]));` : `
    __inner__.add(__setKey__);`}
    return this;
  }

  addSets(${defines.get("mapArgList")}, __sets__) {
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.get("setArgCount")}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.get("setArgCount")} argument${
          defines.get("setArgCount") > 1 ? "s" : ""
        }!\`);
      }

      this.__requireValidKey__(${defines.get("mapArgList")}, ...__set__);
      return __set__;
    });

    const __mapHash__ = this.__mapHasher__.buildHash([${defines.get("mapArgList")}]);
    if (!this.__outerMap__.has(__mapHash__))
      this.__outerMap__.set(__mapHash__, new ${defines.get("strongSetCount") ? "WeakMap" : "WeakSet"});

    const __inner__ = this.__outerMap__.get(__mapHash__);
    __array__.forEach(([${defines.get("setArgList")}] = __set__) => {
      const __setKey__ = this.__setKeyComposer__.getKey([${
        defines.get("weakSetArgList")
      }], [${
        defines.get("strongSetArgList")
      }]);
${
    defines.get("strongSetCount") ? `
      if (!__inner__.has(__setKey__))
        __inner__.set(__setKey__, new Set([${defines.get("strongSetArgList")}]));
` : `
      __inner__.add(__setKey__);`}    });

    return this;
  }

  clear() {
    this.__outerMap__.clear();
  }

  delete(${defines.get("argList")}) {
    this.__requireValidKey__(${defines.get("argList")});

    const [__inner__, __mapHash__] = this.__getInner__(${defines.get("mapArgList")});
    if (!__inner__)
      return false;

    if (!this.__setKeyComposer__.hasKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]))
      return false;

    const __key__ = this.__setKeyComposer__.getKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]);

    return __inner__.delete(__key__);
  }

  deleteSet(${defines.get("mapArgList")}) {
    const [__inner__, __mapHash__] = this.__getInner__(${defines.get("mapArgList")});
    if (!__inner__)
      return false;

    this.__outerMap__.delete(__mapHash__);
    return true;
  }

  has(${defines.get("argList")}) {
    this.__requireValidKey__(${defines.get("argList")});

    const [__inner__, __mapHash__] = this.__getInner__(${defines.get("mapArgList")});
    if (!__inner__)
      return false;

    if (!this.__setKeyComposer__.hasKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]))
      return false;

    const __key__ = this.__setKeyComposer__.getKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]);

    return __inner__.has(__key__);
  }

  hasSet(${defines.get("mapArgList")}) {
    const [__inner__] = this.__getInner__(${defines.get("mapArgList")});
    return Boolean(__inner__);
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("argList")}) {
    return this.__isValidKey__(${defines.get("argList")});
  }

${docs.buildBlock("requireValidKey", 2)}
  __requireValidKey__(${defines.get("argList")}) {
    if (!this.__isValidKey__(${defines.get("argList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  __isValidKey__(${defines.get("argList")}) {
    void(${defines.get("mapArgList")});

    if (!this.__setKeyComposer__.isValidForKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]))
      return false;
${defines.get("validateArguments") || ""}
    return true;
  }

  /** @private */
  __getInner__(...__mapArguments__) {
    const __hash__ = this.__mapHasher__.buildHash(__mapArguments__);
    return [this.__outerMap__.get(__hash__), __hash__] || [];
  }
}

Reflect.defineProperty(${defines.get("className")}, Symbol.toStringTag, {
  value: "${defines.get("className")}",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`;
}
