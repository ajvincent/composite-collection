/**
 * @param {Map} defines
 * @param {JSDocGenerator} docs
 * @returns {string}
 */
export default function preprocess(defines, docs) {
  return `
${defines.get("importLines")}

class ${defines.get("className")} {
  /** @type {WeakKeyComposer} @constant */
  #keyComposer = new WeakKeyComposer(${
    defines.get("weakMapArgNameList")
  }, ${
    defines.get("strongMapArgNameList")
  });

  ${docs.buildBlock("rootContainerWeakMap", 4)}
  #root = new WeakMap;

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
    const __key__ = this.#keyComposer.getKeyIfExists([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]);
    if (!__key__)
      return false;

    this.#keyComposer.deleteKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]);
    return this.#root.delete(__key__);
  }

${docs.buildBlock("get", 2)}
  get(${defines.get("argList")}) {
    this.#requireValidKey(${defines.get("argList")});
    const __key__ = this.#keyComposer.getKeyIfExists([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]);
    return __key__ ? this.#root.get(__key__) : undefined;
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("argList")}) {
    this.#requireValidKey(${defines.get("argList")});

    const __key__ = this.#keyComposer.getKeyIfExists([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]);
    return __key__ ? this.#root.has(__key__) : false;
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

    const __key__ = this.#keyComposer.getKey([${
      defines.get("weakMapArgList")
    }], [${
      defines.get("strongMapArgList")
    }]);
    this.#root.set(__key__, value);
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
