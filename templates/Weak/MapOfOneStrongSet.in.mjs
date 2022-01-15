/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
export default function preprocess(defines, docs) {
  return `
${defines.get("importLines")}
import WeakKeyComposer from "./keys/Composite.mjs";

class ${defines.get("className")} {
  // eslint-disable-next-line jsdoc/require-property
  /** @typedef {object} WeakKey */

  /**
   * @type {WeakMap<WeakKey, Set<${defines.get("setArgument0Type")}>>}
   * @constant
   * This is two levels. The first level is the WeakKey.
   * The second level is the strong set.
   */
  #root = new WeakMap();

  /** @type {WeakKeyComposer} @constant */
  #mapKeyComposer = new WeakKeyComposer(
    ${defines.get("weakMapArgNameList")}, ${defines.get("strongMapArgNameList")}
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
  add(${defines.get("mapArgList")}, ${defines.get("setArgument0")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgument0")});
    const __innerSet__ = this.#requireInnerSet(${defines.get("mapArgList")});

    __innerSet__.add(${defines.get("setArgument0")});
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

    // level 2: inner map to set
    __array__.forEach(__set__ => __innerSet__.add(__set__[0]));

    return this;
  }

${docs.buildBlock("clearSets", 2)}
  clearSets(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    const __innerSet__ = this.#getExistingInnerSet(${defines.get("mapArgList")});
    if (!__innerSet__)
      return;

    __innerSet__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerSet__ = this.#getExistingInnerSet(${defines.get("mapArgList")});
    if (!__innerSet__)
      return false;

    // level 2: inner map to set
    const __returnValue__ = __innerSet__.delete(${defines.get("setArgument0")});

    if (__innerSet__.size === 0) {
      this.deleteSets(${defines.get("mapArgList")});
    }

    return __returnValue__;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});

    const __mapKey__ = this.#mapKeyComposer.getKeyIfExists(
      [${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]
    );

    return __mapKey__ ? this.#root.delete(__mapKey__) : false;
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.get("mapArgList")}, __callback__, __thisArg__) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    const __innerSet__ = this.#getExistingInnerSet(${defines.get("mapArgList")});
    if (!__innerSet__)
      return;

    __innerSet__.forEach(
      __element__ => __callback__.apply(__thisArg__, [${defines.get("mapArgList")}, __element__, this])
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    const __innerSet__ = this.#getExistingInnerSet(${defines.get("mapArgList")});
    return __innerSet__?.size || 0;
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("mapArgList")}, ${defines.get("setArgument0")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerSet__ = this.#getExistingInnerSet(${defines.get("mapArgList")});
    if (!__innerSet__)
      return false;

    return __innerSet__.has(${defines.get("setArgument0")});
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

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});

    const __innerSet__ = this.#getExistingInnerSet(${defines.get("mapArgList")});
    if (!__innerSet__)
      return;

    const __outerIter__ = __innerSet__.values();
    for (let __value__ of __outerIter__)
      yield [${defines.get("mapArgList")}, __value__];
  }

${docs.buildBlock("requireInnerCollectionPrivate", 2)}
  #requireInnerSet(${defines.get("mapArgList")}) {
    const __mapKey__ = this.#mapKeyComposer.getKey(
      [${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]
    );
    if (!this.#root.has(__mapKey__)) {
      this.#root.set(__mapKey__, new Set);
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
  #requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    if (!this.#isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    return this.#isValidMapKey(${defines.get("mapArgList")}) && this.#isValidSetKey(${defines.get("setArgList")});
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
    void(${defines.get("setArgList")});

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