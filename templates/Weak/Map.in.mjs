/**
 * @param {Map} defines
 * @param {JSDocGenerator} docs
 * @returns {string}
 */
export default function preprocess(defines, docs) {
  return `
${defines.get("importLines")}

export default class ${defines.get("className")} {
  /**
   * @type {WeakKeyComposer}
   * @const
   */
  #keyComposer = new WeakKeyComposer(${
    defines.get("weakMapArgNameList")
  }, ${
    defines.get("strongMapArgNameList")
  });

  ${docs.buildBlock("rootContainerWeakMap", 4)}
  #root = new WeakMap;

  ${
    defines.get("strongMapCount") ? `
    /**
     * @type {WeakMap<WeakKey, Set<*>>}
     * @const
     */
    #weakKeyToStrongKeys = new WeakMap;
` : ``
}

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.set(...entry);
      }
    }
  }


${docs.buildBlock("delete", 2)}
  delete(${defines.get("argList")}) {
    this.#requireValidKey(${defines.get("argList")});
    const __keyMap__ = this.#root.get(${defines.get("weakMapArgument0")});
    if (!__keyMap__)
      return false;

    if (!this.#keyComposer.hasKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]))
      return false;

    const __key__ = this.#keyComposer.getKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]);
    this.#keyComposer.deleteKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]);
    return __keyMap__.delete(__key__);
  }

${docs.buildBlock("get", 2)}
  get(${defines.get("argList")}) {
    this.#requireValidKey(${defines.get("argList")});
    const __keyMap__ = this.#root.get(${defines.get("weakMapArgument0")});
    if (!__keyMap__)
      return undefined;

    if (!this.#keyComposer.hasKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]))
      return undefined;

    const __key__ = this.#keyComposer.getKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]);
    if (!__key__)
      return undefined;
    return __keyMap__.get(__key__);
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("argList")}) {
    this.#requireValidKey(${defines.get("argList")});
    const __keyMap__ = this.#root.get(${defines.get("weakMapArgument0")});
    if (!__keyMap__)
      return false;

    if (!this.#keyComposer.hasKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]))
      return false;

    const __key__ = this.#keyComposer.getKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]);
    if (!__key__)
      return false;
    return __keyMap__.has(__key__);
  }


${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("argList")}) {
    return this.#isValidKey(${defines.get("argList")});
  }

${
  defines.has("validateValue") ? `
${docs.buildBlock("isValidValuePublic", 2)}
  isValidValue(value) {
    return this.#isValidValue(value);
  }
  ` : ``
}

${docs.buildBlock("set", 2)}
  set(${defines.get("argList")}, value) {
    this.#requireValidKey(${defines.get("argList")});
    ${
      defines.has("validateValue") ? `
      if (!this.#isValidValue(value))
        throw new Error("The value is not valid!");
    ` : ``
    }

    if (!this.#root.has(${defines.get("weakMapArgument0")}))
      this.#root.set(${defines.get("weakMapArgument0")}, new WeakMap);

    const __keyMap__ = this.#root.get(${defines.get("weakMapArgument0")});
    const __key__ = this.#keyComposer.getKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]);${
defines.get("strongMapCount") ? `
    if (!this.#weakKeyToStrongKeys.has(__key__))
      this.#weakKeyToStrongKeys.set(__key__, new Set([${defines.get("strongMapArgList")}]));
` : ``}
    __keyMap__.set(__key__, value);
    return this;
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.get("argList")}) {
    if (!this.#isValidKey(${defines.get("argList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.get("argList")}) {
    if (!this.#keyComposer.isValidForKey([${
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
  #isValidValue(value) {
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
