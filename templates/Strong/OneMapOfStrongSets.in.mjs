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

  /** @type {Map<${defines.mapArgument0Type}, Map<hash, *[]>>} @constant */
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
  getSizeOfSet(${defines.mapKeys[0]}) {${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${defines.mapKeys[0]})
    return __innerMap__?.size || 0;
  }

${docs.buildBlock("mapSize", 2)}
  get mapSize() {
    return this.#outerMap.size;
  }

${docs.buildBlock("add", 2)}
  add(${defines.mapKeys[0]}, ${defines.setKeys}) {${invokeValidate}
    if (!this.#outerMap.has(${defines.mapKeys[0]}))
      this.#outerMap.set(${defines.mapKeys[0]}, new Map);

    const __innerMap__ = this.#outerMap.get(${defines.mapKeys[0]});

    const __setHash__ = this.#setHasher.getHash(${defines.setKeys});
    if (!__innerMap__.has(__setHash__)) {
      __innerMap__.set(__setHash__, Object.freeze([${defines.argList}]));
      this.#sizeOfAll++;
    }

    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.mapKeys[0]}, __sets__) {${invokeMapValidate}
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.setKeys.length}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.setKeys.length} argument${defines.setKeys.length > 1 ? "s" : ""}!\`);
      }
      ${defines.invokeValidate ? `this.#requireValidKey(${defines.mapKeys[0]}, ...__set__);` : ""}

      return __set__;
    });

    if (!this.#outerMap.has(${defines.mapKeys[0]}))
      this.#outerMap.set(${defines.mapKeys[0]}, new Map);

    const __innerMap__ = this.#outerMap.get(${defines.mapKeys[0]});
    const __mapArgs__ = [${defines.mapKeys[0]}];

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
  clearSets(${defines.mapKeys[0]}) {${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${defines.mapKeys[0]})
    if (!__innerMap__)
      return;

    this.#sizeOfAll -= __innerMap__.size;
    __innerMap__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.mapKeys[0]}, ${defines.setKeys}) {${invokeValidate}
    const __innerMap__ = this.#outerMap.get(${defines.mapKeys[0]})
    if (!__innerMap__)
      return false;

    const __setHash__ = this.#setHasher.getHashIfExists(${defines.setKeys});
    if (!__setHash__ || !__innerMap__.has(__setHash__))
      return false;

    __innerMap__.delete(__setHash__);
    this.#sizeOfAll--;

    if (__innerMap__.size === 0) {
      this.#outerMap.delete(${defines.mapKeys[0]});
    }

    return true;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.mapKeys[0]}) {${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${defines.mapKeys[0]})
    if (!__innerMap__)
      return false;

    this.#outerMap.delete(${defines.mapKeys[0]});
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
  forEachSet(${defines.mapKeys[0]}, __callback__, __thisArg__) {${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${defines.mapKeys[0]})
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, __keySet__.concat(this))
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("has", 2)}
  has(${defines.mapKeys[0]}, ${defines.setKeys}) {${invokeValidate}
    const __innerMap__ = this.#outerMap.get(${defines.mapKeys[0]})
    if (!__innerMap__)
      return false;

    const __setHash__ = this.#setHasher.getHashIfExists(${defines.setKeys});
    return __setHash__ ? __innerMap__.has(__setHash__) : false;
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.mapKeys[0]}) {${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${defines.mapKeys[0]})
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
  * valuesSet(${defines.mapKeys[0]}) {${invokeMapValidate}
    const __innerMap__ = this.#outerMap.get(${defines.mapKeys[0]})
    if (!__innerMap__)
      return;

    for (let __value__ of __innerMap__.values())
      yield __value__;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT25lTWFwT2ZTdHJvbmdTZXRzLmluLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk9uZU1hcE9mU3Ryb25nU2V0cy5pbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxHQUFxQixTQUFTLFVBQVUsQ0FBQyxPQUF3QixFQUFFLElBQW9CO0lBQ3JHLElBQUksY0FBYyxHQUFHLEVBQUUsRUFBRSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7SUFDaEQsSUFBSSxPQUFPLENBQUMsY0FBYyxFQUFFO1FBQzFCLGNBQWMsR0FBRywrQkFBK0IsT0FBTyxDQUFDLE9BQU8sTUFBTSxDQUFDO0tBQ3ZFO0lBQ0QsSUFBSSxPQUFPLENBQUMsb0JBQW9CLEVBQUU7UUFDaEMsaUJBQWlCLEdBQUcsa0NBQWtDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7S0FDeEY7SUFFRCxPQUFPO0VBQ1AsT0FBTyxDQUFDLFdBQVc7OztRQUdiLE9BQU8sQ0FBQyxTQUFTOzs7bUJBR04sT0FBTyxDQUFDLGdCQUFnQjs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBa0J6QyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7Ozs7O0VBSzdCLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztpQkFDbkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxpQkFBaUI7OENBQ1osT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Ozs7RUFJOUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDOzs7OztFQUs3QixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDbkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLENBQUMsT0FBTyxNQUFNLGNBQWM7OEJBQ3BDLE9BQU8sQ0FB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QU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs7TUFFL0IsT0FBTyxDQUFDLG9CQUFvQixJQUFJLEVBQUU7OztHQUdyQyxDQUFDLENBQUMsQ0FBQyxFQUFFOzs7Ozs7NEJBTW9CLE9BQU8sQ0FBQyxTQUFTOzs7O2dCQUk3QixPQUFPLENBQUMsU0FBUztnQkFDakIsT0FBTyxDQUFDLFNBQVM7Q0FDaEMsQ0FBQTtBQUFBLENBQUMsQ0FBQTtBQUVGLGVBQWUsVUFBVSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBSZWFkb25seURlZmluZXMsIEpTRG9jR2VuZXJhdG9yLCBUZW1wbGF0ZUZ1bmN0aW9uIH0gZnJvbSBcIi4uL3NoYXJlZFR5cGVzLm1qc1wiO1xuXG4vKipcbiAqIEBwYXJhbSB7TWFwfSAgICAgICAgICAgIGRlZmluZXMgVGhlIHByZXByb2Nlc3NvciBtYWNyb3MuXG4gKiBAcGFyYW0ge0pTRG9jR2VuZXJhdG9yfSBkb2NzICAgIFRoZSBwcmltYXJ5IGRvY3VtZW50YXRpb24gZ2VuZXJhdG9yLlxuICogQHJldHVybnMge3N0cmluZ30gICAgICAgICAgICAgICBUaGUgZ2VuZXJhdGVkIHNvdXJjZSBjb2RlLlxuICovXG5jb25zdCBwcmVwcm9jZXNzOiBUZW1wbGF0ZUZ1bmN0aW9uID0gZnVuY3Rpb24gcHJlcHJvY2VzcyhkZWZpbmVzOiBSZWFkb25seURlZmluZXMsIGRvY3M6IEpTRG9jR2VuZXJhdG9yKSB7XG4gIGxldCBpbnZva2VWYWxpZGF0ZSA9IFwiXCIsIGludm9rZU1hcFZhbGlkYXRlID0gXCJcIjtcbiAgaWYgKGRlZmluZXMuaW52b2tlVmFsaWRhdGUpIHtcbiAgICBpbnZva2VWYWxpZGF0ZSA9IGBcXG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5hcmdMaXN0fSk7XFxuYDtcbiAgfVxuICBpZiAoZGVmaW5lcy52YWxpZGF0ZU1hcEFyZ3VtZW50cykge1xuICAgIGludm9rZU1hcFZhbGlkYXRlID0gYFxcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XFxuYDtcbiAgfVxuXG4gIHJldHVybiBgXG4ke2RlZmluZXMuaW1wb3J0TGluZXN9XG5pbXBvcnQgS2V5SGFzaGVyIGZyb20gXCIuL2tleXMvSGFzaGVyLm1qc1wiO1xuXG5jbGFzcyAke2RlZmluZXMuY2xhc3NOYW1lfSB7XG4gIC8qKiBAdHlwZWRlZiB7c3RyaW5nfSBoYXNoICovXG5cbiAgLyoqIEB0eXBlIHtNYXA8JHtkZWZpbmVzLm1hcEFyZ3VtZW50MFR5cGV9LCBNYXA8aGFzaCwgKltdPj59IEBjb25zdGFudCAqL1xuICAjb3V0ZXJNYXAgPSBuZXcgTWFwKCk7XG5cbiAgLyoqIEB0eXBlIHtLZXlIYXNoZXJ9IEBjb25zdGFudCAqL1xuICAjc2V0SGFzaGVyID0gbmV3IEtleUhhc2hlcigpO1xuXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAjc2l6ZU9mQWxsID0gMDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGl0ZXJhYmxlID0gYXJndW1lbnRzWzBdO1xuICAgICAgZm9yIChsZXQgZW50cnkgb2YgaXRlcmFibGUpIHtcbiAgICAgICAgdGhpcy5hZGQoLi4uZW50cnkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImdldFNpemVcIiwgMil9XG4gIGdldCBzaXplKCkge1xuICAgIHJldHVybiB0aGlzLiNzaXplT2ZBbGw7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJnZXRTaXplT2ZTZXRcIiwgMil9XG4gIGdldFNpemVPZlNldCgke2RlZmluZXMubWFwS2V5c1swXX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IF9faW5uZXJNYXBfXyA9IHRoaXMuI291dGVyTWFwLmdldCgke2RlZmluZXMubWFwS2V5c1swXX0pXG4gICAgcmV0dXJuIF9faW5uZXJNYXBfXz8uc2l6ZSB8fCAwO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwibWFwU2l6ZVwiLCAyKX1cbiAgZ2V0IG1hcFNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuI291dGVyTWFwLnNpemU7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJhZGRcIiwgMil9XG4gIGFkZCgke2RlZmluZXMubWFwS2V5c1swXX0sICR7ZGVmaW5lcy5zZXRLZXlzfSkgeyR7aW52b2tlVmFsaWRhdGV9XG4gICAgaWYgKCF0aGlzLiNvdXRlck1hcC5oYXMoJHtkZWZpbmVzLm1hcEtleXNbMF19KSlcbiAgICAgIHRoaXMuI291dGVyTWFwLnNldCgke2RlZmluZXMubWFwS2V5c1swXX0sIG5ldyBNYXApO1xuXG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jb3V0ZXJNYXAuZ2V0KCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSk7XG5cbiAgICBjb25zdCBfX3NldEhhc2hfXyA9IHRoaXMuI3NldEhhc2hlci5nZXRIYXNoKCR7ZGVmaW5lcy5zZXRLZXlzfSk7XG4gICAgaWYgKCFfX2lubmVyTWFwX18uaGFzKF9fc2V0SGFzaF9fKSkge1xuICAgICAgX19pbm5lck1hcF9fLnNldChfX3NldEhhc2hfXywgT2JqZWN0LmZyZWV6ZShbJHtkZWZpbmVzLmFyZ0xpc3R9XSkpO1xuICAgICAgdGhpcy4jc2l6ZU9mQWxsKys7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJhZGRTZXRzXCIsIDIpfVxuICBhZGRTZXRzKCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSwgX19zZXRzX18pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IF9fYXJyYXlfXyA9IEFycmF5LmZyb20oX19zZXRzX18pLm1hcCgoX19zZXRfXywgX19pbmRleF9fKSA9PiB7XG4gICAgICBfX3NldF9fID0gQXJyYXkuZnJvbShfX3NldF9fKTtcbiAgICAgIGlmIChfX3NldF9fLmxlbmd0aCAhPT0gJHtkZWZpbmVzLnNldEtleXMubGVuZ3RofSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXFxgU2V0IGF0IGluZGV4IFxcJHtfX2luZGV4X199IGRvZXNuJ3QgaGF2ZSBleGFjdGx5ICR7ZGVmaW5lcy5zZXRLZXlzLmxlbmd0aH0gYXJndW1lbnQke1xuICAgICAgICAgIGRlZmluZXMuc2V0S2V5cy5sZW5ndGggPiAxID8gXCJzXCIgOiBcIlwiXG4gICAgICAgIH0hXFxgKTtcbiAgICAgIH1cbiAgICAgICR7ZGVmaW5lcy5pbnZva2VWYWxpZGF0ZSA/IGB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLm1hcEtleXNbMF19LCAuLi5fX3NldF9fKTtgIDogXCJcIn1cblxuICAgICAgcmV0dXJuIF9fc2V0X187XG4gICAgfSk7XG5cbiAgICBpZiAoIXRoaXMuI291dGVyTWFwLmhhcygke2RlZmluZXMubWFwS2V5c1swXX0pKVxuICAgICAgdGhpcy4jb3V0ZXJNYXAuc2V0KCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSwgbmV3IE1hcCk7XG5cbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNvdXRlck1hcC5nZXQoJHtkZWZpbmVzLm1hcEtleXNbMF19KTtcbiAgICBjb25zdCBfX21hcEFyZ3NfXyA9IFske2RlZmluZXMubWFwS2V5c1swXX1dO1xuXG4gICAgX19hcnJheV9fLmZvckVhY2goX19zZXRfXyA9PiB7XG4gICAgICBjb25zdCBfX3NldEhhc2hfXyA9IHRoaXMuI3NldEhhc2hlci5nZXRIYXNoKC4uLl9fc2V0X18pO1xuICAgICAgaWYgKCFfX2lubmVyTWFwX18uaGFzKF9fc2V0SGFzaF9fKSkge1xuICAgICAgICBfX2lubmVyTWFwX18uc2V0KF9fc2V0SGFzaF9fLCBPYmplY3QuZnJlZXplKF9fbWFwQXJnc19fLmNvbmNhdChfX3NldF9fKSkpO1xuICAgICAgICB0aGlzLiNzaXplT2ZBbGwrKztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiY2xlYXJcIiwgMil9XG4gIGNsZWFyKCkge1xuICAgIHRoaXMuI291dGVyTWFwLmNsZWFyKCk7XG4gICAgdGhpcy4jc2l6ZU9mQWxsID0gMDtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImNsZWFyU2V0c1wiLCAyKX1cbiAgY2xlYXJTZXRzKCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSkgeyR7aW52b2tlTWFwVmFsaWRhdGV9XG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jb3V0ZXJNYXAuZ2V0KCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSlcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybjtcblxuICAgIHRoaXMuI3NpemVPZkFsbCAtPSBfX2lubmVyTWFwX18uc2l6ZTtcbiAgICBfX2lubmVyTWFwX18uY2xlYXIoKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImRlbGV0ZVwiLCAyKX1cbiAgZGVsZXRlKCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSwgJHtkZWZpbmVzLnNldEtleXN9KSB7JHtpbnZva2VWYWxpZGF0ZX1cbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNvdXRlck1hcC5nZXQoJHtkZWZpbmVzLm1hcEtleXNbMF19KVxuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgX19zZXRIYXNoX18gPSB0aGlzLiNzZXRIYXNoZXIuZ2V0SGFzaElmRXhpc3RzKCR7ZGVmaW5lcy5zZXRLZXlzfSk7XG4gICAgaWYgKCFfX3NldEhhc2hfXyB8fCAhX19pbm5lck1hcF9fLmhhcyhfX3NldEhhc2hfXykpXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBfX2lubmVyTWFwX18uZGVsZXRlKF9fc2V0SGFzaF9fKTtcbiAgICB0aGlzLiNzaXplT2ZBbGwtLTtcblxuICAgIGlmIChfX2lubmVyTWFwX18uc2l6ZSA9PT0gMCkge1xuICAgICAgdGhpcy4jb3V0ZXJNYXAuZGVsZXRlKCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJkZWxldGVTZXRzXCIsIDIpfVxuICBkZWxldGVTZXRzKCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSkgeyR7aW52b2tlTWFwVmFsaWRhdGV9XG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jb3V0ZXJNYXAuZ2V0KCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSlcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIHRoaXMuI291dGVyTWFwLmRlbGV0ZSgke2RlZmluZXMubWFwS2V5c1swXX0pO1xuICAgIHRoaXMuI3NpemVPZkFsbCAtPSBfX2lubmVyTWFwX18uc2l6ZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImZvckVhY2hTZXRcIiwgMil9XG4gIGZvckVhY2goX19jYWxsYmFja19fLCBfX3RoaXNBcmdfXykge1xuICAgIHRoaXMuI291dGVyTWFwLmZvckVhY2goXG4gICAgICBfX2lubmVyTWFwX18gPT4gX19pbm5lck1hcF9fLmZvckVhY2goXG4gICAgICAgIF9fa2V5U2V0X18gPT4gX19jYWxsYmFja19fLmFwcGx5KF9fdGhpc0FyZ19fLCBfX2tleVNldF9fLmNvbmNhdCh0aGlzKSlcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZm9yRWFjaE1hcFNldFwiLCAyKX1cbiAgZm9yRWFjaFNldCgke2RlZmluZXMubWFwS2V5c1swXX0sIF9fY2FsbGJhY2tfXywgX190aGlzQXJnX18pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IF9faW5uZXJNYXBfXyA9IHRoaXMuI291dGVyTWFwLmdldCgke2RlZmluZXMubWFwS2V5c1swXX0pXG4gICAgaWYgKCFfX2lubmVyTWFwX18pXG4gICAgICByZXR1cm47XG5cbiAgICBfX2lubmVyTWFwX18uZm9yRWFjaChcbiAgICAgIF9fa2V5U2V0X18gPT4gX19jYWxsYmFja19fLmFwcGx5KF9fdGhpc0FyZ19fLCBfX2tleVNldF9fLmNvbmNhdCh0aGlzKSlcbiAgICApO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZm9yRWFjaENhbGxiYWNrU2V0XCIsIDIpfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImhhc1wiLCAyKX1cbiAgaGFzKCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSwgJHtkZWZpbmVzLnNldEtleXN9KSB7JHtpbnZva2VWYWxpZGF0ZX1cbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNvdXRlck1hcC5nZXQoJHtkZWZpbmVzLm1hcEtleXNbMF19KVxuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgX19zZXRIYXNoX18gPSB0aGlzLiNzZXRIYXNoZXIuZ2V0SGFzaElmRXhpc3RzKCR7ZGVmaW5lcy5zZXRLZXlzfSk7XG4gICAgcmV0dXJuIF9fc2V0SGFzaF9fID8gX19pbm5lck1hcF9fLmhhcyhfX3NldEhhc2hfXykgOiBmYWxzZTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImhhc1NldFwiLCAyKX1cbiAgaGFzU2V0cygke2RlZmluZXMubWFwS2V5c1swXX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IF9faW5uZXJNYXBfXyA9IHRoaXMuI291dGVyTWFwLmdldCgke2RlZmluZXMubWFwS2V5c1swXX0pXG4gICAgcmV0dXJuIEJvb2xlYW4oX19pbm5lck1hcF9fKTtcbiAgfVxuXG4ke2RlZmluZXMudmFsaWRhdGVBcmd1bWVudHMgPyBgXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRLZXlQdWJsaWNcIiwgMil9XG4gIGlzVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KSB7XG4gICAgcmV0dXJuIHRoaXMuI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KTtcbiAgfVxuXG4gIGAgOiBgYH1cbiR7ZG9jcy5idWlsZEJsb2NrKFwidmFsdWVzXCIsIDIpfVxuICAqIHZhbHVlcygpIHtcbiAgICBjb25zdCBfX291dGVySXRlcl9fID0gdGhpcy4jb3V0ZXJNYXAudmFsdWVzKCk7XG5cbiAgICBmb3IgKGxldCBfX2lubmVyTWFwX18gb2YgX19vdXRlckl0ZXJfXykge1xuICAgICAgZm9yIChsZXQgX192YWx1ZV9fIG9mIF9faW5uZXJNYXBfXy52YWx1ZXMoKSlcbiAgICAgICAgeWllbGQgX192YWx1ZV9fO1xuICAgIH1cbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcInZhbHVlc1NldFwiLCAyKX1cbiAgKiB2YWx1ZXNTZXQoJHtkZWZpbmVzLm1hcEtleXNbMF19KSB7JHtpbnZva2VNYXBWYWxpZGF0ZX1cbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNvdXRlck1hcC5nZXQoJHtkZWZpbmVzLm1hcEtleXNbMF19KVxuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuO1xuXG4gICAgZm9yIChsZXQgX192YWx1ZV9fIG9mIF9faW5uZXJNYXBfXy52YWx1ZXMoKSlcbiAgICAgIHlpZWxkIF9fdmFsdWVfXztcbiAgfVxuXG4ke2RlZmluZXMudmFsaWRhdGVBcmd1bWVudHMgPyBgXG4ke2RvY3MuYnVpbGRCbG9jayhcInJlcXVpcmVWYWxpZEtleVwiLCAyKX1cbiAgI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuYXJnTGlzdH0pIHtcbiAgICBpZiAoIXRoaXMuI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBvcmRlcmVkIGtleSBzZXQgaXMgbm90IHZhbGlkIVwiKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRLZXlQcml2YXRlXCIsIDIpfVxuICAjaXNWYWxpZEtleSgke2RlZmluZXMuYXJnTGlzdH0pIHtcbiAgICB2b2lkKCR7ZGVmaW5lcy5hcmdMaXN0fSk7XG5cbiAgICAke2RlZmluZXMudmFsaWRhdGVBcmd1bWVudHN9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgYCA6IGBgfVxuXG4ke2RlZmluZXMudmFsaWRhdGVNYXBBcmd1bWVudHMgPyBgXG4ke2RvY3MuYnVpbGRCbG9jayhcInJlcXVpcmVWYWxpZE1hcEtleVwiLCAyKX1cbiAgI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KSB7XG4gICAgaWYgKCF0aGlzLiNpc1ZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIG9yZGVyZWQgbWFwIGtleSBzZXQgaXMgbm90IHZhbGlkIVwiKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRNYXBLZXlQcml2YXRlXCIsIDIpfVxuICAjaXNWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KSB7XG4gICAgdm9pZCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KTtcblxuICAgICR7ZGVmaW5lcy52YWxpZGF0ZU1hcEFyZ3VtZW50cyB8fCBcIlwifVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGAgOiBgYH1cblxuICBbU3ltYm9sLml0ZXJhdG9yXSgpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZXMoKTtcbiAgfVxuXG4gIFtTeW1ib2wudG9TdHJpbmdUYWddID0gXCIke2RlZmluZXMuY2xhc3NOYW1lfVwiO1xufVxuXG5cbk9iamVjdC5mcmVlemUoJHtkZWZpbmVzLmNsYXNzTmFtZX0pO1xuT2JqZWN0LmZyZWV6ZSgke2RlZmluZXMuY2xhc3NOYW1lfS5wcm90b3R5cGUpO1xuYH1cblxuZXhwb3J0IGRlZmF1bHQgcHJlcHJvY2VzcztcbiJdfQ==