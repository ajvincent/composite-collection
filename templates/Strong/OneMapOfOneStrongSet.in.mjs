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

class ${defines.className} {
  /** @type {Map<${defines.mapArgument0Type}, Set<${defines.setArgument0Type}>>} @constant */
  #outerMap = new Map();

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
    const __innerSet__ = this.#outerMap.get(${defines.mapKeys[0]})
    return __innerSet__?.size || 0;
  }

${docs.buildBlock("mapSize", 2)}
  get mapSize() {
    return this.#outerMap.size;
  }

${docs.buildBlock("add", 2)}
  add(${defines.mapKeys.join(", ")}, ${defines.setKeys[0]}) {${invokeValidate}
    if (!this.#outerMap.has(${defines.mapKeys[0]}))
      this.#outerMap.set(${defines.mapKeys[0]}, new Set);

    const __innerSet__ = this.#outerMap.get(${defines.mapKeys[0]});

    if (!__innerSet__.has(${defines.setKeys[0]})) {
      __innerSet__.add(${defines.setKeys[0]});
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

    if (!this.#outerMap.has(${defines.mapKeys[0]}))
      this.#outerMap.set(${defines.mapKeys[0]}, new Set);

    const __innerSet__ = this.#outerMap.get(${defines.mapKeys[0]});

    __array__.forEach(__set__ => {
      if (!__innerSet__.has(__set__[0])) {
        __innerSet__.add(__set__[0]);
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
    const __innerSet__ = this.#outerMap.get(${defines.mapKeys[0]})
    if (!__innerSet__)
      return;

    this.#sizeOfAll -= __innerSet__.size;
    __innerSet__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.mapKeys.join(", ")}, ${defines.setKeys}) {${invokeValidate}
    const __innerSet__ = this.#outerMap.get(${defines.mapKeys[0]})
    if (!__innerSet__)
      return false;

    if (!__innerSet__.has(${defines.setKeys[0]}))
      return false;

    __innerSet__.delete(${defines.setKeys[0]});
    this.#sizeOfAll--;

    if (__innerSet__.size === 0) {
      this.#outerMap.delete(${defines.mapKeys[0]});
    }

    return true;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.mapKeys.join(", ")}) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.mapKeys[0]})
    if (!__innerSet__)
      return false;

    this.#outerMap.delete(${defines.mapKeys[0]});
    this.#sizeOfAll -= __innerSet__.size;
    return true;
  }

${docs.buildBlock("forEachSet", 2)}
  forEach(__callback__, __thisArg__) {
    this.#outerMap.forEach(
      (__innerSet__, ${defines.mapKeys[0]}) => __innerSet__.forEach(
        ${defines.setKeys[0]} => __callback__.apply(__thisArg__, [${defines.mapKeys[0]}, ${defines.setKeys[0]}, this])
      )
    );
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.mapKeys[0]}, __callback__, __thisArg__) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.mapKeys[0]})
    if (!__innerSet__)
      return;

    __innerSet__.forEach(
      ${defines.setKeys[0]} => __callback__.apply(__thisArg__, [${defines.mapKeys[0]}, ${defines.setKeys[0]}, this])
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("has", 2)}
  has(${defines.mapKeys.join(", ")}, ${defines.setKeys}) {${invokeValidate}
    const __innerSet__ = this.#outerMap.get(${defines.mapKeys[0]})
    if (!__innerSet__)
      return false;

    return __innerSet__.has(${defines.setKeys[0]});
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.mapKeys.join(", ")}) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.mapKeys[0]})
    return Boolean(__innerSet__);
  }

${defines.validateArguments ? `
${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.argList}) {
    return this.#isValidKey(${defines.argList});
  }

  ` : ``}
${docs.buildBlock("values", 2)}
  * values() {
    const __outerIter__ = this.#outerMap.entries();

    for (let [${defines.mapKeys[0]}, __innerSet__] of __outerIter__) {
      for (let ${defines.setKeys[0]} of __innerSet__.values())
        yield [${defines.mapKeys[0]}, ${defines.setKeys[0]}];
    }
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${defines.mapKeys[0]}) {${invokeMapValidate}
    const __innerSet__ = this.#outerMap.get(${defines.mapKeys[0]})
    if (!__innerSet__)
      return;

    for (let ${defines.setKeys[0]} of __innerSet__.values())
      yield [${defines.mapKeys[0]}, ${defines.setKeys[0]}];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT25lTWFwT2ZPbmVTdHJvbmdTZXQuaW4ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiT25lTWFwT2ZPbmVTdHJvbmdTZXQuaW4ubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsR0FBcUIsU0FBUyxVQUFVLENBQUMsT0FBd0IsRUFBRSxJQUFvQjtJQUNyRyxJQUFJLGNBQWMsR0FBRyxFQUFFLEVBQUUsaUJBQWlCLEdBQUcsRUFBRSxDQUFDO0lBQ2hELElBQUksT0FBTyxDQUFDLGNBQWMsRUFBRTtRQUMxQixjQUFjLEdBQUcsK0JBQStCLE9BQU8sQ0FBQyxPQUFPLE1BQU0sQ0FBQztLQUN2RTtJQUNELElBQUksT0FBTyxDQUFDLG9CQUFvQixFQUFFO1FBQ2hDLGlCQUFpQixHQUFHLGtDQUFrQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0tBQ3hGO0lBRUQsT0FBTztFQUNQLE9BQU8sQ0FBQyxXQUFXOztRQUViLE9BQU8sQ0FBQyxTQUFTO21CQUNOLE9BQU8sQ0FBQyxnQkFBZ0IsU0FBUyxPQUFPLENBQUMsZ0JBQWdCOzs7Ozs7Ozs7Ozs7Ozs7RUFlMUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDOzs7OztFQUs3QixJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7aUJBQ25CLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLGlCQUFpQjs4Q0FDcEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Ozs7RUFJOUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDOzs7OztFQUs3QixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDbkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUss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QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUmVhZG9ubHlEZWZpbmVzLCBKU0RvY0dlbmVyYXRvciwgVGVtcGxhdGVGdW5jdGlvbiB9IGZyb20gXCIuLi9zaGFyZWRUeXBlcy5tanNcIjtcblxuLyoqXG4gKiBAcGFyYW0ge01hcH0gICAgICAgICAgICBkZWZpbmVzIFRoZSBwcmVwcm9jZXNzb3IgbWFjcm9zLlxuICogQHBhcmFtIHtKU0RvY0dlbmVyYXRvcn0gZG9jcyAgICBUaGUgcHJpbWFyeSBkb2N1bWVudGF0aW9uIGdlbmVyYXRvci5cbiAqIEByZXR1cm5zIHtzdHJpbmd9ICAgICAgICAgICAgICAgVGhlIGdlbmVyYXRlZCBzb3VyY2UgY29kZS5cbiAqL1xuY29uc3QgcHJlcHJvY2VzczogVGVtcGxhdGVGdW5jdGlvbiA9IGZ1bmN0aW9uIHByZXByb2Nlc3MoZGVmaW5lczogUmVhZG9ubHlEZWZpbmVzLCBkb2NzOiBKU0RvY0dlbmVyYXRvcikge1xuICBsZXQgaW52b2tlVmFsaWRhdGUgPSBcIlwiLCBpbnZva2VNYXBWYWxpZGF0ZSA9IFwiXCI7XG4gIGlmIChkZWZpbmVzLmludm9rZVZhbGlkYXRlKSB7XG4gICAgaW52b2tlVmFsaWRhdGUgPSBgXFxuICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuYXJnTGlzdH0pO1xcbmA7XG4gIH1cbiAgaWYgKGRlZmluZXMudmFsaWRhdGVNYXBBcmd1bWVudHMpIHtcbiAgICBpbnZva2VNYXBWYWxpZGF0ZSA9IGBcXG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xcbmA7XG4gIH1cblxuICByZXR1cm4gYFxuJHtkZWZpbmVzLmltcG9ydExpbmVzfVxuXG5jbGFzcyAke2RlZmluZXMuY2xhc3NOYW1lfSB7XG4gIC8qKiBAdHlwZSB7TWFwPCR7ZGVmaW5lcy5tYXBBcmd1bWVudDBUeXBlfSwgU2V0PCR7ZGVmaW5lcy5zZXRBcmd1bWVudDBUeXBlfT4+fSBAY29uc3RhbnQgKi9cbiAgI291dGVyTWFwID0gbmV3IE1hcCgpO1xuXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAjc2l6ZU9mQWxsID0gMDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGl0ZXJhYmxlID0gYXJndW1lbnRzWzBdO1xuICAgICAgZm9yIChsZXQgZW50cnkgb2YgaXRlcmFibGUpIHtcbiAgICAgICAgdGhpcy5hZGQoLi4uZW50cnkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImdldFNpemVcIiwgMil9XG4gIGdldCBzaXplKCkge1xuICAgIHJldHVybiB0aGlzLiNzaXplT2ZBbGw7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJnZXRTaXplT2ZTZXRcIiwgMil9XG4gIGdldFNpemVPZlNldCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KSB7JHtpbnZva2VNYXBWYWxpZGF0ZX1cbiAgICBjb25zdCBfX2lubmVyU2V0X18gPSB0aGlzLiNvdXRlck1hcC5nZXQoJHtkZWZpbmVzLm1hcEtleXNbMF19KVxuICAgIHJldHVybiBfX2lubmVyU2V0X18/LnNpemUgfHwgMDtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcIm1hcFNpemVcIiwgMil9XG4gIGdldCBtYXBTaXplKCkge1xuICAgIHJldHVybiB0aGlzLiNvdXRlck1hcC5zaXplO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiYWRkXCIsIDIpfVxuICBhZGQoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSwgJHtkZWZpbmVzLnNldEtleXNbMF19KSB7JHtpbnZva2VWYWxpZGF0ZX1cbiAgICBpZiAoIXRoaXMuI291dGVyTWFwLmhhcygke2RlZmluZXMubWFwS2V5c1swXX0pKVxuICAgICAgdGhpcy4jb3V0ZXJNYXAuc2V0KCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSwgbmV3IFNldCk7XG5cbiAgICBjb25zdCBfX2lubmVyU2V0X18gPSB0aGlzLiNvdXRlck1hcC5nZXQoJHtkZWZpbmVzLm1hcEtleXNbMF19KTtcblxuICAgIGlmICghX19pbm5lclNldF9fLmhhcygke2RlZmluZXMuc2V0S2V5c1swXX0pKSB7XG4gICAgICBfX2lubmVyU2V0X18uYWRkKCR7ZGVmaW5lcy5zZXRLZXlzWzBdfSk7XG4gICAgICB0aGlzLiNzaXplT2ZBbGwrKztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImFkZFNldHNcIiwgMil9XG4gIGFkZFNldHMoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSwgX19zZXRzX18pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IF9fYXJyYXlfXyA9IEFycmF5LmZyb20oX19zZXRzX18pLm1hcCgoX19zZXRfXywgX19pbmRleF9fKSA9PiB7XG4gICAgICBfX3NldF9fID0gQXJyYXkuZnJvbShfX3NldF9fKTtcbiAgICAgIGlmIChfX3NldF9fLmxlbmd0aCAhPT0gJHtkZWZpbmVzLnNldEtleXMubGVuZ3RofSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXFxgU2V0IGF0IGluZGV4IFxcJHtfX2luZGV4X199IGRvZXNuJ3QgaGF2ZSBleGFjdGx5ICR7ZGVmaW5lcy5zZXRLZXlzLmxlbmd0aH0gYXJndW1lbnQke1xuICAgICAgICAgIGRlZmluZXMuc2V0S2V5cy5sZW5ndGggPiAxID8gXCJzXCIgOiBcIlwiXG4gICAgICAgIH0hXFxgKTtcbiAgICAgIH1cbiAgICAgICR7ZGVmaW5lcy5pbnZva2VWYWxpZGF0ZSA/IGB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSwgLi4uX19zZXRfXyk7YCA6IFwiXCJ9XG5cbiAgICAgIHJldHVybiBfX3NldF9fO1xuICAgIH0pO1xuXG4gICAgaWYgKCF0aGlzLiNvdXRlck1hcC5oYXMoJHtkZWZpbmVzLm1hcEtleXNbMF19KSlcbiAgICAgIHRoaXMuI291dGVyTWFwLnNldCgke2RlZmluZXMubWFwS2V5c1swXX0sIG5ldyBTZXQpO1xuXG4gICAgY29uc3QgX19pbm5lclNldF9fID0gdGhpcy4jb3V0ZXJNYXAuZ2V0KCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSk7XG5cbiAgICBfX2FycmF5X18uZm9yRWFjaChfX3NldF9fID0+IHtcbiAgICAgIGlmICghX19pbm5lclNldF9fLmhhcyhfX3NldF9fWzBdKSkge1xuICAgICAgICBfX2lubmVyU2V0X18uYWRkKF9fc2V0X19bMF0pO1xuICAgICAgICB0aGlzLiNzaXplT2ZBbGwrKztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiY2xlYXJcIiwgMil9XG4gIGNsZWFyKCkge1xuICAgIHRoaXMuI291dGVyTWFwLmNsZWFyKCk7XG4gICAgdGhpcy4jc2l6ZU9mQWxsID0gMDtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImNsZWFyU2V0c1wiLCAyKX1cbiAgY2xlYXJTZXRzKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI291dGVyTWFwLmdldCgke2RlZmluZXMubWFwS2V5c1swXX0pXG4gICAgaWYgKCFfX2lubmVyU2V0X18pXG4gICAgICByZXR1cm47XG5cbiAgICB0aGlzLiNzaXplT2ZBbGwgLT0gX19pbm5lclNldF9fLnNpemU7XG4gICAgX19pbm5lclNldF9fLmNsZWFyKCk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJkZWxldGVcIiwgMil9XG4gIGRlbGV0ZSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAke2RlZmluZXMuc2V0S2V5c30pIHske2ludm9rZVZhbGlkYXRlfVxuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI291dGVyTWFwLmdldCgke2RlZmluZXMubWFwS2V5c1swXX0pXG4gICAgaWYgKCFfX2lubmVyU2V0X18pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBpZiAoIV9faW5uZXJTZXRfXy5oYXMoJHtkZWZpbmVzLnNldEtleXNbMF19KSlcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIF9faW5uZXJTZXRfXy5kZWxldGUoJHtkZWZpbmVzLnNldEtleXNbMF19KTtcbiAgICB0aGlzLiNzaXplT2ZBbGwtLTtcblxuICAgIGlmIChfX2lubmVyU2V0X18uc2l6ZSA9PT0gMCkge1xuICAgICAgdGhpcy4jb3V0ZXJNYXAuZGVsZXRlKCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJkZWxldGVTZXRzXCIsIDIpfVxuICBkZWxldGVTZXRzKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI291dGVyTWFwLmdldCgke2RlZmluZXMubWFwS2V5c1swXX0pXG4gICAgaWYgKCFfX2lubmVyU2V0X18pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICB0aGlzLiNvdXRlck1hcC5kZWxldGUoJHtkZWZpbmVzLm1hcEtleXNbMF19KTtcbiAgICB0aGlzLiNzaXplT2ZBbGwgLT0gX19pbm5lclNldF9fLnNpemU7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJmb3JFYWNoU2V0XCIsIDIpfVxuICBmb3JFYWNoKF9fY2FsbGJhY2tfXywgX190aGlzQXJnX18pIHtcbiAgICB0aGlzLiNvdXRlck1hcC5mb3JFYWNoKFxuICAgICAgKF9faW5uZXJTZXRfXywgJHtkZWZpbmVzLm1hcEtleXNbMF19KSA9PiBfX2lubmVyU2V0X18uZm9yRWFjaChcbiAgICAgICAgJHtkZWZpbmVzLnNldEtleXNbMF19ID0+IF9fY2FsbGJhY2tfXy5hcHBseShfX3RoaXNBcmdfXywgWyR7ZGVmaW5lcy5tYXBLZXlzWzBdfSwgJHtkZWZpbmVzLnNldEtleXNbMF19LCB0aGlzXSlcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZm9yRWFjaE1hcFNldFwiLCAyKX1cbiAgZm9yRWFjaFNldCgke2RlZmluZXMubWFwS2V5c1swXX0sIF9fY2FsbGJhY2tfXywgX190aGlzQXJnX18pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI291dGVyTWFwLmdldCgke2RlZmluZXMubWFwS2V5c1swXX0pXG4gICAgaWYgKCFfX2lubmVyU2V0X18pXG4gICAgICByZXR1cm47XG5cbiAgICBfX2lubmVyU2V0X18uZm9yRWFjaChcbiAgICAgICR7ZGVmaW5lcy5zZXRLZXlzWzBdfSA9PiBfX2NhbGxiYWNrX18uYXBwbHkoX190aGlzQXJnX18sIFske2RlZmluZXMubWFwS2V5c1swXX0sICR7ZGVmaW5lcy5zZXRLZXlzWzBdfSwgdGhpc10pXG4gICAgKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImZvckVhY2hDYWxsYmFja1NldFwiLCAyKX1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJoYXNcIiwgMil9XG4gIGhhcygke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAke2RlZmluZXMuc2V0S2V5c30pIHske2ludm9rZVZhbGlkYXRlfVxuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI291dGVyTWFwLmdldCgke2RlZmluZXMubWFwS2V5c1swXX0pXG4gICAgaWYgKCFfX2lubmVyU2V0X18pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICByZXR1cm4gX19pbm5lclNldF9fLmhhcygke2RlZmluZXMuc2V0S2V5c1swXX0pO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaGFzU2V0XCIsIDIpfVxuICBoYXNTZXRzKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHske2ludm9rZU1hcFZhbGlkYXRlfVxuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI291dGVyTWFwLmdldCgke2RlZmluZXMubWFwS2V5c1swXX0pXG4gICAgcmV0dXJuIEJvb2xlYW4oX19pbm5lclNldF9fKTtcbiAgfVxuXG4ke2RlZmluZXMudmFsaWRhdGVBcmd1bWVudHMgPyBgXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRLZXlQdWJsaWNcIiwgMil9XG4gIGlzVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KSB7XG4gICAgcmV0dXJuIHRoaXMuI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmFyZ0xpc3R9KTtcbiAgfVxuXG4gIGAgOiBgYH1cbiR7ZG9jcy5idWlsZEJsb2NrKFwidmFsdWVzXCIsIDIpfVxuICAqIHZhbHVlcygpIHtcbiAgICBjb25zdCBfX291dGVySXRlcl9fID0gdGhpcy4jb3V0ZXJNYXAuZW50cmllcygpO1xuXG4gICAgZm9yIChsZXQgWyR7ZGVmaW5lcy5tYXBLZXlzWzBdfSwgX19pbm5lclNldF9fXSBvZiBfX291dGVySXRlcl9fKSB7XG4gICAgICBmb3IgKGxldCAke2RlZmluZXMuc2V0S2V5c1swXX0gb2YgX19pbm5lclNldF9fLnZhbHVlcygpKVxuICAgICAgICB5aWVsZCBbJHtkZWZpbmVzLm1hcEtleXNbMF19LCAke2RlZmluZXMuc2V0S2V5c1swXX1dO1xuICAgIH1cbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcInZhbHVlc1NldFwiLCAyKX1cbiAgKiB2YWx1ZXNTZXQoJHtkZWZpbmVzLm1hcEtleXNbMF19KSB7JHtpbnZva2VNYXBWYWxpZGF0ZX1cbiAgICBjb25zdCBfX2lubmVyU2V0X18gPSB0aGlzLiNvdXRlck1hcC5nZXQoJHtkZWZpbmVzLm1hcEtleXNbMF19KVxuICAgIGlmICghX19pbm5lclNldF9fKVxuICAgICAgcmV0dXJuO1xuXG4gICAgZm9yIChsZXQgJHtkZWZpbmVzLnNldEtleXNbMF19IG9mIF9faW5uZXJTZXRfXy52YWx1ZXMoKSlcbiAgICAgIHlpZWxkIFske2RlZmluZXMubWFwS2V5c1swXX0sICR7ZGVmaW5lcy5zZXRLZXlzWzBdfV07XG4gIH1cblxuJHtkZWZpbmVzLnZhbGlkYXRlQXJndW1lbnRzID8gYFxuJHtkb2NzLmJ1aWxkQmxvY2soXCJyZXF1aXJlVmFsaWRLZXlcIiwgMil9XG4gICAgI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuYXJnTGlzdH0pIHtcbiAgICAgIGlmICghdGhpcy4jaXNWYWxpZEtleSgke2RlZmluZXMuYXJnTGlzdH0pKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgb3JkZXJlZCBrZXkgc2V0IGlzIG5vdCB2YWxpZCFcIik7XG4gICAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRLZXlQcml2YXRlXCIsIDIpfVxuICAgICNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5hcmdMaXN0fSkge1xuICAgICAgdm9pZCgke2RlZmluZXMuYXJnTGlzdH0pO1xuXG4gICAgICAke2RlZmluZXMudmFsaWRhdGVBcmd1bWVudHN9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgYCA6IGBgfVxuXG4ke2RlZmluZXMudmFsaWRhdGVNYXBBcmd1bWVudHMgPyBgXG4ke2RvY3MuYnVpbGRCbG9jayhcInJlcXVpcmVWYWxpZE1hcEtleVwiLCAyKX1cbiAgI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KSB7XG4gICAgaWYgKCF0aGlzLiNpc1ZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIG9yZGVyZWQgbWFwIGtleSBzZXQgaXMgbm90IHZhbGlkIVwiKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRNYXBLZXlQcml2YXRlXCIsIDIpfVxuICAjaXNWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KSB7XG4gICAgdm9pZCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KTtcblxuICAgICR7ZGVmaW5lcy52YWxpZGF0ZU1hcEFyZ3VtZW50cyB8fCBcIlwifVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGAgOiBgYH1cblxuICBbU3ltYm9sLml0ZXJhdG9yXSgpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZXMoKTtcbiAgfVxuXG4gIFtTeW1ib2wudG9TdHJpbmdUYWddID0gXCIke2RlZmluZXMuY2xhc3NOYW1lfVwiO1xufVxuXG5cbk9iamVjdC5mcmVlemUoJHtkZWZpbmVzLmNsYXNzTmFtZX0pO1xuT2JqZWN0LmZyZWV6ZSgke2RlZmluZXMuY2xhc3NOYW1lfS5wcm90b3R5cGUpO1xuYH1cblxuZXhwb3J0IGRlZmF1bHQgcHJlcHJvY2VzcztcbiJdfQ==