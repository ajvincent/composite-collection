/**
 * @callback JSDocCallback
 * @param {string} methodName  The name of the method or callback.
 * @param {string} description The method description.
 */

/**
 *
 * @param {Map} defines
 * @param {JSDocGenerator} docs
 * @returns
 */
export default function preprocess(defines, docs) {
  let invokeValidate = "";
  if (defines.has("invokeValidate")) {
    invokeValidate = `\n    this.__validateArguments__(${defines.get("validateArguments")});\n`;
  }

  return `import KeyHasher from "./KeyHasher.mjs";

export default class ${defines.get("className")} {
  constructor() {
${docs.buildBlock("rootContainerSet", 4)}
    this.__root__ = new Map;

    /**
     * @type {KeyHasher}
     * @private
     * @readonly
     */
    this.__hasher__ = new KeyHasher(${defines.get("argNameList")});
  }

${docs.buildBlock("getSize", 2)}
  get size() {
    return this.__root__.size;
  }

${docs.buildBlock("add", 4)}
  add(${defines.get("argList")}) {${
    invokeValidate
  }${
    defines.get("validateValue")
  }
    const hash = this.__hasher__.buildHash([${defines.get("argList")}]);
    this.__root__.set(hash, Object.freeze([${defines.get("argList")}]));
    return this;
  }

${docs.buildBlock("clear", 4)}
  clear() {
    this.__root__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("argList")}) {
    const hash = this.__hasher__.buildHash([${defines.get("argList")}]);
    return this.__root__.delete(hash);
  }

${docs.buildBlock("forEachSet", 2)}
  forEach(__callback__, __thisArg__) {
    this.__root__.forEach(valueSet => {
      __callback__.apply(__thisArg__, valueSet.concat(this));
    });
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("has", 2)}
  has(${defines.get("argList")}) {
    const hash = this.__hasher__.buildHash([${defines.get("argList")}]);
    return this.__root__.has(hash);
  }

${docs.buildBlock("values", 2)}
  values() {
    return this.__root__.values();
  }
}

${
  defines.has("validateArguments") ?
    docs.buildBlock("validateArguments", 2) + "\n" + defines.get("validateArguments") + "\n\n" :
    ""
}${defines.get("className")}[Symbol.iterator] = function() {
  return this.values();
}

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`;
}
