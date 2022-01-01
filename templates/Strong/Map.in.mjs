/**
 * @param {Map} defines
 * @param {JSDocGenerator} docs
 * @returns {string}
 */
export default function preprocess(defines, docs) {
  let invokeValidate = "";
  if (defines.has("invokeValidate")) {
    invokeValidate = `\n    this.#requireValidKey(${defines.get("argList")});\n`;
  }

  return `
${defines.get("importLines")}

export default class ${defines.get("className")} {
  ${docs.buildBlock("valueAndKeySet", 4)}

  ${docs.buildBlock("rootContainerMap", 4)}
  #root = new Map;

  /**
   * @type {KeyHasher}
   * @constant
   */
  #hasher = new KeyHasher(${defines.get("argNameList")});

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.set(...entry);
      }
    }
  }

${docs.buildBlock("getSize", 2)}
  get size() {
    return this.#root.size;
  }

${docs.buildBlock("clear", 2)}
  clear() {
    this.#root.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("argList")}) {${invokeValidate}
    if (!this.#hasher.hasHash(${defines.get("argList")}))
      return false;

    const hash = this.#hasher.getHash(${defines.get("argList")});
    return this.#root.delete(hash);
  }

${docs.buildBlock("entries", 2)}
  entries() {
    return this.#wrapIterator(
      valueAndKeySet => valueAndKeySet.keySet.concat(valueAndKeySet.value)
    );
  }

${docs.buildBlock("forEachMap", 2)}
  forEach(callback, thisArg) {
    this.#root.forEach((valueAndKeySet) => {
      const args = valueAndKeySet.keySet.concat(this);
      args.unshift(valueAndKeySet.value);
      callback.apply(thisArg, [...args]);
    });
  }

${docs.buildBlock("forEachCallbackMap", 2)}

${docs.buildBlock("get", 2)}
  get(${defines.get("argList")}) {${invokeValidate}
    if (!this.#hasher.hasHash(${defines.get("argList")}))
      return undefined;

    const hash = this.#hasher.getHash(${defines.get("argList")});
    const valueAndKeySet = this.#root.get(hash);
    return valueAndKeySet?.value;
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("argList")}) {${invokeValidate}
    if (!this.#hasher.hasHash(${defines.get("argList")}))
      return false;

    const hash = this.#hasher.getHash(${defines.get("argList")});
    return this.#root.has(hash);
  }

${defines.has("validateArguments") ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("argList")}) {
    return this.#isValidKey(${defines.get("argList")});
  }

${
  defines.has("validateValue") ? `
${docs.buildBlock("isValidValuePublic", 2)}
  isValidValue(value) {
    return this.#isValidValue(value);
  }
  ` : ``
  }

` : ``}

${docs.buildBlock("keys", 2)}
  keys() {
    return this.#wrapIterator(
      valueAndKeySet => valueAndKeySet.keySet.slice()
    );
  }

${docs.buildBlock("set", 2)}
  set(${defines.get("argList")}, value) {${
    invokeValidate
  }
${
  defines.has("validateValue") ? `
  if (!this.#isValidValue(value))
    throw new Error("The value is not valid!");
` : ``
}
    const hash = this.#hasher.getHash(${defines.get("argList")});
    const keySet = [${defines.get("argList")}];
    Object.freeze(keySet);
    this.#root.set(hash, {value, keySet});

    return this;
  }

${docs.buildBlock("values", 2)}
  values() {
    return this.#wrapIterator(
      valueAndKeySet => valueAndKeySet.value
    );
  }
${defines.has("validateArguments") ? `
${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.get("argList")}) {
    if (!this.#isValidKey(${defines.get("argList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.get("argList")}) {
${defines.get("validateArguments")}
    return true;
  }
` : ``}
${defines.has("validateValue") ? `
${docs.buildBlock("isValidValuePrivate", 2)}
  #isValidValue(value) {
    ${defines.get("validateValue")}
    return true;
  }
  ` : ``}
${docs.buildBlock("wrapIteratorMap", 2)}
  #wrapIterator(unpacker) {
    const rootIter = this.#root.values();
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
