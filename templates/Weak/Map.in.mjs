/**
 *
 * @param {Map} defines
 * @param {JSDocGenerator} docs
 * @returns
 */
export default function preprocess(defines, docs) {
  let invokeValidate = "";
  if (defines.has("invokeValidate")) {
    invokeValidate = `\n    this.__validateArguments__(${defines.get("validateArguments")});\n`;
  }

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

  delete(${defines.get("argList")}) {
    // validate arguments, including that weakArguments really are objects!
    const __keyMap__ = this.__root__.get(${defines.get("weakMapArgument0")});
    if (!__keyMap__)
      return false;

    if (!this.__keyComposer__.hasKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]))
      return false;

    const __key__ = this.__keyComposer__.deleteKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]);
    if (!__key__)
      return false;
    return keyMap.delete(key);
  }

  get(${defines.get("argList")}) {
    // validate arguments, including that weakArguments really are objects!
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

  has(${defines.get("argList")}) {
    // validate arguments, including that weakArguments really are objects!
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

  set(${defines.get("argList")}, value) {
    // validate arguments, including that weakArguments really are objects!
    if (this.__root__.has(${defines.get("weakMapArgument0")}))
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
}
`
};
