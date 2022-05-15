import type { ReadonlyDefines, JSDocGenerator, TemplateFunction } from "../sharedTypes.mjs";
import TypeScriptDefines from "../../source/typescript-migration/TypeScriptDefines.mjs";

/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess: TemplateFunction = function preprocess(defines: ReadonlyDefines, docs: JSDocGenerator) {
  return `
${defines.importLines}
import WeakKeyComposer from "./keys/Composite.mjs";

class ${defines.className}${defines.tsGenericFull}
{
  // eslint-disable-next-line jsdoc/require-property
  /** @typedef {object} WeakKey */

  /** @type {WeakKeyComposer} @constant */
  #keyComposer = new WeakKeyComposer(${
    JSON.stringify(defines.weakSetElements)
  }, ${
    JSON.stringify(defines.strongSetElements)
  });

  /** @type {WeakSet<WeakKey>} @constant */
  #weakKeySet = new WeakSet;

  constructor(iterable? : [${defines.tsSetTypes}][]) {
    if (iterable) {
      for (let [${defines.argList}] of iterable) {
        this.add(${defines.argList});
      }
    }
  }

${docs.buildBlock("add", 2)}
  add(${defines.tsSetKeys.join(", ")}) : this
  {
    this.#requireValidKey(${defines.argList});

    const __key__ = this.#keyComposer.getKey([${
      defines.weakSetElements.join(", ")
    }], [${
      defines.strongSetElements.join(", ")
    }]);
    if (!__key__)
      return null;

    this.#weakKeySet.add(__key__);
    return this;
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.tsSetKeys.join(", ")}) : boolean
  {
    this.#requireValidKey(${defines.argList});

    const __key__ = this.#keyComposer.getKeyIfExists([${
      defines.weakSetElements.join(", ")
    }], [${
      defines.strongSetElements.join(", ")
    }]);
    if (!__key__)
      return false;

    const __returnValue__ = this.#weakKeySet.delete(__key__);
    this.#keyComposer.deleteKey([${
      defines.weakSetElements.join(", ")
    }], [${
      defines.strongSetElements.join(", ")
    }]);
    return __returnValue__;
  }

${docs.buildBlock("has", 2)}
  has(${defines.tsSetKeys.join(", ")}) : boolean
  {
    this.#requireValidKey(${defines.argList});

    const __key__ = this.#keyComposer.getKeyIfExists([${
      defines.weakSetElements.join(", ")
    }], [${
      defines.strongSetElements.join(", ")
    }]);

    return __key__ ? this.#weakKeySet.has(__key__) : false;
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.tsSetKeys.join(", ")}) : boolean
  {
    return this.#isValidKey(${defines.argList});
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.tsSetKeys.join(", ")}) : void
  {
    if (!this.#isValidKey(${defines.argList}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.tsSetKeys.join(", ")}) : boolean
  {
    if (!this.#keyComposer.isValidForKey([${
      defines.weakSetElements.join(", ")
    }], [${
      defines.strongSetElements.join(", ")
    }]))
      return false;
${defines.validateArguments || ""}
    return true;
  }

  [Symbol.toStringTag] = "${defines.className}";
}

Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`;
}

export default preprocess;
TypeScriptDefines.registerGenerator(preprocess, true);
