/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    return `
${defines.get("importLines")}
import KeyHasher from "./keys/Hasher.mjs";

/** @typedef {Map<hash, *[]>} ${defines.get("className")}~InnerMap */

class ${defines.get("className")} {
  /** @typedef {string} hash */

  /**
   * @type {WeakMap<${defines.get("mapArgument0Type")}, ${defines.get("className")}~InnerMap>}
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
    const __innerMap__ = this.#root.get(${defines.get("mapArgument0")});
    __innerMap__?.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerMap__ = this.#root.get(${defines.get("mapArgument0")});
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
  deleteSets(${defines.get("mapArgument0")}) {
    this.#requireValidMapKey(${defines.get("mapArgument0")});
    return this.#root.delete(${defines.get("mapArgument0")});
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.get("mapArgList")}, __callback__, __thisArg__) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    const __innerMap__ = this.#root.get(${defines.get("mapArgument0")});
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
    const __innerMap__ = this.#root.get(${defines.get("mapArgument0")});
    return __innerMap__?.size || 0;
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerMap__ = this.#root.get(${defines.get("mapArgument0")});
    if (!__innerMap__)
      return false;

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHashIfExists(${defines.get("setArgList")});
    return __setKeyHash__ ? __innerMap__.has(__setKeyHash__) : false;
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    return this.#root.has(${defines.get("mapArgument0")});
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    return this.#isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});

    const __innerMap__ = this.#root.get(${defines.get("mapArgument0")});
    if (!__innerMap__)
      return;

    const __outerIter__ = __innerMap__.values();
    for (let __value__ of __outerIter__)
      yield [${defines.get("mapArgList")}, ...__value__];
  }

${docs.buildBlock("requireInnerCollectionPrivate", 2)}
  #requireInnerMap(${defines.get("mapArgument0")}) {
    if (!this.#root.has(${defines.get("mapArgument0")})) {
      this.#root.set(${defines.get("mapArgument0")}, new Map);
    }
    return this.#root.get(${defines.get("mapArgument0")});
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    if (!this.#isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.get("mapArgument0")}, ${defines.get("setArgList")}) {
    return this.#isValidMapKey(${defines.get("mapArgument0")}) && this.#isValidSetKey(${defines.get("setArgList")});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT25lTWFwT2ZTdHJvbmdTZXRzLmluLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk9uZU1hcE9mU3Ryb25nU2V0cy5pbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxHQUFxQixTQUFTLFVBQVUsQ0FBQyxPQUE0QixFQUFFLElBQW9CO0lBQ3pHLE9BQU87RUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQzs7O2dDQUdJLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDOztRQUVoRCxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQzs7OztzQkFJVixPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLEtBQUssT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFtQmhGLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDOzRCQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO2lEQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQzs7O3FEQUdyQixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQzs7MENBRXBDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDOzs7Ozs7RUFNakUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDOytCQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDOzs7K0JBR3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDOzRFQUNzQixPQUFPLENBQUMsR0FBRyxDQUFD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QyxjQUFjLENBQUM7K0JBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDOzs7O0VBSXhELElBQUksQ0FBQyxVQUFVLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO21CQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQztpQkFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsU0FBUyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQzs7TUFFMUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEVBQUU7Ozs7RUFJN0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7bUJBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO1dBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDOztNQUU5QixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFBRTs7Ozs0QkFJbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7OztnQkFHcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7Z0JBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO0NBQ3ZDLENBQUM7QUFDRixDQUFDLENBQUE7QUFFRCxlQUFlLFVBQVUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUHJlcHJvY2Vzc29yRGVmaW5lcywgSlNEb2NHZW5lcmF0b3IsIFRlbXBsYXRlRnVuY3Rpb24gfSBmcm9tIFwiLi4vc2hhcmVkVHlwZXMubWpzXCI7XG5cbi8qKlxuICogQHBhcmFtIHtNYXB9ICAgICAgICAgICAgZGVmaW5lcyBUaGUgcHJlcHJvY2Vzc29yIG1hY3Jvcy5cbiAqIEBwYXJhbSB7SlNEb2NHZW5lcmF0b3J9IGRvY3MgICAgVGhlIHByaW1hcnkgZG9jdW1lbnRhdGlvbiBnZW5lcmF0b3IuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSAgICAgICAgICAgICAgIFRoZSBnZW5lcmF0ZWQgc291cmNlIGNvZGUuXG4gKi9cbmNvbnN0IHByZXByb2Nlc3M6IFRlbXBsYXRlRnVuY3Rpb24gPSBmdW5jdGlvbiBwcmVwcm9jZXNzKGRlZmluZXM6IFByZXByb2Nlc3NvckRlZmluZXMsIGRvY3M6IEpTRG9jR2VuZXJhdG9yKSB7XG4gIHJldHVybiBgXG4ke2RlZmluZXMuZ2V0KFwiaW1wb3J0TGluZXNcIil9XG5pbXBvcnQgS2V5SGFzaGVyIGZyb20gXCIuL2tleXMvSGFzaGVyLm1qc1wiO1xuXG4vKiogQHR5cGVkZWYge01hcDxoYXNoLCAqW10+fSAke2RlZmluZXMuZ2V0KFwiY2xhc3NOYW1lXCIpfX5Jbm5lck1hcCAqL1xuXG5jbGFzcyAke2RlZmluZXMuZ2V0KFwiY2xhc3NOYW1lXCIpfSB7XG4gIC8qKiBAdHlwZWRlZiB7c3RyaW5nfSBoYXNoICovXG5cbiAgLyoqXG4gICAqIEB0eXBlIHtXZWFrTWFwPCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBUeXBlXCIpfSwgJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX1+SW5uZXJNYXA+fVxuICAgKiBAY29uc3RhbnRcbiAgICogVGhpcyBpcyB0d28gbGV2ZWxzLiBUaGUgZmlyc3QgbGV2ZWwgaXMgdGhlIG1hcCBrZXkuXG4gICAqIFRoZSBzZWNvbmQgbGV2ZWwgaXMgdGhlIHN0cm9uZyBzZXQuXG4gICAqL1xuICAjcm9vdCA9IG5ldyBXZWFrTWFwKCk7XG5cbiAgLyoqIEB0eXBlIHtLZXlIYXNoZXJ9IEBjb25zdGFudCAqL1xuICAjc2V0SGFzaGVyID0gbmV3IEtleUhhc2hlcigpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgaXRlcmFibGUgPSBhcmd1bWVudHNbMF07XG4gICAgICBmb3IgKGxldCBlbnRyeSBvZiBpdGVyYWJsZSkge1xuICAgICAgICB0aGlzLmFkZCguLi5lbnRyeSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiYWRkXCIsIDIpfVxuICBhZGQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCAke2RlZmluZXMuZ2V0KFwic2V0QXJnTGlzdFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCAke2RlZmluZXMuZ2V0KFwic2V0QXJnTGlzdFwiKX0pO1xuICAgIGNvbnN0IF9faW5uZXJNYXBfXyA9IHRoaXMuI3JlcXVpcmVJbm5lck1hcCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuXG4gICAgLy8gbGV2ZWwgMjogaW5uZXIgbWFwIHRvIHNldFxuICAgIGNvbnN0IF9fc2V0S2V5SGFzaF9fID0gdGhpcy4jc2V0SGFzaGVyLmdldEhhc2goJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXy5oYXMoX19zZXRLZXlIYXNoX18pKSB7XG4gICAgICBfX2lubmVyTWFwX18uc2V0KF9fc2V0S2V5SGFzaF9fLCBbJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9XSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJhZGRTZXRzXCIsIDIpfVxuICBhZGRTZXRzKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgX19zZXRzX18pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcbiAgICBjb25zdCBfX2FycmF5X18gPSBBcnJheS5mcm9tKF9fc2V0c19fKS5tYXAoKF9fc2V0X18sIF9faW5kZXhfXykgPT4ge1xuICAgICAgX19zZXRfXyA9IEFycmF5LmZyb20oX19zZXRfXyk7XG4gICAgICBpZiAoX19zZXRfXy5sZW5ndGggIT09ICR7ZGVmaW5lcy5nZXQoXCJzZXRDb3VudFwiKX0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxcYFNldCBhdCBpbmRleCBcXCR7X19pbmRleF9ffSBkb2Vzbid0IGhhdmUgZXhhY3RseSAke2RlZmluZXMuZ2V0KFwic2V0Q291bnRcIil9IHNldCBhcmd1bWVudCR7XG4gICAgICAgICAgZGVmaW5lcy5nZXQoXCJzZXRDb3VudFwiKSEgPiAxID8gXCJzXCIgOiBcIlwiXG4gICAgICAgIH0hXFxgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0sIC4uLl9fc2V0X18pO1xuICAgICAgcmV0dXJuIF9fc2V0X187XG4gICAgfSk7XG5cbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNyZXF1aXJlSW5uZXJNYXAoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcblxuICAgIC8vIGxldmVsIDI6IGlubmVyIG1hcCB0byBzZXRcbiAgICBfX2FycmF5X18uZm9yRWFjaChfX3NldF9fID0+IHtcbiAgICAgIGNvbnN0IF9fc2V0S2V5SGFzaF9fID0gdGhpcy4jc2V0SGFzaGVyLmdldEhhc2goLi4uX19zZXRfXyk7XG4gICAgICBpZiAoIV9faW5uZXJNYXBfXy5oYXMoX19zZXRLZXlIYXNoX18pKSB7XG4gICAgICAgIF9faW5uZXJNYXBfXy5zZXQoX19zZXRLZXlIYXNoX18sIF9fc2V0X18pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJjbGVhclNldHNcIiwgMil9XG4gIGNsZWFyU2V0cygke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNyb290LmdldCgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSk7XG4gICAgX19pbm5lck1hcF9fPy5jbGVhcigpO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZGVsZXRlXCIsIDIpfVxuICBkZWxldGUoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCAke2RlZmluZXMuZ2V0KFwic2V0QXJnTGlzdFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCAke2RlZmluZXMuZ2V0KFwic2V0QXJnTGlzdFwiKX0pO1xuICAgIGNvbnN0IF9faW5uZXJNYXBfXyA9IHRoaXMuI3Jvb3QuZ2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGxldmVsIDI6IGlubmVyIG1hcCB0byBzZXRcbiAgICBjb25zdCBfX3NldEtleUhhc2hfXyA9IHRoaXMuI3NldEhhc2hlci5nZXRIYXNoSWZFeGlzdHMoJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KTtcbiAgICBpZiAoIV9fc2V0S2V5SGFzaF9fKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IF9fcmV0dXJuVmFsdWVfXyA9IF9faW5uZXJNYXBfXy5kZWxldGUoX19zZXRLZXlIYXNoX18pO1xuXG4gICAgaWYgKF9faW5uZXJNYXBfXy5zaXplID09PSAwKSB7XG4gICAgICB0aGlzLmRlbGV0ZVNldHMoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gX19yZXR1cm5WYWx1ZV9fO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZGVsZXRlU2V0c1wiLCAyKX1cbiAgZGVsZXRlU2V0cygke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSk7XG4gICAgcmV0dXJuIHRoaXMuI3Jvb3QuZGVsZXRlKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImZvckVhY2hNYXBTZXRcIiwgMil9XG4gIGZvckVhY2hTZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCBfX2NhbGxiYWNrX18sIF9fdGhpc0FyZ19fKSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSk7XG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jcm9vdC5nZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pO1xuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuO1xuXG4gICAgX19pbm5lck1hcF9fLmZvckVhY2goXG4gICAgICBfX2tleVNldF9fID0+IF9fY2FsbGJhY2tfXy5hcHBseShfX3RoaXNBcmdfXywgWyR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgLi4uX19rZXlTZXRfXywgdGhpc10pXG4gICAgKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImZvckVhY2hDYWxsYmFja1NldFwiLCAyKX1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJnZXRTaXplT2ZTZXRcIiwgMil9XG4gIGdldFNpemVPZlNldCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNyb290LmdldCgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSk7XG4gICAgcmV0dXJuIF9faW5uZXJNYXBfXz8uc2l6ZSB8fCAwO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaGFzXCIsIDIpfVxuICBoYXMoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCAke2RlZmluZXMuZ2V0KFwic2V0QXJnTGlzdFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCAke2RlZmluZXMuZ2V0KFwic2V0QXJnTGlzdFwiKX0pO1xuICAgIGNvbnN0IF9faW5uZXJNYXBfXyA9IHRoaXMuI3Jvb3QuZ2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGxldmVsIDI6IGlubmVyIG1hcCB0byBzZXRcbiAgICBjb25zdCBfX3NldEtleUhhc2hfXyA9IHRoaXMuI3NldEhhc2hlci5nZXRIYXNoSWZFeGlzdHMoJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KTtcbiAgICByZXR1cm4gX19zZXRLZXlIYXNoX18gPyBfX2lubmVyTWFwX18uaGFzKF9fc2V0S2V5SGFzaF9fKSA6IGZhbHNlO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaGFzU2V0XCIsIDIpfVxuICBoYXNTZXRzKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuICAgIHJldHVybiB0aGlzLiNyb290Lmhhcygke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHVibGljXCIsIDIpfVxuICBpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KSB7XG4gICAgcmV0dXJuIHRoaXMuI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCAke2RlZmluZXMuZ2V0KFwic2V0QXJnTGlzdFwiKX0pO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwidmFsdWVzU2V0XCIsIDIpfVxuICAqIHZhbHVlc1NldCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcblxuICAgIGNvbnN0IF9faW5uZXJNYXBfXyA9IHRoaXMuI3Jvb3QuZ2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybjtcblxuICAgIGNvbnN0IF9fb3V0ZXJJdGVyX18gPSBfX2lubmVyTWFwX18udmFsdWVzKCk7XG4gICAgZm9yIChsZXQgX192YWx1ZV9fIG9mIF9fb3V0ZXJJdGVyX18pXG4gICAgICB5aWVsZCBbJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCAuLi5fX3ZhbHVlX19dO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZUlubmVyQ29sbGVjdGlvblByaXZhdGVcIiwgMil9XG4gICNyZXF1aXJlSW5uZXJNYXAoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pIHtcbiAgICBpZiAoIXRoaXMuI3Jvb3QuaGFzKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KSkge1xuICAgICAgdGhpcy4jcm9vdC5zZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0sIG5ldyBNYXApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy4jcm9vdC5nZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZVZhbGlkS2V5XCIsIDIpfVxuICAjcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KSB7XG4gICAgaWYgKCF0aGlzLiNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBvcmRlcmVkIGtleSBzZXQgaXMgbm90IHZhbGlkIVwiKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRLZXlQcml2YXRlXCIsIDIpfVxuICAjaXNWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSwgJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KSB7XG4gICAgcmV0dXJuIHRoaXMuI2lzVmFsaWRNYXBLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ3VtZW50MFwiKX0pICYmIHRoaXMuI2lzVmFsaWRTZXRLZXkoJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcInJlcXVpcmVWYWxpZE1hcEtleVwiLCAyKX1cbiAgI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSkge1xuICAgIGlmICghdGhpcy4jaXNWYWxpZE1hcEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgb3JkZXJlZCBtYXAga2V5IHNldCBpcyBub3QgdmFsaWQhXCIpO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZE1hcEtleVByaXZhdGVcIiwgMil9XG4gICNpc1ZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KSB7XG4gICAgaWYgKE9iamVjdCgke2RlZmluZXMuZ2V0KFwibWFwQXJndW1lbnQwXCIpfSkgIT09ICR7ZGVmaW5lcy5nZXQoXCJtYXBBcmd1bWVudDBcIil9KVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICR7ZGVmaW5lcy5nZXQoXCJ2YWxpZGF0ZU1hcEFyZ3VtZW50c1wiKSB8fCBcIlwifVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZFNldEtleVByaXZhdGVcIiwgMil9XG4gICNpc1ZhbGlkU2V0S2V5KCR7ZGVmaW5lcy5nZXQoXCJzZXRBcmdMaXN0XCIpfSkge1xuICAgIHZvaWQoJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KTtcblxuICAgICR7ZGVmaW5lcy5nZXQoXCJ2YWxpZGF0ZVNldEFyZ3VtZW50c1wiKSB8fCBcIlwifVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgW1N5bWJvbC50b1N0cmluZ1RhZ10gPSBcIiR7ZGVmaW5lcy5nZXQoXCJjbGFzc05hbWVcIil9XCI7XG59XG5cbk9iamVjdC5mcmVlemUoJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX0pO1xuT2JqZWN0LmZyZWV6ZSgke2RlZmluZXMuZ2V0KFwiY2xhc3NOYW1lXCIpfS5wcm90b3R5cGUpO1xuYDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgcHJlcHJvY2VzcztcbiJdfQ==