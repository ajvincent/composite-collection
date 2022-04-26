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
   * @type {WeakMap<${defines.get("mapArgument0Type")}, Set<${defines.get("setArgument0Type")}>>}
   * @constant
   * This is two levels. The first level is the map key.
   * The second level is the strong set.
   */
  #root = new WeakMap();

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.add(...entry);
      }
    }
  }

${docs.buildBlock("add", 2)}
  add(${defines.get("mapArgument0")}, ${defines.get("setArgument0")}) {
    this.#requireValidKey(${defines.get("mapArgument0")}, ${defines.get("setArgument0")});
    const __innerSet__ = this.#requireInnerSet(${defines.get("mapArgument0")});

    __innerSet__.add(${defines.get("setArgument0")});
    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.get("mapArgument0")}, __sets__) {
    this.#requireValidMapKey(${defines.get("mapArgument0")});
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.get("setCount")}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.get("setCount")} set argument${
          defines.get("setCount") > 1 ? "s" : ""
        }!\`);
      }
      this.#requireValidKey(${defines.get("mapArgument0")}, ...__set__);
      return __set__;
    });

    const __innerSet__ = this.#requireInnerSet(${defines.get("mapArgument0")});

    // level 2: inner map to set
    __array__.forEach(__set__ => __innerSet__.add(__set__[0]));

    return this;
  }

${docs.buildBlock("clearSets", 2)}
  clearSets(${defines.get("mapArgument0")}) {
    this.#requireValidMapKey(${defines.get("mapArgument0")});
    const __innerSet__ = this.#root.get(${defines.get("mapArgument0")});
    if (!__innerSet__)
      return;

    __innerSet__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("mapArgument0")}, ${defines.get("setArgument0")}) {
    this.#requireValidKey(${defines.get("mapArgument0")}, ${defines.get("setArgument0")});
    const __innerSet__ = this.#root.get(${defines.get("mapArgument0")});
    if (!__innerSet__)
      return false;

    // level 2: inner map to set
    const __returnValue__ = __innerSet__.delete(${defines.get("setArgument0")});

    if (__innerSet__.size === 0) {
      this.deleteSets(${defines.get("mapArgument0")});
    }

    return __returnValue__;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.get("mapArgument0")}) {
    this.#requireValidMapKey(${defines.get("mapArgument0")});
    return this.#root.delete(${defines.get("mapArgument0")});
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.get("mapArgument0")}, __callback__, __thisArg__) {
    this.#requireValidMapKey(${defines.get("mapArgument0")});
    const __innerSet__ = this.#root.get(${defines.get("mapArgument0")});
    if (!__innerSet__)
      return;

    __innerSet__.forEach(
      __element__ => __callback__.apply(__thisArg__, [${defines.get("mapArgument0")}, __element__, this])
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${defines.get("mapArgument0")}) {
    this.#requireValidMapKey(${defines.get("mapArgument0")});
    const __innerSet__ = this.#root.get(${defines.get("mapArgument0")});
    return __innerSet__?.size || 0;
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("mapArgument0")}, ${defines.get("setArgument0")}) {
    this.#requireValidKey(${defines.get("mapArgument0")}, ${defines.get("setArgument0")});
    const __innerSet__ = this.#root.get(${defines.get("mapArgument0")});
    if (!__innerSet__)
      return false;

    return __innerSet__.has(${defines.get("setArgument0")});
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.get("mapArgument0")}) {
    this.#requireValidMapKey(${defines.get("mapArgument0")});
    return this.#root.has(${defines.get("mapArgument0")});
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("mapArgument0")}, ${defines.get("setArgument0")}) {
    return this.#isValidKey(${defines.get("mapArgument0")}, ${defines.get("setArgument0")});
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${defines.get("mapArgument0")}) {
    this.#requireValidMapKey(${defines.get("mapArgument0")});

    const __innerSet__ = this.#root.get(${defines.get("mapArgument0")});
    if (!__innerSet__)
      return;

    const __outerIter__ = __innerSet__.values();
    for (let __value__ of __outerIter__)
      yield [${defines.get("mapArgument0")}, __value__];
  }

${docs.buildBlock("requireInnerCollectionPrivate", 2)}
  #requireInnerSet(${defines.get("mapArgument0")}) {
    if (!this.#root.has(${defines.get("mapArgument0")})) {
      this.#root.set(${defines.get("mapArgument0")}, new Set);
    }
    return this.#root.get(${defines.get("mapArgument0")});
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.get("mapArgument0")}, ${defines.get("setArgument0")}) {
    if (!this.#isValidKey(${defines.get("mapArgument0")}, ${defines.get("setArgument0")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.get("mapArgument0")}, ${defines.get("setArgument0")}) {
    return this.#isValidMapKey(${defines.get("mapArgument0")}) && this.#isValidSetKey(${defines.get("setArgument0")});
  }

${docs.buildBlock("requireValidMapKey", 2)}
  #requireValidMapKey(${defines.get("mapArgument0")}) {
    if (!this.#isValidMapKey(${defines.get("mapArgument0")}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  #isValidMapKey(${defines.get("mapArgument0")}) {
    if (Object(${defines.get("mapArgument0")}) !== ${defines.get("mapArgument0")})
      return false;
    ${defines.get("validateMapArguments") || ""}
    return true;
  }

${docs.buildBlock("isValidSetKeyPrivate", 2)}
  #isValidSetKey(${defines.get("setArgument0")}) {
    void(${defines.get("setArgument0")});

    ${defines.get("validateSetArguments") || ""}
    return true;
  }

  [Symbol.toStringTag] = "${defines.get("className")}";
}

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`;
}
