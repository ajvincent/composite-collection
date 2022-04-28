import type { ReadonlyDefines, JSDocGenerator, TemplateFunction } from "../sharedTypes.mjs";

/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess: TemplateFunction = function preprocess(defines: ReadonlyDefines, docs: JSDocGenerator) {
  let invokeValidate = "", invokeMapValidate = "";
  if (defines.invokeValidate) {
    invokeValidate = `\n    this.#requireValidKey(${defines.argList});\n`;
  }
  if (defines.validateMapArguments) {
    invokeMapValidate = `\n    this.#requireValidMapKey(${defines.mapKeys[0]});\n`;
  }

  return `
${defines.importLines}

class ${defines.className} {
  /** @type {Map<${defines.mapArgument0Type}, Set<${defines.setArgument0Type}>>} @constant */
  #outerMap = new Map();

  /** @type {number} */
  #sizeOfAll = 0;

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let [${defines.mapKeys[0]}, ${defines.setKeys[0]}] of iterable) {
        this.add(${defines.mapKeys[0]}, ${defines.setKeys[0]});
      }
    }
  }

${docs.buildBlock("getSize", 2)}
  get size() {
    return this.#sizeOfAll;
  }

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${defines.mapKeys[0]}) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.mapKeys[0]})
    return __innerSet__?.size || 0;
  }

${docs.buildBlock("mapSize", 2)}
  get mapSize() {
    return this.#outerMap.size;
  }

${docs.buildBlock("add", 2)}
  add(${defines.mapKeys[0]}, ${defines.setKeys[0]}) {${invokeValidate}
    if (!this.#outerMap.has(${defines.mapKeys[0]}))
      this.#outerMap.set(${defines.mapKeys[0]}, new Set);

    const __innerSet__ = this.#outerMap.get(${defines.mapKeys[0]});

    if (!__innerSet__.has(${defines.setKeys[0]})) {
      __innerSet__.add(${defines.setKeys[0]});
      this.#sizeOfAll++;
    }

    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.mapKeys[0]}, __sets__) {${invokeMapValidate}
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.setKeys.length}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.setKeys.length} argument${
          defines.setKeys.length > 1 ? "s" : ""
        }!\`);
      }
      ${defines.invokeValidate ? `this.#requireValidKey(${defines.mapKeys[0]}, ...__set__);` : ""}

      return __set__;
    });

    if (!this.#outerMap.has(${defines.mapKeys[0]}))
      this.#outerMap.set(${defines.mapKeys[0]}, new Set);

    const __innerSet__ = this.#outerMap.get(${defines.mapKeys[0]});

    __array__.forEach(__set__ => {
      if (!__innerSet__.has(__set__[0])) {
        __innerSet__.add(__set__[0]);
        this.#sizeOfAll++;
      }
    });

    return this;
  }

${docs.buildBlock("clear", 2)}
  clear() {
    this.#outerMap.clear();
    this.#sizeOfAll = 0;
  }

${docs.buildBlock("clearSets", 2)}
  clearSets(${defines.mapKeys[0]}) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.mapKeys[0]})
    if (!__innerSet__)
      return;

    this.#sizeOfAll -= __innerSet__.size;
    __innerSet__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.mapKeys[0]}, ${defines.setKeys.join(", ")}) {${invokeValidate}
    const __innerSet__ = this.#outerMap.get(${defines.mapKeys[0]})
    if (!__innerSet__)
      return false;

    if (!__innerSet__.has(${defines.setKeys[0]}))
      return false;

    __innerSet__.delete(${defines.setKeys[0]});
    this.#sizeOfAll--;

    if (__innerSet__.size === 0) {
      this.#outerMap.delete(${defines.mapKeys[0]});
    }

    return true;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.mapKeys[0]}) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.mapKeys[0]})
    if (!__innerSet__)
      return false;

    this.#outerMap.delete(${defines.mapKeys[0]});
    this.#sizeOfAll -= __innerSet__.size;
    return true;
  }

${docs.buildBlock("forEachSet", 2)}
  forEach(__callback__, __thisArg__) {
    this.#outerMap.forEach(
      (__innerSet__, ${defines.mapKeys[0]}) => __innerSet__.forEach(
        ${defines.setKeys[0]} => __callback__.apply(__thisArg__, [${defines.mapKeys[0]}, ${defines.setKeys[0]}, this])
      )
    );
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.mapKeys[0]}, __callback__, __thisArg__) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.mapKeys[0]})
    if (!__innerSet__)
      return;

    __innerSet__.forEach(
      ${defines.setKeys[0]} => __callback__.apply(__thisArg__, [${defines.mapKeys[0]}, ${defines.setKeys[0]}, this])
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("has", 2)}
  has(${defines.mapKeys[0]}, ${defines.setKeys.join(", ")}) {${invokeValidate}
    const __innerSet__ = this.#outerMap.get(${defines.mapKeys[0]})
    if (!__innerSet__)
      return false;

    return __innerSet__.has(${defines.setKeys[0]});
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.mapKeys[0]}) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.mapKeys[0]})
    return Boolean(__innerSet__);
  }

${defines.validateArguments ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.argList}) {
    return this.#isValidKey(${defines.argList});
  }

  ` : ``}
${docs.buildBlock("values", 2)}
  * values() {
    const __outerIter__ = this.#outerMap.entries();

    for (let [${defines.mapKeys[0]}, __innerSet__] of __outerIter__) {
      for (let ${defines.setKeys[0]} of __innerSet__.values())
        yield [${defines.mapKeys[0]}, ${defines.setKeys[0]}];
    }
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${defines.mapKeys[0]}) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.mapKeys[0]})
    if (!__innerSet__)
      return;

    for (let ${defines.setKeys[0]} of __innerSet__.values())
      yield [${defines.mapKeys[0]}, ${defines.setKeys[0]}];
  }

${defines.validateArguments ? `
${docs.buildBlock("requireValidKey", 2)}
    #requireValidKey(${defines.argList}) {
      if (!this.#isValidKey(${defines.argList}))
        throw new Error("The ordered key set is not valid!");
    }

${docs.buildBlock("isValidKeyPrivate", 2)}
    #isValidKey(${defines.argList}) {
      void(${defines.argList});

      ${defines.validateArguments}
      return true;
    }

  ` : ``}

${defines.validateMapArguments ? `
${docs.buildBlock("requireValidMapKey", 2)}
  #requireValidMapKey(${defines.mapKeys[0]}) {
    if (!this.#isValidMapKey(${defines.mapKeys[0]}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  #isValidMapKey(${defines.mapKeys[0]}) {
    void(${defines.mapKeys[0]});

    ${defines.validateMapArguments || ""}
    return true;
  }
  ` : ``}

  [Symbol.iterator]() {
    return this.values();
  }

  [Symbol.toStringTag] = "${defines.className}";
}


Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`}

export default preprocess;
