/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    return `
${defines.get("importLines")}
import WeakKeyComposer from "./keys/Composite.mjs";

class ${defines.get("className")} {
  // eslint-disable-next-line jsdoc/require-property
  /** @typedef {object} WeakKey */

  /**
   * @type {WeakMap<WeakKey, Set<${defines.get("setArgument0Type")}>>}
   * @constant
   * This is two levels. The first level is the WeakKey.
   * The second level is the strong set.
   */
  #root = new WeakMap();

  /** @type {WeakKeyComposer} @constant */
  #mapKeyComposer = new WeakKeyComposer(
    ${defines.get("weakMapArgNameList")}, ${defines.get("strongMapArgNameList")}
  );

  constructor() {
    if (arguments.length > 0) {
      const iterable = arguments[0];
      for (let entry of iterable) {
        this.add(...entry);
      }
    }
  }

${docs.buildBlock("add", 2)}
  add(${defines.get("mapArgList")}, ${defines.get("setArgument0")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgument0")});
    const __innerSet__ = this.#requireInnerSet(${defines.get("mapArgList")});

    __innerSet__.add(${defines.get("setArgument0")});
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

    const __innerSet__ = this.#requireInnerSet(${defines.get("mapArgList")});

    // level 2: inner map to set
    __array__.forEach(__set__ => __innerSet__.add(__set__[0]));

    return this;
  }

${docs.buildBlock("clearSets", 2)}
  clearSets(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    const __innerSet__ = this.#getExistingInnerSet(${defines.get("mapArgList")});
    if (!__innerSet__)
      return;

    __innerSet__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerSet__ = this.#getExistingInnerSet(${defines.get("mapArgList")});
    if (!__innerSet__)
      return false;

    // level 2: inner map to set
    const __returnValue__ = __innerSet__.delete(${defines.get("setArgument0")});

    if (__innerSet__.size === 0) {
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
    const __innerSet__ = this.#getExistingInnerSet(${defines.get("mapArgList")});
    if (!__innerSet__)
      return;

    __innerSet__.forEach(
      __element__ => __callback__.apply(__thisArg__, [${defines.get("mapArgList")}, __element__, this])
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    const __innerSet__ = this.#getExistingInnerSet(${defines.get("mapArgList")});
    return __innerSet__?.size || 0;
  }

${docs.buildBlock("has", 2)}
  has(${defines.get("mapArgList")}, ${defines.get("setArgument0")}) {
    this.#requireValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
    const __innerSet__ = this.#getExistingInnerSet(${defines.get("mapArgList")});
    if (!__innerSet__)
      return false;

    return __innerSet__.has(${defines.get("setArgument0")});
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});
    return Boolean(this.#getExistingInnerSet(${defines.get("mapArgList")}));
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")}) {
    return this.#isValidKey(${defines.get("mapArgList")}, ${defines.get("setArgList")});
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${defines.get("mapArgList")}) {
    this.#requireValidMapKey(${defines.get("mapArgList")});

    const __innerSet__ = this.#getExistingInnerSet(${defines.get("mapArgList")});
    if (!__innerSet__)
      return;

    const __outerIter__ = __innerSet__.values();
    for (let __value__ of __outerIter__)
      yield [${defines.get("mapArgList")}, __value__];
  }

${docs.buildBlock("requireInnerCollectionPrivate", 2)}
  #requireInnerSet(${defines.get("mapArgList")}) {
    const __mapKey__ = this.#mapKeyComposer.getKey(
      [${defines.get("weakMapArgList")}], [${defines.get("strongMapArgList")}]
    );
    if (!this.#root.has(__mapKey__)) {
      this.#root.set(__mapKey__, new Set);
    }
    return this.#root.get(__mapKey__);
  }

${docs.buildBlock("getExistingInnerCollectionPrivate", 2)}
  #getExistingInnerSet(${defines.get("mapArgList")}) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFwT2ZPbmVTdHJvbmdTZXQuaW4ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTWFwT2ZPbmVTdHJvbmdTZXQuaW4ubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsR0FBcUIsU0FBUyxVQUFVLENBQUMsT0FBNEIsRUFBRSxJQUFvQjtJQUN6RyxPQUFPO0VBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUM7OztRQUdwQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQzs7Ozs7bUNBS0csT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQzs7Ozs7Ozs7O01BUzVELE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsS0FBSyxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDOzs7Ozs7Ozs7Ozs7RUFZN0UsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUM7NEJBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUM7aURBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDOzt1QkFFbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUM7Ozs7RUFJaEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDOytCQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDOzs7K0JBR3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDOzRFQUNzQixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxnQkFDekYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxV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QyxHQUFHLENBQUMsWUFBWSxDQUFDLDRCQUE0QixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQzs7O0VBRzdHLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO3dCQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQzsrQkFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7Ozs7RUFJdEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7bUJBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDOytDQUNHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDOztNQUU1RyxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFBRTs7OztFQUk3QyxJQUFJLENBQUMsVUFBVSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQzttQkFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7V0FDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7O01BRTlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsSUFBSSxFQUFFOzs7OzRCQUluQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQzs7O2dCQUdwQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztnQkFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7Q0FDdkMsQ0FBQztBQUNGLENBQUMsQ0FBQTtBQUVELGVBQWUsVUFBVSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBQcmVwcm9jZXNzb3JEZWZpbmVzLCBKU0RvY0dlbmVyYXRvciwgVGVtcGxhdGVGdW5jdGlvbiB9IGZyb20gXCIuLi9zaGFyZWRUeXBlcy5tanNcIjtcblxuLyoqXG4gKiBAcGFyYW0ge01hcH0gICAgICAgICAgICBkZWZpbmVzIFRoZSBwcmVwcm9jZXNzb3IgbWFjcm9zLlxuICogQHBhcmFtIHtKU0RvY0dlbmVyYXRvcn0gZG9jcyAgICBUaGUgcHJpbWFyeSBkb2N1bWVudGF0aW9uIGdlbmVyYXRvci5cbiAqIEByZXR1cm5zIHtzdHJpbmd9ICAgICAgICAgICAgICAgVGhlIGdlbmVyYXRlZCBzb3VyY2UgY29kZS5cbiAqL1xuY29uc3QgcHJlcHJvY2VzczogVGVtcGxhdGVGdW5jdGlvbiA9IGZ1bmN0aW9uIHByZXByb2Nlc3MoZGVmaW5lczogUHJlcHJvY2Vzc29yRGVmaW5lcywgZG9jczogSlNEb2NHZW5lcmF0b3IpIHtcbiAgcmV0dXJuIGBcbiR7ZGVmaW5lcy5nZXQoXCJpbXBvcnRMaW5lc1wiKX1cbmltcG9ydCBXZWFrS2V5Q29tcG9zZXIgZnJvbSBcIi4va2V5cy9Db21wb3NpdGUubWpzXCI7XG5cbmNsYXNzICR7ZGVmaW5lcy5nZXQoXCJjbGFzc05hbWVcIil9IHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGpzZG9jL3JlcXVpcmUtcHJvcGVydHlcbiAgLyoqIEB0eXBlZGVmIHtvYmplY3R9IFdlYWtLZXkgKi9cblxuICAvKipcbiAgICogQHR5cGUge1dlYWtNYXA8V2Vha0tleSwgU2V0PCR7ZGVmaW5lcy5nZXQoXCJzZXRBcmd1bWVudDBUeXBlXCIpfT4+fVxuICAgKiBAY29uc3RhbnRcbiAgICogVGhpcyBpcyB0d28gbGV2ZWxzLiBUaGUgZmlyc3QgbGV2ZWwgaXMgdGhlIFdlYWtLZXkuXG4gICAqIFRoZSBzZWNvbmQgbGV2ZWwgaXMgdGhlIHN0cm9uZyBzZXQuXG4gICAqL1xuICAjcm9vdCA9IG5ldyBXZWFrTWFwKCk7XG5cbiAgLyoqIEB0eXBlIHtXZWFrS2V5Q29tcG9zZXJ9IEBjb25zdGFudCAqL1xuICAjbWFwS2V5Q29tcG9zZXIgPSBuZXcgV2Vha0tleUNvbXBvc2VyKFxuICAgICR7ZGVmaW5lcy5nZXQoXCJ3ZWFrTWFwQXJnTmFtZUxpc3RcIil9LCAke2RlZmluZXMuZ2V0KFwic3Ryb25nTWFwQXJnTmFtZUxpc3RcIil9XG4gICk7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBpdGVyYWJsZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgIGZvciAobGV0IGVudHJ5IG9mIGl0ZXJhYmxlKSB7XG4gICAgICAgIHRoaXMuYWRkKC4uLmVudHJ5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJhZGRcIiwgMil9XG4gIGFkZCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmd1bWVudDBcIil9KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgJHtkZWZpbmVzLmdldChcInNldEFyZ3VtZW50MFwiKX0pO1xuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI3JlcXVpcmVJbm5lclNldCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuXG4gICAgX19pbm5lclNldF9fLmFkZCgke2RlZmluZXMuZ2V0KFwic2V0QXJndW1lbnQwXCIpfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJhZGRTZXRzXCIsIDIpfVxuICBhZGRTZXRzKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgX19zZXRzX18pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcbiAgICBjb25zdCBfX2FycmF5X18gPSBBcnJheS5mcm9tKF9fc2V0c19fKS5tYXAoKF9fc2V0X18sIF9faW5kZXhfXykgPT4ge1xuICAgICAgX19zZXRfXyA9IEFycmF5LmZyb20oX19zZXRfXyk7XG4gICAgICBpZiAoX19zZXRfXy5sZW5ndGggIT09ICR7ZGVmaW5lcy5nZXQoXCJzZXRDb3VudFwiKX0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxcYFNldCBhdCBpbmRleCBcXCR7X19pbmRleF9ffSBkb2Vzbid0IGhhdmUgZXhhY3RseSAke2RlZmluZXMuZ2V0KFwic2V0Q291bnRcIil9IHNldCBhcmd1bWVudCR7XG4gICAgICAgICAgZGVmaW5lcy5nZXQoXCJzZXRDb3VudFwiKSEgPiAxID8gXCJzXCIgOiBcIlwiXG4gICAgICAgIH0hXFxgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0sIC4uLl9fc2V0X18pO1xuICAgICAgcmV0dXJuIF9fc2V0X187XG4gICAgfSk7XG5cbiAgICBjb25zdCBfX2lubmVyU2V0X18gPSB0aGlzLiNyZXF1aXJlSW5uZXJTZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcblxuICAgIC8vIGxldmVsIDI6IGlubmVyIG1hcCB0byBzZXRcbiAgICBfX2FycmF5X18uZm9yRWFjaChfX3NldF9fID0+IF9faW5uZXJTZXRfXy5hZGQoX19zZXRfX1swXSkpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJjbGVhclNldHNcIiwgMil9XG4gIGNsZWFyU2V0cygke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcbiAgICBjb25zdCBfX2lubmVyU2V0X18gPSB0aGlzLiNnZXRFeGlzdGluZ0lubmVyU2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSk7XG4gICAgaWYgKCFfX2lubmVyU2V0X18pXG4gICAgICByZXR1cm47XG5cbiAgICBfX2lubmVyU2V0X18uY2xlYXIoKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImRlbGV0ZVwiLCAyKX1cbiAgZGVsZXRlKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KTtcbiAgICBjb25zdCBfX2lubmVyU2V0X18gPSB0aGlzLiNnZXRFeGlzdGluZ0lubmVyU2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSk7XG4gICAgaWYgKCFfX2lubmVyU2V0X18pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBsZXZlbCAyOiBpbm5lciBtYXAgdG8gc2V0XG4gICAgY29uc3QgX19yZXR1cm5WYWx1ZV9fID0gX19pbm5lclNldF9fLmRlbGV0ZSgke2RlZmluZXMuZ2V0KFwic2V0QXJndW1lbnQwXCIpfSk7XG5cbiAgICBpZiAoX19pbm5lclNldF9fLnNpemUgPT09IDApIHtcbiAgICAgIHRoaXMuZGVsZXRlU2V0cygke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuICAgIH1cblxuICAgIHJldHVybiBfX3JldHVyblZhbHVlX187XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJkZWxldGVTZXRzXCIsIDIpfVxuICBkZWxldGVTZXRzKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuXG4gICAgY29uc3QgX19tYXBLZXlfXyA9IHRoaXMuI21hcEtleUNvbXBvc2VyLmdldEtleUlmRXhpc3RzKFxuICAgICAgWyR7ZGVmaW5lcy5nZXQoXCJ3ZWFrTWFwQXJnTGlzdFwiKX1dLCBbJHtkZWZpbmVzLmdldChcInN0cm9uZ01hcEFyZ0xpc3RcIil9XVxuICAgICk7XG5cbiAgICByZXR1cm4gX19tYXBLZXlfXyA/IHRoaXMuI3Jvb3QuZGVsZXRlKF9fbWFwS2V5X18pIDogZmFsc2U7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJmb3JFYWNoTWFwU2V0XCIsIDIpfVxuICBmb3JFYWNoU2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgX19jYWxsYmFja19fLCBfX3RoaXNBcmdfXykge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI2dldEV4aXN0aW5nSW5uZXJTZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcbiAgICBpZiAoIV9faW5uZXJTZXRfXylcbiAgICAgIHJldHVybjtcblxuICAgIF9faW5uZXJTZXRfXy5mb3JFYWNoKFxuICAgICAgX19lbGVtZW50X18gPT4gX19jYWxsYmFja19fLmFwcGx5KF9fdGhpc0FyZ19fLCBbJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCBfX2VsZW1lbnRfXywgdGhpc10pXG4gICAgKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImZvckVhY2hDYWxsYmFja1NldFwiLCAyKX1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJnZXRTaXplT2ZTZXRcIiwgMil9XG4gIGdldFNpemVPZlNldCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcbiAgICBjb25zdCBfX2lubmVyU2V0X18gPSB0aGlzLiNnZXRFeGlzdGluZ0lubmVyU2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSk7XG4gICAgcmV0dXJuIF9faW5uZXJTZXRfXz8uc2l6ZSB8fCAwO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaGFzXCIsIDIpfVxuICBoYXMoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCAke2RlZmluZXMuZ2V0KFwic2V0QXJndW1lbnQwXCIpfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmdMaXN0XCIpfSk7XG4gICAgY29uc3QgX19pbm5lclNldF9fID0gdGhpcy4jZ2V0RXhpc3RpbmdJbm5lclNldCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuICAgIGlmICghX19pbm5lclNldF9fKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgcmV0dXJuIF9faW5uZXJTZXRfXy5oYXMoJHtkZWZpbmVzLmdldChcInNldEFyZ3VtZW50MFwiKX0pO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaGFzU2V0XCIsIDIpfVxuICBoYXNTZXRzKCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pO1xuICAgIHJldHVybiBCb29sZWFuKHRoaXMuI2dldEV4aXN0aW5nSW5uZXJTZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KSk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHVibGljXCIsIDIpfVxuICBpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSwgJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KSB7XG4gICAgcmV0dXJuIHRoaXMuI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCAke2RlZmluZXMuZ2V0KFwic2V0QXJnTGlzdFwiKX0pO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwidmFsdWVzU2V0XCIsIDIpfVxuICAqIHZhbHVlc1NldCgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcblxuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI2dldEV4aXN0aW5nSW5uZXJTZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KTtcbiAgICBpZiAoIV9faW5uZXJTZXRfXylcbiAgICAgIHJldHVybjtcblxuICAgIGNvbnN0IF9fb3V0ZXJJdGVyX18gPSBfX2lubmVyU2V0X18udmFsdWVzKCk7XG4gICAgZm9yIChsZXQgX192YWx1ZV9fIG9mIF9fb3V0ZXJJdGVyX18pXG4gICAgICB5aWVsZCBbJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCBfX3ZhbHVlX19dO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZUlubmVyQ29sbGVjdGlvblByaXZhdGVcIiwgMil9XG4gICNyZXF1aXJlSW5uZXJTZXQoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KSB7XG4gICAgY29uc3QgX19tYXBLZXlfXyA9IHRoaXMuI21hcEtleUNvbXBvc2VyLmdldEtleShcbiAgICAgIFske2RlZmluZXMuZ2V0KFwid2Vha01hcEFyZ0xpc3RcIil9XSwgWyR7ZGVmaW5lcy5nZXQoXCJzdHJvbmdNYXBBcmdMaXN0XCIpfV1cbiAgICApO1xuICAgIGlmICghdGhpcy4jcm9vdC5oYXMoX19tYXBLZXlfXykpIHtcbiAgICAgIHRoaXMuI3Jvb3Quc2V0KF9fbWFwS2V5X18sIG5ldyBTZXQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy4jcm9vdC5nZXQoX19tYXBLZXlfXyk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJnZXRFeGlzdGluZ0lubmVyQ29sbGVjdGlvblByaXZhdGVcIiwgMil9XG4gICNnZXRFeGlzdGluZ0lubmVyU2V0KCR7ZGVmaW5lcy5nZXQoXCJtYXBBcmdMaXN0XCIpfSkge1xuICAgIGNvbnN0IF9fbWFwS2V5X18gPSB0aGlzLiNtYXBLZXlDb21wb3Nlci5nZXRLZXlJZkV4aXN0cyhcbiAgICAgIFske2RlZmluZXMuZ2V0KFwid2Vha01hcEFyZ0xpc3RcIil9XSwgWyR7ZGVmaW5lcy5nZXQoXCJzdHJvbmdNYXBBcmdMaXN0XCIpfV1cbiAgICApO1xuXG4gICAgcmV0dXJuIF9fbWFwS2V5X18gPyB0aGlzLiNyb290LmdldChfX21hcEtleV9fKSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcInJlcXVpcmVWYWxpZEtleVwiLCAyKX1cbiAgI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmdMaXN0XCIpfSkge1xuICAgIGlmICghdGhpcy4jaXNWYWxpZEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0sICR7ZGVmaW5lcy5nZXQoXCJzZXRBcmdMaXN0XCIpfSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgb3JkZXJlZCBrZXkgc2V0IGlzIG5vdCB2YWxpZCFcIik7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHJpdmF0ZVwiLCAyKX1cbiAgI2lzVmFsaWRLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9LCAke2RlZmluZXMuZ2V0KFwic2V0QXJnTGlzdFwiKX0pIHtcbiAgICByZXR1cm4gdGhpcy4jaXNWYWxpZE1hcEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pICYmIHRoaXMuI2lzVmFsaWRTZXRLZXkoJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcInJlcXVpcmVWYWxpZE1hcEtleVwiLCAyKX1cbiAgI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMuZ2V0KFwibWFwQXJnTGlzdFwiKX0pIHtcbiAgICBpZiAoIXRoaXMuI2lzVmFsaWRNYXBLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBvcmRlcmVkIG1hcCBrZXkgc2V0IGlzIG5vdCB2YWxpZCFcIik7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkTWFwS2V5UHJpdmF0ZVwiLCAyKX1cbiAgI2lzVmFsaWRNYXBLZXkoJHtkZWZpbmVzLmdldChcIm1hcEFyZ0xpc3RcIil9KSB7XG4gICAgaWYgKCF0aGlzLiNtYXBLZXlDb21wb3Nlci5pc1ZhbGlkRm9yS2V5KFske2RlZmluZXMuZ2V0KFwid2Vha01hcEFyZ0xpc3RcIil9XSwgWyR7ZGVmaW5lcy5nZXQoXCJzdHJvbmdNYXBBcmdMaXN0XCIpfV0pKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICR7ZGVmaW5lcy5nZXQoXCJ2YWxpZGF0ZU1hcEFyZ3VtZW50c1wiKSB8fCBcIlwifVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZFNldEtleVByaXZhdGVcIiwgMil9XG4gICNpc1ZhbGlkU2V0S2V5KCR7ZGVmaW5lcy5nZXQoXCJzZXRBcmdMaXN0XCIpfSkge1xuICAgIHZvaWQoJHtkZWZpbmVzLmdldChcInNldEFyZ0xpc3RcIil9KTtcblxuICAgICR7ZGVmaW5lcy5nZXQoXCJ2YWxpZGF0ZVNldEFyZ3VtZW50c1wiKSB8fCBcIlwifVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgW1N5bWJvbC50b1N0cmluZ1RhZ10gPSBcIiR7ZGVmaW5lcy5nZXQoXCJjbGFzc05hbWVcIil9XCI7XG59XG5cbk9iamVjdC5mcmVlemUoJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX0pO1xuT2JqZWN0LmZyZWV6ZSgke2RlZmluZXMuZ2V0KFwiY2xhc3NOYW1lXCIpfS5wcm90b3R5cGUpO1xuYDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgcHJlcHJvY2VzcztcbiJdfQ==