/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    return `
${defines.importLines}
import WeakKeyComposer from "./keys/Composite.mjs";
declare abstract class WeakKey {}

class ${defines.className}${defines.tsGenericFull}
{
  // eslint-disable-next-line jsdoc/require-property
  /** @typedef {object} WeakKey */

  /** @type {WeakKeyComposer} @constant */
  #keyComposer = new WeakKeyComposer(${JSON.stringify(defines.weakMapKeys)}, ${JSON.stringify(defines.strongMapKeys)});

${docs.buildBlock("rootContainerWeakMap", 2)}
  #root: WeakMap<WeakKey, __V__> = new WeakMap;

  constructor(iterable?: [${defines.tsMapTypes.join(", ")}, ${defines.tsValueType}][])
  {
    if (iterable) {
      for (const [${defines.argList}, value] of iterable) {
        this.set(${defines.argList}, value);
      }
    }
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.tsMapKeys.join(", ")}) : boolean
  {
    this.#requireValidKey(${defines.argList});
    const __key__ = this.#keyComposer.getKeyIfExists([${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]);
    if (!__key__)
      return false;

    this.#keyComposer.deleteKey([${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]);
    return this.#root.delete(__key__);
  }

${docs.buildBlock("get", 2)}
  get(${defines.tsMapKeys.join(", ")}) : __V__ | undefined
  {
    this.#requireValidKey(${defines.argList});
    const __key__ = this.#keyComposer.getKeyIfExists([${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]);
    return __key__ ? this.#root.get(__key__) : undefined;
  }

${docs.buildBlock("getDefaultCallback", 2)}

${docs.buildBlock("getDefault", 2)}
  getDefault(${defines.tsMapKeys.join(", ")}, __default__: () => __V__) : __V__
  {
    this.#requireValidKey(${defines.argList});
    const __key__ = this.#keyComposer.getKey([${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]);

    if (this.#root.has(__key__))
      return this.#root.get(__key__) as __V__;

    const value = __default__();
    this.#root.set(__key__, value);

    return value;
  }

${docs.buildBlock("has", 2)}
  has(${defines.tsMapKeys.join(", ")}) : boolean
  {
    this.#requireValidKey(${defines.argList});

    const __key__ = this.#keyComposer.getKeyIfExists([${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]);
    return __key__ ? this.#root.has(__key__) : false;
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.tsMapKeys.join(", ")}) : boolean
  {
    return this.#isValidKey(${defines.argList});
  }

${defines.validateValue ? `
${docs.buildBlock("isValidValuePublic", 2)}
  isValidValue(value: __V__) : boolean
  {
    return this.#isValidValue(value);
  }
  ` : ``}

${docs.buildBlock("set", 2)}
  set(${defines.tsMapKeys.join(", ")}, value: __V__) : this
  {
    this.#requireValidKey(${defines.argList});
    ${defines.validateValue ? `
      if (!this.#isValidValue(value))
        throw new Error("The value is not valid!");
    ` : ``}

    const __key__ = this.#keyComposer.getKey([${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]);
    this.#root.set(__key__, value);
    return this;
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.tsMapKeys.join(", ")}) : void
  {
    if (!this.#isValidKey(${defines.argList}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.tsMapKeys.join(", ")}) : boolean
  {
    if (!this.#keyComposer.isValidForKey([${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]))
      return false;

${defines.validateArguments || ""}
    return true;
  }

${defines.validateValue ? `
${docs.buildBlock("isValidValuePrivate", 2)}
  #isValidValue(value: __V__) : boolean
  {
    ${defines.validateValue}
    return true;
  }
  ` : ``}

  [Symbol.toStringTag] = "${defines.className}";
}

Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);

export type Readonly${defines.className}${defines.tsGenericFull}
= Pick<
  ${defines.className}<${defines.tsMapTypes.join(", ")}, ${defines.tsValueType}>,
  "get" | "has" | "isValidKey"${defines.validateValue ? ` | "isValidValue"` : ``}
>;
`;
};
export default preprocess;
//# sourceMappingURL=Map.in.mjs.map