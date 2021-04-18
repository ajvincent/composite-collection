/**
 *
 * @param {Map} defines
 * @param {JSDocGenerator} docs
 * @returns
 */
 export default function preprocess(defines, docs) {
  return `import WeakKeyComposer from "./WeakKey-WeakMap.mjs";

export default class ${defines.get("className")} {
  constructor() {
    /** @type {WeakKeyComposer} @const @private */
    this.__keyComposer__ = new WeakKeyComposer(${
      defines.get("weakSetArgNameList")
    }, ${
      defines.get("strongSetArgNameList")
    });
${
  defines.get("strongSetCount") ? `
    /**
     * @type {WeakMap<WeakKey, Set<*>>}
     * @const
     * @private
     */
    this.__weakKeyToStrongKeys__ = new WeakMap;

    /**
     * @type {string[]}
     * @const
     * @private
     */
    this.__strongArgNames__ = ${defines.get("strongSetArgNameList")};
` : `
    /**
     * @type {WeakSet<WeakKey>}
     * @const
     * @private
     */
    this.__weakKeySet__ = new WeakSet;
`
}  }

${docs.buildBlock("add", 2)}
  add(${defines.get("argList")}) {
    this.__requireValidKey__(${defines.get("argList")});

    const __key__ = this.__keyComposer__.getKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]);
    if (!__key__)
      return null;${
  defines.get("strongSetCount") ? `
    if (!this.__weakKeyToStrongKeys__.has(__key__))
      this.__weakKeyToStrongKeys__.set(__key__, new Set([${defines.get("strongSetArgList")}]));
` : `
    this.__weakKeySet__.add(__key__);
`}
    return this;
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("argList")}) {
    this.__requireValidKey__(${defines.get("argList")});

    if (!this.__keyComposer__.hasKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]))
      return false;

    const __key__ = this.__keyComposer__.getKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]);
${
  defines.get("strongSetCount") ? `
    const __returnValue__ = this.__weakKeyToStrongKeys__.delete(__key__);
    if (__returnValue__)
      this.__keyComposer__.deleteKey([${
        defines.get("weakSetArgList")
      }], [${
        defines.get("strongSetArgList")
      }]);

    return __returnValue__;
` : `
    return this.__weakKeySet__.delete(__key__);
`}  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("argList")}) {
    return this.__isValidKey__(${defines.get("argList")});
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("argList")}) {
    this.__requireValidKey__(${defines.get("argList")});

    if (!this.__keyComposer__.hasKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]))
      return false;

    const __key__ = this.__keyComposer__.getKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]);
${
  defines.get("strongSetCount") ? `
    return this.__weakKeyToStrongKeys__.has(__key__);
` : `
    return this.__weakKeySet__.has(__key__);
`}  }

${docs.buildBlock("requireValidKey", 2)}
  __requireValidKey__(${defines.get("argList")}) {
    if (!this.__isValidKey__(${defines.get("argList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  __isValidKey__(${defines.get("argList")}) {
    if (!this.__keyComposer__.isValidForKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]))
      return false;
${defines.get("validateArguments") || ""}
    return true;
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
