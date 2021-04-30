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
    invokeValidate = `\n    this.__requireValidKey__(${defines.get("argList")});\n`;
  }

  return `import KeyHasher from "./KeyHasher.mjs";
${defines.get("importLines")}

export default class ${defines.get("className")} {
  constructor() {
${docs.buildBlock("rootContainerSet", 4)}
    this.__root__ = new Map;

    /**
     * @type {KeyHasher}
     * @private
     * @const
     */
    this.__hasher__ = new KeyHasher(${defines.get("argNameList")});

    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.add(...entry);
      }
    }
  }

${docs.buildBlock("getSize", 2)}
  get size() {
    return this.__root__.size;
  }

${docs.buildBlock("add", 2)}
  add(${defines.get("argList")}) {${
    invokeValidate
  }${
    defines.get("validateValue")
  }
    const hash = this.__hasher__.buildHash([${defines.get("argList")}]);
    this.__root__.set(hash, Object.freeze([${defines.get("argList")}]));
    return this;
  }

${docs.buildBlock("clear", 2)}
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
${defines.has("invokeValidate") ?
`
${docs.buildBlock("requireValidKey", 2)}
  __requireValidKey__(${defines.get("argList")}) {
    if (!this.__isValidKey__(${defines.get("argList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  __isValidKey__(${defines.get("argList")}) {
${defines.get("validateArguments")}
    return true;
  }

` : ``}
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

${defines.get("className")}[Symbol.iterator] = function() {
  return this.values();
}

Reflect.defineProperty(${defines.get("className")}, Symbol.toStringTag, {
  value: "${defines.get("className")}",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`;
}
