/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    let invokeValidate = "", invokeMapValidate = "";
    if (defines.has("invokeValidate")) {
        invokeValidate = `\n    this.#requireValidKey(${defines.get("argList")});\n`;
    }
    if (defines.has("validateMapArguments")) {
        invokeMapValidate = `\n    this.#requireValidMapKey(${defines.get("mapArgList")});\n`;
    }
    return `
${defines.get("importLines")}
import KeyHasher from "./keys/Hasher.mjs";

class ${defines.get("className")} {
  /** @typedef {string} hash */

  /** @type {Map<${defines.get("mapArgument0Type")}, Map<hash, *[]>>} @constant */
  #outerMap = new Map();

  /** @type {KeyHasher} @constant */
  #setHasher = new KeyHasher();

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
  getSizeOfSet(${defines.get("mapArgument0")}) {${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${defines.get("mapArgument0")})
    return __innerMap__?.size || 0;
  }

${docs.buildBlock("mapSize", 2)}
  get mapSize() {
    return this.#outerMap.size;
  }

${docs.buildBlock("add", 2)}
  add(${defines.get("mapArgument0")}, ${defines.get("setArgList")}) {${invokeValidate}
    if (!this.#outerMap.has(${defines.get("mapArgument0")}))
      this.#outerMap.set(${defines.get("mapArgument0")}, new Map);

    const __innerMap__ = this.#outerMap.get(${defines.get("mapArgument0")});

    const __setHash__ = this.#setHasher.getHash(${defines.get("setArgList")});
    if (!__innerMap__.has(__setHash__)) {
      __innerMap__.set(__setHash__, Object.freeze([${defines.get("argList")}]));
      this.#sizeOfAll++;
    }

    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.get("mapArgument0")}, __sets__) {${invokeMapValidate}
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.get("setCount")}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.get("setCount")} argument${defines.get("setCount") > 1 ? "s" : ""}!\`);
      }
      ${defines.has("invokeValidate") ? `this.#requireValidKey(${defines.get("mapArgument0")}, ...__set__);` : ""}

      return __set__;
    });

    if (!this.#outerMap.has(${defines.get("mapArgument0")}))
      this.#outerMap.set(${defines.get("mapArgument0")}, new Map);

    const __innerMap__ = this.#outerMap.get(${defines.get("mapArgument0")});
    const __mapArgs__ = [${defines.get("mapArgument0")}];

    __array__.forEach(__set__ => {
      const __setHash__ = this.#setHasher.getHash(...__set__);
      if (!__innerMap__.has(__setHash__)) {
        __innerMap__.set(__setHash__, Object.freeze(__mapArgs__.concat(__set__)));
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
  clearSets(${defines.get("mapArgument0")}) {${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerMap__)
      return;

    this.#sizeOfAll -= __innerMap__.size;
    __innerMap__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("mapArgument0")}, ${defines.get("setArgList")}) {${invokeValidate}
    const __innerMap__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerMap__)
      return false;

    const __setHash__ = this.#setHasher.getHashIfExists(${defines.get("setArgList")});
    if (!__setHash__ || !__innerMap__.has(__setHash__))
      return false;

    __innerMap__.delete(__setHash__);
    this.#sizeOfAll--;

    if (__innerMap__.size === 0) {
      this.#outerMap.delete(${defines.get("mapArgument0")});
    }

    return true;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.get("mapArgument0")}) {${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerMap__)
      return false;

    this.#outerMap.delete(${defines.get("mapArgument0")});
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
  forEachSet(${defines.get("mapArgument0")}, __callback__, __thisArg__) {${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("has", 2)}
  has(${defines.get("mapArgument0")}, ${defines.get("setArgList")}) {${invokeValidate}
    const __innerMap__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerMap__)
      return false;

    const __setHash__ = this.#setHasher.getHashIfExists(${defines.get("setArgList")});
    return __setHash__ ? __innerMap__.has(__setHash__) : false;
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.get("mapArgument0")}) {${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${defines.get("mapArgument0")})
    return Boolean(__innerMap__);
  }

${defines.has("validateArguments") ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("argList")}) {
    return this.#isValidKey(${defines.get("argList")});
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
  * valuesSet(${defines.get("mapArgument0")}) {${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${defines.get("mapArgument0")})
    if (!__innerMap__)
      return;

    for (let __value__ of __innerMap__.values())
      yield __value__;
  }

${defines.has("validateArguments") ? `
${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.get("argList")}) {
    if (!this.#isValidKey(${defines.get("argList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.get("argList")}) {
    void(${defines.get("argList")});

    ${defines.get("validateArguments")}
    return true;
  }
  ` : ``}

${defines.has("validateMapArguments") ? `
${docs.buildBlock("requireValidMapKey", 2)}
  #requireValidMapKey(${defines.get("mapArgList")}) {
    if (!this.#isValidMapKey(${defines.get("mapArgList")}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  #isValidMapKey(${defines.get("mapArgList")}) {
    void(${defines.get("mapArgList")});

    ${defines.get("validateMapArguments") || ""}
    return true;
  }
  ` : ``}

  [Symbol.iterator]() {
    return this.values();
  }

  [Symbol.toStringTag] = "${defines.get("className")}";
}


Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`;
};
export default preprocess;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT25lTWFwT2ZTdHJvbmdTZXRzLmluLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk9uZU1hcE9mU3Ryb25nU2V0cy5pbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxHQUFxQixTQUFTLFVBQVUsQ0FBQyxPQUE0QixFQUFFLElBQW9CO0lBQ3pHLElBQUksY0FBYyxHQUFHLEVBQUUsRUFBRSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7SUFDaEQsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7UUFDakMsY0FBYyxHQUFHLCtCQUErQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7S0FDOUU7SUFDRCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsRUFBRTtRQUN2QyxpQkFBaUIsR0FBRyxrQ0FBa0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO0tBQ3ZGO0lBRUQsT0FBTztFQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDOzs7UUFHcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7OzttQkFHYixPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFrQmhELElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQzs7Ozs7RUFLN0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO2lCQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxNQUFNLGlCQUFpQjs4Q0FDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUM7Ozs7RUFJdkUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDOzs7OztFQUs3QixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLENB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QUFTLENBQUM7O01BRTNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUM7OztHQUduQyxDQUFDLENBQUMsQ0FBQyxFQUFFOztFQUVOLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDdEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7d0JBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDOytCQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQzs7OztFQUl0RCxJQUFJLENBQUMsVUFBVSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQzttQkFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7V0FDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7O01BRTlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsSUFBSSxFQUFFOzs7R0FHNUMsQ0FBQyxDQUFDLENBQUMsRUFBRTs7Ozs7OzRCQU1vQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQzs7OztnQkFJcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7Z0JBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO0NBQ3ZDLENBQUE7QUFBQSxDQUFDLENBQUE7QUFFRixlQUFlLFVBQVUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUHJlcHJvY2Vzc29yRGVmaW5lcywgSlNEb2NHZW5lcmF0b3IsIFRlbXBsYXRlRnVuY3Rpb24gfSBmcm9tIFwiLi4vc2hhcmVkVHlwZXMubWpzXCI7XG5cbi8qKlxuICogQHBhcmFtIHtNYXB9ICAgICAgICAgICAgZGVmaW5lcyBUaGUgcHJlcHJvY2Vzc29yIG1hY3Jvcy5cbiAqIEBwYXJhbSB7SlNEb2NHZW5lcmF0b3J9IGRvY3MgICAgVGhlIHByaW1hcnkgZG9jdW1lbnRhdGlvbiBnZW5lcmF0b3IuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSAgICAgICAgICAgICAgIFRoZSBnZW5lcmF0ZWQgc291cmNlIGNvZGUuXG4gKi9cbmNvbnN0IHByZXByb2Nlc3M6IFRlbXBsYXRlRnVuY3Rpb24gPSBmdW5jdGlvbiBwcmVwcm9jZXNzKGRlZmluZXM6IFByZXByb2Nlc3NvckRlZmluZXMsIGRvY3M6IEpTRG9jR2VuZXJhdG9yKSB7XG4gIGxldCBpbnZva2VWYWxpZGF0ZSA9IFwiXCIsIGludm9rZU1hcFZhbGlkYXRlID0gXCJcIjtcbiAgaWYgKGRlZmluZXMuaGFzKFwiaW52b2tlVmFsaWRhdGVcIikpIHtcbiAgICBpbnZva2VWYWxpZGF0ZSA9IGBcXG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSk7XFxuYDtcbiAgfVxuICBpZiAoZGVmaW5lcy5oYXMoXCJ2YWxpZGF0ZU1hcEFyZ3VtZW50c1wiKSkge1xuICAgIGludm9rZU1hcFZhbGlkYXRlID0gYFxcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcXG5gO1xuICB9XG5cbiAgcmV0dXJuIGBcbiR7ZGVmaW5lcy5nZXQoXCJpbXBvcnRMaW5lc1wiKX1cbmltcG9ydCBLZXlIYXNoZXIgZnJvbSBcIi4va2V5cy9IYXNoZXIubWpzXCI7XG5cbmNsYXNzICR7ZGVmaW5lcy5nZXQoXCJjbGFzc05hbWVcIil9IHtcbiAgLyoqIEB0eXBlZGVmIHtzdHJpbmd9IGhhc2ggKi9cblxuICAvKiogQHR5cGUge01hcDwke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwVHlwZVwiKX0sIE1hcDxoYXNoLCAqW10+Pn0gQGNvbnN0YW50ICovXG4gICNvdXRlck1hcCA9IG5ldyBNYXAoKTtcblxuICAvKiogQHR5cGUge0tleUhhc2hlcn0gQGNvbnN0YW50ICovXG4gICNzZXRIYXNoZXIgPSBuZXcgS2V5SGFzaGVyKCk7XG5cbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICNzaXplT2ZBbGwgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgaXRlcmFibGUgPSBhcmd1bWVudHNbMF07XG4gICAgICBmb3IgKGxldCBlbnRyeSBvZiBpdGVyYWJsZSkge1xuICAgICAgICB0aGlzLmFkZCguLi5lbnRyeSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZ2V0U2l6ZVwiLCAyKX1cbiAgZ2V0IHNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuI3NpemVPZkFsbDtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImdldFNpemVPZlNldFwiLCAyKX1cbiAgZ2V0U2l6ZU9mU2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KSB7JHtpbnZva2VNYXBWYWxpZGF0ZX1cbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNvdXRlck1hcC5nZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pXG4gICAgcmV0dXJuIF9faW5uZXJNYXBfXz8uc2l6ZSB8fCAwO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwibWFwU2l6ZVwiLCAyKX1cbiAgZ2V0IG1hcFNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuI291dGVyTWFwLnNpemU7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJhZGRcIiwgMil9XG4gIGFkZCgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSwgJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KSB7JHtpbnZva2VWYWxpZGF0ZX1cbiAgICBpZiAoIXRoaXMuI291dGVyTWFwLmhhcygke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSkpXG4gICAgICB0aGlzLiNvdXRlck1hcC5zZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0sIG5ldyBNYXApO1xuXG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jb3V0ZXJNYXAuZ2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KTtcblxuICAgIGNvbnN0IF9fc2V0SGFzaF9fID0gdGhpcy4jc2V0SGFzaGVyLmdldEhhc2goJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXy5oYXMoX19zZXRIYXNoX18pKSB7XG4gICAgICBfX2lubmVyTWFwX18uc2V0KF9fc2V0SGFzaF9fLCBPYmplY3QuZnJlZXplKFske2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX1dKSk7XG4gICAgICB0aGlzLiNzaXplT2ZBbGwrKztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImFkZFNldHNcIiwgMil9XG4gIGFkZFNldHMoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0sIF9fc2V0c19fKSB7JHtpbnZva2VNYXBWYWxpZGF0ZX1cbiAgICBjb25zdCBfX2FycmF5X18gPSBBcnJheS5mcm9tKF9fc2V0c19fKS5tYXAoKF9fc2V0X18sIF9faW5kZXhfXykgPT4ge1xuICAgICAgX19zZXRfXyA9IEFycmF5LmZyb20oX19zZXRfXyk7XG4gICAgICBpZiAoX19zZXRfXy5sZW5ndGggIT09ICR7ZGVmaW5lcy5nZXQoXCJzZXRDb3VudFwiKX0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxcYFNldCBhdCBpbmRleCBcXCR7X19pbmRleF9ffSBkb2Vzbid0IGhhdmUgZXhhY3RseSAke2RlZmluZXMuZ2V0KFwic2V0Q291bnRcIil9IGFyZ3VtZW50JHtcbiAgICAgICAgICBkZWZpbmVzLmdldChcInNldENvdW50XCIpISA+IDEgPyBcInNcIiA6IFwiXCJcbiAgICAgICAgfSFcXGApO1xuICAgICAgfVxuICAgICAgJHtkZWZpbmVzLmhhcyhcImludm9rZVZhbGlkYXRlXCIpID8gYHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSwgLi4uX19zZXRfXyk7YCA6IFwiXCJ9XG5cbiAgICAgIHJldHVybiBfX3NldF9fO1xuICAgIH0pO1xuXG4gICAgaWYgKCF0aGlzLiNvdXRlck1hcC5oYXMoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pKVxuICAgICAgdGhpcy4jb3V0ZXJNYXAuc2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9LCBuZXcgTWFwKTtcblxuICAgIGNvbnN0IF9faW5uZXJNYXBfXyA9IHRoaXMuI291dGVyTWFwLmdldCgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSk7XG4gICAgY29uc3QgX19tYXBBcmdzX18gPSBbJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX1dO1xuXG4gICAgX19hcnJheV9fLmZvckVhY2goX19zZXRfXyA9PiB7XG4gICAgICBjb25zdCBfX3NldEhhc2hfXyA9IHRoaXMuI3NldEhhc2hlci5nZXRIYXNoKC4uLl9fc2V0X18pO1xuICAgICAgaWYgKCFfX2lubmVyTWFwX18uaGFzKF9fc2V0SGFzaF9fKSkge1xuICAgICAgICBfX2lubmVyTWFwX18uc2V0KF9fc2V0SGFzaF9fLCBPYmplY3QuZnJlZXplKF9fbWFwQXJnc19fLmNvbmNhdChfX3NldF9fKSkpO1xuICAgICAgICB0aGlzLiNzaXplT2ZBbGwrKztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiY2xlYXJcIiwgMil9XG4gIGNsZWFyKCkge1xuICAgIHRoaXMuI291dGVyTWFwLmNsZWFyKCk7XG4gICAgdGhpcy4jc2l6ZU9mQWxsID0gMDtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImNsZWFyU2V0c1wiLCAyKX1cbiAgY2xlYXJTZXRzKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KSB7JHtpbnZva2VNYXBWYWxpZGF0ZX1cbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNvdXRlck1hcC5nZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pXG4gICAgaWYgKCFfX2lubmVyTWFwX18pXG4gICAgICByZXR1cm47XG5cbiAgICB0aGlzLiNzaXplT2ZBbGwgLT0gX19pbm5lck1hcF9fLnNpemU7XG4gICAgX19pbm5lck1hcF9fLmNsZWFyKCk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJkZWxldGVcIiwgMil9XG4gIGRlbGV0ZSgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSwgJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KSB7JHtpbnZva2VWYWxpZGF0ZX1cbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNvdXRlck1hcC5nZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pXG4gICAgaWYgKCFfX2lubmVyTWFwX18pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBfX3NldEhhc2hfXyA9IHRoaXMuI3NldEhhc2hlci5nZXRIYXNoSWZFeGlzdHMoJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KTtcbiAgICBpZiAoIV9fc2V0SGFzaF9fIHx8ICFfX2lubmVyTWFwX18uaGFzKF9fc2V0SGFzaF9fKSlcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIF9faW5uZXJNYXBfXy5kZWxldGUoX19zZXRIYXNoX18pO1xuICAgIHRoaXMuI3NpemVPZkFsbC0tO1xuXG4gICAgaWYgKF9faW5uZXJNYXBfXy5zaXplID09PSAwKSB7XG4gICAgICB0aGlzLiNvdXRlck1hcC5kZWxldGUoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZGVsZXRlU2V0c1wiLCAyKX1cbiAgZGVsZXRlU2V0cygke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSkgeyR7aW52b2tlTWFwVmFsaWRhdGV9XG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jb3V0ZXJNYXAuZ2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KVxuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgdGhpcy4jb3V0ZXJNYXAuZGVsZXRlKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KTtcbiAgICB0aGlzLiNzaXplT2ZBbGwgLT0gX19pbm5lck1hcF9fLnNpemU7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJmb3JFYWNoU2V0XCIsIDIpfVxuICBmb3JFYWNoKF9fY2FsbGJhY2tfXywgX190aGlzQXJnX18pIHtcbiAgICB0aGlzLiNvdXRlck1hcC5mb3JFYWNoKFxuICAgICAgX19pbm5lck1hcF9fID0+IF9faW5uZXJNYXBfXy5mb3JFYWNoKFxuICAgICAgICBfX2tleVNldF9fID0+IF9fY2FsbGJhY2tfXy5hcHBseShfX3RoaXNBcmdfXywgX19rZXlTZXRfXy5jb25jYXQodGhpcykpXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImZvckVhY2hNYXBTZXRcIiwgMil9XG4gIGZvckVhY2hTZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0sIF9fY2FsbGJhY2tfXywgX190aGlzQXJnX18pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IF9faW5uZXJNYXBfXyA9IHRoaXMuI291dGVyTWFwLmdldCgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSlcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybjtcblxuICAgIF9faW5uZXJNYXBfXy5mb3JFYWNoKFxuICAgICAgX19rZXlTZXRfXyA9PiBfX2NhbGxiYWNrX18uYXBwbHkoX190aGlzQXJnX18sIF9fa2V5U2V0X18uY29uY2F0KHRoaXMpKVxuICAgICk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJmb3JFYWNoQ2FsbGJhY2tTZXRcIiwgMil9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaGFzXCIsIDIpfVxuICBoYXMoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmdMaXN0XCIpfSkgeyR7aW52b2tlVmFsaWRhdGV9XG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jb3V0ZXJNYXAuZ2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KVxuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgX19zZXRIYXNoX18gPSB0aGlzLiNzZXRIYXNoZXIuZ2V0SGFzaElmRXhpc3RzKCR7ZGVmaW5lcy5nZXQoXCJzZXRBcmdMaXN0XCIpfSk7XG4gICAgcmV0dXJuIF9fc2V0SGFzaF9fID8gX19pbm5lck1hcF9fLmhhcyhfX3NldEhhc2hfXykgOiBmYWxzZTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImhhc1NldFwiLCAyKX1cbiAgaGFzU2V0cygke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSkgeyR7aW52b2tlTWFwVmFsaWRhdGV9XG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jb3V0ZXJNYXAuZ2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KVxuICAgIHJldHVybiBCb29sZWFuKF9faW5uZXJNYXBfXyk7XG4gIH1cblxuJHtkZWZpbmVzLmhhcyhcInZhbGlkYXRlQXJndW1lbnRzXCIpID8gYFxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHVibGljXCIsIDIpfVxuICBpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSkge1xuICAgIHJldHVybiB0aGlzLiNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSk7XG4gIH1cblxuICBgIDogYGB9XG4ke2RvY3MuYnVpbGRCbG9jayhcInZhbHVlc1wiLCAyKX1cbiAgKiB2YWx1ZXMoKSB7XG4gICAgY29uc3QgX19vdXRlckl0ZXJfXyA9IHRoaXMuI291dGVyTWFwLnZhbHVlcygpO1xuXG4gICAgZm9yIChsZXQgX19pbm5lck1hcF9fIG9mIF9fb3V0ZXJJdGVyX18pIHtcbiAgICAgIGZvciAobGV0IF9fdmFsdWVfXyBvZiBfX2lubmVyTWFwX18udmFsdWVzKCkpXG4gICAgICAgIHlpZWxkIF9fdmFsdWVfXztcbiAgICB9XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJ2YWx1ZXNTZXRcIiwgMil9XG4gICogdmFsdWVzU2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KSB7JHtpbnZva2VNYXBWYWxpZGF0ZX1cbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNvdXRlck1hcC5nZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pXG4gICAgaWYgKCFfX2lubmVyTWFwX18pXG4gICAgICByZXR1cm47XG5cbiAgICBmb3IgKGxldCBfX3ZhbHVlX18gb2YgX19pbm5lck1hcF9fLnZhbHVlcygpKVxuICAgICAgeWllbGQgX192YWx1ZV9fO1xuICB9XG5cbiR7ZGVmaW5lcy5oYXMoXCJ2YWxpZGF0ZUFyZ3VtZW50c1wiKSA/IGBcbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZVZhbGlkS2V5XCIsIDIpfVxuICAjcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSkge1xuICAgIGlmICghdGhpcy4jaXNWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIG9yZGVyZWQga2V5IHNldCBpcyBub3QgdmFsaWQhXCIpO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZEtleVByaXZhdGVcIiwgMil9XG4gICNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJhcmdMaXN0XCIpfSkge1xuICAgIHZvaWQoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KTtcblxuICAgICR7ZGVmaW5lcy5nZXQoXCJ2YWxpZGF0ZUFyZ3VtZW50c1wiKX1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBgIDogYGB9XG5cbiR7ZGVmaW5lcy5oYXMoXCJ2YWxpZGF0ZU1hcEFyZ3VtZW50c1wiKSA/IGBcbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZVZhbGlkTWFwS2V5XCIsIDIpfVxuICAjcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSkge1xuICAgIGlmICghdGhpcy4jaXNWYWxpZE1hcEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIG9yZGVyZWQgbWFwIGtleSBzZXQgaXMgbm90IHZhbGlkIVwiKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRNYXBLZXlQcml2YXRlXCIsIDIpfVxuICAjaXNWYWxpZE1hcEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHtcbiAgICB2b2lkKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSk7XG5cbiAgICAke2RlZmluZXMuZ2V0KFwidmFsaWRhdGVNYXBBcmd1bWVudHNcIikgfHwgXCJcIn1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBgIDogYGB9XG5cbiAgW1N5bWJvbC5pdGVyYXRvcl0oKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWVzKCk7XG4gIH1cblxuICBbU3ltYm9sLnRvU3RyaW5nVGFnXSA9IFwiJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX1cIjtcbn1cblxuXG5PYmplY3QuZnJlZXplKCR7ZGVmaW5lcy5nZXQoXCJjbGFzc05hbWVcIil9KTtcbk9iamVjdC5mcmVlemUoJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX0ucHJvdG90eXBlKTtcbmB9XG5cbmV4cG9ydCBkZWZhdWx0IHByZXByb2Nlc3M7XG4iXX0=