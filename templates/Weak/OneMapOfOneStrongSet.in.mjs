/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    return `
${defines.importLines}
class ${defines.className} {
  /**
   * @type {WeakMap<${defines.mapArgument0Type}, Set<${defines.setArgument0Type}>>}
   * @constant
   * This is two levels. The first level is the map key.
   * The second level is the strong set.
   */
  #root = new WeakMap();

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.add(...entry);
      }
    }
  }

${docs.buildBlock("add", 2)}
  add(${defines.mapKeys[0]}, ${defines.setKeys[0]}) {
    this.#requireValidKey(${defines.mapKeys[0]}, ${defines.setKeys[0]});
    const __innerSet__ = this.#requireInnerSet(${defines.mapKeys[0]});

    __innerSet__.add(${defines.setKeys[0]});
    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.mapKeys[0]}, __sets__) {
    this.#requireValidMapKey(${defines.mapKeys[0]});
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.setKeys.length}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.setKeys.length} set argument${defines.setKeys.length > 1 ? "s" : ""}!\`);
      }
      this.#requireValidKey(${defines.mapKeys[0]}, ...__set__);
      return __set__;
    });

    const __innerSet__ = this.#requireInnerSet(${defines.mapKeys[0]});

    // level 2: inner map to set
    __array__.forEach(__set__ => __innerSet__.add(__set__[0]));

    return this;
  }

${docs.buildBlock("clearSets", 2)}
  clearSets(${defines.mapKeys[0]}) {
    this.#requireValidMapKey(${defines.mapKeys[0]});
    const __innerSet__ = this.#root.get(${defines.mapKeys[0]});
    if (!__innerSet__)
      return;

    __innerSet__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.mapKeys[0]}, ${defines.setKeys[0]}) {
    this.#requireValidKey(${defines.mapKeys[0]}, ${defines.setKeys[0]});
    const __innerSet__ = this.#root.get(${defines.mapKeys[0]});
    if (!__innerSet__)
      return false;

    // level 2: inner map to set
    const __returnValue__ = __innerSet__.delete(${defines.setKeys[0]});

    if (__innerSet__.size === 0) {
      this.deleteSets(${defines.mapKeys[0]});
    }

    return __returnValue__;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.mapKeys[0]}) {
    this.#requireValidMapKey(${defines.mapKeys[0]});
    return this.#root.delete(${defines.mapKeys[0]});
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.mapKeys[0]}, __callback__, __thisArg__) {
    this.#requireValidMapKey(${defines.mapKeys[0]});
    const __innerSet__ = this.#root.get(${defines.mapKeys[0]});
    if (!__innerSet__)
      return;

    __innerSet__.forEach(
      __element__ => __callback__.apply(__thisArg__, [${defines.mapKeys[0]}, __element__, this])
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${defines.mapKeys[0]}) {
    this.#requireValidMapKey(${defines.mapKeys[0]});
    const __innerSet__ = this.#root.get(${defines.mapKeys[0]});
    return __innerSet__?.size || 0;
  }

${docs.buildBlock("has", 2)}
  has(${defines.mapKeys[0]}, ${defines.setKeys[0]}) {
    this.#requireValidKey(${defines.mapKeys[0]}, ${defines.setKeys[0]});
    const __innerSet__ = this.#root.get(${defines.mapKeys[0]});
    if (!__innerSet__)
      return false;

    return __innerSet__.has(${defines.setKeys[0]});
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.mapKeys[0]}) {
    this.#requireValidMapKey(${defines.mapKeys[0]});
    return this.#root.has(${defines.mapKeys[0]});
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.mapKeys[0]}, ${defines.setKeys[0]}) {
    return this.#isValidKey(${defines.mapKeys[0]}, ${defines.setKeys[0]});
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${defines.mapKeys[0]}) {
    this.#requireValidMapKey(${defines.mapKeys[0]});

    const __innerSet__ = this.#root.get(${defines.mapKeys[0]});
    if (!__innerSet__)
      return;

    const __outerIter__ = __innerSet__.values();
    for (let __value__ of __outerIter__)
      yield [${defines.mapKeys[0]}, __value__];
  }

${docs.buildBlock("requireInnerCollectionPrivate", 2)}
  #requireInnerSet(${defines.mapKeys[0]}) {
    if (!this.#root.has(${defines.mapKeys[0]})) {
      this.#root.set(${defines.mapKeys[0]}, new Set);
    }
    return this.#root.get(${defines.mapKeys[0]});
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.mapKeys[0]}, ${defines.setKeys[0]}) {
    if (!this.#isValidKey(${defines.mapKeys[0]}, ${defines.setKeys[0]}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.mapKeys[0]}, ${defines.setKeys[0]}) {
    return this.#isValidMapKey(${defines.mapKeys[0]}) && this.#isValidSetKey(${defines.setKeys[0]});
  }

${docs.buildBlock("requireValidMapKey", 2)}
  #requireValidMapKey(${defines.mapKeys[0]}) {
    if (!this.#isValidMapKey(${defines.mapKeys[0]}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  #isValidMapKey(${defines.mapKeys[0]}) {
    if (Object(${defines.mapKeys[0]}) !== ${defines.mapKeys[0]})
      return false;
    ${defines.validateMapArguments || ""}
    return true;
  }

${docs.buildBlock("isValidSetKeyPrivate", 2)}
  #isValidSetKey(${defines.setKeys[0]}) {
    void(${defines.setKeys[0]});

    ${defines.validateSetArguments || ""}
    return true;
  }

  [Symbol.toStringTag] = "${defines.className}";
}

Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`;
};
export default preprocess;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT25lTWFwT2ZPbmVTdHJvbmdTZXQuaW4ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiT25lTWFwT2ZPbmVTdHJvbmdTZXQuaW4ubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsR0FBcUIsU0FBUyxVQUFVLENBQUMsT0FBd0IsRUFBRSxJQUFvQjtJQUNyRyxPQUFPO0VBQ1AsT0FBTyxDQUFDLFdBQVc7UUFDYixPQUFPLENBQUMsU0FBUzs7c0JBRUgsT0FBTyxDQUFDLGdCQUFnQixTQUFTLE9BQU8sQ0FBQyxnQkFBZ0I7Ozs7Ozs7Ozs7Ozs7Ozs7RUFnQjdFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDOzRCQUNyQixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2lEQUNwQixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzs7dUJBRTVDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDOzs7O0VBSXZDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUNuQixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzsrQkFDQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzs7OytCQUdsQixPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU07NEVBQ3VCLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxnQkFDeEYsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQ3JDOzs4QkFFc0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Ozs7aURBSUMsT0FBTyxDQUFD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Q0FBQyxDQUFDLFNBQVMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7O01BRXhELE9BQU8sQ0FBQyxvQkFBb0IsSUFBSSxFQUFFOzs7O0VBSXRDLElBQUksQ0FBQyxVQUFVLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO21CQUN6QixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztXQUMxQixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzs7TUFFdkIsT0FBTyxDQUFDLG9CQUFvQixJQUFJLEVBQUU7Ozs7NEJBSVosT0FBTyxDQUFDLFNBQVM7OztnQkFHN0IsT0FBTyxDQUFDLFNBQVM7Z0JBQ2pCLE9BQU8sQ0FBQyxTQUFTO0NBQ2hDLENBQUM7QUFDRixDQUFDLENBQUE7QUFFRCxlQUFlLFVBQVUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUmVhZG9ubHlEZWZpbmVzLCBKU0RvY0dlbmVyYXRvciwgVGVtcGxhdGVGdW5jdGlvbiB9IGZyb20gXCIuLi9zaGFyZWRUeXBlcy5tanNcIjtcblxuLyoqXG4gKiBAcGFyYW0ge01hcH0gICAgICAgICAgICBkZWZpbmVzIFRoZSBwcmVwcm9jZXNzb3IgbWFjcm9zLlxuICogQHBhcmFtIHtKU0RvY0dlbmVyYXRvcn0gZG9jcyAgICBUaGUgcHJpbWFyeSBkb2N1bWVudGF0aW9uIGdlbmVyYXRvci5cbiAqIEByZXR1cm5zIHtzdHJpbmd9ICAgICAgICAgICAgICAgVGhlIGdlbmVyYXRlZCBzb3VyY2UgY29kZS5cbiAqL1xuY29uc3QgcHJlcHJvY2VzczogVGVtcGxhdGVGdW5jdGlvbiA9IGZ1bmN0aW9uIHByZXByb2Nlc3MoZGVmaW5lczogUmVhZG9ubHlEZWZpbmVzLCBkb2NzOiBKU0RvY0dlbmVyYXRvcikge1xuICByZXR1cm4gYFxuJHtkZWZpbmVzLmltcG9ydExpbmVzfVxuY2xhc3MgJHtkZWZpbmVzLmNsYXNzTmFtZX0ge1xuICAvKipcbiAgICogQHR5cGUge1dlYWtNYXA8JHtkZWZpbmVzLm1hcEFyZ3VtZW50MFR5cGV9LCBTZXQ8JHtkZWZpbmVzLnNldEFyZ3VtZW50MFR5cGV9Pj59XG4gICAqIEBjb25zdGFudFxuICAgKiBUaGlzIGlzIHR3byBsZXZlbHMuIFRoZSBmaXJzdCBsZXZlbCBpcyB0aGUgbWFwIGtleS5cbiAgICogVGhlIHNlY29uZCBsZXZlbCBpcyB0aGUgc3Ryb25nIHNldC5cbiAgICovXG4gICNyb290ID0gbmV3IFdlYWtNYXAoKTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGl0ZXJhYmxlID0gYXJndW1lbnRzWzBdO1xuICAgICAgZm9yIChsZXQgZW50cnkgb2YgaXRlcmFibGUpIHtcbiAgICAgICAgdGhpcy5hZGQoLi4uZW50cnkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImFkZFwiLCAyKX1cbiAgYWRkKCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSwgJHtkZWZpbmVzLnNldEtleXNbMF19KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSwgJHtkZWZpbmVzLnNldEtleXNbMF19KTtcbiAgICBjb25zdCBfX2lubmVyU2V0X18gPSB0aGlzLiNyZXF1aXJlSW5uZXJTZXQoJHtkZWZpbmVzLm1hcEtleXNbMF19KTtcblxuICAgIF9faW5uZXJTZXRfXy5hZGQoJHtkZWZpbmVzLnNldEtleXNbMF19KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImFkZFNldHNcIiwgMil9XG4gIGFkZFNldHMoJHtkZWZpbmVzLm1hcEtleXNbMF19LCBfX3NldHNfXykge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5c1swXX0pO1xuICAgIGNvbnN0IF9fYXJyYXlfXyA9IEFycmF5LmZyb20oX19zZXRzX18pLm1hcCgoX19zZXRfXywgX19pbmRleF9fKSA9PiB7XG4gICAgICBfX3NldF9fID0gQXJyYXkuZnJvbShfX3NldF9fKTtcbiAgICAgIGlmIChfX3NldF9fLmxlbmd0aCAhPT0gJHtkZWZpbmVzLnNldEtleXMubGVuZ3RofSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXFxgU2V0IGF0IGluZGV4IFxcJHtfX2luZGV4X199IGRvZXNuJ3QgaGF2ZSBleGFjdGx5ICR7ZGVmaW5lcy5zZXRLZXlzLmxlbmd0aH0gc2V0IGFyZ3VtZW50JHtcbiAgICAgICAgICBkZWZpbmVzLnNldEtleXMubGVuZ3RoID4gMSA/IFwic1wiIDogXCJcIlxuICAgICAgICB9IVxcYCk7XG4gICAgICB9XG4gICAgICB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLm1hcEtleXNbMF19LCAuLi5fX3NldF9fKTtcbiAgICAgIHJldHVybiBfX3NldF9fO1xuICAgIH0pO1xuXG4gICAgY29uc3QgX19pbm5lclNldF9fID0gdGhpcy4jcmVxdWlyZUlubmVyU2V0KCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSk7XG5cbiAgICAvLyBsZXZlbCAyOiBpbm5lciBtYXAgdG8gc2V0XG4gICAgX19hcnJheV9fLmZvckVhY2goX19zZXRfXyA9PiBfX2lubmVyU2V0X18uYWRkKF9fc2V0X19bMF0pKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiY2xlYXJTZXRzXCIsIDIpfVxuICBjbGVhclNldHMoJHtkZWZpbmVzLm1hcEtleXNbMF19KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSk7XG4gICAgY29uc3QgX19pbm5lclNldF9fID0gdGhpcy4jcm9vdC5nZXQoJHtkZWZpbmVzLm1hcEtleXNbMF19KTtcbiAgICBpZiAoIV9faW5uZXJTZXRfXylcbiAgICAgIHJldHVybjtcblxuICAgIF9faW5uZXJTZXRfXy5jbGVhcigpO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZGVsZXRlXCIsIDIpfVxuICBkZWxldGUoJHtkZWZpbmVzLm1hcEtleXNbMF19LCAke2RlZmluZXMuc2V0S2V5c1swXX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLm1hcEtleXNbMF19LCAke2RlZmluZXMuc2V0S2V5c1swXX0pO1xuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI3Jvb3QuZ2V0KCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSk7XG4gICAgaWYgKCFfX2lubmVyU2V0X18pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBsZXZlbCAyOiBpbm5lciBtYXAgdG8gc2V0XG4gICAgY29uc3QgX19yZXR1cm5WYWx1ZV9fID0gX19pbm5lclNldF9fLmRlbGV0ZSgke2RlZmluZXMuc2V0S2V5c1swXX0pO1xuXG4gICAgaWYgKF9faW5uZXJTZXRfXy5zaXplID09PSAwKSB7XG4gICAgICB0aGlzLmRlbGV0ZVNldHMoJHtkZWZpbmVzLm1hcEtleXNbMF19KTtcbiAgICB9XG5cbiAgICByZXR1cm4gX19yZXR1cm5WYWx1ZV9fO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZGVsZXRlU2V0c1wiLCAyKX1cbiAgZGVsZXRlU2V0cygke2RlZmluZXMubWFwS2V5c1swXX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXNbMF19KTtcbiAgICByZXR1cm4gdGhpcy4jcm9vdC5kZWxldGUoJHtkZWZpbmVzLm1hcEtleXNbMF19KTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImZvckVhY2hNYXBTZXRcIiwgMil9XG4gIGZvckVhY2hTZXQoJHtkZWZpbmVzLm1hcEtleXNbMF19LCBfX2NhbGxiYWNrX18sIF9fdGhpc0FyZ19fKSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSk7XG4gICAgY29uc3QgX19pbm5lclNldF9fID0gdGhpcy4jcm9vdC5nZXQoJHtkZWZpbmVzLm1hcEtleXNbMF19KTtcbiAgICBpZiAoIV9faW5uZXJTZXRfXylcbiAgICAgIHJldHVybjtcblxuICAgIF9faW5uZXJTZXRfXy5mb3JFYWNoKFxuICAgICAgX19lbGVtZW50X18gPT4gX19jYWxsYmFja19fLmFwcGx5KF9fdGhpc0FyZ19fLCBbJHtkZWZpbmVzLm1hcEtleXNbMF19LCBfX2VsZW1lbnRfXywgdGhpc10pXG4gICAgKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImZvckVhY2hDYWxsYmFja1NldFwiLCAyKX1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJnZXRTaXplT2ZTZXRcIiwgMil9XG4gIGdldFNpemVPZlNldCgke2RlZmluZXMubWFwS2V5c1swXX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXNbMF19KTtcbiAgICBjb25zdCBfX2lubmVyU2V0X18gPSB0aGlzLiNyb290LmdldCgke2RlZmluZXMubWFwS2V5c1swXX0pO1xuICAgIHJldHVybiBfX2lubmVyU2V0X18/LnNpemUgfHwgMDtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImhhc1wiLCAyKX1cbiAgaGFzKCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSwgJHtkZWZpbmVzLnNldEtleXNbMF19KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSwgJHtkZWZpbmVzLnNldEtleXNbMF19KTtcbiAgICBjb25zdCBfX2lubmVyU2V0X18gPSB0aGlzLiNyb290LmdldCgke2RlZmluZXMubWFwS2V5c1swXX0pO1xuICAgIGlmICghX19pbm5lclNldF9fKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgcmV0dXJuIF9faW5uZXJTZXRfXy5oYXMoJHtkZWZpbmVzLnNldEtleXNbMF19KTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImhhc1NldFwiLCAyKX1cbiAgaGFzU2V0cygke2RlZmluZXMubWFwS2V5c1swXX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXNbMF19KTtcbiAgICByZXR1cm4gdGhpcy4jcm9vdC5oYXMoJHtkZWZpbmVzLm1hcEtleXNbMF19KTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRLZXlQdWJsaWNcIiwgMil9XG4gIGlzVmFsaWRLZXkoJHtkZWZpbmVzLm1hcEtleXNbMF19LCAke2RlZmluZXMuc2V0S2V5c1swXX0pIHtcbiAgICByZXR1cm4gdGhpcy4jaXNWYWxpZEtleSgke2RlZmluZXMubWFwS2V5c1swXX0sICR7ZGVmaW5lcy5zZXRLZXlzWzBdfSk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJ2YWx1ZXNTZXRcIiwgMil9XG4gICogdmFsdWVzU2V0KCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5c1swXX0pO1xuXG4gICAgY29uc3QgX19pbm5lclNldF9fID0gdGhpcy4jcm9vdC5nZXQoJHtkZWZpbmVzLm1hcEtleXNbMF19KTtcbiAgICBpZiAoIV9faW5uZXJTZXRfXylcbiAgICAgIHJldHVybjtcblxuICAgIGNvbnN0IF9fb3V0ZXJJdGVyX18gPSBfX2lubmVyU2V0X18udmFsdWVzKCk7XG4gICAgZm9yIChsZXQgX192YWx1ZV9fIG9mIF9fb3V0ZXJJdGVyX18pXG4gICAgICB5aWVsZCBbJHtkZWZpbmVzLm1hcEtleXNbMF19LCBfX3ZhbHVlX19dO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZUlubmVyQ29sbGVjdGlvblByaXZhdGVcIiwgMil9XG4gICNyZXF1aXJlSW5uZXJTZXQoJHtkZWZpbmVzLm1hcEtleXNbMF19KSB7XG4gICAgaWYgKCF0aGlzLiNyb290Lmhhcygke2RlZmluZXMubWFwS2V5c1swXX0pKSB7XG4gICAgICB0aGlzLiNyb290LnNldCgke2RlZmluZXMubWFwS2V5c1swXX0sIG5ldyBTZXQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy4jcm9vdC5nZXQoJHtkZWZpbmVzLm1hcEtleXNbMF19KTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcInJlcXVpcmVWYWxpZEtleVwiLCAyKX1cbiAgI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMubWFwS2V5c1swXX0sICR7ZGVmaW5lcy5zZXRLZXlzWzBdfSkge1xuICAgIGlmICghdGhpcy4jaXNWYWxpZEtleSgke2RlZmluZXMubWFwS2V5c1swXX0sICR7ZGVmaW5lcy5zZXRLZXlzWzBdfSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgb3JkZXJlZCBrZXkgc2V0IGlzIG5vdCB2YWxpZCFcIik7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHJpdmF0ZVwiLCAyKX1cbiAgI2lzVmFsaWRLZXkoJHtkZWZpbmVzLm1hcEtleXNbMF19LCAke2RlZmluZXMuc2V0S2V5c1swXX0pIHtcbiAgICByZXR1cm4gdGhpcy4jaXNWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5c1swXX0pICYmIHRoaXMuI2lzVmFsaWRTZXRLZXkoJHtkZWZpbmVzLnNldEtleXNbMF19KTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcInJlcXVpcmVWYWxpZE1hcEtleVwiLCAyKX1cbiAgI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5c1swXX0pIHtcbiAgICBpZiAoIXRoaXMuI2lzVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXNbMF19KSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBvcmRlcmVkIG1hcCBrZXkgc2V0IGlzIG5vdCB2YWxpZCFcIik7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkTWFwS2V5UHJpdmF0ZVwiLCAyKX1cbiAgI2lzVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXNbMF19KSB7XG4gICAgaWYgKE9iamVjdCgke2RlZmluZXMubWFwS2V5c1swXX0pICE9PSAke2RlZmluZXMubWFwS2V5c1swXX0pXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgJHtkZWZpbmVzLnZhbGlkYXRlTWFwQXJndW1lbnRzIHx8IFwiXCJ9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkU2V0S2V5UHJpdmF0ZVwiLCAyKX1cbiAgI2lzVmFsaWRTZXRLZXkoJHtkZWZpbmVzLnNldEtleXNbMF19KSB7XG4gICAgdm9pZCgke2RlZmluZXMuc2V0S2V5c1swXX0pO1xuXG4gICAgJHtkZWZpbmVzLnZhbGlkYXRlU2V0QXJndW1lbnRzIHx8IFwiXCJ9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBbU3ltYm9sLnRvU3RyaW5nVGFnXSA9IFwiJHtkZWZpbmVzLmNsYXNzTmFtZX1cIjtcbn1cblxuT2JqZWN0LmZyZWV6ZSgke2RlZmluZXMuY2xhc3NOYW1lfSk7XG5PYmplY3QuZnJlZXplKCR7ZGVmaW5lcy5jbGFzc05hbWV9LnByb3RvdHlwZSk7XG5gO1xufVxuXG5leHBvcnQgZGVmYXVsdCBwcmVwcm9jZXNzO1xuIl19