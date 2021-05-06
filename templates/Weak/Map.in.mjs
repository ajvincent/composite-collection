/**
 *
 * @param {Map} defines
 * @param {JSDocGenerator} docs
 * @returns
 */
export default function preprocess(defines, docs) {
  return `
${defines.get("importLines")}

export default class ${defines.get("className")} {
  constructor() {
    this.__weakArgCount__ = ${defines.get("weakMapCount")};
    this.__strongArgCount__ = ${defines.get("strongMapCount")};

    /**
     * @type {WeakKeyComposer}
     * @private
     * @const
     */
    this.__keyComposer__ = new WeakKeyComposer(${
      defines.get("weakMapArgNameList")
    }, ${
      defines.get("strongMapArgNameList")
    });

${docs.buildBlock("rootContainerWeakMap", 4)}
    this.__root__ = new WeakMap;
${
      defines.get("strongMapCount") ? `
        /**
         * @type {WeakMap<WeakKey, Set<*>>}
         * @const
         * @private
         */
        this.__weakKeyToStrongKeys__ = new WeakMap;
` : ``
}
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.set(...entry);
      }
    }
  }


${docs.buildBlock("delete", 2)}
  delete(${defines.get("argList")}) {
    this.__requireValidKey__(${defines.get("argList")});
    const __keyMap__ = this.__root__.get(${defines.get("weakMapArgument0")});
    if (!__keyMap__)
      return false;

    if (!this.__keyComposer__.hasKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]))
      return false;

    const __key__ = this.__keyComposer__.getKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]);
    this.__keyComposer__.deleteKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]);
    return __keyMap__.delete(__key__);
  }

${docs.buildBlock("get", 2)}
  get(${defines.get("argList")}) {
    this.__requireValidKey__(${defines.get("argList")});
    const __keyMap__ = this.__root__.get(${defines.get("weakMapArgument0")});
    if (!__keyMap__)
      return undefined;

    if (!this.__keyComposer__.hasKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]))
      return undefined;

    const __key__ = this.__keyComposer__.getKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]);
    if (!__key__)
      return undefined;
    return __keyMap__.get(__key__);
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("argList")}) {
    return this.__isValidKey__(${defines.get("argList")});
  }

${
  defines.has("validateValue") ? `
${docs.buildBlock("isValidValuePublic", 2)}
  isValidValue(value) {
    return this.__isValidValue__(value);
  }
  ` : ``
}

${docs.buildBlock("has", 2)}
  has(${defines.get("argList")}) {
    this.__requireValidKey__(${defines.get("argList")});
    const __keyMap__ = this.__root__.get(${defines.get("weakMapArgument0")});
    if (!__keyMap__)
      return false;

    if (!this.__keyComposer__.hasKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]))
      return false;

    const __key__ = this.__keyComposer__.getKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]);
    if (!__key__)
      return false;
    return __keyMap__.has(__key__);
  }

${docs.buildBlock("set", 2)}
  set(${defines.get("argList")}, value) {
    this.__requireValidKey__(${defines.get("argList")});
    ${
      defines.has("validateValue") ? `
      if (!this.__isValidValue__(value))
        throw new Error("The value is not valid!");
    ` : ``
    }

    if (!this.__root__.has(${defines.get("weakMapArgument0")}))
      this.__root__.set(${defines.get("weakMapArgument0")}, new WeakMap);

    const __keyMap__ = this.__root__.get(${defines.get("weakMapArgument0")});
    const __key__ = this.__keyComposer__.getKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]);${
defines.get("strongMapCount") ? `
    if (!this.__weakKeyToStrongKeys__.has(__key__))
      this.__weakKeyToStrongKeys__.set(__key__, new Set([${defines.get("strongMapArgList")}]));
` : ``}
    __keyMap__.set(__key__, value);
    return this;
  }

${docs.buildBlock("requireValidKey", 2)}
  __requireValidKey__(${defines.get("argList")}) {
    if (!this.__isValidKey__(${defines.get("argList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  __isValidKey__(${defines.get("argList")}) {
    if (!this.__keyComposer__.isValidForKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]))
      return false;

${defines.get("validateArguments") || ""}
    return true;
  }

${defines.has("validateValue") ? `
${docs.buildBlock("isValidValuePrivate", 2)}
  __isValidValue__(value) {
    ${defines.get("validateValue")}
    return true;
  }
  ` : ``}
}

Reflect.defineProperty(${defines.get("className")}, Symbol.toStringTag, {
  value: "${defines.get("className")}",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`
}
