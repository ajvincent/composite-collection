/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    let invokeValidate = "", invokeMapValidate = "";
    if (defines.invokeValidate) {
        invokeValidate = `\n    this.#requireValidKey(${defines.argList});\n`;
    }
    if (defines.validateMapArguments) {
        invokeMapValidate = `\n    this.#requireValidMapKey(${defines.mapKeys.join(", ")});\n`;
    }
    return `
${defines.importLines}
import KeyHasher from "./keys/Hasher.mjs";

class ${defines.className} {
  /** @typedef {string} hash */

  /** @type {Map<hash, Map<${defines.setArgument0Type}, *[]>>} @constant */
  #outerMap = new Map();

  /** @type {KeyHasher} @constant */
  #mapHasher = new KeyHasher();

  /** @type {number} */
  #sizeOfAll = 0;

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let [${defines.mapKeys.join(", ")}, ${defines.setKeys[0]}] of iterable) {
        this.add(${defines.mapKeys.join(", ")}, ${defines.setKeys[0]});
      }
    }
  }

${docs.buildBlock("getSize", 2)}
  get size() {
    return this.#sizeOfAll;
  }

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${defines.mapKeys.join(", ")}) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.mapKeys.join(", ")});
    return __innerMap__ ? __innerMap__.size : 0;
  }

${docs.buildBlock("mapSize", 2)}
  get mapSize() {
    return this.#outerMap.size;
  }

${docs.buildBlock("add", 2)}
  add(${defines.mapKeys.join(", ")}, ${defines.setKeys[0]}) {${invokeValidate}
    const __mapHash__ = this.#mapHasher.getHash(${defines.mapKeys.join(", ")});
    if (!this.#outerMap.has(__mapHash__))
      this.#outerMap.set(__mapHash__, new Map);

    const __innerMap__ = this.#outerMap.get(__mapHash__);

    if (!__innerMap__.has(${defines.setKeys[0]})) {
      __innerMap__.set(${defines.setKeys[0]}, Object.freeze([${defines.argList}]));
      this.#sizeOfAll++;
    }

    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.mapKeys.join(", ")}, __sets__) {${invokeMapValidate}
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.setKeys.length}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.setKeys.length} argument${defines.setKeys.length > 1 ? "s" : ""}!\`);
      }
      ${defines.invokeValidate ? `this.#requireValidKey(${defines.mapKeys.join(", ")}, ...__set__);` : ""}

      return __set__;
    });

    const __mapHash__ = this.#mapHasher.getHash(${defines.mapKeys.join(", ")});
    if (!this.#outerMap.has(__mapHash__))
      this.#outerMap.set(__mapHash__, new Map);

    const __innerMap__ = this.#outerMap.get(__mapHash__);
    const __mapArgs__ = [${defines.mapKeys.join(", ")}];

    __array__.forEach(__set__ => {
      if (!__innerMap__.has(__set__[0])) {
        __innerMap__.set(__set__[0], Object.freeze(__mapArgs__.concat(__set__)));
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
  clearSets(${defines.mapKeys.join(", ")}) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.mapKeys.join(", ")});
    if (!__innerMap__)
      return;

    this.#sizeOfAll -= __innerMap__.size;
    __innerMap__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.mapKeys.join(", ")}, ${defines.setKeys.join(", ")}) {${invokeValidate}
    const [__innerMap__, __mapHash__] = this.#getInnerMap(${defines.mapKeys.join(", ")});
    if (!__innerMap__)
      return false;

    if (!__innerMap__.has(${defines.setKeys[0]}))
      return false;

    __innerMap__.delete(${defines.setKeys[0]});
    this.#sizeOfAll--;

    if (__innerMap__.size === 0) {
      this.#outerMap.delete(__mapHash__);
    }

    return true;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.mapKeys.join(", ")}) {${invokeMapValidate}
    const [__innerMap__, __mapHash__] = this.#getInnerMap(${defines.mapKeys.join(", ")});
    if (!__innerMap__)
      return false;

    this.#outerMap.delete(__mapHash__);
    this.#sizeOfAll -= __innerMap__.size;
    return true;
  }

${docs.buildBlock("forEachSet", 2)}
  forEach(__callback__, __thisArg__) {
    this.#outerMap.forEach(
      __innerMap__ => __innerMap__.forEach(
        __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
      )
    );
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.mapKeys.join(", ")}, __callback__, __thisArg__) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.mapKeys.join(", ")});
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("has", 2)}
  has(${defines.mapKeys.join(", ")}, ${defines.setKeys.join(", ")}) {${invokeValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.mapKeys.join(", ")});
    if (!__innerMap__)
      return false;

    return __innerMap__.has(${defines.setKeys[0]});
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.mapKeys.join(", ")}) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.mapKeys.join(", ")});
    return Boolean(__innerMap__);
  }

${defines.validateArguments ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.argList}) {
    return this.#isValidKey(${defines.argList});
  }

  ` : ``}
${docs.buildBlock("values", 2)}
  * values() {
    const __outerIter__ = this.#outerMap.values();

    for (let __innerMap__ of __outerIter__) {
      for (let __value__ of __innerMap__.values())
        yield __value__;
    }
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${defines.mapKeys.join(", ")}) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.mapKeys.join(", ")});
    if (!__innerMap__)
      return;

    for (let __value__ of __innerMap__.values())
      yield __value__;
  }

  #getInnerMap(...__mapArguments__) {
    const __hash__ = this.#mapHasher.getHashIfExists(...__mapArguments__);
    return __hash__ ? [this.#outerMap.get(__hash__), __hash__] : [null];
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
  #requireValidMapKey(${defines.mapKeys.join(", ")}) {
    if (!this.#isValidMapKey(${defines.mapKeys.join(", ")}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  #isValidMapKey(${defines.mapKeys.join(", ")}) {
    void(${defines.mapKeys.join(", ")});

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
`;
};
export default preprocess;
//# sourceMappingURL=MapOfOneStrongSet.in.mjs.map