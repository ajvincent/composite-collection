/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    return `
${defines.importLines}
import KeyHasher from "./keys/Hasher.mjs";

/** @typedef {Map<hash, *[]>} ${defines.className}~InnerMap */

class ${defines.className} {
  /** @typedef {string} hash */

  /**
   * @type {WeakMap<${defines.mapArgument0Type}, ${defines.className}~InnerMap>}
   * @constant
   * This is two levels. The first level is the map key.
   * The second level is the strong set.
   */
  #root = new WeakMap();

  /** @type {KeyHasher} @constant */
  #setHasher = new KeyHasher();

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.add(...entry);
      }
    }
  }

${docs.buildBlock("add", 2)}
  add(${defines.mapKeys.join(", ")}, ${defines.setKeys}) {
    this.#requireValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys});
    const __innerMap__ = this.#requireInnerMap(${defines.mapKeys.join(", ")});

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHash(${defines.setKeys});
    if (!__innerMap__.has(__setKeyHash__)) {
      __innerMap__.set(__setKeyHash__, [${defines.setKeys}]);
    }

    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.mapKeys.join(", ")}, __sets__) {
    this.#requireValidMapKey(${defines.mapKeys.join(", ")});
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.setKeys.length}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.setKeys.length} set argument${defines.setKeys.length > 1 ? "s" : ""}!\`);
      }
      this.#requireValidKey(${defines.mapKeys.join(", ")}, ...__set__);
      return __set__;
    });

    const __innerMap__ = this.#requireInnerMap(${defines.mapKeys.join(", ")});

    // level 2: inner map to set
    __array__.forEach(__set__ => {
      const __setKeyHash__ = this.#setHasher.getHash(...__set__);
      if (!__innerMap__.has(__setKeyHash__)) {
        __innerMap__.set(__setKeyHash__, __set__);
      }
    });

    return this;
  }

${docs.buildBlock("clearSets", 2)}
  clearSets(${defines.mapKeys.join(", ")}) {
    this.#requireValidMapKey(${defines.mapKeys.join(", ")});
    const __innerMap__ = this.#root.get(${defines.mapKeys[0]});
    __innerMap__?.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.mapKeys.join(", ")}, ${defines.setKeys}) {
    this.#requireValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys});
    const __innerMap__ = this.#root.get(${defines.mapKeys[0]});
    if (!__innerMap__)
      return false;

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHashIfExists(${defines.setKeys});
    if (!__setKeyHash__)
      return false;
    const __returnValue__ = __innerMap__.delete(__setKeyHash__);

    if (__innerMap__.size === 0) {
      this.deleteSets(${defines.mapKeys.join(", ")});
    }

    return __returnValue__;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.mapKeys[0]}) {
    this.#requireValidMapKey(${defines.mapKeys[0]});
    return this.#root.delete(${defines.mapKeys[0]});
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.mapKeys.join(", ")}, __callback__, __thisArg__) {
    this.#requireValidMapKey(${defines.mapKeys.join(", ")});
    const __innerMap__ = this.#root.get(${defines.mapKeys[0]});
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, [${defines.mapKeys.join(", ")}, ...__keySet__, this])
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${defines.mapKeys.join(", ")}) {
    this.#requireValidMapKey(${defines.mapKeys.join(", ")});
    const __innerMap__ = this.#root.get(${defines.mapKeys[0]});
    return __innerMap__?.size || 0;
  }

${docs.buildBlock("has", 2)}
  has(${defines.mapKeys.join(", ")}, ${defines.setKeys}) {
    this.#requireValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys});
    const __innerMap__ = this.#root.get(${defines.mapKeys[0]});
    if (!__innerMap__)
      return false;

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHashIfExists(${defines.setKeys});
    return __setKeyHash__ ? __innerMap__.has(__setKeyHash__) : false;
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.mapKeys.join(", ")}) {
    this.#requireValidMapKey(${defines.mapKeys.join(", ")});
    return this.#root.has(${defines.mapKeys[0]});
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys}) {
    return this.#isValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys});
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${defines.mapKeys.join(", ")}) {
    this.#requireValidMapKey(${defines.mapKeys.join(", ")});

    const __innerMap__ = this.#root.get(${defines.mapKeys[0]});
    if (!__innerMap__)
      return;

    const __outerIter__ = __innerMap__.values();
    for (let __value__ of __outerIter__)
      yield [${defines.mapKeys.join(", ")}, ...__value__];
  }

${docs.buildBlock("requireInnerCollectionPrivate", 2)}
  #requireInnerMap(${defines.mapKeys[0]}) {
    if (!this.#root.has(${defines.mapKeys[0]})) {
      this.#root.set(${defines.mapKeys[0]}, new Map);
    }
    return this.#root.get(${defines.mapKeys[0]});
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys}) {
    if (!this.#isValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.mapKeys[0]}, ${defines.setKeys}) {
    return this.#isValidMapKey(${defines.mapKeys[0]}) && this.#isValidSetKey(${defines.setKeys});
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
  #isValidSetKey(${defines.setKeys}) {
    void(${defines.setKeys});

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT25lTWFwT2ZTdHJvbmdTZXRzLmluLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk9uZU1hcE9mU3Ryb25nU2V0cy5pbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxHQUFxQixTQUFTLFVBQVUsQ0FBQyxPQUF3QixFQUFFLElBQW9CO0lBQ3JHLE9BQU87RUFDUCxPQUFPLENBQUMsV0FBVzs7O2dDQUdXLE9BQU8sQ0FBQyxTQUFTOztRQUV6QyxPQUFPLENBQUMsU0FBUzs7OztzQkFJSCxPQUFPLENBQUMsZ0JBQWdCLEtBQUssT0FBTyxDQUFDLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFtQmxFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxPQUFPLENBQUMsT0FBTzs0QkFDMUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssT0FBTyxDQUFDLE9BQU87aURBQ3pCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs7O3FEQUd0QixPQUFPLENBQUMsT0FBTzs7MENBRTFCLE9BQU8sQ0FBQyxPQUFPOzs7Ozs7RUFNdkQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQ25CLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzsrQkFDUCxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7OzsrQkFHMUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNOzRFQUN1QixPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sZ0JBQ3hGLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNyQzs7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QUkvQyxJQUFJLENBQUMsVUFBVSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQzttQkFDekIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7aUJBQ3BCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7O01BRXhELE9BQU8sQ0FBQyxvQkFBb0IsSUFBSSxFQUFFOzs7O0VBSXRDLElBQUksQ0FBQyxVQUFVLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO21CQUN6QixPQUFPLENBQUMsT0FBTztXQUN2QixPQUFPLENBQUMsT0FBTzs7TUFFcEIsT0FBTyxDQUFDLG9CQUFvQixJQUFJLEVBQUU7Ozs7NEJBSVosT0FBTyxDQUFDLFNBQVM7OztnQkFHN0IsT0FBTyxDQUFDLFNBQVM7Z0JBQ2pCLE9BQU8sQ0FBQyxTQUFTO0NBQ2hDLENBQUM7QUFDRixDQUFDLENBQUE7QUFFRCxlQUFlLFVBQVUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUmVhZG9ubHlEZWZpbmVzLCBKU0RvY0dlbmVyYXRvciwgVGVtcGxhdGVGdW5jdGlvbiB9IGZyb20gXCIuLi9zaGFyZWRUeXBlcy5tanNcIjtcblxuLyoqXG4gKiBAcGFyYW0ge01hcH0gICAgICAgICAgICBkZWZpbmVzIFRoZSBwcmVwcm9jZXNzb3IgbWFjcm9zLlxuICogQHBhcmFtIHtKU0RvY0dlbmVyYXRvcn0gZG9jcyAgICBUaGUgcHJpbWFyeSBkb2N1bWVudGF0aW9uIGdlbmVyYXRvci5cbiAqIEByZXR1cm5zIHtzdHJpbmd9ICAgICAgICAgICAgICAgVGhlIGdlbmVyYXRlZCBzb3VyY2UgY29kZS5cbiAqL1xuY29uc3QgcHJlcHJvY2VzczogVGVtcGxhdGVGdW5jdGlvbiA9IGZ1bmN0aW9uIHByZXByb2Nlc3MoZGVmaW5lczogUmVhZG9ubHlEZWZpbmVzLCBkb2NzOiBKU0RvY0dlbmVyYXRvcikge1xuICByZXR1cm4gYFxuJHtkZWZpbmVzLmltcG9ydExpbmVzfVxuaW1wb3J0IEtleUhhc2hlciBmcm9tIFwiLi9rZXlzL0hhc2hlci5tanNcIjtcblxuLyoqIEB0eXBlZGVmIHtNYXA8aGFzaCwgKltdPn0gJHtkZWZpbmVzLmNsYXNzTmFtZX1+SW5uZXJNYXAgKi9cblxuY2xhc3MgJHtkZWZpbmVzLmNsYXNzTmFtZX0ge1xuICAvKiogQHR5cGVkZWYge3N0cmluZ30gaGFzaCAqL1xuXG4gIC8qKlxuICAgKiBAdHlwZSB7V2Vha01hcDwke2RlZmluZXMubWFwQXJndW1lbnQwVHlwZX0sICR7ZGVmaW5lcy5jbGFzc05hbWV9fklubmVyTWFwPn1cbiAgICogQGNvbnN0YW50XG4gICAqIFRoaXMgaXMgdHdvIGxldmVscy4gVGhlIGZpcnN0IGxldmVsIGlzIHRoZSBtYXAga2V5LlxuICAgKiBUaGUgc2Vjb25kIGxldmVsIGlzIHRoZSBzdHJvbmcgc2V0LlxuICAgKi9cbiAgI3Jvb3QgPSBuZXcgV2Vha01hcCgpO1xuXG4gIC8qKiBAdHlwZSB7S2V5SGFzaGVyfSBAY29uc3RhbnQgKi9cbiAgI3NldEhhc2hlciA9IG5ldyBLZXlIYXNoZXIoKTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGl0ZXJhYmxlID0gYXJndW1lbnRzWzBdO1xuICAgICAgZm9yIChsZXQgZW50cnkgb2YgaXRlcmFibGUpIHtcbiAgICAgICAgdGhpcy5hZGQoLi4uZW50cnkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImFkZFwiLCAyKX1cbiAgYWRkKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0sICR7ZGVmaW5lcy5zZXRLZXlzfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAke2RlZmluZXMuc2V0S2V5c30pO1xuICAgIGNvbnN0IF9faW5uZXJNYXBfXyA9IHRoaXMuI3JlcXVpcmVJbm5lck1hcCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KTtcblxuICAgIC8vIGxldmVsIDI6IGlubmVyIG1hcCB0byBzZXRcbiAgICBjb25zdCBfX3NldEtleUhhc2hfXyA9IHRoaXMuI3NldEhhc2hlci5nZXRIYXNoKCR7ZGVmaW5lcy5zZXRLZXlzfSk7XG4gICAgaWYgKCFfX2lubmVyTWFwX18uaGFzKF9fc2V0S2V5SGFzaF9fKSkge1xuICAgICAgX19pbm5lck1hcF9fLnNldChfX3NldEtleUhhc2hfXywgWyR7ZGVmaW5lcy5zZXRLZXlzfV0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiYWRkU2V0c1wiLCAyKX1cbiAgYWRkU2V0cygke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCBfX3NldHNfXykge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KTtcbiAgICBjb25zdCBfX2FycmF5X18gPSBBcnJheS5mcm9tKF9fc2V0c19fKS5tYXAoKF9fc2V0X18sIF9faW5kZXhfXykgPT4ge1xuICAgICAgX19zZXRfXyA9IEFycmF5LmZyb20oX19zZXRfXyk7XG4gICAgICBpZiAoX19zZXRfXy5sZW5ndGggIT09ICR7ZGVmaW5lcy5zZXRLZXlzLmxlbmd0aH0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxcYFNldCBhdCBpbmRleCBcXCR7X19pbmRleF9ffSBkb2Vzbid0IGhhdmUgZXhhY3RseSAke2RlZmluZXMuc2V0S2V5cy5sZW5ndGh9IHNldCBhcmd1bWVudCR7XG4gICAgICAgICAgZGVmaW5lcy5zZXRLZXlzLmxlbmd0aCA+IDEgPyBcInNcIiA6IFwiXCJcbiAgICAgICAgfSFcXGApO1xuICAgICAgfVxuICAgICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0sIC4uLl9fc2V0X18pO1xuICAgICAgcmV0dXJuIF9fc2V0X187XG4gICAgfSk7XG5cbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNyZXF1aXJlSW5uZXJNYXAoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG5cbiAgICAvLyBsZXZlbCAyOiBpbm5lciBtYXAgdG8gc2V0XG4gICAgX19hcnJheV9fLmZvckVhY2goX19zZXRfXyA9PiB7XG4gICAgICBjb25zdCBfX3NldEtleUhhc2hfXyA9IHRoaXMuI3NldEhhc2hlci5nZXRIYXNoKC4uLl9fc2V0X18pO1xuICAgICAgaWYgKCFfX2lubmVyTWFwX18uaGFzKF9fc2V0S2V5SGFzaF9fKSkge1xuICAgICAgICBfX2lubmVyTWFwX18uc2V0KF9fc2V0S2V5SGFzaF9fLCBfX3NldF9fKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiY2xlYXJTZXRzXCIsIDIpfVxuICBjbGVhclNldHMoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KTtcbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNyb290LmdldCgke2RlZmluZXMubWFwS2V5c1swXX0pO1xuICAgIF9faW5uZXJNYXBfXz8uY2xlYXIoKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImRlbGV0ZVwiLCAyKX1cbiAgZGVsZXRlKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0sICR7ZGVmaW5lcy5zZXRLZXlzfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAke2RlZmluZXMuc2V0S2V5c30pO1xuICAgIGNvbnN0IF9faW5uZXJNYXBfXyA9IHRoaXMuI3Jvb3QuZ2V0KCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSk7XG4gICAgaWYgKCFfX2lubmVyTWFwX18pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBsZXZlbCAyOiBpbm5lciBtYXAgdG8gc2V0XG4gICAgY29uc3QgX19zZXRLZXlIYXNoX18gPSB0aGlzLiNzZXRIYXNoZXIuZ2V0SGFzaElmRXhpc3RzKCR7ZGVmaW5lcy5zZXRLZXlzfSk7XG4gICAgaWYgKCFfX3NldEtleUhhc2hfXylcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBfX3JldHVyblZhbHVlX18gPSBfX2lubmVyTWFwX18uZGVsZXRlKF9fc2V0S2V5SGFzaF9fKTtcblxuICAgIGlmIChfX2lubmVyTWFwX18uc2l6ZSA9PT0gMCkge1xuICAgICAgdGhpcy5kZWxldGVTZXRzKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xuICAgIH1cblxuICAgIHJldHVybiBfX3JldHVyblZhbHVlX187XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJkZWxldGVTZXRzXCIsIDIpfVxuICBkZWxldGVTZXRzKCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5c1swXX0pO1xuICAgIHJldHVybiB0aGlzLiNyb290LmRlbGV0ZSgke2RlZmluZXMubWFwS2V5c1swXX0pO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZm9yRWFjaE1hcFNldFwiLCAyKX1cbiAgZm9yRWFjaFNldCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCBfX2NhbGxiYWNrX18sIF9fdGhpc0FyZ19fKSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xuICAgIGNvbnN0IF9faW5uZXJNYXBfXyA9IHRoaXMuI3Jvb3QuZ2V0KCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSk7XG4gICAgaWYgKCFfX2lubmVyTWFwX18pXG4gICAgICByZXR1cm47XG5cbiAgICBfX2lubmVyTWFwX18uZm9yRWFjaChcbiAgICAgIF9fa2V5U2V0X18gPT4gX19jYWxsYmFja19fLmFwcGx5KF9fdGhpc0FyZ19fLCBbJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSwgLi4uX19rZXlTZXRfXywgdGhpc10pXG4gICAgKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImZvckVhY2hDYWxsYmFja1NldFwiLCAyKX1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJnZXRTaXplT2ZTZXRcIiwgMil9XG4gIGdldFNpemVPZlNldCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xuICAgIGNvbnN0IF9faW5uZXJNYXBfXyA9IHRoaXMuI3Jvb3QuZ2V0KCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSk7XG4gICAgcmV0dXJuIF9faW5uZXJNYXBfXz8uc2l6ZSB8fCAwO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaGFzXCIsIDIpfVxuICBoYXMoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSwgJHtkZWZpbmVzLnNldEtleXN9KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0sICR7ZGVmaW5lcy5zZXRLZXlzfSk7XG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jcm9vdC5nZXQoJHtkZWZpbmVzLm1hcEtleXNbMF19KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGxldmVsIDI6IGlubmVyIG1hcCB0byBzZXRcbiAgICBjb25zdCBfX3NldEtleUhhc2hfXyA9IHRoaXMuI3NldEhhc2hlci5nZXRIYXNoSWZFeGlzdHMoJHtkZWZpbmVzLnNldEtleXN9KTtcbiAgICByZXR1cm4gX19zZXRLZXlIYXNoX18gPyBfX2lubmVyTWFwX18uaGFzKF9fc2V0S2V5SGFzaF9fKSA6IGZhbHNlO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaGFzU2V0XCIsIDIpfVxuICBoYXNTZXRzKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgcmV0dXJuIHRoaXMuI3Jvb3QuaGFzKCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHVibGljXCIsIDIpfVxuICBpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0sICR7ZGVmaW5lcy5zZXRLZXlzfSkge1xuICAgIHJldHVybiB0aGlzLiNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0sICR7ZGVmaW5lcy5zZXRLZXlzfSk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJ2YWx1ZXNTZXRcIiwgMil9XG4gICogdmFsdWVzU2V0KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG5cbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNyb290LmdldCgke2RlZmluZXMubWFwS2V5c1swXX0pO1xuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuO1xuXG4gICAgY29uc3QgX19vdXRlckl0ZXJfXyA9IF9faW5uZXJNYXBfXy52YWx1ZXMoKTtcbiAgICBmb3IgKGxldCBfX3ZhbHVlX18gb2YgX19vdXRlckl0ZXJfXylcbiAgICAgIHlpZWxkIFske2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAuLi5fX3ZhbHVlX19dO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZUlubmVyQ29sbGVjdGlvblByaXZhdGVcIiwgMil9XG4gICNyZXF1aXJlSW5uZXJNYXAoJHtkZWZpbmVzLm1hcEtleXNbMF19KSB7XG4gICAgaWYgKCF0aGlzLiNyb290Lmhhcygke2RlZmluZXMubWFwS2V5c1swXX0pKSB7XG4gICAgICB0aGlzLiNyb290LnNldCgke2RlZmluZXMubWFwS2V5c1swXX0sIG5ldyBNYXApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy4jcm9vdC5nZXQoJHtkZWZpbmVzLm1hcEtleXNbMF19KTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcInJlcXVpcmVWYWxpZEtleVwiLCAyKX1cbiAgI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAke2RlZmluZXMuc2V0S2V5c30pIHtcbiAgICBpZiAoIXRoaXMuI2lzVmFsaWRLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSwgJHtkZWZpbmVzLnNldEtleXN9KSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBvcmRlcmVkIGtleSBzZXQgaXMgbm90IHZhbGlkIVwiKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRLZXlQcml2YXRlXCIsIDIpfVxuICAjaXNWYWxpZEtleSgke2RlZmluZXMubWFwS2V5c1swXX0sICR7ZGVmaW5lcy5zZXRLZXlzfSkge1xuICAgIHJldHVybiB0aGlzLiNpc1ZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSkgJiYgdGhpcy4jaXNWYWxpZFNldEtleSgke2RlZmluZXMuc2V0S2V5c30pO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZVZhbGlkTWFwS2V5XCIsIDIpfVxuICAjcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSkge1xuICAgIGlmICghdGhpcy4jaXNWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5c1swXX0pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIG9yZGVyZWQgbWFwIGtleSBzZXQgaXMgbm90IHZhbGlkIVwiKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRNYXBLZXlQcml2YXRlXCIsIDIpfVxuICAjaXNWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5c1swXX0pIHtcbiAgICBpZiAoT2JqZWN0KCR7ZGVmaW5lcy5tYXBLZXlzWzBdfSkgIT09ICR7ZGVmaW5lcy5tYXBLZXlzWzBdfSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICAke2RlZmluZXMudmFsaWRhdGVNYXBBcmd1bWVudHMgfHwgXCJcIn1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRTZXRLZXlQcml2YXRlXCIsIDIpfVxuICAjaXNWYWxpZFNldEtleSgke2RlZmluZXMuc2V0S2V5c30pIHtcbiAgICB2b2lkKCR7ZGVmaW5lcy5zZXRLZXlzfSk7XG5cbiAgICAke2RlZmluZXMudmFsaWRhdGVTZXRBcmd1bWVudHMgfHwgXCJcIn1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIFtTeW1ib2wudG9TdHJpbmdUYWddID0gXCIke2RlZmluZXMuY2xhc3NOYW1lfVwiO1xufVxuXG5PYmplY3QuZnJlZXplKCR7ZGVmaW5lcy5jbGFzc05hbWV9KTtcbk9iamVjdC5mcmVlemUoJHtkZWZpbmVzLmNsYXNzTmFtZX0ucHJvdG90eXBlKTtcbmA7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHByZXByb2Nlc3M7XG4iXX0=