import TypeScriptDefines from "../../source/typescript-migration/TypeScriptDefines.mjs";
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
    const tsAllTypes = [...defines.tsMapTypes, ...defines.tsSetTypes].join(", ");
    const tsAllKeys = [...defines.tsMapKeys, ...defines.tsSetKeys].join(", ");
    const tsMapTypes = defines.tsMapTypes.join(", ");
    const tsMapKeys = defines.tsMapKeys.join(", ");
    const tsSetTypes = defines.tsSetTypes.join(", ");
    const allKeys = [...defines.mapKeys, ...defines.setKeys].join(", ");
    const mapKeys = defines.mapKeys.join(", ");
    const setKeys = defines.setKeys.join(", ");
    return `
${defines.importLines}
import KeyHasher from "./keys/Hasher.mjs";

class ${defines.className}${defines.tsGenericFull}
{
  /** @typedef {string} hash */

  /** @type {Map<${defines.mapArgument0Type}, Map<hash, *[]>>} @constant */
  #outerMap: Map<${tsMapTypes}, Map<string, [${tsAllTypes}]>> = new Map();

  /** @type {KeyHasher} @constant */
  #setHasher = new KeyHasher();

  /** @type {number} */
  #sizeOfAll = 0;

  constructor(iterable?: [${tsAllTypes}][])
  {
    if (iterable) {
      for (let [${allKeys}] of iterable) {
        this.add(${allKeys});
      }
    }
  }

${docs.buildBlock("getSize", 2)}
  get size() : number
  {
    return this.#sizeOfAll;
  }

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${tsMapKeys}) : number
  {
    ${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${mapKeys});
    return __innerMap__?.size || 0;
  }

${docs.buildBlock("mapSize", 2)}
  get mapSize() : number
  {
    return this.#outerMap.size;
  }

${docs.buildBlock("add", 2)}
  add(${tsAllKeys}) : this
  {
    ${invokeValidate}
    if (!this.#outerMap.has(${mapKeys}))
      this.#outerMap.set(${mapKeys}, new Map);

    const __innerMap__ = this.#outerMap.get(${mapKeys});

    const __setHash__ = this.#setHasher.getHash(${setKeys});
    if (!__innerMap__.has(__setHash__)) {
      __innerMap__.set(__setHash__, [${allKeys}]);
      this.#sizeOfAll++;
    }

    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${tsMapKeys}, __sets__: [${tsSetTypes}][]) : this
  {
    ${invokeMapValidate}
    ${invokeValidate ? `__sets__.forEach(([${setKeys}]) => this.#requireValidKey(${allKeys}))` : ""}

    if (!this.#outerMap.has(${mapKeys}))
      this.#outerMap.set(${mapKeys}, new Map);

    const __innerMap__ = this.#outerMap.get(${mapKeys});
    __sets__.forEach(([${setKeys}]) => {
      const __setHash__ = this.#setHasher.getHash(${setKeys});
      if (!__innerMap__.has(__setHash__)) {
        __innerMap__.set(__setHash__, [${allKeys}]);
        this.#sizeOfAll++;
      }
    });

    return this;
  }

${docs.buildBlock("clear", 2)}
  clear() : void
  {
    this.#outerMap.clear();
    this.#sizeOfAll = 0;
  }

${docs.buildBlock("clearSets", 2)}
  clearSets(${tsMapKeys}) : void
  {
    ${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${mapKeys})
    if (!__innerMap__)
      return;

    this.#sizeOfAll -= __innerMap__.size;
    __innerMap__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${tsAllKeys}) : boolean
  {
    ${invokeValidate}
    const __innerMap__ = this.#outerMap.get(${mapKeys})
    if (!__innerMap__)
      return false;

    const __setHash__ = this.#setHasher.getHashIfExists(${setKeys});
    if (!__setHash__ || !__innerMap__.has(__setHash__))
      return false;

    __innerMap__.delete(__setHash__);
    this.#sizeOfAll--;

    if (__innerMap__.size === 0) {
      this.#outerMap.delete(${mapKeys});
    }

    return true;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${tsMapKeys}) : boolean
  {
    ${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${mapKeys})
    if (!__innerMap__)
      return false;

    this.#outerMap.delete(${mapKeys});
    this.#sizeOfAll -= __innerMap__.size;
    return true;
  }

${docs.buildBlock("forEachSet", 2)}
  forEach(
    __callback__: (
      ${defines.tsMapTypes.join(",\n      ")},
      ${defines.tsSetTypes.join(",\n      ")},
      __collection__: ${defines.className}<${tsAllTypes}>
    ) => void,
    __thisArg__: unknown
  ) : void
  {
    this.#outerMap.forEach(
      __innerMap__ => __innerMap__.forEach(
        __keySet__ => __callback__.apply(__thisArg__, [...__keySet__, this])
      )
    );
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(
    ${tsMapKeys},
    __callback__: (
      ${defines.tsMapTypes.join(",\n      ")},
      ${defines.tsSetTypes.join(",\n      ")},
      __collection__: ${defines.className}<${tsAllTypes}>
    ) => void,
    __thisArg__: unknown
  ): void
  {
    ${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${mapKeys})
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, [...__keySet__, this])
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("has", 2)}
  has(${tsAllKeys}) : boolean
  {
    ${invokeValidate}
    const __innerMap__ = this.#outerMap.get(${mapKeys})
    if (!__innerMap__)
      return false;

    const __setHash__ = this.#setHasher.getHashIfExists(${setKeys});
    return __setHash__ ? __innerMap__.has(__setHash__) : false;
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${mapKeys}) : boolean
  {
    ${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${defines.mapKeys[0]})
    return Boolean(__innerMap__);
  }

${defines.validateArguments ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${tsAllKeys}) : boolean
  {
    return this.#isValidKey(${allKeys});
  }

  ` : ``}
${docs.buildBlock("values", 2)}
  * values() : Iterator<[${tsAllTypes}]>
  {
    const __outerIter__ = this.#outerMap.values();

    for (let __innerMap__ of __outerIter__) {
      for (let __value__ of __innerMap__.values())
        yield __value__;
    }
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${tsMapKeys}) : Iterator<[${tsAllTypes}]>
  {
    ${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${mapKeys})
    if (!__innerMap__)
      return;

    for (let __value__ of __innerMap__.values())
      yield __value__;
  }

${defines.validateArguments ? `
${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${tsAllKeys}): void
  {
    if (!this.#isValidKey(${allKeys}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${tsAllKeys}) : boolean
  {
    ${defines.mapKeys.map(key => `void(${key});`).join("\n      ")}
    ${defines.setKeys.map(key => `void(${key});`).join("\n      ")}

    ${defines.validateArguments}
    return true;
  }
  ` : ``}

${defines.validateMapArguments ? `
${docs.buildBlock("requireValidMapKey", 2)}
  #requireValidMapKey(${tsMapKeys}) : void
  {
    if (!this.#isValidMapKey(${mapKeys}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  #isValidMapKey(${tsMapKeys}) : boolean
  {
    ${defines.mapKeys.map(key => `void(${key});`).join("\n      ")}

    ${defines.validateMapArguments || ""}
    return true;
  }
  ` : ``}

  [Symbol.iterator]() : Iterator<[${tsAllTypes}]>
  {
    return this.values();
  }

  [Symbol.toStringTag] = "${defines.className}";
}


Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`;
};
export default preprocess;
TypeScriptDefines.registerGenerator(preprocess, true);
//# sourceMappingURL=OneMapOfStrongSets.in.mjs.map