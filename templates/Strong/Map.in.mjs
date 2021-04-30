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
${docs.buildBlock("rootContainerMap", 4)}
    this.__root__ = new Map;

${docs.buildBlock("valueAndKeySet", 4)}

    /**
     * @type {KeyHasher}
     * @private
     * @const
     */
    this.__hasher__ = new KeyHasher(${defines.get("argNameList")});

    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.set(...entry);
      }
    }
  }

${docs.buildBlock("getSize", 2)}
  get size() {
    return this.__root__.size;
  }

${docs.buildBlock("clear", 2)}
  clear() {
    this.__root__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("argList")}) {${invokeValidate}
    const hash = this.__hasher__.buildHash([${defines.get("argList")}]);
    return this.__root__.delete(hash);
  }

${docs.buildBlock("entries", 2)}
  entries() {
    return this.__wrapIterator__(
      valueAndKeySet => valueAndKeySet.keySet.concat(valueAndKeySet.value)
    );
  }

${docs.buildBlock("forEachMap", 2)}
  forEach(callback, thisArg) {
    this.__root__.forEach((valueAndKeySet) => {
      const args = valueAndKeySet.keySet.concat(this);
      args.unshift(valueAndKeySet.value);
      callback.apply(thisArg, [...args]);
    });
  }

${docs.buildBlock("forEachCallbackMap", 2)}

${docs.buildBlock("get", 2)}
  get(${defines.get("argList")}) {${invokeValidate}
    const hash = this.__hasher__.buildHash([${defines.get("argList")}]);
    const valueAndKeySet = this.__root__.get(hash);
    return valueAndKeySet ? valueAndKeySet.value : valueAndKeySet;
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("argList")}) {${invokeValidate}
    const hash = this.__hasher__.buildHash([${defines.get("argList")}]);
    return this.__root__.has(hash);
  }

${defines.has("validateArguments") ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("argList")}) {
    return this.__isValidKey__(${defines.get("argList")});
  }

` : ``}${docs.buildBlock("keys", 2)}
  keys() {
    return this.__wrapIterator__(
      valueAndKeySet => valueAndKeySet.keySet.slice()
    );
  }

${docs.buildBlock("set", 2)}
  set(${defines.get("argList")}, value) {${
    invokeValidate
  }${
    defines.get("validateValue")
  }
    const hash = this.__hasher__.buildHash([${defines.get("argList")}]);
    const keySet = [${defines.get("argList")}];
    Object.freeze(keySet);
    this.__root__.set(hash, {value, keySet});

    return this;
  }

${docs.buildBlock("values", 2)}
  values() {
    return this.__wrapIterator__(
      valueAndKeySet => valueAndKeySet.value
    );
  }

${defines.has("validateArguments") ? `
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

` : ``}${docs.buildBlock("wrapIteratorMap", 2)}
  __wrapIterator__(unpacker) {
    const rootIter = this.__root__.values();
    return {
      next() {
        const {value, done} = rootIter.next();
        return {
          value: done ? undefined : unpacker(value),
          done
        };
      }
    }
  }
}

${defines.get("className")}[Symbol.iterator] = function() {
  return this.entries();
}

Reflect.defineProperty(${defines.get("className")}, Symbol.toStringTag, {
  value: "${defines.get("className")}",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`}
