import type { ReadonlyDefines, JSDocGenerator, TemplateFunction } from "../sharedTypes.mjs";
import TypeScriptDefines from "../../source/typescript-migration/TypeScriptDefines.mjs"

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
type __${defines.className}_valueSet__${defines.tsGenericFull} = [
  ${defines.tsSetTypes.join(",\n  ")}
];

class ${defines.className}${defines.tsGenericFull}
{
  /** @typedef {string} hash */

${docs.buildBlock("rootContainerSet", 2)}
  #root: Map<string, __${defines.className}_valueSet__<${
    defines.tsSetTypes.join(", ")
  }>> = new Map;

  /** @type {KeyHasher} @constant */
  #hasher: KeyHasher = new KeyHasher();

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let [${defines.argList}] of iterable) {
        this.add(${defines.argList});
      }
    }
  }

${docs.buildBlock("getSize", 2)}
  get size() : number {
    return this.#root.size;
  }

${docs.buildBlock("add", 2)}
  add(${defines.tsSetKeys.join(", ")}) : this
  {
    ${invokeValidate}
    const __hash__ = this.#hasher.getHash(${defines.argList});
    this.#root.set(__hash__, [${defines.argList}]);
    return this;
  }

${docs.buildBlock("clear", 2)}
  clear() : void {
    this.#root.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.tsSetKeys.join(", ")}) : boolean
  {
    const __hash__ = this.#hasher.getHashIfExists(${defines.argList});
    return __hash__ ? this.#root.delete(__hash__) : false;
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("forEachSet", 2)}
  forEach(
    __callback__: (
      ${defines.tsSetKeys.join(",\n      ")},
      __collection__: ${defines.className}<${
        defines.tsSetTypes.join(", ")
      }>
    ) => void,
    __thisArg__: unknown
  ) : void
  {
    this.#root.forEach(valueSet => {
      const __args__: [${
        defines.tsSetTypes.join(", ")
      }, this] = [
        ...valueSet,
        this
      ];
      __callback__.apply(__thisArg__, __args__);
    });
  }

${docs.buildBlock("has", 2)}
  has(${defines.tsSetKeys.join(", ")}) : boolean {
    const __hash__ = this.#hasher.getHashIfExists(${defines.argList});
    return __hash__ ? this.#root.has(__hash__) : false;
  }

${defines.validateArguments ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.tsSetKeys.join(", ")}) : boolean {
    return this.#isValidKey(${defines.argList});
  }
` : ``}

${docs.buildBlock("values", 2)}
  * values() : Iterator<[${defines.tsSetKeys.join(", ")}]>
  {
    for (let __value__ of this.#root.values()) {
      yield __value__;
    }
  }

${defines.invokeValidate ?
  `
${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.tsSetKeys.join(", ")}) : void {
    if (!this.#isValidKey(${defines.argList}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.tsSetKeys.join(", ")}) : boolean
  {
${defines.validateArguments}
    return true;
  }
` : ``}

  [Symbol.iterator]() : Iterator<[${defines.tsSetTypes.join(", ")}]> {
    return this.values();
  }

  [Symbol.toStringTag] = "${defines.className}";
}

Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`;
}

export default preprocess;
TypeScriptDefines.registerGenerator(preprocess, true);
