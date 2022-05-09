import type { ReadonlyDefines, JSDocGenerator, TemplateFunction } from "../sharedTypes.mjs";
import TypeScriptDefines from "../../source/typescript-migration/TypeScriptDefines.mjs";

/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess: TemplateFunction = function preprocess(defines: ReadonlyDefines, docs: JSDocGenerator) {
  let invokeValidate = "";
  if (defines.invokeValidate) {
    invokeValidate = `\n    this.#requireValidKey(${defines.argList});\n`;
  }

  return `
${defines.importLines}
import KeyHasher from "./keys/Hasher.mjs";

${docs.buildBlock("valueAndKeySet", 0)}
type __${defines.className}_valueAndKeySet__${defines.tsGenericFull} = {
  value: ${defines.tsValueType},
  keySet: [${defines.tsMapTypes.join(", ")}]
};

class ${defines.className}${defines.tsGenericFull} {
${docs.buildBlock("rootContainerMap", 2)}
  #root: Map<string, __${defines.className}_valueAndKeySet__<${
    defines.tsMapTypes.join(", ") + ", " + defines.tsValueType
  }>> = new Map;

  /**
   * @type {KeyHasher}
   * @constant
   */
  #hasher: KeyHasher = new KeyHasher();

  constructor(
    iterable?: [${defines.tsMapTypes}, ${defines.tsValueType}][]
  )
  {
    if (iterable) {
      for (const [${defines.argList}, value] of iterable) {
        this.set(${defines.argList}, value);
      }
    }
  }

${docs.buildBlock("getSize", 2)}
  get size() : number {
    return this.#root.size;
  }

${docs.buildBlock("clear", 2)}
  clear() : void {
    this.#root.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.tsMapKeys}) : boolean {
    ${invokeValidate}
    const __hash__ = this.#hasher.getHashIfExists(${defines.argList});
    return __hash__ ? this.#root.delete(__hash__) : false;
  }

${docs.buildBlock("entries", 2)}
  * entries() : Iterator<[${defines.tsMapTypes.join(", ")}, ${defines.tsValueType}]> {
    for (let valueAndKeySet of this.#root.values()) {
      yield [
        ...valueAndKeySet.keySet,
        valueAndKeySet.value
      ];
    }
  }

${docs.buildBlock("forEachCallbackMap", 2)}

${docs.buildBlock("forEachMap", 2)}
  forEach(
    __callback__: (
      ${defines.tsValueKey},
      ${defines.tsMapKeys.join(",\n      ")},
      __collection__: ${defines.className}<${
        defines.tsMapTypes.join(", ")
      }, ${
        defines.tsValueType
      }>
    ) => void,
    __thisArg__: unknown
  ) : void
  {
    this.#root.forEach((__valueAndKeySet__) => {
      const __args__: [${
        defines.tsValueType
      }, ${
        defines.tsMapTypes.join(", ")
      }, this] = [
        __valueAndKeySet__.value,
        ...__valueAndKeySet__.keySet,
        this
      ];
      __callback__.apply(__thisArg__, __args__);
    });
  }

${docs.buildBlock("get", 2)}
  get(${defines.tsMapKeys.join(", ")}) : __V__ | undefined {
    ${invokeValidate}
    const __hash__ = this.#hasher.getHashIfExists(${defines.argList});
    if (!__hash__)
      return undefined;

    const valueAndKeySet = this.#root.get(__hash__);
    return valueAndKeySet?.value;
  }

${docs.buildBlock("has", 2)}
  has(${defines.tsMapKeys.join(", ")}) : boolean {
    ${invokeValidate}
    const __hash__ = this.#hasher.getHashIfExists(${defines.argList});
    return __hash__ ? this.#root.has(__hash__) : false;
  }

${defines.validateArguments ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.tsMapKeys.join(", ")}) : boolean {
    return this.#isValidKey(${defines.argList});
  }

${
  defines.validateValue ? `
${docs.buildBlock("isValidValuePublic", 2)}
  isValidValue(value: __V__) : boolean {
    return this.#isValidValue(value);
  }
  ` : ``
  }

` : ``}

${docs.buildBlock("keys", 2)}
  * keys() : Iterator<[${defines.tsMapTypes.join(", ")}]> {
    for (let valueAndKeySet of this.#root.values()) {
      const [${defines.mapKeys.join(", ")}] : [${defines.tsMapTypes.join(", ")}] = valueAndKeySet.keySet;
      yield [${defines.mapKeys.join(", ")}];
    }
  }

${docs.buildBlock("set", 2)}
  set(${defines.tsMapKeys}, ${defines.tsValueKey}) : this {${
    invokeValidate
  }
${
  defines.validateValue ? `
  if (!this.#isValidValue(value))
    throw new Error("The value is not valid!");
` : ``
}
    const __hash__ = this.#hasher.getHash(${defines.argList});
    const __keySet__: [${defines.tsMapTypes.join(", ")}] = [${defines.argList}];
    Object.freeze(__keySet__);
    this.#root.set(__hash__, {value, keySet: __keySet__});

    return this;
  }

${docs.buildBlock("values", 2)}
  * values() : Iterator<${defines.tsValueType}> {
    for (let valueAndKeySet of this.#root.values())
      yield valueAndKeySet.value;
  }
${defines.validateArguments ? `
${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.tsMapKeys}) : void {
    if (!this.#isValidKey(${defines.argList}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.tsMapKeys}) : boolean {
${defines.validateArguments}
    return true;
  }
` : ``}
${defines.validateValue ? `
${docs.buildBlock("isValidValuePrivate", 2)}
  #isValidValue(${defines.tsValueKey}) : boolean {
    ${defines.validateValue}
    return true;
  }
  ` : ``}

  [Symbol.iterator]() : Iterator<[${defines.tsMapTypes.join(", ")}, ${defines.tsValueType}]> {
    return this.entries();
  }

  [Symbol.toStringTag] = "${defines.className}";
}

Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`}

export default preprocess;
TypeScriptDefines.registerGenerator(preprocess, true);
