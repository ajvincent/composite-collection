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

  /** @type {Map<hash, Map<hash, *[]>>} @constant */
  #outerMap = new Map();

  /** @type {KeyHasher} @constant */
  #mapHasher = new KeyHasher();

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
  getSizeOfSet(${defines.get("mapArgList")}) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.get("mapArgList")});
    return __innerMap__ ? __innerMap__.size : 0;
  }

${docs.buildBlock("mapSize", 2)}
  get mapSize() {
    return this.#outerMap.size;
  }

${docs.buildBlock("add", 2)}
  add(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {${invokeValidate}
    const __mapHash__ = this.#mapHasher.getHash(${defines.get("mapArgList")});
    if (!this.#outerMap.has(__mapHash__))
      this.#outerMap.set(__mapHash__, new Map);

    const __innerMap__ = this.#outerMap.get(__mapHash__);

    const __setHash__ = this.#setHasher.getHash(${defines.get("setArgList")});
    if (!__innerMap__.has(__setHash__)) {
      __innerMap__.set(__setHash__, Object.freeze([${defines.get("argList")}]));
      this.#sizeOfAll++;
    }

    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.get("mapArgList")}, __sets__) {${invokeMapValidate}
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.get("setCount")}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.get("setCount")} argument${defines.get("setCount") > 1 ? "s" : ""}!\`);
      }
      ${defines.has("invokeValidate") ? `this.#requireValidKey(${defines.get("mapArgList")}, ...__set__);` : ""}

      return __set__;
    });

    const __mapHash__ = this.#mapHasher.getHash(${defines.get("mapArgList")});
    if (!this.#outerMap.has(__mapHash__))
      this.#outerMap.set(__mapHash__, new Map);

    const __innerMap__ = this.#outerMap.get(__mapHash__);
    const __mapArgs__ = [${defines.get("mapArgList")}];

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
  clearSets(${defines.get("mapArgList")}) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return;

    this.#sizeOfAll -= __innerMap__.size;
    __innerMap__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {${invokeValidate}
    const [__innerMap__, __mapHash__] = this.#getInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return false;

    const __setHash__ = this.#setHasher.getHashIfExists(${defines.get("setArgList")});
    if (!__setHash__ || !__innerMap__.has(__setHash__))
      return false;

    __innerMap__.delete(__setHash__);
    this.#sizeOfAll--;

    if (__innerMap__.size === 0) {
      this.#outerMap.delete(__mapHash__);
    }

    return true;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.get("mapArgList")}) {${invokeMapValidate}
    const [__innerMap__, __mapHash__] = this.#getInnerMap(${defines.get("mapArgList")});
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
  forEachSet(${defines.get("mapArgList")}, __callback__, __thisArg__) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("has", 2)}
  has(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {${invokeValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return false;

    const __setHash__ = this.#setHasher.getHashIfExists(${defines.get("setArgList")});
    return __setHash__ ? __innerMap__.has(__setHash__) : false;
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.get("mapArgList")}) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.get("mapArgList")});
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
  * valuesSet(${defines.get("mapArgList")}) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return;

    for (let __value__ of __innerMap__.values())
      yield __value__;
  }

  #getInnerMap(...__mapArguments__) {
    const __hash__ = this.#mapHasher.getHashIfExists(...__mapArguments__);
    return __hash__ ? [this.#outerMap.get(__hash__), __hash__] : [null];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFwT2ZTdHJvbmdTZXRzLmluLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1hcE9mU3Ryb25nU2V0cy5pbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxHQUFxQixTQUFTLFVBQVUsQ0FBQyxPQUE0QixFQUFFLElBQW9CO0lBQ3pHLElBQUksY0FBYyxHQUFHLEVBQUUsRUFBRSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7SUFDaEQsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7UUFDakMsY0FBYyxHQUFHLCtCQUErQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7S0FDOUU7SUFDRCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsRUFBRTtRQUN2QyxpQkFBaUIsR0FBRyxrQ0FBa0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO0tBQ3ZGO0lBRUQsT0FBTztFQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDOzs7UUFHcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXdCOUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDOzs7OztFQUs3QixJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7aUJBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0saUJBQWlCOytDQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQzs7OztFQUl0RSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7Ozs7O0VBSzdCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxL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QUM7Ozs7RUFJdEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7bUJBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO1dBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDOztNQUU5QixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFBRTs7OztHQUk1QyxDQUFDLENBQUMsQ0FBQyxFQUFFOzs7Ozs7NEJBTW9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDOzs7Z0JBR3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO2dCQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztDQUN2QyxDQUFBO0FBQUEsQ0FBQyxDQUFBO0FBRUYsZUFBZSxVQUFVLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFByZXByb2Nlc3NvckRlZmluZXMsIEpTRG9jR2VuZXJhdG9yLCBUZW1wbGF0ZUZ1bmN0aW9uIH0gZnJvbSBcIi4uL3NoYXJlZFR5cGVzLm1qc1wiO1xuXG4vKipcbiAqIEBwYXJhbSB7TWFwfSAgICAgICAgICAgIGRlZmluZXMgVGhlIHByZXByb2Nlc3NvciBtYWNyb3MuXG4gKiBAcGFyYW0ge0pTRG9jR2VuZXJhdG9yfSBkb2NzICAgIFRoZSBwcmltYXJ5IGRvY3VtZW50YXRpb24gZ2VuZXJhdG9yLlxuICogQHJldHVybnMge3N0cmluZ30gICAgICAgICAgICAgICBUaGUgZ2VuZXJhdGVkIHNvdXJjZSBjb2RlLlxuICovXG5jb25zdCBwcmVwcm9jZXNzOiBUZW1wbGF0ZUZ1bmN0aW9uID0gZnVuY3Rpb24gcHJlcHJvY2VzcyhkZWZpbmVzOiBQcmVwcm9jZXNzb3JEZWZpbmVzLCBkb2NzOiBKU0RvY0dlbmVyYXRvcikge1xuICBsZXQgaW52b2tlVmFsaWRhdGUgPSBcIlwiLCBpbnZva2VNYXBWYWxpZGF0ZSA9IFwiXCI7XG4gIGlmIChkZWZpbmVzLmhhcyhcImludm9rZVZhbGlkYXRlXCIpKSB7XG4gICAgaW52b2tlVmFsaWRhdGUgPSBgXFxuICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pO1xcbmA7XG4gIH1cbiAgaWYgKGRlZmluZXMuaGFzKFwidmFsaWRhdGVNYXBBcmd1bWVudHNcIikpIHtcbiAgICBpbnZva2VNYXBWYWxpZGF0ZSA9IGBcXG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSk7XFxuYDtcbiAgfVxuXG4gIHJldHVybiBgXG4ke2RlZmluZXMuZ2V0KFwiaW1wb3J0TGluZXNcIil9XG5pbXBvcnQgS2V5SGFzaGVyIGZyb20gXCIuL2tleXMvSGFzaGVyLm1qc1wiO1xuXG5jbGFzcyAke2RlZmluZXMuZ2V0KFwiY2xhc3NOYW1lXCIpfSB7XG4gIC8qKiBAdHlwZWRlZiB7c3RyaW5nfSBoYXNoICovXG5cbiAgLyoqIEB0eXBlIHtNYXA8aGFzaCwgTWFwPGhhc2gsICpbXT4+fSBAY29uc3RhbnQgKi9cbiAgI291dGVyTWFwID0gbmV3IE1hcCgpO1xuXG4gIC8qKiBAdHlwZSB7S2V5SGFzaGVyfSBAY29uc3RhbnQgKi9cbiAgI21hcEhhc2hlciA9IG5ldyBLZXlIYXNoZXIoKTtcblxuICAvKiogQHR5cGUge0tleUhhc2hlcn0gQGNvbnN0YW50ICovXG4gICNzZXRIYXNoZXIgPSBuZXcgS2V5SGFzaGVyKCk7XG5cbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICNzaXplT2ZBbGwgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgaXRlcmFibGUgPSBhcmd1bWVudHNbMF07XG4gICAgICBmb3IgKGxldCBlbnRyeSBvZiBpdGVyYWJsZSkge1xuICAgICAgICB0aGlzLmFkZCguLi5lbnRyeSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZ2V0U2l6ZVwiLCAyKX1cbiAgZ2V0IHNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuI3NpemVPZkFsbDtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImdldFNpemVPZlNldFwiLCAyKX1cbiAgZ2V0U2l6ZU9mU2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSkgeyR7aW52b2tlTWFwVmFsaWRhdGV9XG4gICAgY29uc3QgW19faW5uZXJNYXBfX10gPSB0aGlzLiNnZXRJbm5lck1hcCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuICAgIHJldHVybiBfX2lubmVyTWFwX18gPyBfX2lubmVyTWFwX18uc2l6ZSA6IDA7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJtYXBTaXplXCIsIDIpfVxuICBnZXQgbWFwU2l6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy4jb3V0ZXJNYXAuc2l6ZTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImFkZFwiLCAyKX1cbiAgYWRkKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KSB7JHtpbnZva2VWYWxpZGF0ZX1cbiAgICBjb25zdCBfX21hcEhhc2hfXyA9IHRoaXMuI21hcEhhc2hlci5nZXRIYXNoKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSk7XG4gICAgaWYgKCF0aGlzLiNvdXRlck1hcC5oYXMoX19tYXBIYXNoX18pKVxuICAgICAgdGhpcy4jb3V0ZXJNYXAuc2V0KF9fbWFwSGFzaF9fLCBuZXcgTWFwKTtcblxuICAgIGNvbnN0IF9faW5uZXJNYXBfXyA9IHRoaXMuI291dGVyTWFwLmdldChfX21hcEhhc2hfXyk7XG5cbiAgICBjb25zdCBfX3NldEhhc2hfXyA9IHRoaXMuI3NldEhhc2hlci5nZXRIYXNoKCR7ZGVmaW5lcy5nZXQoXCJzZXRBcmdMaXN0XCIpfSk7XG4gICAgaWYgKCFfX2lubmVyTWFwX18uaGFzKF9fc2V0SGFzaF9fKSkge1xuICAgICAgX19pbm5lck1hcF9fLnNldChfX3NldEhhc2hfXywgT2JqZWN0LmZyZWV6ZShbJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9XSkpO1xuICAgICAgdGhpcy4jc2l6ZU9mQWxsKys7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJhZGRTZXRzXCIsIDIpfVxuICBhZGRTZXRzKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgX19zZXRzX18pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IF9fYXJyYXlfXyA9IEFycmF5LmZyb20oX19zZXRzX18pLm1hcCgoX19zZXRfXywgX19pbmRleF9fKSA9PiB7XG4gICAgICBfX3NldF9fID0gQXJyYXkuZnJvbShfX3NldF9fKTtcbiAgICAgIGlmIChfX3NldF9fLmxlbmd0aCAhPT0gJHtkZWZpbmVzLmdldChcInNldENvdW50XCIpfSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXFxgU2V0IGF0IGluZGV4IFxcJHtfX2luZGV4X199IGRvZXNuJ3QgaGF2ZSBleGFjdGx5ICR7ZGVmaW5lcy5nZXQoXCJzZXRDb3VudFwiKX0gYXJndW1lbnQke1xuICAgICAgICAgIGRlZmluZXMuZ2V0KFwic2V0Q291bnRcIikhID4gMSA/IFwic1wiIDogXCJcIlxuICAgICAgICB9IVxcYCk7XG4gICAgICB9XG4gICAgICAke2RlZmluZXMuaGFzKFwiaW52b2tlVmFsaWRhdGVcIikgPyBgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgLi4uX19zZXRfXyk7YCA6IFwiXCJ9XG5cbiAgICAgIHJldHVybiBfX3NldF9fO1xuICAgIH0pO1xuXG4gICAgY29uc3QgX19tYXBIYXNoX18gPSB0aGlzLiNtYXBIYXNoZXIuZ2V0SGFzaCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuICAgIGlmICghdGhpcy4jb3V0ZXJNYXAuaGFzKF9fbWFwSGFzaF9fKSlcbiAgICAgIHRoaXMuI291dGVyTWFwLnNldChfX21hcEhhc2hfXywgbmV3IE1hcCk7XG5cbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNvdXRlck1hcC5nZXQoX19tYXBIYXNoX18pO1xuICAgIGNvbnN0IF9fbWFwQXJnc19fID0gWyR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfV07XG5cbiAgICBfX2FycmF5X18uZm9yRWFjaChfX3NldF9fID0+IHtcbiAgICAgIGNvbnN0IF9fc2V0SGFzaF9fID0gdGhpcy4jc2V0SGFzaGVyLmdldEhhc2goLi4uX19zZXRfXyk7XG4gICAgICBpZiAoIV9faW5uZXJNYXBfXy5oYXMoX19zZXRIYXNoX18pKSB7XG4gICAgICAgIF9faW5uZXJNYXBfXy5zZXQoX19zZXRIYXNoX18sIE9iamVjdC5mcmVlemUoX19tYXBBcmdzX18uY29uY2F0KF9fc2V0X18pKSk7XG4gICAgICAgIHRoaXMuI3NpemVPZkFsbCsrO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJjbGVhclwiLCAyKX1cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy4jb3V0ZXJNYXAuY2xlYXIoKTtcbiAgICB0aGlzLiNzaXplT2ZBbGwgPSAwO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiY2xlYXJTZXRzXCIsIDIpfVxuICBjbGVhclNldHMoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KSB7JHtpbnZva2VNYXBWYWxpZGF0ZX1cbiAgICBjb25zdCBbX19pbm5lck1hcF9fXSA9IHRoaXMuI2dldElubmVyTWFwKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSk7XG4gICAgaWYgKCFfX2lubmVyTWFwX18pXG4gICAgICByZXR1cm47XG5cbiAgICB0aGlzLiNzaXplT2ZBbGwgLT0gX19pbm5lck1hcF9fLnNpemU7XG4gICAgX19pbm5lck1hcF9fLmNsZWFyKCk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJkZWxldGVcIiwgMil9XG4gIGRlbGV0ZSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmdMaXN0XCIpfSkgeyR7aW52b2tlVmFsaWRhdGV9XG4gICAgY29uc3QgW19faW5uZXJNYXBfXywgX19tYXBIYXNoX19dID0gdGhpcy4jZ2V0SW5uZXJNYXAoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IF9fc2V0SGFzaF9fID0gdGhpcy4jc2V0SGFzaGVyLmdldEhhc2hJZkV4aXN0cygke2RlZmluZXMuZ2V0KFwic2V0QXJnTGlzdFwiKX0pO1xuICAgIGlmICghX19zZXRIYXNoX18gfHwgIV9faW5uZXJNYXBfXy5oYXMoX19zZXRIYXNoX18pKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgX19pbm5lck1hcF9fLmRlbGV0ZShfX3NldEhhc2hfXyk7XG4gICAgdGhpcy4jc2l6ZU9mQWxsLS07XG5cbiAgICBpZiAoX19pbm5lck1hcF9fLnNpemUgPT09IDApIHtcbiAgICAgIHRoaXMuI291dGVyTWFwLmRlbGV0ZShfX21hcEhhc2hfXyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJkZWxldGVTZXRzXCIsIDIpfVxuICBkZWxldGVTZXRzKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSkgeyR7aW52b2tlTWFwVmFsaWRhdGV9XG4gICAgY29uc3QgW19faW5uZXJNYXBfXywgX19tYXBIYXNoX19dID0gdGhpcy4jZ2V0SW5uZXJNYXAoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIHRoaXMuI291dGVyTWFwLmRlbGV0ZShfX21hcEhhc2hfXyk7XG4gICAgdGhpcy4jc2l6ZU9mQWxsIC09IF9faW5uZXJNYXBfXy5zaXplO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZm9yRWFjaFNldFwiLCAyKX1cbiAgZm9yRWFjaChfX2NhbGxiYWNrX18sIF9fdGhpc0FyZ19fKSB7XG4gICAgdGhpcy4jb3V0ZXJNYXAuZm9yRWFjaChcbiAgICAgIF9faW5uZXJNYXBfXyA9PiBfX2lubmVyTWFwX18uZm9yRWFjaChcbiAgICAgICAgX19rZXlTZXRfXyA9PiBfX2NhbGxiYWNrX18uYXBwbHkoX190aGlzQXJnX18sIF9fa2V5U2V0X18uY29uY2F0KHRoaXMpKVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJmb3JFYWNoTWFwU2V0XCIsIDIpfVxuICBmb3JFYWNoU2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgX19jYWxsYmFja19fLCBfX3RoaXNBcmdfXykgeyR7aW52b2tlTWFwVmFsaWRhdGV9XG4gICAgY29uc3QgW19faW5uZXJNYXBfX10gPSB0aGlzLiNnZXRJbm5lck1hcCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuO1xuXG4gICAgX19pbm5lck1hcF9fLmZvckVhY2goXG4gICAgICBfX2tleVNldF9fID0+IF9fY2FsbGJhY2tfXy5hcHBseShfX3RoaXNBcmdfXywgX19rZXlTZXRfXy5jb25jYXQodGhpcykpXG4gICAgKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImZvckVhY2hDYWxsYmFja1NldFwiLCAyKX1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJoYXNcIiwgMil9XG4gIGhhcygke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmdMaXN0XCIpfSkgeyR7aW52b2tlVmFsaWRhdGV9XG4gICAgY29uc3QgW19faW5uZXJNYXBfX10gPSB0aGlzLiNnZXRJbm5lck1hcCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgX19zZXRIYXNoX18gPSB0aGlzLiNzZXRIYXNoZXIuZ2V0SGFzaElmRXhpc3RzKCR7ZGVmaW5lcy5nZXQoXCJzZXRBcmdMaXN0XCIpfSk7XG4gICAgcmV0dXJuIF9fc2V0SGFzaF9fID8gX19pbm5lck1hcF9fLmhhcyhfX3NldEhhc2hfXykgOiBmYWxzZTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImhhc1NldFwiLCAyKX1cbiAgaGFzU2V0cygke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IFtfX2lubmVyTWFwX19dID0gdGhpcy4jZ2V0SW5uZXJNYXAoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcbiAgICByZXR1cm4gQm9vbGVhbihfX2lubmVyTWFwX18pO1xuICB9XG5cbiR7ZGVmaW5lcy5oYXMoXCJ2YWxpZGF0ZUFyZ3VtZW50c1wiKSA/IGBcbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZEtleVB1YmxpY1wiLCAyKX1cbiAgaXNWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pIHtcbiAgICByZXR1cm4gdGhpcy4jaXNWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pO1xuICB9XG5cbiAgYCA6IGBgfVxuJHtkb2NzLmJ1aWxkQmxvY2soXCJ2YWx1ZXNcIiwgMil9XG4gICogdmFsdWVzKCkge1xuICAgIGNvbnN0IF9fb3V0ZXJJdGVyX18gPSB0aGlzLiNvdXRlck1hcC52YWx1ZXMoKTtcblxuICAgIGZvciAobGV0IF9faW5uZXJNYXBfXyBvZiBfX291dGVySXRlcl9fKSB7XG4gICAgICBmb3IgKGxldCBfX3ZhbHVlX18gb2YgX19pbm5lck1hcF9fLnZhbHVlcygpKVxuICAgICAgICB5aWVsZCBfX3ZhbHVlX187XG4gICAgfVxuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwidmFsdWVzU2V0XCIsIDIpfVxuICAqIHZhbHVlc1NldCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IFtfX2lubmVyTWFwX19dID0gdGhpcy4jZ2V0SW5uZXJNYXAoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybjtcblxuICAgIGZvciAobGV0IF9fdmFsdWVfXyBvZiBfX2lubmVyTWFwX18udmFsdWVzKCkpXG4gICAgICB5aWVsZCBfX3ZhbHVlX187XG4gIH1cblxuICAjZ2V0SW5uZXJNYXAoLi4uX19tYXBBcmd1bWVudHNfXykge1xuICAgIGNvbnN0IF9faGFzaF9fID0gdGhpcy4jbWFwSGFzaGVyLmdldEhhc2hJZkV4aXN0cyguLi5fX21hcEFyZ3VtZW50c19fKTtcbiAgICByZXR1cm4gX19oYXNoX18gPyBbdGhpcy4jb3V0ZXJNYXAuZ2V0KF9faGFzaF9fKSwgX19oYXNoX19dIDogW251bGxdO1xuICB9XG5cbiR7ZGVmaW5lcy5oYXMoXCJ2YWxpZGF0ZUFyZ3VtZW50c1wiKSA/IGBcbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZVZhbGlkS2V5XCIsIDIpfVxuICAgICNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KSB7XG4gICAgICBpZiAoIXRoaXMuI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIG9yZGVyZWQga2V5IHNldCBpcyBub3QgdmFsaWQhXCIpO1xuICAgIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHJpdmF0ZVwiLCAyKX1cbiAgICAjaXNWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pIHtcbiAgICAgIHZvaWQoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KTtcblxuICAgICAgJHtkZWZpbmVzLmdldChcInZhbGlkYXRlQXJndW1lbnRzXCIpfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gIGAgOiBgYH1cblxuJHtkZWZpbmVzLmhhcyhcInZhbGlkYXRlTWFwQXJndW1lbnRzXCIpID8gYFxuJHtkb2NzLmJ1aWxkQmxvY2soXCJyZXF1aXJlVmFsaWRNYXBLZXlcIiwgMil9XG4gICNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KSB7XG4gICAgaWYgKCF0aGlzLiNpc1ZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgb3JkZXJlZCBtYXAga2V5IHNldCBpcyBub3QgdmFsaWQhXCIpO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZE1hcEtleVByaXZhdGVcIiwgMil9XG4gICNpc1ZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSkge1xuICAgIHZvaWQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcblxuICAgICR7ZGVmaW5lcy5nZXQoXCJ2YWxpZGF0ZU1hcEFyZ3VtZW50c1wiKSB8fCBcIlwifVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgYCA6IGBgfVxuXG4gIFtTeW1ib2wuaXRlcmF0b3JdKCkge1xuICAgIHJldHVybiB0aGlzLnZhbHVlcygpO1xuICB9XG5cbiAgW1N5bWJvbC50b1N0cmluZ1RhZ10gPSBcIiR7ZGVmaW5lcy5nZXQoXCJjbGFzc05hbWVcIil9XCI7XG59XG5cbk9iamVjdC5mcmVlemUoJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX0pO1xuT2JqZWN0LmZyZWV6ZSgke2RlZmluZXMuZ2V0KFwiY2xhc3NOYW1lXCIpfS5wcm90b3R5cGUpO1xuYH1cblxuZXhwb3J0IGRlZmF1bHQgcHJlcHJvY2VzcztcbiJdfQ==