/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    return `
${defines.get("importLines")}
import KeyHasher from "./keys/Hasher.mjs";
import WeakKeyComposer from "./keys/Composite.mjs";

/** @typedef {Map<hash, *[]>} ${defines.get("className")}~InnerMap */

class ${defines.get("className")} {
  /** @typedef {string} hash */

  // eslint-disable-next-line jsdoc/require-property
  /** @typedef {object} WeakKey */

  /**
   * @type {WeakMap<WeakKey, ${defines.get("className")}~InnerMap>}
   * @constant
   * This is two levels. The first level is the WeakKey.
   * The second level is the strong set.
   */
  #root = new WeakMap();

  /** @type {WeakKeyComposer} @constant */
  #mapKeyComposer = new WeakKeyComposer(
    ${defines.get("weakMapArgNameList")}, ${defines.get("strongMapArgNameList")}
  );

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
  add(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerMap__ = this.#requireInnerMap(${defines.get("mapArgList")});

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHash(${defines.get("setArgList")});
    if (!__innerMap__.has(__setKeyHash__)) {
      __innerMap__.set(__setKeyHash__, [${defines.get("setArgList")}]);
    }

    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${defines.get("mapArgList")}, __sets__) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    const __array__ = Array.from(__sets__).map((__set__, __index__) => {
      __set__ = Array.from(__set__);
      if (__set__.length !== ${defines.get("setCount")}) {
        throw new Error(\`Set at index \${__index__} doesn't have exactly ${defines.get("setCount")} set argument${defines.get("setCount") > 1 ? "s" : ""}!\`);
      }
      this.#requireValidKey(${defines.get("mapArgList")}, ...__set__);
      return __set__;
    });

    const __innerMap__ = this.#requireInnerMap(${defines.get("mapArgList")});

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
  clearSets(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    const __innerMap__ = this.#getExistingInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return;

    __innerMap__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerMap__ = this.#getExistingInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return false;

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHashIfExists(${defines.get("setArgList")});
    if (!__setKeyHash__)
      return false;
    const __returnValue__ = __innerMap__.delete(__setKeyHash__);

    if (__innerMap__.size === 0) {
      this.deleteSets(${defines.get("mapArgList")});
    }

    return __returnValue__;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});

    const __mapKey__ = this.#mapKeyComposer.getKeyIfExists(
      [${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]
    );

    return __mapKey__ ? this.#root.delete(__mapKey__) : false;
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.get("mapArgList")}, __callback__, __thisArg__) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    const __innerMap__ = this.#getExistingInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      __keySet__ => __callback__.apply(__thisArg__, [${defines.get("mapArgList")}, ...__keySet__, this])
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    const __innerMap__ = this.#getExistingInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return 0;

    return __innerMap__.size;
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerMap__ = this.#getExistingInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return false;

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHashIfExists(${defines.get("setArgList")});
    return __setKeyHash__ ? __innerMap__.has(__setKeyHash__) : false;
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    return Boolean(this.#getExistingInnerMap(${defines.get("mapArgList")}));
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    return this.#isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});

    const __innerMap__ = this.#getExistingInnerMap(${defines.get("mapArgList")});
    if (!__innerMap__)
      return;

    const __outerIter__ = __innerMap__.values();
    for (let __value__ of __outerIter__)
      yield [${defines.get("mapArgList")}, ...__value__];
  }

${docs.buildBlock("requireInnerCollectionPrivate", 2)}
  #requireInnerMap(${defines.get("mapArgList")}) {
    const __mapKey__ = this.#mapKeyComposer.getKey(
      [${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]
    );
    if (!this.#root.has(__mapKey__)) {
      this.#root.set(__mapKey__, new Map);
    }
    return this.#root.get(__mapKey__);
  }

${docs.buildBlock("getExistingInnerCollectionPrivate", 2)}
  #getExistingInnerMap(${defines.get("mapArgList")}) {
    const __mapKey__ = this.#mapKeyComposer.getKeyIfExists(
      [${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]
    );

    return __mapKey__ ? this.#root.get(__mapKey__) : undefined;
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    if (!this.#isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    return this.#isValidMapKey(${defines.get("mapArgList")}) && this.#isValidSetKey(${defines.get("setArgList")});
  }

${docs.buildBlock("requireValidMapKey", 2)}
  #requireValidMapKey(${defines.get("mapArgList")}) {
    if (!this.#isValidMapKey(${defines.get("mapArgList")}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  #isValidMapKey(${defines.get("mapArgList")}) {
    if (!this.#mapKeyComposer.isValidForKey([${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]))
      return false;
    ${defines.get("validateMapArguments") || ""}
    return true;
  }

${docs.buildBlock("isValidSetKeyPrivate", 2)}
  #isValidSetKey(${defines.get("setArgList")}) {
    void(${defines.get("setArgList")});

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFwT2ZTdHJvbmdTZXRzLmluLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1hcE9mU3Ryb25nU2V0cy5pbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxHQUFxQixTQUFTLFVBQVUsQ0FBQyxPQUE0QixFQUFFLElBQW9CO0lBQ3pHLE9BQU87RUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQzs7OztnQ0FJSSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQzs7UUFFaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7Ozs7Ozs7K0JBT0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7Ozs7Ozs7OztNQVNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLEtBQUssT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0VBZTdFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDOzRCQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO2lEQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQzs7O3FEQUdyQixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQzs7MENBRXBDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDOzs7Ozs7RUFNakUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDOytCQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDOzs7K0JBR3pCLE9BQU8sQ0FBQyxHQUFHLENB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QUFDO2dCQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO2lDQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyw0QkFBNEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7OztFQUc3RyxJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQzt3QkFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7K0JBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDOzs7O0VBSXRELElBQUksQ0FBQyxVQUFVLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO21CQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQzsrQ0FDRyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQzs7TUFFNUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEVBQUU7Ozs7RUFJN0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7bUJBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO1dBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDOztNQUU5QixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFBRTs7Ozs0QkFJbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7OztnQkFHcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7Z0JBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO0NBQ3ZDLENBQUM7QUFDRixDQUFDLENBQUE7QUFFRCxlQUFlLFVBQVUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUHJlcHJvY2Vzc29yRGVmaW5lcywgSlNEb2NHZW5lcmF0b3IsIFRlbXBsYXRlRnVuY3Rpb24gfSBmcm9tIFwiLi4vc2hhcmVkVHlwZXMubWpzXCI7XG5cbi8qKlxuICogQHBhcmFtIHtNYXB9ICAgICAgICAgICAgZGVmaW5lcyBUaGUgcHJlcHJvY2Vzc29yIG1hY3Jvcy5cbiAqIEBwYXJhbSB7SlNEb2NHZW5lcmF0b3J9IGRvY3MgICAgVGhlIHByaW1hcnkgZG9jdW1lbnRhdGlvbiBnZW5lcmF0b3IuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSAgICAgICAgICAgICAgIFRoZSBnZW5lcmF0ZWQgc291cmNlIGNvZGUuXG4gKi9cbmNvbnN0IHByZXByb2Nlc3M6IFRlbXBsYXRlRnVuY3Rpb24gPSBmdW5jdGlvbiBwcmVwcm9jZXNzKGRlZmluZXM6IFByZXByb2Nlc3NvckRlZmluZXMsIGRvY3M6IEpTRG9jR2VuZXJhdG9yKSB7XG4gIHJldHVybiBgXG4ke2RlZmluZXMuZ2V0KFwiaW1wb3J0TGluZXNcIil9XG5pbXBvcnQgS2V5SGFzaGVyIGZyb20gXCIuL2tleXMvSGFzaGVyLm1qc1wiO1xuaW1wb3J0IFdlYWtLZXlDb21wb3NlciBmcm9tIFwiLi9rZXlzL0NvbXBvc2l0ZS5tanNcIjtcblxuLyoqIEB0eXBlZGVmIHtNYXA8aGFzaCwgKltdPn0gJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX1+SW5uZXJNYXAgKi9cblxuY2xhc3MgJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX0ge1xuICAvKiogQHR5cGVkZWYge3N0cmluZ30gaGFzaCAqL1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBqc2RvYy9yZXF1aXJlLXByb3BlcnR5XG4gIC8qKiBAdHlwZWRlZiB7b2JqZWN0fSBXZWFrS2V5ICovXG5cbiAgLyoqXG4gICAqIEB0eXBlIHtXZWFrTWFwPFdlYWtLZXksICR7ZGVmaW5lcy5nZXQoXCJjbGFzc05hbWVcIil9fklubmVyTWFwPn1cbiAgICogQGNvbnN0YW50XG4gICAqIFRoaXMgaXMgdHdvIGxldmVscy4gVGhlIGZpcnN0IGxldmVsIGlzIHRoZSBXZWFrS2V5LlxuICAgKiBUaGUgc2Vjb25kIGxldmVsIGlzIHRoZSBzdHJvbmcgc2V0LlxuICAgKi9cbiAgI3Jvb3QgPSBuZXcgV2Vha01hcCgpO1xuXG4gIC8qKiBAdHlwZSB7V2Vha0tleUNvbXBvc2VyfSBAY29uc3RhbnQgKi9cbiAgI21hcEtleUNvbXBvc2VyID0gbmV3IFdlYWtLZXlDb21wb3NlcihcbiAgICAke2RlZmluZXMuZ2V0KFwid2Vha01hcEFyZ05hbWVMaXN0XCIpfSwgJHtkZWZpbmVzLmdldChcInN0cm9uZ01hcEFyZ05hbWVMaXN0XCIpfVxuICApO1xuXG4gIC8qKiBAdHlwZSB7S2V5SGFzaGVyfSBAY29uc3RhbnQgKi9cbiAgI3NldEhhc2hlciA9IG5ldyBLZXlIYXNoZXIoKTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGl0ZXJhYmxlID0gYXJndW1lbnRzWzBdO1xuICAgICAgZm9yIChsZXQgZW50cnkgb2YgaXRlcmFibGUpIHtcbiAgICAgICAgdGhpcy5hZGQoLi4uZW50cnkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImFkZFwiLCAyKX1cbiAgYWRkKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KTtcbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNyZXF1aXJlSW5uZXJNYXAoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcblxuICAgIC8vIGxldmVsIDI6IGlubmVyIG1hcCB0byBzZXRcbiAgICBjb25zdCBfX3NldEtleUhhc2hfXyA9IHRoaXMuI3NldEhhc2hlci5nZXRIYXNoKCR7ZGVmaW5lcy5nZXQoXCJzZXRBcmdMaXN0XCIpfSk7XG4gICAgaWYgKCFfX2lubmVyTWFwX18uaGFzKF9fc2V0S2V5SGFzaF9fKSkge1xuICAgICAgX19pbm5lck1hcF9fLnNldChfX3NldEtleUhhc2hfXywgWyR7ZGVmaW5lcy5nZXQoXCJzZXRBcmdMaXN0XCIpfV0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiYWRkU2V0c1wiLCAyKX1cbiAgYWRkU2V0cygke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0sIF9fc2V0c19fKSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSk7XG4gICAgY29uc3QgX19hcnJheV9fID0gQXJyYXkuZnJvbShfX3NldHNfXykubWFwKChfX3NldF9fLCBfX2luZGV4X18pID0+IHtcbiAgICAgIF9fc2V0X18gPSBBcnJheS5mcm9tKF9fc2V0X18pO1xuICAgICAgaWYgKF9fc2V0X18ubGVuZ3RoICE9PSAke2RlZmluZXMuZ2V0KFwic2V0Q291bnRcIil9KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcXGBTZXQgYXQgaW5kZXggXFwke19faW5kZXhfX30gZG9lc24ndCBoYXZlIGV4YWN0bHkgJHtkZWZpbmVzLmdldChcInNldENvdW50XCIpfSBzZXQgYXJndW1lbnQke1xuICAgICAgICAgIGRlZmluZXMuZ2V0KFwic2V0Q291bnRcIikhID4gMSA/IFwic1wiIDogXCJcIlxuICAgICAgICB9IVxcYCk7XG4gICAgICB9XG4gICAgICB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCAuLi5fX3NldF9fKTtcbiAgICAgIHJldHVybiBfX3NldF9fO1xuICAgIH0pO1xuXG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jcmVxdWlyZUlubmVyTWFwKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSk7XG5cbiAgICAvLyBsZXZlbCAyOiBpbm5lciBtYXAgdG8gc2V0XG4gICAgX19hcnJheV9fLmZvckVhY2goX19zZXRfXyA9PiB7XG4gICAgICBjb25zdCBfX3NldEtleUhhc2hfXyA9IHRoaXMuI3NldEhhc2hlci5nZXRIYXNoKC4uLl9fc2V0X18pO1xuICAgICAgaWYgKCFfX2lubmVyTWFwX18uaGFzKF9fc2V0S2V5SGFzaF9fKSkge1xuICAgICAgICBfX2lubmVyTWFwX18uc2V0KF9fc2V0S2V5SGFzaF9fLCBfX3NldF9fKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiY2xlYXJTZXRzXCIsIDIpfVxuICBjbGVhclNldHMoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSk7XG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jZ2V0RXhpc3RpbmdJbm5lck1hcCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuO1xuXG4gICAgX19pbm5lck1hcF9fLmNsZWFyKCk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJkZWxldGVcIiwgMil9XG4gIGRlbGV0ZSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmdMaXN0XCIpfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmdMaXN0XCIpfSk7XG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jZ2V0RXhpc3RpbmdJbm5lck1hcCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gbGV2ZWwgMjogaW5uZXIgbWFwIHRvIHNldFxuICAgIGNvbnN0IF9fc2V0S2V5SGFzaF9fID0gdGhpcy4jc2V0SGFzaGVyLmdldEhhc2hJZkV4aXN0cygke2RlZmluZXMuZ2V0KFwic2V0QXJnTGlzdFwiKX0pO1xuICAgIGlmICghX19zZXRLZXlIYXNoX18pXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgX19yZXR1cm5WYWx1ZV9fID0gX19pbm5lck1hcF9fLmRlbGV0ZShfX3NldEtleUhhc2hfXyk7XG5cbiAgICBpZiAoX19pbm5lck1hcF9fLnNpemUgPT09IDApIHtcbiAgICAgIHRoaXMuZGVsZXRlU2V0cygke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuICAgIH1cblxuICAgIHJldHVybiBfX3JldHVyblZhbHVlX187XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJkZWxldGVTZXRzXCIsIDIpfVxuICBkZWxldGVTZXRzKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuXG4gICAgY29uc3QgX19tYXBLZXlfXyA9IHRoaXMuI21hcEtleUNvbXBvc2VyLmdldEtleUlmRXhpc3RzKFxuICAgICAgWyR7ZGVmaW5lcy5nZXQoXCJ3ZWFrTWFwQXJnTGlzdFwiKX1dLCBbJHtkZWZpbmVzLmdldChcInN0cm9uZ01hcEFyZ0xpc3RcIil9XVxuICAgICk7XG5cbiAgICByZXR1cm4gX19tYXBLZXlfXyA/IHRoaXMuI3Jvb3QuZGVsZXRlKF9fbWFwS2V5X18pIDogZmFsc2U7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJmb3JFYWNoTWFwU2V0XCIsIDIpfVxuICBmb3JFYWNoU2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgX19jYWxsYmFja19fLCBfX3RoaXNBcmdfXykge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuICAgIGNvbnN0IF9faW5uZXJNYXBfXyA9IHRoaXMuI2dldEV4aXN0aW5nSW5uZXJNYXAoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybjtcblxuICAgIF9faW5uZXJNYXBfXy5mb3JFYWNoKFxuICAgICAgX19rZXlTZXRfXyA9PiBfX2NhbGxiYWNrX18uYXBwbHkoX190aGlzQXJnX18sIFske2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0sIC4uLl9fa2V5U2V0X18sIHRoaXNdKVxuICAgICk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJmb3JFYWNoQ2FsbGJhY2tTZXRcIiwgMil9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZ2V0U2l6ZU9mU2V0XCIsIDIpfVxuICBnZXRTaXplT2ZTZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSk7XG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jZ2V0RXhpc3RpbmdJbm5lck1hcCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuIDA7XG5cbiAgICByZXR1cm4gX19pbm5lck1hcF9fLnNpemU7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJoYXNcIiwgMil9XG4gIGhhcygke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmdMaXN0XCIpfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmdMaXN0XCIpfSk7XG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jZ2V0RXhpc3RpbmdJbm5lck1hcCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gbGV2ZWwgMjogaW5uZXIgbWFwIHRvIHNldFxuICAgIGNvbnN0IF9fc2V0S2V5SGFzaF9fID0gdGhpcy4jc2V0SGFzaGVyLmdldEhhc2hJZkV4aXN0cygke2RlZmluZXMuZ2V0KFwic2V0QXJnTGlzdFwiKX0pO1xuICAgIHJldHVybiBfX3NldEtleUhhc2hfXyA/IF9faW5uZXJNYXBfXy5oYXMoX19zZXRLZXlIYXNoX18pIDogZmFsc2U7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJoYXNTZXRcIiwgMil9XG4gIGhhc1NldHMoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSk7XG4gICAgcmV0dXJuIEJvb2xlYW4odGhpcy4jZ2V0RXhpc3RpbmdJbm5lck1hcCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRLZXlQdWJsaWNcIiwgMil9XG4gIGlzVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCAke2RlZmluZXMuZ2V0KFwic2V0QXJnTGlzdFwiKX0pIHtcbiAgICByZXR1cm4gdGhpcy4jaXNWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmdMaXN0XCIpfSk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJ2YWx1ZXNTZXRcIiwgMil9XG4gICogdmFsdWVzU2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuXG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jZ2V0RXhpc3RpbmdJbm5lck1hcCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuO1xuXG4gICAgY29uc3QgX19vdXRlckl0ZXJfXyA9IF9faW5uZXJNYXBfXy52YWx1ZXMoKTtcbiAgICBmb3IgKGxldCBfX3ZhbHVlX18gb2YgX19vdXRlckl0ZXJfXylcbiAgICAgIHlpZWxkIFske2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0sIC4uLl9fdmFsdWVfX107XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJyZXF1aXJlSW5uZXJDb2xsZWN0aW9uUHJpdmF0ZVwiLCAyKX1cbiAgI3JlcXVpcmVJbm5lck1hcCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHtcbiAgICBjb25zdCBfX21hcEtleV9fID0gdGhpcy4jbWFwS2V5Q29tcG9zZXIuZ2V0S2V5KFxuICAgICAgWyR7ZGVmaW5lcy5nZXQoXCJ3ZWFrTWFwQXJnTGlzdFwiKX1dLCBbJHtkZWZpbmVzLmdldChcInN0cm9uZ01hcEFyZ0xpc3RcIil9XVxuICAgICk7XG4gICAgaWYgKCF0aGlzLiNyb290LmhhcyhfX21hcEtleV9fKSkge1xuICAgICAgdGhpcy4jcm9vdC5zZXQoX19tYXBLZXlfXywgbmV3IE1hcCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLiNyb290LmdldChfX21hcEtleV9fKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImdldEV4aXN0aW5nSW5uZXJDb2xsZWN0aW9uUHJpdmF0ZVwiLCAyKX1cbiAgI2dldEV4aXN0aW5nSW5uZXJNYXAoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KSB7XG4gICAgY29uc3QgX19tYXBLZXlfXyA9IHRoaXMuI21hcEtleUNvbXBvc2VyLmdldEtleUlmRXhpc3RzKFxuICAgICAgWyR7ZGVmaW5lcy5nZXQoXCJ3ZWFrTWFwQXJnTGlzdFwiKX1dLCBbJHtkZWZpbmVzLmdldChcInN0cm9uZ01hcEFyZ0xpc3RcIil9XVxuICAgICk7XG5cbiAgICByZXR1cm4gX19tYXBLZXlfXyA/IHRoaXMuI3Jvb3QuZ2V0KF9fbWFwS2V5X18pIDogdW5kZWZpbmVkO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZVZhbGlkS2V5XCIsIDIpfVxuICAjcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KSB7XG4gICAgaWYgKCF0aGlzLiNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBvcmRlcmVkIGtleSBzZXQgaXMgbm90IHZhbGlkIVwiKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRLZXlQcml2YXRlXCIsIDIpfVxuICAjaXNWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmdMaXN0XCIpfSkge1xuICAgIHJldHVybiB0aGlzLiNpc1ZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSkgJiYgdGhpcy4jaXNWYWxpZFNldEtleSgke2RlZmluZXMuZ2V0KFwic2V0QXJnTGlzdFwiKX0pO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZVZhbGlkTWFwS2V5XCIsIDIpfVxuICAjcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSkge1xuICAgIGlmICghdGhpcy4jaXNWYWxpZE1hcEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIG9yZGVyZWQgbWFwIGtleSBzZXQgaXMgbm90IHZhbGlkIVwiKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRNYXBLZXlQcml2YXRlXCIsIDIpfVxuICAjaXNWYWxpZE1hcEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHtcbiAgICBpZiAoIXRoaXMuI21hcEtleUNvbXBvc2VyLmlzVmFsaWRGb3JLZXkoWyR7ZGVmaW5lcy5nZXQoXCJ3ZWFrTWFwQXJnTGlzdFwiKX1dLCBbJHtkZWZpbmVzLmdldChcInN0cm9uZ01hcEFyZ0xpc3RcIil9XSkpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgJHtkZWZpbmVzLmdldChcInZhbGlkYXRlTWFwQXJndW1lbnRzXCIpIHx8IFwiXCJ9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkU2V0S2V5UHJpdmF0ZVwiLCAyKX1cbiAgI2lzVmFsaWRTZXRLZXkoJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KSB7XG4gICAgdm9pZCgke2RlZmluZXMuZ2V0KFwic2V0QXJnTGlzdFwiKX0pO1xuXG4gICAgJHtkZWZpbmVzLmdldChcInZhbGlkYXRlU2V0QXJndW1lbnRzXCIpIHx8IFwiXCJ9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBbU3ltYm9sLnRvU3RyaW5nVGFnXSA9IFwiJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX1cIjtcbn1cblxuT2JqZWN0LmZyZWV6ZSgke2RlZmluZXMuZ2V0KFwiY2xhc3NOYW1lXCIpfSk7XG5PYmplY3QuZnJlZXplKCR7ZGVmaW5lcy5nZXQoXCJjbGFzc05hbWVcIil9LnByb3RvdHlwZSk7XG5gO1xufVxuXG5leHBvcnQgZGVmYXVsdCBwcmVwcm9jZXNzO1xuIl19