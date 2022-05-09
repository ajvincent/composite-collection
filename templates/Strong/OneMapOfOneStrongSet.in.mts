import type { ReadonlyDefines, JSDocGenerator, TemplateFunction } from "../sharedTypes.mjs";
import TypeScriptDefines from "../../source/typescript-migration/TypeScriptDefines.mjs";

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

class ${defines.className}${defines.tsGenericFull}
{
  /** @type {Map<${defines.mapArgument0Type}, Set<${defines.setArgument0Type}>>} @constant */
  #outerMap: Map<${tsMapTypes}, Set<${tsSetTypes}>> = new Map();

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
    if (!this.#outerMap.has(${mapKeys}))
      this.#outerMap.set(${mapKeys}, new Set);

    const __innerSet__ = this.#outerMap.get(${mapKeys});
    if (!__innerSet__)
      throw new Error("assertion failure: unreachable");

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

    if (!this.#outerMap.has(${mapKeys}))
      this.#outerMap.set(${mapKeys}, new Set);

    const __innerSet__ = this.#outerMap.get(${mapKeys});
    if (!__innerSet__)
      throw new Error("assertion failure: unreachable");

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

${docs.buildBlock("clearSets", 2)}
  clearSets(${tsMapKeys}) : void
  {
    ${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${mapKeys})
    if (!__innerSet__)
      return;

    this.#sizeOfAll -= __innerSet__.size;
    __innerSet__.clear();
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

${docs.buildBlock("forEachSet", 2)}
  forEach(
    __callback__: (
      ${tsMapKeys},
      ${tsSetKeys},
      __collection__: ${defines.className}<${tsAllTypes}>
    ) => void,
    __thisArg__: unknown
  ) : void
  {
    this.#outerMap.forEach(
      (__innerSet__, ${mapKeys}) => __innerSet__.forEach(
        ${setKeys} => __callback__.apply(__thisArg__, [${allKeys}, this])
      )
    );
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(
    ${tsMapKeys},
    __callback__: (
      ${tsMapKeys},
      ${tsSetKeys},
      __collection__: ${defines.className}<${tsAllTypes}>
    ) => void,
    __thisArg__: unknown
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

${docs.buildBlock("forEachCallbackSet", 2)}

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
  * values() : Iterator<[${tsAllTypes}]>
  {
    const __outerIter__ = this.#outerMap.entries();

    for (let [${mapKeys}, __innerSet__] of __outerIter__) {
      for (let ${setKeys} of __innerSet__.values())
        yield [${allKeys}];
    }
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${tsMapKeys}) : Iterator<[${tsAllTypes}]>
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

  [Symbol.iterator]() : Iterator<[${tsAllTypes}]>
  {
    return this.values();
  }

  [Symbol.toStringTag] = "${defines.className}";
}


Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`}

export default preprocess;
TypeScriptDefines.registerGenerator(preprocess, true);
