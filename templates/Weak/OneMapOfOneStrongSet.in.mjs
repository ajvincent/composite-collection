/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    return `
${defines.get("importLines")}
class ${defines.get("className")} {
  /**
   * @type {WeakMap<${defines.get("mapArgument0Type")}, Set<${defines.get("setArgument0Type")}>>}
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
  add(${defines.get("mapArgument0")}, ${defines.get("setArgument0")}) {
    this.#requireValidKey(${defines.get("mapArgument0")}, ${defines.get("setArgument0")});
    const __innerSet__ = this.#requireInnerSet(${defines.get("mapArgument0")});

    __innerSet__.add(${defines.get("setArgument0")});
    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.get("mapArgument0")}, __sets__) {
    this.#requireValidMapKey(${defines.get("mapArgument0")});
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.get("setCount")}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.get("setCount")} set argument${defines.get("setCount") > 1 ? "s" : ""}!\`);
      }
      this.#requireValidKey(${defines.get("mapArgument0")}, ...__set__);
      return __set__;
    });

    const __innerSet__ = this.#requireInnerSet(${defines.get("mapArgument0")});

    // level 2: inner map to set
    __array__.forEach(__set__ => __innerSet__.add(__set__[0]));

    return this;
  }

${docs.buildBlock("clearSets", 2)}
  clearSets(${defines.get("mapArgument0")}) {
    this.#requireValidMapKey(${defines.get("mapArgument0")});
    const __innerSet__ = this.#root.get(${defines.get("mapArgument0")});
    if (!__innerSet__)
      return;

    __innerSet__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("mapArgument0")}, ${defines.get("setArgument0")}) {
    this.#requireValidKey(${defines.get("mapArgument0")}, ${defines.get("setArgument0")});
    const __innerSet__ = this.#root.get(${defines.get("mapArgument0")});
    if (!__innerSet__)
      return false;

    // level 2: inner map to set
    const __returnValue__ = __innerSet__.delete(${defines.get("setArgument0")});

    if (__innerSet__.size === 0) {
      this.deleteSets(${defines.get("mapArgument0")});
    }

    return __returnValue__;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.get("mapArgument0")}) {
    this.#requireValidMapKey(${defines.get("mapArgument0")});
    return this.#root.delete(${defines.get("mapArgument0")});
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.get("mapArgument0")}, __callback__, __thisArg__) {
    this.#requireValidMapKey(${defines.get("mapArgument0")});
    const __innerSet__ = this.#root.get(${defines.get("mapArgument0")});
    if (!__innerSet__)
      return;

    __innerSet__.forEach(
      __element__ => __callback__.apply(__thisArg__, [${defines.get("mapArgument0")}, __element__, this])
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${defines.get("mapArgument0")}) {
    this.#requireValidMapKey(${defines.get("mapArgument0")});
    const __innerSet__ = this.#root.get(${defines.get("mapArgument0")});
    return __innerSet__?.size || 0;
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("mapArgument0")}, ${defines.get("setArgument0")}) {
    this.#requireValidKey(${defines.get("mapArgument0")}, ${defines.get("setArgument0")});
    const __innerSet__ = this.#root.get(${defines.get("mapArgument0")});
    if (!__innerSet__)
      return false;

    return __innerSet__.has(${defines.get("setArgument0")});
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.get("mapArgument0")}) {
    this.#requireValidMapKey(${defines.get("mapArgument0")});
    return this.#root.has(${defines.get("mapArgument0")});
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("mapArgument0")}, ${defines.get("setArgument0")}) {
    return this.#isValidKey(${defines.get("mapArgument0")}, ${defines.get("setArgument0")});
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${defines.get("mapArgument0")}) {
    this.#requireValidMapKey(${defines.get("mapArgument0")});

    const __innerSet__ = this.#root.get(${defines.get("mapArgument0")});
    if (!__innerSet__)
      return;

    const __outerIter__ = __innerSet__.values();
    for (let __value__ of __outerIter__)
      yield [${defines.get("mapArgument0")}, __value__];
  }

${docs.buildBlock("requireInnerCollectionPrivate", 2)}
  #requireInnerSet(${defines.get("mapArgument0")}) {
    if (!this.#root.has(${defines.get("mapArgument0")})) {
      this.#root.set(${defines.get("mapArgument0")}, new Set);
    }
    return this.#root.get(${defines.get("mapArgument0")});
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.get("mapArgument0")}, ${defines.get("setArgument0")}) {
    if (!this.#isValidKey(${defines.get("mapArgument0")}, ${defines.get("setArgument0")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.get("mapArgument0")}, ${defines.get("setArgument0")}) {
    return this.#isValidMapKey(${defines.get("mapArgument0")}) && this.#isValidSetKey(${defines.get("setArgument0")});
  }

${docs.buildBlock("requireValidMapKey", 2)}
  #requireValidMapKey(${defines.get("mapArgument0")}) {
    if (!this.#isValidMapKey(${defines.get("mapArgument0")}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  #isValidMapKey(${defines.get("mapArgument0")}) {
    if (Object(${defines.get("mapArgument0")}) !== ${defines.get("mapArgument0")})
      return false;
    ${defines.get("validateMapArguments") || ""}
    return true;
  }

${docs.buildBlock("isValidSetKeyPrivate", 2)}
  #isValidSetKey(${defines.get("setArgument0")}) {
    void(${defines.get("setArgument0")});

    ${defines.get("validateSetArguments") || ""}
    return true;
  }

  [Symbol.toStringTag] = "${defines.get("className")}";
}

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`;
};
export default preprocess;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT25lTWFwT2ZPbmVTdHJvbmdTZXQuaW4ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiT25lTWFwT2ZPbmVTdHJvbmdTZXQuaW4ubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsR0FBcUIsU0FBUyxVQUFVLENBQUMsT0FBNEIsRUFBRSxJQUFvQjtJQUN6RyxPQUFPO0VBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUM7UUFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7O3NCQUVWLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsU0FBUyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0VBZ0IzRixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsS0FBSyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQzs0QkFDdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsS0FBSyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQztpREFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUM7O3VCQUVyRCxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQzs7OztFQUloRCxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7WUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUM7K0JBQ1IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUM7OzsrQkFHM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7NEVBQ3NCLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLGdCQUN6RixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxD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QUFzQixFQUFFLENBQUMsQ0FBQzttQkFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUM7aUJBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLFNBQVMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUM7O01BRTFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsSUFBSSxFQUFFOzs7O0VBSTdDLElBQUksQ0FBQyxVQUFVLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO21CQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQztXQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQzs7TUFFaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEVBQUU7Ozs7NEJBSW5CLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDOzs7Z0JBR3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO2dCQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztDQUN2QyxDQUFDO0FBQ0YsQ0FBQyxDQUFBO0FBRUQsZUFBZSxVQUFVLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFByZXByb2Nlc3NvckRlZmluZXMsIEpTRG9jR2VuZXJhdG9yLCBUZW1wbGF0ZUZ1bmN0aW9uIH0gZnJvbSBcIi4uL3NoYXJlZFR5cGVzLm1qc1wiO1xuXG4vKipcbiAqIEBwYXJhbSB7TWFwfSAgICAgICAgICAgIGRlZmluZXMgVGhlIHByZXByb2Nlc3NvciBtYWNyb3MuXG4gKiBAcGFyYW0ge0pTRG9jR2VuZXJhdG9yfSBkb2NzICAgIFRoZSBwcmltYXJ5IGRvY3VtZW50YXRpb24gZ2VuZXJhdG9yLlxuICogQHJldHVybnMge3N0cmluZ30gICAgICAgICAgICAgICBUaGUgZ2VuZXJhdGVkIHNvdXJjZSBjb2RlLlxuICovXG5jb25zdCBwcmVwcm9jZXNzOiBUZW1wbGF0ZUZ1bmN0aW9uID0gZnVuY3Rpb24gcHJlcHJvY2VzcyhkZWZpbmVzOiBQcmVwcm9jZXNzb3JEZWZpbmVzLCBkb2NzOiBKU0RvY0dlbmVyYXRvcikge1xuICByZXR1cm4gYFxuJHtkZWZpbmVzLmdldChcImltcG9ydExpbmVzXCIpfVxuY2xhc3MgJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX0ge1xuICAvKipcbiAgICogQHR5cGUge1dlYWtNYXA8JHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFR5cGVcIil9LCBTZXQ8JHtkZWZpbmVzLmdldChcInNldEFyZ3VtZW50MFR5cGVcIil9Pj59XG4gICAqIEBjb25zdGFudFxuICAgKiBUaGlzIGlzIHR3byBsZXZlbHMuIFRoZSBmaXJzdCBsZXZlbCBpcyB0aGUgbWFwIGtleS5cbiAgICogVGhlIHNlY29uZCBsZXZlbCBpcyB0aGUgc3Ryb25nIHNldC5cbiAgICovXG4gICNyb290ID0gbmV3IFdlYWtNYXAoKTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGl0ZXJhYmxlID0gYXJndW1lbnRzWzBdO1xuICAgICAgZm9yIChsZXQgZW50cnkgb2YgaXRlcmFibGUpIHtcbiAgICAgICAgdGhpcy5hZGQoLi4uZW50cnkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImFkZFwiLCAyKX1cbiAgYWRkKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9LCAke2RlZmluZXMuZ2V0KFwic2V0QXJndW1lbnQwXCIpfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSwgJHtkZWZpbmVzLmdldChcInNldEFyZ3VtZW50MFwiKX0pO1xuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI3JlcXVpcmVJbm5lclNldCgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSk7XG5cbiAgICBfX2lubmVyU2V0X18uYWRkKCR7ZGVmaW5lcy5nZXQoXCJzZXRBcmd1bWVudDBcIil9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImFkZFNldHNcIiwgMil9XG4gIGFkZFNldHMoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0sIF9fc2V0c19fKSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KTtcbiAgICBjb25zdCBfX2FycmF5X18gPSBBcnJheS5mcm9tKF9fc2V0c19fKS5tYXAoKF9fc2V0X18sIF9faW5kZXhfXykgPT4ge1xuICAgICAgX19zZXRfXyA9IEFycmF5LmZyb20oX19zZXRfXyk7XG4gICAgICBpZiAoX19zZXRfXy5sZW5ndGggIT09ICR7ZGVmaW5lcy5nZXQoXCJzZXRDb3VudFwiKX0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxcYFNldCBhdCBpbmRleCBcXCR7X19pbmRleF9ffSBkb2Vzbid0IGhhdmUgZXhhY3RseSAke2RlZmluZXMuZ2V0KFwic2V0Q291bnRcIil9IHNldCBhcmd1bWVudCR7XG4gICAgICAgICAgZGVmaW5lcy5nZXQoXCJzZXRDb3VudFwiKSEgPiAxID8gXCJzXCIgOiBcIlwiXG4gICAgICAgIH0hXFxgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSwgLi4uX19zZXRfXyk7XG4gICAgICByZXR1cm4gX19zZXRfXztcbiAgICB9KTtcblxuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI3JlcXVpcmVJbm5lclNldCgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSk7XG5cbiAgICAvLyBsZXZlbCAyOiBpbm5lciBtYXAgdG8gc2V0XG4gICAgX19hcnJheV9fLmZvckVhY2goX19zZXRfXyA9PiBfX2lubmVyU2V0X18uYWRkKF9fc2V0X19bMF0pKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiY2xlYXJTZXRzXCIsIDIpfVxuICBjbGVhclNldHMoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pO1xuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI3Jvb3QuZ2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KTtcbiAgICBpZiAoIV9faW5uZXJTZXRfXylcbiAgICAgIHJldHVybjtcblxuICAgIF9faW5uZXJTZXRfXy5jbGVhcigpO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZGVsZXRlXCIsIDIpfVxuICBkZWxldGUoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmd1bWVudDBcIil9KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9LCAke2RlZmluZXMuZ2V0KFwic2V0QXJndW1lbnQwXCIpfSk7XG4gICAgY29uc3QgX19pbm5lclNldF9fID0gdGhpcy4jcm9vdC5nZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pO1xuICAgIGlmICghX19pbm5lclNldF9fKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gbGV2ZWwgMjogaW5uZXIgbWFwIHRvIHNldFxuICAgIGNvbnN0IF9fcmV0dXJuVmFsdWVfXyA9IF9faW5uZXJTZXRfXy5kZWxldGUoJHtkZWZpbmVzLmdldChcInNldEFyZ3VtZW50MFwiKX0pO1xuXG4gICAgaWYgKF9faW5uZXJTZXRfXy5zaXplID09PSAwKSB7XG4gICAgICB0aGlzLmRlbGV0ZVNldHMoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pO1xuICAgIH1cblxuICAgIHJldHVybiBfX3JldHVyblZhbHVlX187XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJkZWxldGVTZXRzXCIsIDIpfVxuICBkZWxldGVTZXRzKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KTtcbiAgICByZXR1cm4gdGhpcy4jcm9vdC5kZWxldGUoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZm9yRWFjaE1hcFNldFwiLCAyKX1cbiAgZm9yRWFjaFNldCgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSwgX19jYWxsYmFja19fLCBfX3RoaXNBcmdfXykge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSk7XG4gICAgY29uc3QgX19pbm5lclNldF9fID0gdGhpcy4jcm9vdC5nZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pO1xuICAgIGlmICghX19pbm5lclNldF9fKVxuICAgICAgcmV0dXJuO1xuXG4gICAgX19pbm5lclNldF9fLmZvckVhY2goXG4gICAgICBfX2VsZW1lbnRfXyA9PiBfX2NhbGxiYWNrX18uYXBwbHkoX190aGlzQXJnX18sIFske2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSwgX19lbGVtZW50X18sIHRoaXNdKVxuICAgICk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJmb3JFYWNoQ2FsbGJhY2tTZXRcIiwgMil9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZ2V0U2l6ZU9mU2V0XCIsIDIpfVxuICBnZXRTaXplT2ZTZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pO1xuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI3Jvb3QuZ2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KTtcbiAgICByZXR1cm4gX19pbm5lclNldF9fPy5zaXplIHx8IDA7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJoYXNcIiwgMil9XG4gIGhhcygke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSwgJHtkZWZpbmVzLmdldChcInNldEFyZ3VtZW50MFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmd1bWVudDBcIil9KTtcbiAgICBjb25zdCBfX2lubmVyU2V0X18gPSB0aGlzLiNyb290LmdldCgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSk7XG4gICAgaWYgKCFfX2lubmVyU2V0X18pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICByZXR1cm4gX19pbm5lclNldF9fLmhhcygke2RlZmluZXMuZ2V0KFwic2V0QXJndW1lbnQwXCIpfSk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJoYXNTZXRcIiwgMil9XG4gIGhhc1NldHMoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pO1xuICAgIHJldHVybiB0aGlzLiNyb290Lmhhcygke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHVibGljXCIsIDIpfVxuICBpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9LCAke2RlZmluZXMuZ2V0KFwic2V0QXJndW1lbnQwXCIpfSkge1xuICAgIHJldHVybiB0aGlzLiNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9LCAke2RlZmluZXMuZ2V0KFwic2V0QXJndW1lbnQwXCIpfSk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJ2YWx1ZXNTZXRcIiwgMil9XG4gICogdmFsdWVzU2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KTtcblxuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI3Jvb3QuZ2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KTtcbiAgICBpZiAoIV9faW5uZXJTZXRfXylcbiAgICAgIHJldHVybjtcblxuICAgIGNvbnN0IF9fb3V0ZXJJdGVyX18gPSBfX2lubmVyU2V0X18udmFsdWVzKCk7XG4gICAgZm9yIChsZXQgX192YWx1ZV9fIG9mIF9fb3V0ZXJJdGVyX18pXG4gICAgICB5aWVsZCBbJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0sIF9fdmFsdWVfX107XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJyZXF1aXJlSW5uZXJDb2xsZWN0aW9uUHJpdmF0ZVwiLCAyKX1cbiAgI3JlcXVpcmVJbm5lclNldCgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSkge1xuICAgIGlmICghdGhpcy4jcm9vdC5oYXMoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pKSB7XG4gICAgICB0aGlzLiNyb290LnNldCgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSwgbmV3IFNldCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLiNyb290LmdldCgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJyZXF1aXJlVmFsaWRLZXlcIiwgMil9XG4gICNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmd1bWVudDBcIil9KSB7XG4gICAgaWYgKCF0aGlzLiNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9LCAke2RlZmluZXMuZ2V0KFwic2V0QXJndW1lbnQwXCIpfSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgb3JkZXJlZCBrZXkgc2V0IGlzIG5vdCB2YWxpZCFcIik7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHJpdmF0ZVwiLCAyKX1cbiAgI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmd1bWVudDBcIil9KSB7XG4gICAgcmV0dXJuIHRoaXMuI2lzVmFsaWRNYXBLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pICYmIHRoaXMuI2lzVmFsaWRTZXRLZXkoJHtkZWZpbmVzLmdldChcInNldEFyZ3VtZW50MFwiKX0pO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZVZhbGlkTWFwS2V5XCIsIDIpfVxuICAjcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KSB7XG4gICAgaWYgKCF0aGlzLiNpc1ZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBvcmRlcmVkIG1hcCBrZXkgc2V0IGlzIG5vdCB2YWxpZCFcIik7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkTWFwS2V5UHJpdmF0ZVwiLCAyKX1cbiAgI2lzVmFsaWRNYXBLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pIHtcbiAgICBpZiAoT2JqZWN0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KSAhPT0gJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgJHtkZWZpbmVzLmdldChcInZhbGlkYXRlTWFwQXJndW1lbnRzXCIpIHx8IFwiXCJ9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkU2V0S2V5UHJpdmF0ZVwiLCAyKX1cbiAgI2lzVmFsaWRTZXRLZXkoJHtkZWZpbmVzLmdldChcInNldEFyZ3VtZW50MFwiKX0pIHtcbiAgICB2b2lkKCR7ZGVmaW5lcy5nZXQoXCJzZXRBcmd1bWVudDBcIil9KTtcblxuICAgICR7ZGVmaW5lcy5nZXQoXCJ2YWxpZGF0ZVNldEFyZ3VtZW50c1wiKSB8fCBcIlwifVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgW1N5bWJvbC50b1N0cmluZ1RhZ10gPSBcIiR7ZGVmaW5lcy5nZXQoXCJjbGFzc05hbWVcIil9XCI7XG59XG5cbk9iamVjdC5mcmVlemUoJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX0pO1xuT2JqZWN0LmZyZWV6ZSgke2RlZmluZXMuZ2V0KFwiY2xhc3NOYW1lXCIpfS5wcm90b3R5cGUpO1xuYDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgcHJlcHJvY2VzcztcbiJdfQ==