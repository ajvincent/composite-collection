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
   * @type {WeakMap<object, WeakMap<WeakKey, WeakSet<WeakKey>>>}
   * @note This is three levels.  The first level is the first weak argument.
   * The second level is the WeakKey.  The third level is the weak set.
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

  /**
   * @type {WeakMap<WeakKey, Map<hash, Set<*>>>}
   * @const
   */
  #weakKeyToStrongKeys = new WeakMap;

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

    // level 3: inner WeakSet
    const __weakSetKey__ = this.#setKeyComposer.getKey(
      [${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]
    );
    if (!this.#weakKeyToStrongKeys.has(__weakSetKey__))
      this.#weakKeyToStrongKeys.set(__weakSetKey__, new Set([${defines.get("strongSetArgList")}]));

    __innerSet__.add(__weakSetKey__);
    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.get("mapArgList")}, __sets__) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.get("setArgCount")}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.get("setArgCount")} set argument${
          defines.get("setArgCount") > 1 ? "s" : ""
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
      if (!this.#weakKeyToStrongKeys.has(__weakSetKey__))
        this.#weakKeyToStrongKeys.set(__weakSetKey__, new Set([${defines.get("strongSetArgList")}]));
  
      __innerSet__.add(__weakSetKey__);
    });
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerSet__ = this.#getExistingInnerSet(${defines.get("mapArgList")});
    if (!__innerSet__)
      return false;

    if (!this.#setKeyComposer.hasKey(
      [${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]
    ))
      return false;

    const __weakSetKey__ = this.#setKeyComposer.getKey(
      [${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]
    );

    const __returnValue__ = this.#weakKeyToStrongKeys.delete(__weakSetKey__);
    if (__returnValue__)
      this.#setKeyComposer.deleteKey(
        [${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]
      );

    return __returnValue__;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    let __weakKeyMap__;

    // level 1:  first weak argument to weak map key
    {
      if (!this.#root.has(${defines.get("weakMapArgument0")})) {
        return false;
      }
      __weakKeyMap__ = this.#root.get(${defines.get("weakMapArgument0")});
    }

    // level 2:  weak map key to inner map
    {
      const __mapKey__ = this.#mapKeyComposer.getKey(
        [${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]
      );
      return __weakKeyMap__.delete(__mapKey__);
    }
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerSet__ = this.#getExistingInnerSet(${defines.get("mapArgList")});
    if (!__innerSet__)
      return false;

    if (!this.#setKeyComposer.hasKey(
      [${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]
    ))
      return false;

    const __weakSetKey__ = this.#setKeyComposer.getKey(
      [${defines.get("weakSetArgList")}], [${defines.get("strongSetArgList")}]
    );

    return __innerSet__.has(__weakSetKey__);
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    return Boolean(this.#getExistingInnerSet(${defines.get("mapArgList")}));
  }

${docs.buildBlock("requireInnerCollectionPrivate", 2)}
  #requireInnerSet(${defines.get("mapArgList")}) {
    let __weakKeyMap__, __innerSet__;
    // level 1:  first weak argument to weak map key
    {
      if (!this.#root.has(${defines.get("weakMapArgument0")})) {
        this.#root.set(${defines.get("weakMapArgument0")}, new WeakMap);
      }
      __weakKeyMap__ = this.#root.get(${defines.get("weakMapArgument0")});
    }

    // level 2:  weak map key to inner map
    {
      const __mapKey__ = this.#mapKeyComposer.getKey(
        [${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]
      );
      if (!__weakKeyMap__.has(__mapKey__)) {
        __weakKeyMap__.set(__mapKey__, new WeakSet);
      }
      __innerSet__ = __weakKeyMap__.get(__mapKey__);

      if (!this.#weakKeyToStrongKeys.has(__mapKey__)) {
        this.#weakKeyToStrongKeys.set(__mapKey__, new WeakSet([${defines.get("strongMapArgList")}]));
      }

      return __innerSet__;
    }
  }

${docs.buildBlock("getExistingInnerCollectionPrivate", 2)}
  #getExistingInnerSet(${defines.get("mapArgList")}) {
    let __weakKeyMap__;

    // level 1:  first weak argument to weak map key
    {
      __weakKeyMap__ = this.#root.get(${defines.get("weakMapArgument0")});
      if (!__weakKeyMap__)
        return undefined;
    }

    // level 2:  weak map key to inner map
    {
      const __mapKey__ = this.#mapKeyComposer.getKey(
        [${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]
      );

      return __weakKeyMap__.get(__mapKey__);
    }
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
