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

  /** @type {Map<hash, Map<${defines.get("setArgument0Type")}, *[]>>} @constant */
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
  getSizeOfSet(${defines.get("mapArgList")}) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.get("mapArgList")});
    return __innerMap__ ? __innerMap__.size : 0;
  }

${docs.buildBlock("mapSize", 2)}
  get mapSize() {
    return this.#outerMap.size;
  }

${docs.buildBlock("add", 2)}
  add(${defines.get("mapArgList")}, ${defines.get("setArgument0")}) {${invokeValidate}
    const __mapHash__ = this.#mapHasher.getHash(${defines.get("mapArgList")});
    if (!this.#outerMap.has(__mapHash__))
      this.#outerMap.set(__mapHash__, new Map);

    const __innerMap__ = this.#outerMap.get(__mapHash__);

    if (!__innerMap__.has(${defines.get("setArgument0")})) {
      __innerMap__.set(${defines.get("setArgument0")}, Object.freeze([${defines.get("argList")}]));
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

    if (!__innerMap__.has(${defines.get("setArgument0")}))
      return false;

    __innerMap__.delete(${defines.get("setArgument0")});
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

    return __innerMap__.has(${defines.get("setArgument0")});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFwT2ZPbmVTdHJvbmdTZXQuaW4ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTWFwT2ZPbmVTdHJvbmdTZXQuaW4ubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsR0FBcUIsU0FBUyxVQUFVLENBQUMsT0FBNEIsRUFBRSxJQUFvQjtJQUN6RyxJQUFJLGNBQWMsR0FBRyxFQUFFLEVBQUUsaUJBQWlCLEdBQUcsRUFBRSxDQUFDO0lBQ2hELElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1FBQ2pDLGNBQWMsR0FBRywrQkFBK0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO0tBQzlFO0lBQ0QsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLEVBQUU7UUFDdkMsaUJBQWlCLEdBQUcsa0NBQWtDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztLQUN2RjtJQUVELE9BQU87RUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQzs7O1FBR3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDOzs7NkJBR0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBa0IxRCxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7Ozs7O0VBSzdCLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztpQkFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxpQkFBaUI7K0NBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDOzs7O0VBSXRFLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQzs7Ozs7RUFLN0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFD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Q0FBQyxVQUFVLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO3dCQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQzsrQkFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7Ozs7RUFJdEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7bUJBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO1dBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDOztNQUU5QixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFBRTs7OztHQUk1QyxDQUFDLENBQUMsQ0FBQyxFQUFFOzs7Ozs7NEJBTW9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDOzs7Z0JBR3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO2dCQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztDQUN2QyxDQUFBO0FBQUEsQ0FBQyxDQUFBO0FBRUYsZUFBZSxVQUFVLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFByZXByb2Nlc3NvckRlZmluZXMsIEpTRG9jR2VuZXJhdG9yLCBUZW1wbGF0ZUZ1bmN0aW9uIH0gZnJvbSBcIi4uL3NoYXJlZFR5cGVzLm1qc1wiO1xuXG4vKipcbiAqIEBwYXJhbSB7TWFwfSAgICAgICAgICAgIGRlZmluZXMgVGhlIHByZXByb2Nlc3NvciBtYWNyb3MuXG4gKiBAcGFyYW0ge0pTRG9jR2VuZXJhdG9yfSBkb2NzICAgIFRoZSBwcmltYXJ5IGRvY3VtZW50YXRpb24gZ2VuZXJhdG9yLlxuICogQHJldHVybnMge3N0cmluZ30gICAgICAgICAgICAgICBUaGUgZ2VuZXJhdGVkIHNvdXJjZSBjb2RlLlxuICovXG5jb25zdCBwcmVwcm9jZXNzOiBUZW1wbGF0ZUZ1bmN0aW9uID0gZnVuY3Rpb24gcHJlcHJvY2VzcyhkZWZpbmVzOiBQcmVwcm9jZXNzb3JEZWZpbmVzLCBkb2NzOiBKU0RvY0dlbmVyYXRvcikge1xuICBsZXQgaW52b2tlVmFsaWRhdGUgPSBcIlwiLCBpbnZva2VNYXBWYWxpZGF0ZSA9IFwiXCI7XG4gIGlmIChkZWZpbmVzLmhhcyhcImludm9rZVZhbGlkYXRlXCIpKSB7XG4gICAgaW52b2tlVmFsaWRhdGUgPSBgXFxuICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pO1xcbmA7XG4gIH1cbiAgaWYgKGRlZmluZXMuaGFzKFwidmFsaWRhdGVNYXBBcmd1bWVudHNcIikpIHtcbiAgICBpbnZva2VNYXBWYWxpZGF0ZSA9IGBcXG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSk7XFxuYDtcbiAgfVxuXG4gIHJldHVybiBgXG4ke2RlZmluZXMuZ2V0KFwiaW1wb3J0TGluZXNcIil9XG5pbXBvcnQgS2V5SGFzaGVyIGZyb20gXCIuL2tleXMvSGFzaGVyLm1qc1wiO1xuXG5jbGFzcyAke2RlZmluZXMuZ2V0KFwiY2xhc3NOYW1lXCIpfSB7XG4gIC8qKiBAdHlwZWRlZiB7c3RyaW5nfSBoYXNoICovXG5cbiAgLyoqIEB0eXBlIHtNYXA8aGFzaCwgTWFwPCR7ZGVmaW5lcy5nZXQoXCJzZXRBcmd1bWVudDBUeXBlXCIpfSwgKltdPj59IEBjb25zdGFudCAqL1xuICAjb3V0ZXJNYXAgPSBuZXcgTWFwKCk7XG5cbiAgLyoqIEB0eXBlIHtLZXlIYXNoZXJ9IEBjb25zdGFudCAqL1xuICAjbWFwSGFzaGVyID0gbmV3IEtleUhhc2hlcigpO1xuXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAjc2l6ZU9mQWxsID0gMDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGl0ZXJhYmxlID0gYXJndW1lbnRzWzBdO1xuICAgICAgZm9yIChsZXQgZW50cnkgb2YgaXRlcmFibGUpIHtcbiAgICAgICAgdGhpcy5hZGQoLi4uZW50cnkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImdldFNpemVcIiwgMil9XG4gIGdldCBzaXplKCkge1xuICAgIHJldHVybiB0aGlzLiNzaXplT2ZBbGw7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJnZXRTaXplT2ZTZXRcIiwgMil9XG4gIGdldFNpemVPZlNldCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IFtfX2lubmVyTWFwX19dID0gdGhpcy4jZ2V0SW5uZXJNYXAoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcbiAgICByZXR1cm4gX19pbm5lck1hcF9fID8gX19pbm5lck1hcF9fLnNpemUgOiAwO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwibWFwU2l6ZVwiLCAyKX1cbiAgZ2V0IG1hcFNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuI291dGVyTWFwLnNpemU7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJhZGRcIiwgMil9XG4gIGFkZCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmd1bWVudDBcIil9KSB7JHtpbnZva2VWYWxpZGF0ZX1cbiAgICBjb25zdCBfX21hcEhhc2hfXyA9IHRoaXMuI21hcEhhc2hlci5nZXRIYXNoKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSk7XG4gICAgaWYgKCF0aGlzLiNvdXRlck1hcC5oYXMoX19tYXBIYXNoX18pKVxuICAgICAgdGhpcy4jb3V0ZXJNYXAuc2V0KF9fbWFwSGFzaF9fLCBuZXcgTWFwKTtcblxuICAgIGNvbnN0IF9faW5uZXJNYXBfXyA9IHRoaXMuI291dGVyTWFwLmdldChfX21hcEhhc2hfXyk7XG5cbiAgICBpZiAoIV9faW5uZXJNYXBfXy5oYXMoJHtkZWZpbmVzLmdldChcInNldEFyZ3VtZW50MFwiKX0pKSB7XG4gICAgICBfX2lubmVyTWFwX18uc2V0KCR7ZGVmaW5lcy5nZXQoXCJzZXRBcmd1bWVudDBcIil9LCBPYmplY3QuZnJlZXplKFske2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX1dKSk7XG4gICAgICB0aGlzLiNzaXplT2ZBbGwrKztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImFkZFNldHNcIiwgMil9XG4gIGFkZFNldHMoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCBfX3NldHNfXykgeyR7aW52b2tlTWFwVmFsaWRhdGV9XG4gICAgY29uc3QgX19hcnJheV9fID0gQXJyYXkuZnJvbShfX3NldHNfXykubWFwKChfX3NldF9fLCBfX2luZGV4X18pID0+IHtcbiAgICAgIF9fc2V0X18gPSBBcnJheS5mcm9tKF9fc2V0X18pO1xuICAgICAgaWYgKF9fc2V0X18ubGVuZ3RoICE9PSAke2RlZmluZXMuZ2V0KFwic2V0Q291bnRcIil9KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcXGBTZXQgYXQgaW5kZXggXFwke19faW5kZXhfX30gZG9lc24ndCBoYXZlIGV4YWN0bHkgJHtkZWZpbmVzLmdldChcInNldENvdW50XCIpfSBhcmd1bWVudCR7XG4gICAgICAgICAgZGVmaW5lcy5nZXQoXCJzZXRDb3VudFwiKSEgPiAxID8gXCJzXCIgOiBcIlwiXG4gICAgICAgIH0hXFxgKTtcbiAgICAgIH1cbiAgICAgICR7ZGVmaW5lcy5oYXMoXCJpbnZva2VWYWxpZGF0ZVwiKSA/IGB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCAuLi5fX3NldF9fKTtgIDogXCJcIn1cblxuICAgICAgcmV0dXJuIF9fc2V0X187XG4gICAgfSk7XG5cbiAgICBjb25zdCBfX21hcEhhc2hfXyA9IHRoaXMuI21hcEhhc2hlci5nZXRIYXNoKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSk7XG4gICAgaWYgKCF0aGlzLiNvdXRlck1hcC5oYXMoX19tYXBIYXNoX18pKVxuICAgICAgdGhpcy4jb3V0ZXJNYXAuc2V0KF9fbWFwSGFzaF9fLCBuZXcgTWFwKTtcblxuICAgIGNvbnN0IF9faW5uZXJNYXBfXyA9IHRoaXMuI291dGVyTWFwLmdldChfX21hcEhhc2hfXyk7XG4gICAgY29uc3QgX19tYXBBcmdzX18gPSBbJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9XTtcblxuICAgIF9fYXJyYXlfXy5mb3JFYWNoKF9fc2V0X18gPT4ge1xuICAgICAgaWYgKCFfX2lubmVyTWFwX18uaGFzKF9fc2V0X19bMF0pKSB7XG4gICAgICAgIF9faW5uZXJNYXBfXy5zZXQoX19zZXRfX1swXSwgT2JqZWN0LmZyZWV6ZShfX21hcEFyZ3NfXy5jb25jYXQoX19zZXRfXykpKTtcbiAgICAgICAgdGhpcy4jc2l6ZU9mQWxsKys7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImNsZWFyXCIsIDIpfVxuICBjbGVhcigpIHtcbiAgICB0aGlzLiNvdXRlck1hcC5jbGVhcigpO1xuICAgIHRoaXMuI3NpemVPZkFsbCA9IDA7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJjbGVhclNldHNcIiwgMil9XG4gIGNsZWFyU2V0cygke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IFtfX2lubmVyTWFwX19dID0gdGhpcy4jZ2V0SW5uZXJNYXAoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybjtcblxuICAgIHRoaXMuI3NpemVPZkFsbCAtPSBfX2lubmVyTWFwX18uc2l6ZTtcbiAgICBfX2lubmVyTWFwX18uY2xlYXIoKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImRlbGV0ZVwiLCAyKX1cbiAgZGVsZXRlKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KSB7JHtpbnZva2VWYWxpZGF0ZX1cbiAgICBjb25zdCBbX19pbm5lck1hcF9fLCBfX21hcEhhc2hfX10gPSB0aGlzLiNnZXRJbm5lck1hcCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgaWYgKCFfX2lubmVyTWFwX18uaGFzKCR7ZGVmaW5lcy5nZXQoXCJzZXRBcmd1bWVudDBcIil9KSlcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIF9faW5uZXJNYXBfXy5kZWxldGUoJHtkZWZpbmVzLmdldChcInNldEFyZ3VtZW50MFwiKX0pO1xuICAgIHRoaXMuI3NpemVPZkFsbC0tO1xuXG4gICAgaWYgKF9faW5uZXJNYXBfXy5zaXplID09PSAwKSB7XG4gICAgICB0aGlzLiNvdXRlck1hcC5kZWxldGUoX19tYXBIYXNoX18pO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZGVsZXRlU2V0c1wiLCAyKX1cbiAgZGVsZXRlU2V0cygke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IFtfX2lubmVyTWFwX18sIF9fbWFwSGFzaF9fXSA9IHRoaXMuI2dldElubmVyTWFwKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSk7XG4gICAgaWYgKCFfX2lubmVyTWFwX18pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICB0aGlzLiNvdXRlck1hcC5kZWxldGUoX19tYXBIYXNoX18pO1xuICAgIHRoaXMuI3NpemVPZkFsbCAtPSBfX2lubmVyTWFwX18uc2l6ZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImZvckVhY2hTZXRcIiwgMil9XG4gIGZvckVhY2goX19jYWxsYmFja19fLCBfX3RoaXNBcmdfXykge1xuICAgIHRoaXMuI291dGVyTWFwLmZvckVhY2goXG4gICAgICBfX2lubmVyTWFwX18gPT4gX19pbm5lck1hcF9fLmZvckVhY2goXG4gICAgICAgIF9fa2V5U2V0X18gPT4gX19jYWxsYmFja19fLmFwcGx5KF9fdGhpc0FyZ19fLCBfX2tleVNldF9fLmNvbmNhdCh0aGlzKSlcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZm9yRWFjaE1hcFNldFwiLCAyKX1cbiAgZm9yRWFjaFNldCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0sIF9fY2FsbGJhY2tfXywgX190aGlzQXJnX18pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IFtfX2lubmVyTWFwX19dID0gdGhpcy4jZ2V0SW5uZXJNYXAoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybjtcblxuICAgIF9faW5uZXJNYXBfXy5mb3JFYWNoKFxuICAgICAgX19rZXlTZXRfXyA9PiBfX2NhbGxiYWNrX18uYXBwbHkoX190aGlzQXJnX18sIF9fa2V5U2V0X18uY29uY2F0KHRoaXMpKVxuICAgICk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJmb3JFYWNoQ2FsbGJhY2tTZXRcIiwgMil9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaGFzXCIsIDIpfVxuICBoYXMoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCAke2RlZmluZXMuZ2V0KFwic2V0QXJnTGlzdFwiKX0pIHske2ludm9rZVZhbGlkYXRlfVxuICAgIGNvbnN0IFtfX2lubmVyTWFwX19dID0gdGhpcy4jZ2V0SW5uZXJNYXAoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIHJldHVybiBfX2lubmVyTWFwX18uaGFzKCR7ZGVmaW5lcy5nZXQoXCJzZXRBcmd1bWVudDBcIil9KTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImhhc1NldFwiLCAyKX1cbiAgaGFzU2V0cygke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IFtfX2lubmVyTWFwX19dID0gdGhpcy4jZ2V0SW5uZXJNYXAoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcbiAgICByZXR1cm4gQm9vbGVhbihfX2lubmVyTWFwX18pO1xuICB9XG5cbiR7ZGVmaW5lcy5oYXMoXCJ2YWxpZGF0ZUFyZ3VtZW50c1wiKSA/IGBcbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZEtleVB1YmxpY1wiLCAyKX1cbiAgaXNWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pIHtcbiAgICByZXR1cm4gdGhpcy4jaXNWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pO1xuICB9XG5cbiAgYCA6IGBgfVxuJHtkb2NzLmJ1aWxkQmxvY2soXCJ2YWx1ZXNcIiwgMil9XG4gICogdmFsdWVzKCkge1xuICAgIGNvbnN0IF9fb3V0ZXJJdGVyX18gPSB0aGlzLiNvdXRlck1hcC52YWx1ZXMoKTtcblxuICAgIGZvciAobGV0IF9faW5uZXJNYXBfXyBvZiBfX291dGVySXRlcl9fKSB7XG4gICAgICBmb3IgKGxldCBfX3ZhbHVlX18gb2YgX19pbm5lck1hcF9fLnZhbHVlcygpKVxuICAgICAgICB5aWVsZCBfX3ZhbHVlX187XG4gICAgfVxuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwidmFsdWVzU2V0XCIsIDIpfVxuICAqIHZhbHVlc1NldCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IFtfX2lubmVyTWFwX19dID0gdGhpcy4jZ2V0SW5uZXJNYXAoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybjtcblxuICAgIGZvciAobGV0IF9fdmFsdWVfXyBvZiBfX2lubmVyTWFwX18udmFsdWVzKCkpXG4gICAgICB5aWVsZCBfX3ZhbHVlX187XG4gIH1cblxuICAjZ2V0SW5uZXJNYXAoLi4uX19tYXBBcmd1bWVudHNfXykge1xuICAgIGNvbnN0IF9faGFzaF9fID0gdGhpcy4jbWFwSGFzaGVyLmdldEhhc2hJZkV4aXN0cyguLi5fX21hcEFyZ3VtZW50c19fKTtcbiAgICByZXR1cm4gX19oYXNoX18gPyBbdGhpcy4jb3V0ZXJNYXAuZ2V0KF9faGFzaF9fKSwgX19oYXNoX19dIDogW251bGxdO1xuICB9XG5cbiR7ZGVmaW5lcy5oYXMoXCJ2YWxpZGF0ZUFyZ3VtZW50c1wiKSA/IGBcbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZVZhbGlkS2V5XCIsIDIpfVxuICAgICNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KSB7XG4gICAgICBpZiAoIXRoaXMuI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIG9yZGVyZWQga2V5IHNldCBpcyBub3QgdmFsaWQhXCIpO1xuICAgIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHJpdmF0ZVwiLCAyKX1cbiAgICAjaXNWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwiYXJnTGlzdFwiKX0pIHtcbiAgICAgIHZvaWQoJHtkZWZpbmVzLmdldChcImFyZ0xpc3RcIil9KTtcblxuICAgICAgJHtkZWZpbmVzLmdldChcInZhbGlkYXRlQXJndW1lbnRzXCIpfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gIGAgOiBgYH1cblxuJHtkZWZpbmVzLmhhcyhcInZhbGlkYXRlTWFwQXJndW1lbnRzXCIpID8gYFxuJHtkb2NzLmJ1aWxkQmxvY2soXCJyZXF1aXJlVmFsaWRNYXBLZXlcIiwgMil9XG4gICNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KSB7XG4gICAgaWYgKCF0aGlzLiNpc1ZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgb3JkZXJlZCBtYXAga2V5IHNldCBpcyBub3QgdmFsaWQhXCIpO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZE1hcEtleVByaXZhdGVcIiwgMil9XG4gICNpc1ZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSkge1xuICAgIHZvaWQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcblxuICAgICR7ZGVmaW5lcy5nZXQoXCJ2YWxpZGF0ZU1hcEFyZ3VtZW50c1wiKSB8fCBcIlwifVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgYCA6IGBgfVxuXG4gIFtTeW1ib2wuaXRlcmF0b3JdKCkge1xuICAgIHJldHVybiB0aGlzLnZhbHVlcygpO1xuICB9XG5cbiAgW1N5bWJvbC50b1N0cmluZ1RhZ10gPSBcIiR7ZGVmaW5lcy5nZXQoXCJjbGFzc05hbWVcIil9XCI7XG59XG5cbk9iamVjdC5mcmVlemUoJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX0pO1xuT2JqZWN0LmZyZWV6ZSgke2RlZmluZXMuZ2V0KFwiY2xhc3NOYW1lXCIpfS5wcm90b3R5cGUpO1xuYH1cblxuZXhwb3J0IGRlZmF1bHQgcHJlcHJvY2VzcztcbiJdfQ==