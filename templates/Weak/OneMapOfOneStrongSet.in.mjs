/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    return `
${defines.importLines}
class ${defines.className} {
  /**
   * @type {WeakMap<${defines.mapArgument0Type}, Set<${defines.setArgument0Type}>>}
   * @constant
   * This is two levels. The first level is the map key.
   * The second level is the strong set.
   */
  #root = new WeakMap();

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let [${defines.mapKeys[0]}, ${defines.setKeys[0]}] of iterable) {
        this.add(${defines.mapKeys[0]}, ${defines.setKeys[0]});
      }
    }
  }

${docs.buildBlock("add", 2)}
  add(${defines.mapKeys[0]}, ${defines.setKeys[0]}) {
    this.#requireValidKey(${defines.mapKeys[0]}, ${defines.setKeys[0]});
    const __innerSet__ = this.#requireInnerSet(${defines.mapKeys[0]});

    __innerSet__.add(${defines.setKeys[0]});
    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.mapKeys[0]}, __sets__) {
    this.#requireValidMapKey(${defines.mapKeys[0]});
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.setKeys.length}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.setKeys.length} set argument${defines.setKeys.length > 1 ? "s" : ""}!\`);
      }
      this.#requireValidKey(${defines.mapKeys[0]}, ...__set__);
      return __set__;
    });

    const __innerSet__ = this.#requireInnerSet(${defines.mapKeys[0]});

    // level 2: inner map to set
    __array__.forEach(__set__ => __innerSet__.add(__set__[0]));

    return this;
  }

${docs.buildBlock("clearSets", 2)}
  clearSets(${defines.mapKeys[0]}) {
    this.#requireValidMapKey(${defines.mapKeys[0]});
    const __innerSet__ = this.#root.get(${defines.mapKeys[0]});
    if (!__innerSet__)
      return;

    __innerSet__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.mapKeys[0]}, ${defines.setKeys[0]}) {
    this.#requireValidKey(${defines.mapKeys[0]}, ${defines.setKeys[0]});
    const __innerSet__ = this.#root.get(${defines.mapKeys[0]});
    if (!__innerSet__)
      return false;

    // level 2: inner map to set
    const __returnValue__ = __innerSet__.delete(${defines.setKeys[0]});

    if (__innerSet__.size === 0) {
      this.deleteSets(${defines.mapKeys[0]});
    }

    return __returnValue__;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.mapKeys[0]}) {
    this.#requireValidMapKey(${defines.mapKeys[0]});
    return this.#root.delete(${defines.mapKeys[0]});
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.mapKeys[0]}, __callback__, __thisArg__) {
    this.#requireValidMapKey(${defines.mapKeys[0]});
    const __innerSet__ = this.#root.get(${defines.mapKeys[0]});
    if (!__innerSet__)
      return;

    __innerSet__.forEach(
      __element__ => __callback__.apply(__thisArg__, [${defines.mapKeys[0]}, __element__, this])
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${defines.mapKeys[0]}) {
    this.#requireValidMapKey(${defines.mapKeys[0]});
    const __innerSet__ = this.#root.get(${defines.mapKeys[0]});
    return __innerSet__?.size || 0;
  }

${docs.buildBlock("has", 2)}
  has(${defines.mapKeys[0]}, ${defines.setKeys[0]}) {
    this.#requireValidKey(${defines.mapKeys[0]}, ${defines.setKeys[0]});
    const __innerSet__ = this.#root.get(${defines.mapKeys[0]});
    if (!__innerSet__)
      return false;

    return __innerSet__.has(${defines.setKeys[0]});
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.mapKeys[0]}) {
    this.#requireValidMapKey(${defines.mapKeys[0]});
    return this.#root.has(${defines.mapKeys[0]});
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.mapKeys[0]}, ${defines.setKeys[0]}) {
    return this.#isValidKey(${defines.mapKeys[0]}, ${defines.setKeys[0]});
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${defines.mapKeys[0]}) {
    this.#requireValidMapKey(${defines.mapKeys[0]});

    const __innerSet__ = this.#root.get(${defines.mapKeys[0]});
    if (!__innerSet__)
      return;

    const __outerIter__ = __innerSet__.values();
    for (let __value__ of __outerIter__)
      yield [${defines.mapKeys[0]}, __value__];
  }

${docs.buildBlock("requireInnerCollectionPrivate", 2)}
  #requireInnerSet(${defines.mapKeys[0]}) {
    if (!this.#root.has(${defines.mapKeys[0]})) {
      this.#root.set(${defines.mapKeys[0]}, new Set);
    }
    return this.#root.get(${defines.mapKeys[0]});
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.mapKeys[0]}, ${defines.setKeys[0]}) {
    if (!this.#isValidKey(${defines.mapKeys[0]}, ${defines.setKeys[0]}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.mapKeys[0]}, ${defines.setKeys[0]}) {
    return this.#isValidMapKey(${defines.mapKeys[0]}) && this.#isValidSetKey(${defines.setKeys[0]});
  }

${docs.buildBlock("requireValidMapKey", 2)}
  #requireValidMapKey(${defines.mapKeys[0]}) {
    if (!this.#isValidMapKey(${defines.mapKeys[0]}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  #isValidMapKey(${defines.mapKeys[0]}) {
    if (Object(${defines.mapKeys[0]}) !== ${defines.mapKeys[0]})
      return false;
    ${defines.validateMapArguments || ""}
    return true;
  }

${docs.buildBlock("isValidSetKeyPrivate", 2)}
  #isValidSetKey(${defines.setKeys[0]}) {
    void(${defines.setKeys[0]});

    ${defines.validateSetArguments || ""}
    return true;
  }

  [Symbol.toStringTag] = "${defines.className}";
}

Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`;
};
export default preprocess;
//# sourceMappingURL=OneMapOfOneStrongSet.in.mjs.map