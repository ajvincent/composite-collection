/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
export default function preprocess(defines, docs) {
  let invokeValidate = "", invokeMapValidate = "";
  if (defines.has("invokeValidate")) {
    invokeValidate = `\n    this.#requireValidKey(${defines.get("argList")});\n`;
  }
  if (defines.has("validateMapArguments")) {
    invokeMapValidate = `\n    this.#requireValidMapKey(${defines.get("mapArgList")});\n`;
  }

  return `
${defines.get("importLines")}

class ${defines.get("className")} {
  /** @type {Map<${defines.get("mapArgument0Type")}, Set<${defines.get("setArgument0Type")}>>} @constant */
  #outerMap = new Map();

  /** @type {number} */
  #sizeOfAll = 0;

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.add(...entry);
      }
    }
  }

${docs.buildBlock("getSize", 2)}
  get size() {
    return this.#sizeOfAll;
  }

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${defines.get("mapArgList")}) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.get("mapArgument0")})
    return __innerSet__?.size || 0;
  }

${docs.buildBlock("mapSize", 2)}
  get mapSize() {
    return this.#outerMap.size;
  }

${docs.buildBlock("add", 2)}
  add(${defines.get("mapArgList")}, ${defines.get("setArgument0")}) {${invokeValidate}
    if (!this.#outerMap.has(${defines.get("mapArgument0")}))
      this.#outerMap.set(${defines.get("mapArgument0")}, new Set);

    const __innerSet__ = this.#outerMap.get(${defines.get("mapArgument0")});

    if (!__innerSet__.has(${defines.get("setArgument0")})) {
      __innerSet__.add(${defines.get("setArgument0")});
      this.#sizeOfAll++;
    }

    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.get("mapArgList")}, __sets__) {${invokeMapValidate}
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.get("setCount")}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.get("setCount")} argument${
          defines.get("setCount") > 1 ? "s" : ""
        }!\`);
      }
      ${defines.has("invokeValidate") ? `this.#requireValidKey(${defines.get("mapArgList")}, ...__set__);` : ""}

      return __set__;
    });

    if (!this.#outerMap.has(${defines.get("mapArgument0")}))
      this.#outerMap.set(${defines.get("mapArgument0")}, new Set);

    const __innerSet__ = this.#outerMap.get(${defines.get("mapArgument0")});

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
  clearSets(${defines.get("mapArgList")}) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerSet__)
      return;

    this.#sizeOfAll -= __innerSet__.size;
    __innerSet__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {${invokeValidate}
    const __innerSet__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerSet__)
      return false;

    if (!__innerSet__.has(${defines.get("setArgument0")}))
      return false;

    __innerSet__.delete(${defines.get("setArgument0")});
    this.#sizeOfAll--;

    if (__innerSet__.size === 0) {
      this.#outerMap.delete(${defines.get("mapArgument0")});
    }

    return true;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.get("mapArgList")}) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerSet__)
      return false;

    this.#outerMap.delete(${defines.get("mapArgument0")});
    this.#sizeOfAll -= __innerSet__.size;
    return true;
  }

${docs.buildBlock("forEachSet", 2)}
  forEach(__callback__, __thisArg__) {
    this.#outerMap.forEach(
      (__innerSet__, ${defines.get("mapArgument0")}) => __innerSet__.forEach(
        ${defines.get("setArgument0")} => __callback__.apply(__thisArg__, [${defines.get("mapArgument0")}, ${defines.get("setArgument0")}, this])
      )
    );
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.get("mapArgument0")}, __callback__, __thisArg__) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerSet__)
      return;

    __innerSet__.forEach(
      ${defines.get("setArgument0")} => __callback__.apply(__thisArg__, [${defines.get("mapArgument0")}, ${defines.get("setArgument0")}, this])
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("has", 2)}
  has(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {${invokeValidate}
    const __innerSet__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerSet__)
      return false;

    return __innerSet__.has(${defines.get("setArgument0")});
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.get("mapArgList")}) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.get("mapArgument0")})
    return Boolean(__innerSet__);
  }

${defines.has("validateArguments") ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("argList")}) {
    return this.#isValidKey(${defines.get("argList")});
  }

  ` : ``}
${docs.buildBlock("values", 2)}
  * values() {
    const __outerIter__ = this.#outerMap.entries();

    for (let [${defines.get("mapArgument0")}, __innerSet__] of __outerIter__) {
      for (let ${defines.get("setArgument0")} of __innerSet__.values())
        yield [${defines.get("mapArgument0")}, ${defines.get("setArgument0")}];
    }
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${defines.get("mapArgument0")}) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerSet__)
      return;

    for (let ${defines.get("setArgument0")} of __innerSet__.values())
      yield [${defines.get("mapArgument0")}, ${defines.get("setArgument0")}];
  }

${defines.has("validateArguments") ? `
${docs.buildBlock("requireValidKey", 2)}
    #requireValidKey(${defines.get("argList")}) {
      if (!this.#isValidKey(${defines.get("argList")}))
        throw new Error("The ordered key set is not valid!");
    }

${docs.buildBlock("isValidKeyPrivate", 2)}
    #isValidKey(${defines.get("argList")}) {
      void(${defines.get("argList")});

      ${defines.get("validateArguments")}
      return true;
    }

  ` : ``}

${defines.has("validateMapArguments") ? `
${docs.buildBlock("requireValidMapKey", 2)}
  #requireValidMapKey(${defines.get("mapArgList")}) {
    if (!this.#isValidMapKey(${defines.get("mapArgList")}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  #isValidMapKey(${defines.get("mapArgList")}) {
    void(${defines.get("mapArgList")});

    ${defines.get("validateMapArguments") || ""}
    return true;
  }

  ` : ``}
}

${defines.get("className")}[Symbol.iterator] = function() {
  return this.values();
}

Reflect.defineProperty(${defines.get("className")}, Symbol.toStringTag, {
  value: "${defines.get("className")}",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`}
