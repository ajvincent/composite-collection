/**
 *
 * @param {Map} defines
 * @param {JSDocGenerator} docs
 * @returns
 */
export default function preprocess(defines, docs) {
  return `import KeyHasher from "./KeyHasher.mjs"
import WeakKeyComposer from "./WeakKey-WeakMap.mjs"

export default class ${defines.get("className")} {
  constructor() {
    this.__weakArgCount__ = ${defines.get("weakMapCount")};
    this.__strongArgCount__ = ${defines.get("strongMapCount")};
    this.__keyHasher__ = new KeyHasher(${defines.get("argNameList")});
    this.__keyComposer__ = new WeakKeyComposer(${
      defines.get("weakMapArgNameList")
    }, ${
      defines.get("strongMapArgNameList")
    });

${docs.buildBlock("rootContainerWeakMap", 4)}
    /** @type {WeakMap<object, WeakMap<WeakKey, *>>} */
    this.__root__ = new WeakMap;
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
    if (!this.__root__.has(${defines.get("weakMapArgument0")}))
      this.__root__.set(${defines.get("weakMapArgument0")}, new WeakMap);

    const __keyMap__ = this.__root__.get(${defines.get("weakMapArgument0")});
    const __key__ = this.__keyComposer__.getKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]);

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
}

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`
};
