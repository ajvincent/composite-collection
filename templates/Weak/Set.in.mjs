/**
 * @param {Map} defines
 * @param {JSDocGenerator} docs
 * @returns {string}
 */
export default function preprocess(defines, docs) {
  return `
${defines.get("importLines")}

export default class ${defines.get("className")} {
  /** @type {WeakKeyComposer} @constant */
  #keyComposer = new WeakKeyComposer(${
    defines.get("weakSetArgNameList")
  }, ${
    defines.get("strongSetArgNameList")
  });

  /** @type {WeakSet<WeakKey>} @constant */
  #weakKeySet = new WeakSet;

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.add(...entry);
      }
    }
  }

${docs.buildBlock("add", 2)}
  add(${defines.get("argList")}) {
    this.#requireValidKey(${defines.get("argList")});

    const __key__ = this.#keyComposer.getKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]);
    if (!__key__)
      return null;

    this.#weakKeySet.add(__key__);
    return this;
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("argList")}) {
    this.#requireValidKey(${defines.get("argList")});

    if (!this.#keyComposer.hasKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]))
      return false;

    const __key__ = this.#keyComposer.getKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]);

    const __returnValue__ = this.#weakKeySet.delete(__key__);
    this.#keyComposer.deleteKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]);
    return __returnValue__;
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("argList")}) {
    this.#requireValidKey(${defines.get("argList")});

    if (!this.#keyComposer.hasKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]))
      return false;

    const __key__ = this.#keyComposer.getKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]);

    return this.#weakKeySet.has(__key__);
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("argList")}) {
    return this.#isValidKey(${defines.get("argList")});
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.get("argList")}) {
    if (!this.#isValidKey(${defines.get("argList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.get("argList")}) {
    if (!this.#keyComposer.isValidForKey([${
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
