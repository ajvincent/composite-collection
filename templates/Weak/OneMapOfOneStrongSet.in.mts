import type { ReadonlyDefines, JSDocGenerator, TemplateFunction } from "../sharedTypes.mjs";

/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess: TemplateFunction = function preprocess(defines: ReadonlyDefines, docs: JSDocGenerator) {
  const tsAllTypes = [...defines.tsMapTypes, ...defines.tsSetTypes].join(", ");
  const tsAllKeys = [...defines.tsMapKeys, ...defines.tsSetKeys].join(", ");
  const tsMapTypes = defines.tsMapTypes.join(", ");
  const tsSetTypes = defines.tsSetTypes.join(", ");
  const tsMapKeys = defines.tsMapKeys.join(", ");
  const tsSetKeys = defines.tsSetKeys.join(", ");
  const allKeys = defines.mapArgList + ", " + defines.setArgList;
  const mapKeys = defines.mapArgList;
  const setKeys = defines.setArgList;

  return `
${defines.importLines}
import { DefaultWeakMap } from "./keys/DefaultMap.mjs";

class ${defines.className}${defines.tsGenericFull}
{
  /** @typedef {Set<${defines.setArgument0Type}>} __${defines.className}_InnerMap__ */

  /**
   * @type {WeakMap<${defines.mapArgument0Type}, __${defines.className}_InnerMap__>}
   * @constant
   * This is two levels. The first level is the map key.
   * The second level is the strong set.
   */
  #root: DefaultWeakMap<${tsMapTypes}, Set<${tsSetTypes}>> = new DefaultWeakMap();

  constructor(iterable? : [${tsAllTypes}][])
  {
    if (iterable) {
      for (let [${allKeys}] of iterable) {
        this.add(${allKeys});
      }
    }
  }

${docs.buildBlock("add", 2)}
  add(${tsAllKeys}) : this
  {
    this.#requireValidKey(${allKeys});

    const __innerSet__ = this.#root.getDefault(${mapKeys}, () => new Set);
    __innerSet__.add(${setKeys});
    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${tsMapKeys}, __sets__: [${tsSetTypes}][]) : this
  {
    this.#requireValidMapKey(${mapKeys});

    if (__sets__.length === 0)
      return this;
    __sets__.forEach(([${setKeys}]) => {
      this.#requireValidKey(${allKeys});
    });

    const __innerSet__ = this.#root.getDefault(${mapKeys}, () => new Set);
    __sets__.forEach(([${setKeys}]) => __innerSet__.add(${setKeys}));
    return this;
  }

${docs.buildBlock("delete", 2)}
  delete(${tsAllKeys}) : boolean
  {
    this.#requireValidKey(${allKeys});
    const __innerSet__ = this.#root.get(${mapKeys});
    if (!__innerSet__)
      return false;

    // level 2: inner map to set
    const __returnValue__ = __innerSet__.delete(${setKeys});

    if (__innerSet__.size === 0) {
      this.deleteSets(${mapKeys});
    }

    return __returnValue__;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${tsMapKeys}) : boolean
  {
    this.#requireValidMapKey(${mapKeys});
    return this.#root.delete(${mapKeys});
  }

${docs.buildBlock("forEachSet_MapSet", 2)}
  forEachSet(
    ${tsMapKeys},
    __callback__: (
      ${tsMapKeys},
      ${tsSetKeys},
      __collection__: ${defines.className}<${tsAllTypes}>
    ) => void,
    __thisArg__?: unknown
  ) : void
  {
    this.#requireValidMapKey(${mapKeys});
    const __innerSet__ = this.#root.get(${mapKeys});
    if (!__innerSet__)
      return;

    __innerSet__.forEach(
      ${setKeys} => __callback__.apply(__thisArg__, [${allKeys}, this])
    );
  }

${docs.buildBlock("forEach_Set_callback", 2)}

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${tsMapKeys}) : number
  {
    this.#requireValidMapKey(${mapKeys});
    const __innerSet__ = this.#root.get(${mapKeys});
    return __innerSet__?.size || 0;
  }

${docs.buildBlock("has", 2)}
  has(${tsAllKeys}) : boolean
  {
    this.#requireValidKey(${allKeys});
    const __innerSet__ = this.#root.get(${mapKeys});
    if (!__innerSet__)
      return false;

    return __innerSet__.has(${setKeys});
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${tsMapKeys}) : boolean
  {
    this.#requireValidMapKey(${mapKeys});
    return this.#root.has(${mapKeys});
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${tsAllKeys}) : boolean
  {
    return this.#isValidKey(${allKeys});
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${tsMapKeys}) : IterableIterator<[${tsAllTypes}]>
  {
    this.#requireValidMapKey(${mapKeys});

    const __innerSet__ = this.#root.get(${mapKeys});
    if (!__innerSet__)
      return;

    const __outerIter__ = __innerSet__.values();
    for (let ${setKeys} of __outerIter__)
      yield [${allKeys}];
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${tsAllKeys}) : void
  {
    if (!this.#isValidKey(${allKeys}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${tsAllKeys}) : boolean
  {
    return this.#isValidMapKey(${mapKeys}) && this.#isValidSetKey(${setKeys});
  }

${docs.buildBlock("requireValidMapKey", 2)}
  #requireValidMapKey(${tsMapKeys}) : void
  {
    if (!this.#isValidMapKey(${mapKeys}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  #isValidMapKey(${tsMapKeys}) : boolean
  {
    if (Object(${mapKeys}) !== ${mapKeys})
      return false;
    ${defines.validateMapArguments || ""}
    return true;
  }

${docs.buildBlock("isValidSetKeyPrivate", 2)}
  #isValidSetKey(${tsSetKeys}) : boolean
  {
    void(${setKeys});

    ${defines.validateSetArguments || ""}
    return true;
  }

  [Symbol.toStringTag] = "${defines.className}";
}

Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);

export type Readonly${defines.className}${defines.tsGenericFull} =
  Pick<
    ${defines.className}<${tsAllTypes}>,
    "getSizeOfSet" | "has" | "hasSets" | "isValidKey" | "valuesSet"
  > &
  {
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
`;
}

export default preprocess;
