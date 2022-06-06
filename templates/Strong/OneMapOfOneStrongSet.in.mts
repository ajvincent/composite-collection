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

  const tsAllTypes = `${defines.tsMapTypes[0]}, ${defines.tsSetTypes[0]}`;
  const tsAllKeys = `${defines.tsMapKeys[0]}, ${defines.tsSetKeys[0]}`;
  const tsMapTypes = defines.tsMapTypes[0];
  const tsSetTypes = defines.tsSetTypes[0];
  const tsMapKeys = defines.tsMapKeys[0];
  const tsSetKeys = defines.tsSetKeys[0];
  const allKeys = `${defines.mapKeys[0]}, ${defines.setKeys[0]}`;
  const mapKeys = defines.mapKeys[0];
  const setKeys = defines.setKeys[0];

  return `
${defines.importLines}
import { DefaultMap } from "./keys/DefaultMap.mjs";

class ${defines.className}${defines.tsGenericFull}
{
  /** @typedef {Set<${defines.setArgument0Type}>} __${defines.className}__InnerMap__ */

  /** @type {Map<${defines.mapArgument0Type}, __${defines.className}__InnerMap__>} @constant */
  #outerMap: DefaultMap<${tsMapTypes}, Set<${tsSetTypes}>> = new DefaultMap();

  /** @type {number} */
  #sizeOfAll = 0;

  constructor(iterable?: [${tsAllTypes}][]) {
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
    const __innerSet__ = this.#outerMap.get(${mapKeys})
    return __innerSet__?.size || 0;
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
    const __innerSet__ = this.#outerMap.getDefault(${mapKeys}, () => new Set);
    if (!__innerSet__.has(${setKeys})) {
      __innerSet__.add(${setKeys});
      this.#sizeOfAll++;
    }

    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${tsMapKeys}, __sets__: [${tsSetTypes}][]) : this
  {
    ${invokeMapValidate}
    ${invokeValidate ? `__sets__.forEach(([${setKeys}]) => this.#requireValidKey(${allKeys}))` : ""}

    if (__sets__.length === 0)
      return this;

    const __innerSet__ = this.#outerMap.getDefault(${mapKeys}, () => new Set);
    __sets__.forEach(([${setKeys}]) =>  {
      if (!__innerSet__.has(${setKeys})) {
        __innerSet__.add(${setKeys});
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

${docs.buildBlock("delete", 2)}
  delete(${tsAllKeys}) : boolean
  {
    ${invokeValidate}
    const __innerSet__ = this.#outerMap.get(${mapKeys})
    if (!__innerSet__)
      return false;

    if (!__innerSet__.has(${setKeys}))
      return false;

    __innerSet__.delete(${setKeys});
    this.#sizeOfAll--;

    if (__innerSet__.size === 0) {
      this.#outerMap.delete(${mapKeys});
    }

    return true;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${tsMapKeys}) : boolean
  {
    ${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${mapKeys})
    if (!__innerSet__)
      return false;

    this.#outerMap.delete(${mapKeys});
    this.#sizeOfAll -= __innerSet__.size;
    return true;
  }

${docs.buildBlock("forEach_Set", 2)}
  forEach(
    __callback__: (
      ${tsMapKeys},
      ${tsSetKeys},
      __collection__: ${defines.className}<${tsAllTypes}>
    ) => void,
    __thisArg__?: unknown
  ) : void
  {
    this.#outerMap.forEach(
      (__innerSet__, ${mapKeys}) => __innerSet__.forEach(
        ${setKeys} => __callback__.apply(__thisArg__, [${allKeys}, this])
      )
    );
  }

${docs.buildBlock("forEach_Set_callback", 2)}

${docs.buildBlock("forEachMap_MapSet", 2)}
  forEachMap(
    __callback__: (
      ${defines.tsMapKeys.join(",\n      ")},
      __collection__: ${defines.className}<${tsAllTypes}>
    ) => void,
    __thisArg__?: unknown
  ) : void
  {
    for (let ${mapKeys} of this.#outerMap.keys()) {
      __callback__.apply(__thisArg__, [${mapKeys}, this]);
    }
  }

${docs.buildBlock("forEachMap_MapSet_callback", 2)}

${docs.buildBlock("forEachSet_MapSet", 2)}
  forEachSet(
    ${tsMapKeys},
    __callback__: (
      ${tsMapKeys},
      ${tsSetKeys},
      __collection__: ${defines.className}<${tsAllTypes}>
    ) => void,
    __thisArg__?: unknown
  ): void
  {
    ${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${mapKeys})
    if (!__innerSet__)
      return;

    __innerSet__.forEach(
      ${setKeys} => __callback__.apply(__thisArg__, [${allKeys}, this])
    );
  }

${docs.buildBlock("has", 2)}
  has(${tsAllKeys}) : boolean
  {
    ${invokeValidate}
    const __innerSet__ = this.#outerMap.get(${mapKeys})
    if (!__innerSet__)
      return false;

    return __innerSet__.has(${setKeys});
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${tsMapKeys}) : boolean
  {
    ${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${mapKeys})
    return Boolean(__innerSet__);
  }

${defines.validateArguments ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${tsAllKeys}) : boolean
  {
    return this.#isValidKey(${allKeys});
  }

  ` : ``}
${docs.buildBlock("values", 2)}
  * values() : IterableIterator<[${tsAllTypes}]>
  {
    const __outerIter__ = this.#outerMap.entries();

    for (let [${mapKeys}, __innerSet__] of __outerIter__) {
      for (let ${setKeys} of __innerSet__.values())
        yield [${allKeys}];
    }
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${tsMapKeys}) : IterableIterator<[${tsAllTypes}]>
  {
    ${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${mapKeys})
    if (!__innerSet__)
      return;

    for (let ${setKeys} of __innerSet__.values())
      yield [${allKeys}];
  }

${defines.validateArguments ? `
${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${tsAllKeys}) : void
  {
    if (!this.#isValidKey(${defines.argList}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${tsAllKeys}) : boolean
  {
    void(${mapKeys});
    void(${setKeys});

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
    void(${mapKeys});

    ${defines.validateMapArguments || ""}
    return true;
  }
  ` : ``}

  [Symbol.iterator]() : IterableIterator<[${tsAllTypes}]>
  {
    return this.values();
  }

  [Symbol.toStringTag] = "${defines.className}";
}


Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);

export type Readonly${defines.className}${defines.tsGenericFull} =
  Pick<
    ${defines.className}<${tsAllTypes}>,
    "size" | "getSizeOfSet" | "mapSize" | "has" | "hasSets"${
      defines.validateArguments ? ` | "isValidKey"` : ``
    } | "values" | "valuesSet"
  > &
  {
    forEach(
      __callback__: (
        ${defines.tsMapKeys.join(",\n        ")},
        ${defines.tsSetKeys.join(",\n        ")},
        __collection__: Readonly${defines.className}<${tsAllTypes}>
      ) => void,
      __thisArg__?: unknown
    ) : void;

    forEachMap(
      __callback__: (
        ${defines.tsMapKeys.join(",\n        ")},
        __collection__: Readonly${defines.className}<${tsAllTypes}>
      ) => void,
      __thisArg__?: unknown
    ) : void;

    forEachSet(
      ${tsMapKeys},
      __callback__: (
        ${defines.tsMapKeys.join(",\n        ")},
        ${defines.tsSetKeys.join(",\n        ")},
        __collection__: Readonly${defines.className}<${tsAllTypes}>
      ) => void,
      __thisArg__?: unknown
    ): void;
  }
`}

export default preprocess;
