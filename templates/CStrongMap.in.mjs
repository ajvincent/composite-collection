/**
 * @callback JSDocCallback
 * @param {string} methodName  The name of the method or callback.
 * @param {string} description The method description.
 */

/**
 *
 * @param {Map} defines
 * @param {JSDocCallback} docs
 * @returns
 */
export default function preprocess(defines, docs) {
  void(docs);

  let invokeValidate = "";
  if (defines.has("invokeValidate")) {
    invokeValidate = `\n    this.__validateArguments__(${defines.get("validateArguments")});\n`;
  }

  return `import KeyHasher from "composite-collection/KeyHasher";

/**
 * @typedef ${defines.get("className")}~valueAndKeySet
 * @property {void}   value  The actual value we store.
 * @property {void[]} keySet The set of keys we hashed.
 * @private
 */

export default class ${defines.get("className")} {
  constructor() {
    /**
     * @type {Map<string, ${defines.get("className")}~valueAndKeySet>}
     * @private
     * @readonly
     */
    this.__root__ = new Map;

    /**
     * @type {KeyHasher}
     */
    this.__hasher__ = new KeyHasher(${defines.get("argNameList")});
  }

  /**
   * The number of elements in this map.
   * @type {number}
   * @public
   */
  get size() {
    return this.__root__.size;
  }

  /**
   * Clear the map.
   * @public
   */
  clear() {
    this.__root__.clear();
  }

  /**
   * Delete an element from the map by the given key sequence.
   * __argDescriptions__
   * __valueDescription__
   *
   * @returns {boolean} True if the item was found and deleted.
   * @public
   */
  delete(${defines.get("argList")}) {${invokeValidate}
    const hash = this.__hasher__.buildHash([${defines.get("argList")}]);
    return this.__root__.delete(hash);
  }

  /**
   * Return a new iterator for the key-value pairs of the map.
   *
   * @returns {Iterator<${defines.get("argList")}, value>}
   * @public
   */
  entries() {
    return this.__wrapIterator__(
      valueAndKeySet => valueAndKeySet.keySet.concat(valueAndKeySet.value)
    );
  }

  /**
   * Iterate over the keys and values.
   *
   * @param {${defines.get("className")}~ForEachCallback} callback A function to invoke for each key set.
   *
   * @public
   */
  forEach(callback) {
    this.__root__.forEach((valueAndKeySet, key, root) => {
      const args = valueAndKeySet.keySet.concat(this);
      args.unshift(valueAndKeySet.value);
      callback(...args);
    });
  }

  /**
   * @callback ${defines.get("className")}~ForEachCallback
   * __argDescriptions__
   * __valueDescription__
   * @param {${defines.get("className")}} The map.
   */

  /**
   * Get a value for a key set.
   *
   * __argDescriptions__
   *
   * @returns {__valueType__?}
   * @public
   */
  get(${defines.get("argList")}) {${invokeValidate}
    const hash = this.__hasher__.buildHash([${defines.get("argList")}]);
    const valueAndKeySet = this.__root__.get(hash);
    return valueAndKeySet ? valueAndKeySet.value : valueAndKeySet;
  }

  /**
   * Report if the map has a value for a key set.
   *
   * __argDescriptions__
   *
   * @returns {boolean} True if the key set refers to a value.
   * @public
   */
  has(${defines.get("argList")}) {${invokeValidate}
    const hash = this.__hasher__.buildHash([${defines.get("argList")}]);
    return this.__root__.has(hash);
  }

  /**
   * Return a new iterator for the key sets of the map.
   *
   * @returns {Iterator<${defines.get("argList")}>}
   * @public
   */
  keys() {
    return this.__wrapIterator__(
      valueAndKeySet => valueAndKeySet.keySet.slice()
    );
  }

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

  /**
   * Return a new iterator for the value of the map.
   *
   * @returns {Iterator<value>}
   * @public
   */
  values() {
    return this.__wrapIterator__(
      valueAndKeySet => valueAndKeySet.value
    );
  }

  /**
   * Bootstrap from the native Map's values() iterator to the kind of iterator we want.
   * @param {function} unpacker The transforming function for values.
   *
   * @returns {Iterator}
   * @private
   */
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
${
  defines.has("validateArguments") ? defines.get("validateArguments") : ""
}}

${defines.get("className")}[Symbol.iterator] = function() {
  return this.entries();
}

Reflect.defineProperty(${defines.get("className")}, Symbol.toStringTag, {
  value: "${defines.get("className")}",
  writable: false,
  enumerable: false,
  configurable: true
});
`};
