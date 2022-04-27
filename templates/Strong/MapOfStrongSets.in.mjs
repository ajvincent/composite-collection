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
  getSizeOfSet(${defines.mapKeys.join(", ")}) {${invokeMapValidate}
    const [__innerMap__] = this.#getInnerMap(${defines.mapKeys.join(", ")});
    return __innerMap__ ? __innerMap__.size : 0;
  }

${docs.buildBlock("mapSize", 2)}
  get mapSize() {
    return this.#outerMap.size;
  }

${docs.buildBlock("add", 2)}
  add(${defines.mapKeys.join(", ")}, ${defines.setKeys}) {${invokeValidate}
    const __mapHash__ = this.#mapHasher.getHash(${defines.mapKeys.join(", ")});
    if (!this.#outerMap.has(__mapHash__))
      this.#outerMap.set(__mapHash__, new Map);

    const __innerMap__ = this.#outerMap.get(__mapHash__);

    const __setHash__ = this.#setHasher.getHash(${defines.setKeys});
    if (!__innerMap__.has(__setHash__)) {
      __innerMap__.set(__setHash__, Object.freeze([${defines.argList}]));
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

    const __setHash__ = this.#setHasher.getHashIfExists(${defines.setKeys});
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

    const __setHash__ = this.#setHasher.getHashIfExists(${defines.setKeys});
    return __setHash__ ? __innerMap__.has(__setHash__) : false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFwT2ZTdHJvbmdTZXRzLmluLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1hcE9mU3Ryb25nU2V0cy5pbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxHQUFxQixTQUFTLFVBQVUsQ0FBQyxPQUF3QixFQUFFLElBQW9CO0lBQ3JHLElBQUksY0FBYyxHQUFHLEVBQUUsRUFBRSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7SUFDaEQsSUFBSSxPQUFPLENBQUMsY0FBYyxFQUFFO1FBQzFCLGNBQWMsR0FBRywrQkFBK0IsT0FBTyxDQUFDLE9BQU8sTUFBTSxDQUFDO0tBQ3ZFO0lBQ0QsSUFBSSxPQUFPLENBQUMsb0JBQW9CLEVBQUU7UUFDaEMsaUJBQWlCLEdBQUcsa0NBQWtDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7S0FDeEY7SUFFRCxPQUFPO0VBQ1AsT0FBTyxDQUFDLFdBQVc7OztRQUdiLE9BQU8sQ0FBQyxTQUFTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUF3QnZCLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQzs7Ozs7RUFLN0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO2lCQUNuQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxpQkFBaUI7K0NBQ25CLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs7OztFQUl2RSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7Ozs7O0VBSzdCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxPQUFPLENBQUMsT0FBTyxNQUFNLGNBQWM7a0RBQ3hCLE9B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QyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs7TUFFL0IsT0FBTyxDQUFDLG9CQUFvQixJQUFJLEVBQUU7Ozs7R0FJckMsQ0FBQyxDQUFDLENBQUMsRUFBRTs7Ozs7OzRCQU1vQixPQUFPLENBQUMsU0FBUzs7O2dCQUc3QixPQUFPLENBQUMsU0FBUztnQkFDakIsT0FBTyxDQUFDLFNBQVM7Q0FDaEMsQ0FBQTtBQUFBLENBQUMsQ0FBQTtBQUVGLGVBQWUsVUFBVSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBSZWFkb25seURlZmluZXMsIEpTRG9jR2VuZXJhdG9yLCBUZW1wbGF0ZUZ1bmN0aW9uIH0gZnJvbSBcIi4uL3NoYXJlZFR5cGVzLm1qc1wiO1xuXG4vKipcbiAqIEBwYXJhbSB7TWFwfSAgICAgICAgICAgIGRlZmluZXMgVGhlIHByZXByb2Nlc3NvciBtYWNyb3MuXG4gKiBAcGFyYW0ge0pTRG9jR2VuZXJhdG9yfSBkb2NzICAgIFRoZSBwcmltYXJ5IGRvY3VtZW50YXRpb24gZ2VuZXJhdG9yLlxuICogQHJldHVybnMge3N0cmluZ30gICAgICAgICAgICAgICBUaGUgZ2VuZXJhdGVkIHNvdXJjZSBjb2RlLlxuICovXG5jb25zdCBwcmVwcm9jZXNzOiBUZW1wbGF0ZUZ1bmN0aW9uID0gZnVuY3Rpb24gcHJlcHJvY2VzcyhkZWZpbmVzOiBSZWFkb25seURlZmluZXMsIGRvY3M6IEpTRG9jR2VuZXJhdG9yKSB7XG4gIGxldCBpbnZva2VWYWxpZGF0ZSA9IFwiXCIsIGludm9rZU1hcFZhbGlkYXRlID0gXCJcIjtcbiAgaWYgKGRlZmluZXMuaW52b2tlVmFsaWRhdGUpIHtcbiAgICBpbnZva2VWYWxpZGF0ZSA9IGBcXG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5hcmdMaXN0fSk7XFxuYDtcbiAgfVxuICBpZiAoZGVmaW5lcy52YWxpZGF0ZU1hcEFyZ3VtZW50cykge1xuICAgIGludm9rZU1hcFZhbGlkYXRlID0gYFxcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XFxuYDtcbiAgfVxuXG4gIHJldHVybiBgXG4ke2RlZmluZXMuaW1wb3J0TGluZXN9XG5pbXBvcnQgS2V5SGFzaGVyIGZyb20gXCIuL2tleXMvSGFzaGVyLm1qc1wiO1xuXG5jbGFzcyAke2RlZmluZXMuY2xhc3NOYW1lfSB7XG4gIC8qKiBAdHlwZWRlZiB7c3RyaW5nfSBoYXNoICovXG5cbiAgLyoqIEB0eXBlIHtNYXA8aGFzaCwgTWFwPGhhc2gsICpbXT4+fSBAY29uc3RhbnQgKi9cbiAgI291dGVyTWFwID0gbmV3IE1hcCgpO1xuXG4gIC8qKiBAdHlwZSB7S2V5SGFzaGVyfSBAY29uc3RhbnQgKi9cbiAgI21hcEhhc2hlciA9IG5ldyBLZXlIYXNoZXIoKTtcblxuICAvKiogQHR5cGUge0tleUhhc2hlcn0gQGNvbnN0YW50ICovXG4gICNzZXRIYXNoZXIgPSBuZXcgS2V5SGFzaGVyKCk7XG5cbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICNzaXplT2ZBbGwgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgaXRlcmFibGUgPSBhcmd1bWVudHNbMF07XG4gICAgICBmb3IgKGxldCBlbnRyeSBvZiBpdGVyYWJsZSkge1xuICAgICAgICB0aGlzLmFkZCguLi5lbnRyeSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZ2V0U2l6ZVwiLCAyKX1cbiAgZ2V0IHNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuI3NpemVPZkFsbDtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImdldFNpemVPZlNldFwiLCAyKX1cbiAgZ2V0U2l6ZU9mU2V0KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IFtfX2lubmVyTWFwX19dID0gdGhpcy4jZ2V0SW5uZXJNYXAoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgcmV0dXJuIF9faW5uZXJNYXBfXyA/IF9faW5uZXJNYXBfXy5zaXplIDogMDtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcIm1hcFNpemVcIiwgMil9XG4gIGdldCBtYXBTaXplKCkge1xuICAgIHJldHVybiB0aGlzLiNvdXRlck1hcC5zaXplO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiYWRkXCIsIDIpfVxuICBhZGQoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSwgJHtkZWZpbmVzLnNldEtleXN9KSB7JHtpbnZva2VWYWxpZGF0ZX1cbiAgICBjb25zdCBfX21hcEhhc2hfXyA9IHRoaXMuI21hcEhhc2hlci5nZXRIYXNoKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xuICAgIGlmICghdGhpcy4jb3V0ZXJNYXAuaGFzKF9fbWFwSGFzaF9fKSlcbiAgICAgIHRoaXMuI291dGVyTWFwLnNldChfX21hcEhhc2hfXywgbmV3IE1hcCk7XG5cbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNvdXRlck1hcC5nZXQoX19tYXBIYXNoX18pO1xuXG4gICAgY29uc3QgX19zZXRIYXNoX18gPSB0aGlzLiNzZXRIYXNoZXIuZ2V0SGFzaCgke2RlZmluZXMuc2V0S2V5c30pO1xuICAgIGlmICghX19pbm5lck1hcF9fLmhhcyhfX3NldEhhc2hfXykpIHtcbiAgICAgIF9faW5uZXJNYXBfXy5zZXQoX19zZXRIYXNoX18sIE9iamVjdC5mcmVlemUoWyR7ZGVmaW5lcy5hcmdMaXN0fV0pKTtcbiAgICAgIHRoaXMuI3NpemVPZkFsbCsrO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiYWRkU2V0c1wiLCAyKX1cbiAgYWRkU2V0cygke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCBfX3NldHNfXykgeyR7aW52b2tlTWFwVmFsaWRhdGV9XG4gICAgY29uc3QgX19hcnJheV9fID0gQXJyYXkuZnJvbShfX3NldHNfXykubWFwKChfX3NldF9fLCBfX2luZGV4X18pID0+IHtcbiAgICAgIF9fc2V0X18gPSBBcnJheS5mcm9tKF9fc2V0X18pO1xuICAgICAgaWYgKF9fc2V0X18ubGVuZ3RoICE9PSAke2RlZmluZXMuc2V0S2V5cy5sZW5ndGh9KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcXGBTZXQgYXQgaW5kZXggXFwke19faW5kZXhfX30gZG9lc24ndCBoYXZlIGV4YWN0bHkgJHtkZWZpbmVzLnNldEtleXMubGVuZ3RofSBhcmd1bWVudCR7XG4gICAgICAgICAgZGVmaW5lcy5zZXRLZXlzLmxlbmd0aCA+IDEgPyBcInNcIiA6IFwiXCJcbiAgICAgICAgfSFcXGApO1xuICAgICAgfVxuICAgICAgJHtkZWZpbmVzLmludm9rZVZhbGlkYXRlID8gYHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAuLi5fX3NldF9fKTtgIDogXCJcIn1cblxuICAgICAgcmV0dXJuIF9fc2V0X187XG4gICAgfSk7XG5cbiAgICBjb25zdCBfX21hcEhhc2hfXyA9IHRoaXMuI21hcEhhc2hlci5nZXRIYXNoKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xuICAgIGlmICghdGhpcy4jb3V0ZXJNYXAuaGFzKF9fbWFwSGFzaF9fKSlcbiAgICAgIHRoaXMuI291dGVyTWFwLnNldChfX21hcEhhc2hfXywgbmV3IE1hcCk7XG5cbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNvdXRlck1hcC5nZXQoX19tYXBIYXNoX18pO1xuICAgIGNvbnN0IF9fbWFwQXJnc19fID0gWyR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX1dO1xuXG4gICAgX19hcnJheV9fLmZvckVhY2goX19zZXRfXyA9PiB7XG4gICAgICBjb25zdCBfX3NldEhhc2hfXyA9IHRoaXMuI3NldEhhc2hlci5nZXRIYXNoKC4uLl9fc2V0X18pO1xuICAgICAgaWYgKCFfX2lubmVyTWFwX18uaGFzKF9fc2V0SGFzaF9fKSkge1xuICAgICAgICBfX2lubmVyTWFwX18uc2V0KF9fc2V0SGFzaF9fLCBPYmplY3QuZnJlZXplKF9fbWFwQXJnc19fLmNvbmNhdChfX3NldF9fKSkpO1xuICAgICAgICB0aGlzLiNzaXplT2ZBbGwrKztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiY2xlYXJcIiwgMil9XG4gIGNsZWFyKCkge1xuICAgIHRoaXMuI291dGVyTWFwLmNsZWFyKCk7XG4gICAgdGhpcy4jc2l6ZU9mQWxsID0gMDtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImNsZWFyU2V0c1wiLCAyKX1cbiAgY2xlYXJTZXRzKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IFtfX2lubmVyTWFwX19dID0gdGhpcy4jZ2V0SW5uZXJNYXAoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgaWYgKCFfX2lubmVyTWFwX18pXG4gICAgICByZXR1cm47XG5cbiAgICB0aGlzLiNzaXplT2ZBbGwgLT0gX19pbm5lck1hcF9fLnNpemU7XG4gICAgX19pbm5lck1hcF9fLmNsZWFyKCk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJkZWxldGVcIiwgMil9XG4gIGRlbGV0ZSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAke2RlZmluZXMuc2V0S2V5c30pIHske2ludm9rZVZhbGlkYXRlfVxuICAgIGNvbnN0IFtfX2lubmVyTWFwX18sIF9fbWFwSGFzaF9fXSA9IHRoaXMuI2dldElubmVyTWFwKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgX19zZXRIYXNoX18gPSB0aGlzLiNzZXRIYXNoZXIuZ2V0SGFzaElmRXhpc3RzKCR7ZGVmaW5lcy5zZXRLZXlzfSk7XG4gICAgaWYgKCFfX3NldEhhc2hfXyB8fCAhX19pbm5lck1hcF9fLmhhcyhfX3NldEhhc2hfXykpXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBfX2lubmVyTWFwX18uZGVsZXRlKF9fc2V0SGFzaF9fKTtcbiAgICB0aGlzLiNzaXplT2ZBbGwtLTtcblxuICAgIGlmIChfX2lubmVyTWFwX18uc2l6ZSA9PT0gMCkge1xuICAgICAgdGhpcy4jb3V0ZXJNYXAuZGVsZXRlKF9fbWFwSGFzaF9fKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImRlbGV0ZVNldHNcIiwgMil9XG4gIGRlbGV0ZVNldHMoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSkgeyR7aW52b2tlTWFwVmFsaWRhdGV9XG4gICAgY29uc3QgW19faW5uZXJNYXBfXywgX19tYXBIYXNoX19dID0gdGhpcy4jZ2V0SW5uZXJNYXAoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgaWYgKCFfX2lubmVyTWFwX18pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICB0aGlzLiNvdXRlck1hcC5kZWxldGUoX19tYXBIYXNoX18pO1xuICAgIHRoaXMuI3NpemVPZkFsbCAtPSBfX2lubmVyTWFwX18uc2l6ZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImZvckVhY2hTZXRcIiwgMil9XG4gIGZvckVhY2goX19jYWxsYmFja19fLCBfX3RoaXNBcmdfXykge1xuICAgIHRoaXMuI291dGVyTWFwLmZvckVhY2goXG4gICAgICBfX2lubmVyTWFwX18gPT4gX19pbm5lck1hcF9fLmZvckVhY2goXG4gICAgICAgIF9fa2V5U2V0X18gPT4gX19jYWxsYmFja19fLmFwcGx5KF9fdGhpc0FyZ19fLCBfX2tleVNldF9fLmNvbmNhdCh0aGlzKSlcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZm9yRWFjaE1hcFNldFwiLCAyKX1cbiAgZm9yRWFjaFNldCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCBfX2NhbGxiYWNrX18sIF9fdGhpc0FyZ19fKSB7JHtpbnZva2VNYXBWYWxpZGF0ZX1cbiAgICBjb25zdCBbX19pbm5lck1hcF9fXSA9IHRoaXMuI2dldElubmVyTWFwKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuO1xuXG4gICAgX19pbm5lck1hcF9fLmZvckVhY2goXG4gICAgICBfX2tleVNldF9fID0+IF9fY2FsbGJhY2tfXy5hcHBseShfX3RoaXNBcmdfXywgX19rZXlTZXRfXy5jb25jYXQodGhpcykpXG4gICAgKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImZvckVhY2hDYWxsYmFja1NldFwiLCAyKX1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJoYXNcIiwgMil9XG4gIGhhcygke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAke2RlZmluZXMuc2V0S2V5c30pIHske2ludm9rZVZhbGlkYXRlfVxuICAgIGNvbnN0IFtfX2lubmVyTWFwX19dID0gdGhpcy4jZ2V0SW5uZXJNYXAoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgaWYgKCFfX2lubmVyTWFwX18pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBfX3NldEhhc2hfXyA9IHRoaXMuI3NldEhhc2hlci5nZXRIYXNoSWZFeGlzdHMoJHtkZWZpbmVzLnNldEtleXN9KTtcbiAgICByZXR1cm4gX19zZXRIYXNoX18gPyBfX2lubmVyTWFwX18uaGFzKF9fc2V0SGFzaF9fKSA6IGZhbHNlO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaGFzU2V0XCIsIDIpfVxuICBoYXNTZXRzKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IFtfX2lubmVyTWFwX19dID0gdGhpcy4jZ2V0SW5uZXJNYXAoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgcmV0dXJuIEJvb2xlYW4oX19pbm5lck1hcF9fKTtcbiAgfVxuXG4ke2RlZmluZXMudmFsaWRhdGVBcmd1bWVudHMgPyBgXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRLZXlQdWJsaWNcIiwgMil9XG4gIGlzVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KSB7XG4gICAgcmV0dXJuIHRoaXMuI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KTtcbiAgfVxuXG4gIGAgOiBgYH1cbiR7ZG9jcy5idWlsZEJsb2NrKFwidmFsdWVzXCIsIDIpfVxuICAqIHZhbHVlcygpIHtcbiAgICBjb25zdCBfX291dGVySXRlcl9fID0gdGhpcy4jb3V0ZXJNYXAudmFsdWVzKCk7XG5cbiAgICBmb3IgKGxldCBfX2lubmVyTWFwX18gb2YgX19vdXRlckl0ZXJfXykge1xuICAgICAgZm9yIChsZXQgX192YWx1ZV9fIG9mIF9faW5uZXJNYXBfXy52YWx1ZXMoKSlcbiAgICAgICAgeWllbGQgX192YWx1ZV9fO1xuICAgIH1cbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcInZhbHVlc1NldFwiLCAyKX1cbiAgKiB2YWx1ZXNTZXQoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSkgeyR7aW52b2tlTWFwVmFsaWRhdGV9XG4gICAgY29uc3QgW19faW5uZXJNYXBfX10gPSB0aGlzLiNnZXRJbm5lck1hcCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybjtcblxuICAgIGZvciAobGV0IF9fdmFsdWVfXyBvZiBfX2lubmVyTWFwX18udmFsdWVzKCkpXG4gICAgICB5aWVsZCBfX3ZhbHVlX187XG4gIH1cblxuICAjZ2V0SW5uZXJNYXAoLi4uX19tYXBBcmd1bWVudHNfXykge1xuICAgIGNvbnN0IF9faGFzaF9fID0gdGhpcy4jbWFwSGFzaGVyLmdldEhhc2hJZkV4aXN0cyguLi5fX21hcEFyZ3VtZW50c19fKTtcbiAgICByZXR1cm4gX19oYXNoX18gPyBbdGhpcy4jb3V0ZXJNYXAuZ2V0KF9faGFzaF9fKSwgX19oYXNoX19dIDogW251bGxdO1xuICB9XG5cbiR7ZGVmaW5lcy52YWxpZGF0ZUFyZ3VtZW50cyA/IGBcbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZVZhbGlkS2V5XCIsIDIpfVxuICAgICNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KSB7XG4gICAgICBpZiAoIXRoaXMuI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIG9yZGVyZWQga2V5IHNldCBpcyBub3QgdmFsaWQhXCIpO1xuICAgIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHJpdmF0ZVwiLCAyKX1cbiAgICAjaXNWYWxpZEtleSgke2RlZmluZXMuYXJnTGlzdH0pIHtcbiAgICAgIHZvaWQoJHtkZWZpbmVzLmFyZ0xpc3R9KTtcblxuICAgICAgJHtkZWZpbmVzLnZhbGlkYXRlQXJndW1lbnRzfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gIGAgOiBgYH1cblxuJHtkZWZpbmVzLnZhbGlkYXRlTWFwQXJndW1lbnRzID8gYFxuJHtkb2NzLmJ1aWxkQmxvY2soXCJyZXF1aXJlVmFsaWRNYXBLZXlcIiwgMil9XG4gICNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSkge1xuICAgIGlmICghdGhpcy4jaXNWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBvcmRlcmVkIG1hcCBrZXkgc2V0IGlzIG5vdCB2YWxpZCFcIik7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkTWFwS2V5UHJpdmF0ZVwiLCAyKX1cbiAgI2lzVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSkge1xuICAgIHZvaWQoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG5cbiAgICAke2RlZmluZXMudmFsaWRhdGVNYXBBcmd1bWVudHMgfHwgXCJcIn1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGAgOiBgYH1cblxuICBbU3ltYm9sLml0ZXJhdG9yXSgpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZXMoKTtcbiAgfVxuXG4gIFtTeW1ib2wudG9TdHJpbmdUYWddID0gXCIke2RlZmluZXMuY2xhc3NOYW1lfVwiO1xufVxuXG5PYmplY3QuZnJlZXplKCR7ZGVmaW5lcy5jbGFzc05hbWV9KTtcbk9iamVjdC5mcmVlemUoJHtkZWZpbmVzLmNsYXNzTmFtZX0ucHJvdG90eXBlKTtcbmB9XG5cbmV4cG9ydCBkZWZhdWx0IHByZXByb2Nlc3M7XG4iXX0=