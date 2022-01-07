/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
export default function preprocess(defines, docs) {
  return `
${defines.get("importLines")}

class ${defines.get("className")} {
  /**
   * @type {WeakMap<WeakKey, WeakSet<WeakKey>>}
   * @note This is two levels.  The first level is the map's weak key.
   * The second level is the weak set of weak keys.
   */
  #root = new WeakMap();

  /** @type {WeakKeyComposer} */
  #mapKeyComposer = new WeakKeyComposer(
    ${defines.get("weakMapArgNameList")}, ${defines.get("strongMapArgNameList")}
  );

  /** @type {WeakKeyComposer} */
  #setKeyComposer = new WeakKeyComposer(
    ${defines.get("weakSetArgNameList")}, ${defines.get("strongSetArgNameList")}
  );

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.add(...entry);
      }
    }
  }

${docs.buildBlock("add", 2)}
  add(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerSet__ = this.#requireInnerSet(${defines.get("mapArgList")});

    // level 2: inner WeakSet
    const __weakSetKey__ = this.#setKeyComposer.getKey(
      [${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]
    );

    __innerSet__.add(__weakSetKey__);
    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.get("mapArgList")}, __sets__) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.get("setCount")}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.get("setCount")} set argument${
          defines.get("setCount") > 1 ? "s" : ""
        }!\`);
      }
      this.#requireValidKey(${defines.get("mapArgList")}, ...__set__);
      return __set__;
    });

    const __innerSet__ = this.#requireInnerSet(${defines.get("mapArgList")});

    __array__.forEach(__set__ => {
      const [${defines.get("setArgList")}] = __set__;
      const __weakSetKey__ = this.#setKeyComposer.getKey(
        [${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]
      );

      __innerSet__.add(__weakSetKey__);
    });
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerSet__ = this.#getExistingInnerSet(${defines.get("mapArgList")});
    if (!__innerSet__)
      return false;

    const __weakSetKey__ = this.#setKeyComposer.getKeyIfExists([${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]);
    return __weakSetKey__ ? __innerSet__.delete(__weakSetKey__) : false;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    const __mapKey__ = this.#mapKeyComposer.getKeyIfExists(
      [${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]
    );
    return __mapKey__ ? this.#root.delete(__mapKey__) : false;
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerSet__ = this.#getExistingInnerSet(${defines.get("mapArgList")});
    if (!__innerSet__)
      return false;

    const __weakSetKey__ = this.#setKeyComposer.getKeyIfExists(
      [${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]
    );

    return __weakSetKey__ ? __innerSet__.has(__weakSetKey__) : false;
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    return Boolean(this.#getExistingInnerSet(${defines.get("mapArgList")}));
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    return this.#isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
  }

${docs.buildBlock("requireInnerCollectionPrivate", 2)}
  #requireInnerSet(${defines.get("mapArgList")}) {
    const __mapKey__ = this.#mapKeyComposer.getKey(
      [${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]
    );
    if (!this.#root.has(__mapKey__)) {
      this.#root.set(__mapKey__, new WeakSet);
    }
    return this.#root.get(__mapKey__);
  }

${docs.buildBlock("getExistingInnerCollectionPrivate", 2)}
  #getExistingInnerSet(${defines.get("mapArgList")}) {
    const __mapKey__ = this.#mapKeyComposer.getKeyIfExists(
      [${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]
    );

    return __mapKey__ ? this.#root.get(__mapKey__) : undefined;
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.get("argList")}) {
    if (!this.#isValidKey(${defines.get("argList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.get("argList")}) {
    return this.#isValidMapKey(${defines.get("mapArgList")}) &&
           this.#isValidSetKey(${defines.get("setArgList")});
  }

${docs.buildBlock("requireValidMapKey", 2)}
  #requireValidMapKey(${defines.get("mapArgList")}) {
    if (!this.#isValidMapKey(${defines.get("mapArgList")}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  #isValidMapKey(${defines.get("mapArgList")}) {
    if (!this.#mapKeyComposer.isValidForKey([${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]))
      return false;

${defines.get("validateMapArguments") || ""}
    return true;
  }

${docs.buildBlock("isValidSetKeyPrivate", 2)}
  #isValidSetKey(${defines.get("setArgList")}) {
    if (!this.#setKeyComposer.isValidForKey([${
      defines.get("weakSetArgList")
    }], [${
      defines.get("strongSetArgList")
    }]))
      return false;

${defines.get("validateSetArguments") || ""}
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
