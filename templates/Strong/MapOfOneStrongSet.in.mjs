/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    let invokeValidate = "", invokeMapValidate = "";
    if (defines.invokeValidate) {
        invokeValidate = `\n    this.#requireValidKey(${defines.argList});\n`;
    }
    if (defines.validateMapArguments) {
        invokeMapValidate = `\n    this.#requireValidMapKey(${defines.mapKeys.join(", ")});\n`;
    }
    return `
${defines.importLines}
import KeyHasher from "./keys/Hasher.mjs";

class ${defines.className} {
  /** @typedef {string} hash */

  /** @type {Map<hash, Map<${defines.setArgument0Type}, *[]>>} @constant */
  #outerMap = new Map();

  /** @type {KeyHasher} @constant */
  #mapHasher = new KeyHasher();

  /** @type {number} */
  #sizeOfAll = 0;

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.add(...entry);
      }
    }
  }

${docs.buildBlock("getSize", 2)}
  get size() {
    return this.#sizeOfAll;
  }

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${defines.mapKeys.join(", ")}) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.mapKeys.join(", ")});
    return __innerMap__ ? __innerMap__.size : 0;
  }

${docs.buildBlock("mapSize", 2)}
  get mapSize() {
    return this.#outerMap.size;
  }

${docs.buildBlock("add", 2)}
  add(${defines.mapKeys.join(", ")}, ${defines.setKeys[0]}) {${invokeValidate}
    const __mapHash__ = this.#mapHasher.getHash(${defines.mapKeys.join(", ")});
    if (!this.#outerMap.has(__mapHash__))
      this.#outerMap.set(__mapHash__, new Map);

    const __innerMap__ = this.#outerMap.get(__mapHash__);

    if (!__innerMap__.has(${defines.setKeys[0]})) {
      __innerMap__.set(${defines.setKeys[0]}, Object.freeze([${defines.argList}]));
      this.#sizeOfAll++;
    }

    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.mapKeys.join(", ")}, __sets__) {${invokeMapValidate}
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.setKeys.length}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.setKeys.length} argument${defines.setKeys.length > 1 ? "s" : ""}!\`);
      }
      ${defines.invokeValidate ? `this.#requireValidKey(${defines.mapKeys.join(", ")}, ...__set__);` : ""}

      return __set__;
    });

    const __mapHash__ = this.#mapHasher.getHash(${defines.mapKeys.join(", ")});
    if (!this.#outerMap.has(__mapHash__))
      this.#outerMap.set(__mapHash__, new Map);

    const __innerMap__ = this.#outerMap.get(__mapHash__);
    const __mapArgs__ = [${defines.mapKeys.join(", ")}];

    __array__.forEach(__set__ => {
      if (!__innerMap__.has(__set__[0])) {
        __innerMap__.set(__set__[0], Object.freeze(__mapArgs__.concat(__set__)));
        this.#sizeOfAll++;
      }
    });

    return this;
  }

${docs.buildBlock("clear", 2)}
  clear() {
    this.#outerMap.clear();
    this.#sizeOfAll = 0;
  }

${docs.buildBlock("clearSets", 2)}
  clearSets(${defines.mapKeys.join(", ")}) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.mapKeys.join(", ")});
    if (!__innerMap__)
      return;

    this.#sizeOfAll -= __innerMap__.size;
    __innerMap__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.mapKeys.join(", ")}, ${defines.setKeys}) {${invokeValidate}
    const [__innerMap__, __mapHash__] = this.#getInnerMap(${defines.mapKeys.join(", ")});
    if (!__innerMap__)
      return false;

    if (!__innerMap__.has(${defines.setKeys[0]}))
      return false;

    __innerMap__.delete(${defines.setKeys[0]});
    this.#sizeOfAll--;

    if (__innerMap__.size === 0) {
      this.#outerMap.delete(__mapHash__);
    }

    return true;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.mapKeys.join(", ")}) {${invokeMapValidate}
    const [__innerMap__, __mapHash__] = this.#getInnerMap(${defines.mapKeys.join(", ")});
    if (!__innerMap__)
      return false;

    this.#outerMap.delete(__mapHash__);
    this.#sizeOfAll -= __innerMap__.size;
    return true;
  }

${docs.buildBlock("forEachSet", 2)}
  forEach(__callback__, __thisArg__) {
    this.#outerMap.forEach(
      __innerMap__ => __innerMap__.forEach(
        __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
      )
    );
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.mapKeys.join(", ")}, __callback__, __thisArg__) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.mapKeys.join(", ")});
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("has", 2)}
  has(${defines.mapKeys.join(", ")}, ${defines.setKeys}) {${invokeValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.mapKeys.join(", ")});
    if (!__innerMap__)
      return false;

    return __innerMap__.has(${defines.setKeys[0]});
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.mapKeys.join(", ")}) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.mapKeys.join(", ")});
    return Boolean(__innerMap__);
  }

${defines.validateArguments ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.argList}) {
    return this.#isValidKey(${defines.argList});
  }

  ` : ``}
${docs.buildBlock("values", 2)}
  * values() {
    const __outerIter__ = this.#outerMap.values();

    for (let __innerMap__ of __outerIter__) {
      for (let __value__ of __innerMap__.values())
        yield __value__;
    }
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${defines.mapKeys.join(", ")}) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.mapKeys.join(", ")});
    if (!__innerMap__)
      return;

    for (let __value__ of __innerMap__.values())
      yield __value__;
  }

  #getInnerMap(...__mapArguments__) {
    const __hash__ = this.#mapHasher.getHashIfExists(...__mapArguments__);
    return __hash__ ? [this.#outerMap.get(__hash__), __hash__] : [null];
  }

${defines.validateArguments ? `
${docs.buildBlock("requireValidKey", 2)}
    #requireValidKey(${defines.argList}) {
      if (!this.#isValidKey(${defines.argList}))
        throw new Error("The ordered key set is not valid!");
    }

${docs.buildBlock("isValidKeyPrivate", 2)}
    #isValidKey(${defines.argList}) {
      void(${defines.argList});

      ${defines.validateArguments}
      return true;
    }

  ` : ``}

${defines.validateMapArguments ? `
${docs.buildBlock("requireValidMapKey", 2)}
  #requireValidMapKey(${defines.mapKeys.join(", ")}) {
    if (!this.#isValidMapKey(${defines.mapKeys.join(", ")}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  #isValidMapKey(${defines.mapKeys.join(", ")}) {
    void(${defines.mapKeys.join(", ")});

    ${defines.validateMapArguments || ""}
    return true;
  }

  ` : ``}

  [Symbol.iterator]() {
    return this.values();
  }

  [Symbol.toStringTag] = "${defines.className}";
}

Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`;
};
export default preprocess;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFwT2ZPbmVTdHJvbmdTZXQuaW4ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTWFwT2ZPbmVTdHJvbmdTZXQuaW4ubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsR0FBcUIsU0FBUyxVQUFVLENBQUMsT0FBd0IsRUFBRSxJQUFvQjtJQUNyRyxJQUFJLGNBQWMsR0FBRyxFQUFFLEVBQUUsaUJBQWlCLEdBQUcsRUFBRSxDQUFDO0lBQ2hELElBQUksT0FBTyxDQUFDLGNBQWMsRUFBRTtRQUMxQixjQUFjLEdBQUcsK0JBQStCLE9BQU8sQ0FBQyxPQUFPLE1BQU0sQ0FBQztLQUN2RTtJQUNELElBQUksT0FBTyxDQUFDLG9CQUFvQixFQUFFO1FBQ2hDLGlCQUFpQixHQUFHLGtDQUFrQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0tBQ3hGO0lBRUQsT0FBTztFQUNQLE9BQU8sQ0FBQyxXQUFXOzs7UUFHYixPQUFPLENBQUMsU0FBUzs7OzZCQUdJLE9BQU8sQ0FBQyxnQkFBZ0I7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQWtCbkQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDOzs7OztFQUs3QixJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7aUJBQ25CLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLGlCQUFpQjsrQ0FDbkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzs7O0VBSXZFLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQzs7Ozs7RUFLN0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ25CLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sY0FBYztrREFDM0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzs7Ozs7NEJBTWhELE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO3lCQUNyQixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsT0FBTyxDQUFDLE9BQU87Ozs7Ozs7RUFPNUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQ25CLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsaUJBQWlCOzs7K0JBR3hDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTTs0RUFDdUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLFlBQ3hGLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNyQzs7UUFFQSxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyx5QkFBeUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFOzs7OztrREFLdkQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzs7OzsyQkFLakQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzs7Ozs7Ozs7Ozs7RUFZbkQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDOzs7Ozs7RUFNM0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2NBQ25CLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLGlCQUFpQjsrQ0FDaEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzs7Ozs7OztFQVF2RSxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7V0FDbkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssT0FBTyxDQUFDLE9BQU8sTUFBTSxjQUFjOzREQUNqQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7NEJBSTFELE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDOzs7MEJBR3BCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDOzs7Ozs7Ozs7O0VBVTFDLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztlQUNuQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxpQkFBaUI7NERBQ0osT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzs7Ozs7Ozs7RUFTcEYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDOzs7Ozs7Ozs7RUFTaEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO2VBQ3RCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsaUJBQWlCOytDQUM1QyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7Ozs7OztFQVN2RSxJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQzs7RUFFeEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ25CLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLE9BQU8sQ0FBQyxPQUFPLE1BQU0sY0FBYzsrQ0FDM0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzs7OzhCQUkzQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzs7O0VBRzlDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNsQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxpQkFBaUI7K0NBQ2QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzs7O0VBSXZFLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7RUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7ZUFDekIsT0FBTyxDQUFDLE9BQU87OEJBQ0EsT0FBTyxDQUFDLE9BQU87OztHQUcxQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ04sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDOzs7Ozs7Ozs7O0VBVTVCLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztnQkFDakIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0saUJBQWlCOytDQUNsQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7Ozs7Ozs7Ozs7RUFhdkUsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztFQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQzt1QkFDaEIsT0FBTyxDQUFDLE9BQU87OEJBQ1IsT0FBTyxDQUFDLE9BQU87Ozs7RUFJM0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7a0JBQ3ZCLE9BQU8sQ0FBQyxPQUFPO2FBQ3BCLE9BQU8sQ0FBQyxPQUFPOztRQUVwQixPQUFPLENBQUMsaUJBQWlCOzs7O0dBSTlCLENBQUMsQ0FBQyxDQUFDLEVBQUU7O0VBRU4sT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztFQUMvQixJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQzt3QkFDbEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOytCQUNuQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7RUFJdkQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7bUJBQ3pCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztXQUNsQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7O01BRS9CLE9BQU8sQ0FBQyxvQkFBb0IsSUFBSSxFQUFFOzs7O0dBSXJDLENBQUMsQ0FBQyxDQUFDLEVBQUU7Ozs7Ozs0QkFNb0IsT0FBTyxDQUFDLFNBQVM7OztnQkFHN0IsT0FBTyxDQUFDLFNBQVM7Z0JBQ2pCLE9BQU8sQ0FBQyxTQUFTO0NBQ2hDLENBQUE7QUFBQSxDQUFDLENBQUE7QUFFRixlQUFlLFVBQVUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUmVhZG9ubHlEZWZpbmVzLCBKU0RvY0dlbmVyYXRvciwgVGVtcGxhdGVGdW5jdGlvbiB9IGZyb20gXCIuLi9zaGFyZWRUeXBlcy5tanNcIjtcblxuLyoqXG4gKiBAcGFyYW0ge01hcH0gICAgICAgICAgICBkZWZpbmVzIFRoZSBwcmVwcm9jZXNzb3IgbWFjcm9zLlxuICogQHBhcmFtIHtKU0RvY0dlbmVyYXRvcn0gZG9jcyAgICBUaGUgcHJpbWFyeSBkb2N1bWVudGF0aW9uIGdlbmVyYXRvci5cbiAqIEByZXR1cm5zIHtzdHJpbmd9ICAgICAgICAgICAgICAgVGhlIGdlbmVyYXRlZCBzb3VyY2UgY29kZS5cbiAqL1xuY29uc3QgcHJlcHJvY2VzczogVGVtcGxhdGVGdW5jdGlvbiA9IGZ1bmN0aW9uIHByZXByb2Nlc3MoZGVmaW5lczogUmVhZG9ubHlEZWZpbmVzLCBkb2NzOiBKU0RvY0dlbmVyYXRvcikge1xuICBsZXQgaW52b2tlVmFsaWRhdGUgPSBcIlwiLCBpbnZva2VNYXBWYWxpZGF0ZSA9IFwiXCI7XG4gIGlmIChkZWZpbmVzLmludm9rZVZhbGlkYXRlKSB7XG4gICAgaW52b2tlVmFsaWRhdGUgPSBgXFxuICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuYXJnTGlzdH0pO1xcbmA7XG4gIH1cbiAgaWYgKGRlZmluZXMudmFsaWRhdGVNYXBBcmd1bWVudHMpIHtcbiAgICBpbnZva2VNYXBWYWxpZGF0ZSA9IGBcXG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xcbmA7XG4gIH1cblxuICByZXR1cm4gYFxuJHtkZWZpbmVzLmltcG9ydExpbmVzfVxuaW1wb3J0IEtleUhhc2hlciBmcm9tIFwiLi9rZXlzL0hhc2hlci5tanNcIjtcblxuY2xhc3MgJHtkZWZpbmVzLmNsYXNzTmFtZX0ge1xuICAvKiogQHR5cGVkZWYge3N0cmluZ30gaGFzaCAqL1xuXG4gIC8qKiBAdHlwZSB7TWFwPGhhc2gsIE1hcDwke2RlZmluZXMuc2V0QXJndW1lbnQwVHlwZX0sICpbXT4+fSBAY29uc3RhbnQgKi9cbiAgI291dGVyTWFwID0gbmV3IE1hcCgpO1xuXG4gIC8qKiBAdHlwZSB7S2V5SGFzaGVyfSBAY29uc3RhbnQgKi9cbiAgI21hcEhhc2hlciA9IG5ldyBLZXlIYXNoZXIoKTtcblxuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgI3NpemVPZkFsbCA9IDA7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBpdGVyYWJsZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgIGZvciAobGV0IGVudHJ5IG9mIGl0ZXJhYmxlKSB7XG4gICAgICAgIHRoaXMuYWRkKC4uLmVudHJ5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJnZXRTaXplXCIsIDIpfVxuICBnZXQgc2l6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy4jc2l6ZU9mQWxsO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZ2V0U2l6ZU9mU2V0XCIsIDIpfVxuICBnZXRTaXplT2ZTZXQoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSkgeyR7aW52b2tlTWFwVmFsaWRhdGV9XG4gICAgY29uc3QgW19faW5uZXJNYXBfX10gPSB0aGlzLiNnZXRJbm5lck1hcCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KTtcbiAgICByZXR1cm4gX19pbm5lck1hcF9fID8gX19pbm5lck1hcF9fLnNpemUgOiAwO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwibWFwU2l6ZVwiLCAyKX1cbiAgZ2V0IG1hcFNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuI291dGVyTWFwLnNpemU7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJhZGRcIiwgMil9XG4gIGFkZCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAke2RlZmluZXMuc2V0S2V5c1swXX0pIHske2ludm9rZVZhbGlkYXRlfVxuICAgIGNvbnN0IF9fbWFwSGFzaF9fID0gdGhpcy4jbWFwSGFzaGVyLmdldEhhc2goJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgaWYgKCF0aGlzLiNvdXRlck1hcC5oYXMoX19tYXBIYXNoX18pKVxuICAgICAgdGhpcy4jb3V0ZXJNYXAuc2V0KF9fbWFwSGFzaF9fLCBuZXcgTWFwKTtcblxuICAgIGNvbnN0IF9faW5uZXJNYXBfXyA9IHRoaXMuI291dGVyTWFwLmdldChfX21hcEhhc2hfXyk7XG5cbiAgICBpZiAoIV9faW5uZXJNYXBfXy5oYXMoJHtkZWZpbmVzLnNldEtleXNbMF19KSkge1xuICAgICAgX19pbm5lck1hcF9fLnNldCgke2RlZmluZXMuc2V0S2V5c1swXX0sIE9iamVjdC5mcmVlemUoWyR7ZGVmaW5lcy5hcmdMaXN0fV0pKTtcbiAgICAgIHRoaXMuI3NpemVPZkFsbCsrO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiYWRkU2V0c1wiLCAyKX1cbiAgYWRkU2V0cygke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCBfX3NldHNfXykgeyR7aW52b2tlTWFwVmFsaWRhdGV9XG4gICAgY29uc3QgX19hcnJheV9fID0gQXJyYXkuZnJvbShfX3NldHNfXykubWFwKChfX3NldF9fLCBfX2luZGV4X18pID0+IHtcbiAgICAgIF9fc2V0X18gPSBBcnJheS5mcm9tKF9fc2V0X18pO1xuICAgICAgaWYgKF9fc2V0X18ubGVuZ3RoICE9PSAke2RlZmluZXMuc2V0S2V5cy5sZW5ndGh9KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcXGBTZXQgYXQgaW5kZXggXFwke19faW5kZXhfX30gZG9lc24ndCBoYXZlIGV4YWN0bHkgJHtkZWZpbmVzLnNldEtleXMubGVuZ3RofSBhcmd1bWVudCR7XG4gICAgICAgICAgZGVmaW5lcy5zZXRLZXlzLmxlbmd0aCA+IDEgPyBcInNcIiA6IFwiXCJcbiAgICAgICAgfSFcXGApO1xuICAgICAgfVxuICAgICAgJHtkZWZpbmVzLmludm9rZVZhbGlkYXRlID8gYHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAuLi5fX3NldF9fKTtgIDogXCJcIn1cblxuICAgICAgcmV0dXJuIF9fc2V0X187XG4gICAgfSk7XG5cbiAgICBjb25zdCBfX21hcEhhc2hfXyA9IHRoaXMuI21hcEhhc2hlci5nZXRIYXNoKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xuICAgIGlmICghdGhpcy4jb3V0ZXJNYXAuaGFzKF9fbWFwSGFzaF9fKSlcbiAgICAgIHRoaXMuI291dGVyTWFwLnNldChfX21hcEhhc2hfXywgbmV3IE1hcCk7XG5cbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNvdXRlck1hcC5nZXQoX19tYXBIYXNoX18pO1xuICAgIGNvbnN0IF9fbWFwQXJnc19fID0gWyR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX1dO1xuXG4gICAgX19hcnJheV9fLmZvckVhY2goX19zZXRfXyA9PiB7XG4gICAgICBpZiAoIV9faW5uZXJNYXBfXy5oYXMoX19zZXRfX1swXSkpIHtcbiAgICAgICAgX19pbm5lck1hcF9fLnNldChfX3NldF9fWzBdLCBPYmplY3QuZnJlZXplKF9fbWFwQXJnc19fLmNvbmNhdChfX3NldF9fKSkpO1xuICAgICAgICB0aGlzLiNzaXplT2ZBbGwrKztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiY2xlYXJcIiwgMil9XG4gIGNsZWFyKCkge1xuICAgIHRoaXMuI291dGVyTWFwLmNsZWFyKCk7XG4gICAgdGhpcy4jc2l6ZU9mQWxsID0gMDtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImNsZWFyU2V0c1wiLCAyKX1cbiAgY2xlYXJTZXRzKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IFtfX2lubmVyTWFwX19dID0gdGhpcy4jZ2V0SW5uZXJNYXAoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgaWYgKCFfX2lubmVyTWFwX18pXG4gICAgICByZXR1cm47XG5cbiAgICB0aGlzLiNzaXplT2ZBbGwgLT0gX19pbm5lck1hcF9fLnNpemU7XG4gICAgX19pbm5lck1hcF9fLmNsZWFyKCk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJkZWxldGVcIiwgMil9XG4gIGRlbGV0ZSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAke2RlZmluZXMuc2V0S2V5c30pIHske2ludm9rZVZhbGlkYXRlfVxuICAgIGNvbnN0IFtfX2lubmVyTWFwX18sIF9fbWFwSGFzaF9fXSA9IHRoaXMuI2dldElubmVyTWFwKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgaWYgKCFfX2lubmVyTWFwX18uaGFzKCR7ZGVmaW5lcy5zZXRLZXlzWzBdfSkpXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBfX2lubmVyTWFwX18uZGVsZXRlKCR7ZGVmaW5lcy5zZXRLZXlzWzBdfSk7XG4gICAgdGhpcy4jc2l6ZU9mQWxsLS07XG5cbiAgICBpZiAoX19pbm5lck1hcF9fLnNpemUgPT09IDApIHtcbiAgICAgIHRoaXMuI291dGVyTWFwLmRlbGV0ZShfX21hcEhhc2hfXyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJkZWxldGVTZXRzXCIsIDIpfVxuICBkZWxldGVTZXRzKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IFtfX2lubmVyTWFwX18sIF9fbWFwSGFzaF9fXSA9IHRoaXMuI2dldElubmVyTWFwKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgdGhpcy4jb3V0ZXJNYXAuZGVsZXRlKF9fbWFwSGFzaF9fKTtcbiAgICB0aGlzLiNzaXplT2ZBbGwgLT0gX19pbm5lck1hcF9fLnNpemU7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJmb3JFYWNoU2V0XCIsIDIpfVxuICBmb3JFYWNoKF9fY2FsbGJhY2tfXywgX190aGlzQXJnX18pIHtcbiAgICB0aGlzLiNvdXRlck1hcC5mb3JFYWNoKFxuICAgICAgX19pbm5lck1hcF9fID0+IF9faW5uZXJNYXBfXy5mb3JFYWNoKFxuICAgICAgICBfX2tleVNldF9fID0+IF9fY2FsbGJhY2tfXy5hcHBseShfX3RoaXNBcmdfXywgX19rZXlTZXRfXy5jb25jYXQodGhpcykpXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImZvckVhY2hNYXBTZXRcIiwgMil9XG4gIGZvckVhY2hTZXQoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSwgX19jYWxsYmFja19fLCBfX3RoaXNBcmdfXykgeyR7aW52b2tlTWFwVmFsaWRhdGV9XG4gICAgY29uc3QgW19faW5uZXJNYXBfX10gPSB0aGlzLiNnZXRJbm5lck1hcCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybjtcblxuICAgIF9faW5uZXJNYXBfXy5mb3JFYWNoKFxuICAgICAgX19rZXlTZXRfXyA9PiBfX2NhbGxiYWNrX18uYXBwbHkoX190aGlzQXJnX18sIF9fa2V5U2V0X18uY29uY2F0KHRoaXMpKVxuICAgICk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJmb3JFYWNoQ2FsbGJhY2tTZXRcIiwgMil9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaGFzXCIsIDIpfVxuICBoYXMoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSwgJHtkZWZpbmVzLnNldEtleXN9KSB7JHtpbnZva2VWYWxpZGF0ZX1cbiAgICBjb25zdCBbX19pbm5lck1hcF9fXSA9IHRoaXMuI2dldElubmVyTWFwKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgcmV0dXJuIF9faW5uZXJNYXBfXy5oYXMoJHtkZWZpbmVzLnNldEtleXNbMF19KTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImhhc1NldFwiLCAyKX1cbiAgaGFzU2V0cygke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KSB7JHtpbnZva2VNYXBWYWxpZGF0ZX1cbiAgICBjb25zdCBbX19pbm5lck1hcF9fXSA9IHRoaXMuI2dldElubmVyTWFwKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xuICAgIHJldHVybiBCb29sZWFuKF9faW5uZXJNYXBfXyk7XG4gIH1cblxuJHtkZWZpbmVzLnZhbGlkYXRlQXJndW1lbnRzID8gYFxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHVibGljXCIsIDIpfVxuICBpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5hcmdMaXN0fSkge1xuICAgIHJldHVybiB0aGlzLiNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5hcmdMaXN0fSk7XG4gIH1cblxuICBgIDogYGB9XG4ke2RvY3MuYnVpbGRCbG9jayhcInZhbHVlc1wiLCAyKX1cbiAgKiB2YWx1ZXMoKSB7XG4gICAgY29uc3QgX19vdXRlckl0ZXJfXyA9IHRoaXMuI291dGVyTWFwLnZhbHVlcygpO1xuXG4gICAgZm9yIChsZXQgX19pbm5lck1hcF9fIG9mIF9fb3V0ZXJJdGVyX18pIHtcbiAgICAgIGZvciAobGV0IF9fdmFsdWVfXyBvZiBfX2lubmVyTWFwX18udmFsdWVzKCkpXG4gICAgICAgIHlpZWxkIF9fdmFsdWVfXztcbiAgICB9XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJ2YWx1ZXNTZXRcIiwgMil9XG4gICogdmFsdWVzU2V0KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IFtfX2lubmVyTWFwX19dID0gdGhpcy4jZ2V0SW5uZXJNYXAoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgaWYgKCFfX2lubmVyTWFwX18pXG4gICAgICByZXR1cm47XG5cbiAgICBmb3IgKGxldCBfX3ZhbHVlX18gb2YgX19pbm5lck1hcF9fLnZhbHVlcygpKVxuICAgICAgeWllbGQgX192YWx1ZV9fO1xuICB9XG5cbiAgI2dldElubmVyTWFwKC4uLl9fbWFwQXJndW1lbnRzX18pIHtcbiAgICBjb25zdCBfX2hhc2hfXyA9IHRoaXMuI21hcEhhc2hlci5nZXRIYXNoSWZFeGlzdHMoLi4uX19tYXBBcmd1bWVudHNfXyk7XG4gICAgcmV0dXJuIF9faGFzaF9fID8gW3RoaXMuI291dGVyTWFwLmdldChfX2hhc2hfXyksIF9faGFzaF9fXSA6IFtudWxsXTtcbiAgfVxuXG4ke2RlZmluZXMudmFsaWRhdGVBcmd1bWVudHMgPyBgXG4ke2RvY3MuYnVpbGRCbG9jayhcInJlcXVpcmVWYWxpZEtleVwiLCAyKX1cbiAgICAjcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5hcmdMaXN0fSkge1xuICAgICAgaWYgKCF0aGlzLiNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5hcmdMaXN0fSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBvcmRlcmVkIGtleSBzZXQgaXMgbm90IHZhbGlkIVwiKTtcbiAgICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZEtleVByaXZhdGVcIiwgMil9XG4gICAgI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KSB7XG4gICAgICB2b2lkKCR7ZGVmaW5lcy5hcmdMaXN0fSk7XG5cbiAgICAgICR7ZGVmaW5lcy52YWxpZGF0ZUFyZ3VtZW50c31cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICBgIDogYGB9XG5cbiR7ZGVmaW5lcy52YWxpZGF0ZU1hcEFyZ3VtZW50cyA/IGBcbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZVZhbGlkTWFwS2V5XCIsIDIpfVxuICAjcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHtcbiAgICBpZiAoIXRoaXMuI2lzVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgb3JkZXJlZCBtYXAga2V5IHNldCBpcyBub3QgdmFsaWQhXCIpO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZE1hcEtleVByaXZhdGVcIiwgMil9XG4gICNpc1ZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHtcbiAgICB2b2lkKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xuXG4gICAgJHtkZWZpbmVzLnZhbGlkYXRlTWFwQXJndW1lbnRzIHx8IFwiXCJ9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBgIDogYGB9XG5cbiAgW1N5bWJvbC5pdGVyYXRvcl0oKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWVzKCk7XG4gIH1cblxuICBbU3ltYm9sLnRvU3RyaW5nVGFnXSA9IFwiJHtkZWZpbmVzLmNsYXNzTmFtZX1cIjtcbn1cblxuT2JqZWN0LmZyZWV6ZSgke2RlZmluZXMuY2xhc3NOYW1lfSk7XG5PYmplY3QuZnJlZXplKCR7ZGVmaW5lcy5jbGFzc05hbWV9LnByb3RvdHlwZSk7XG5gfVxuXG5leHBvcnQgZGVmYXVsdCBwcmVwcm9jZXNzO1xuIl19