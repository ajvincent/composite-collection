/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    return `
${defines.importLines}
import WeakKeyComposer from "./keys/Composite.mjs";

class ${defines.className} {
  // eslint-disable-next-line jsdoc/require-property
  /** @typedef {object} WeakKey */

  /**
   * @type {WeakMap<WeakKey, Set<${defines.setArgument0Type}>>}
   * @constant
   * This is two levels. The first level is the WeakKey.
   * The second level is the strong set.
   */
  #root = new WeakMap();

  /** @type {WeakKeyComposer} @constant */
  #mapKeyComposer = new WeakKeyComposer(
    ${JSON.stringify(defines.weakMapKeys)}, ${JSON.stringify(defines.strongMapKeys)}
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
  add(${defines.mapKeys.join(", ")}, ${defines.setKeys[0]}) {
    this.#requireValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys[0]});
    const __innerSet__ = this.#requireInnerSet(${defines.mapKeys.join(", ")});

    __innerSet__.add(${defines.setKeys[0]});
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

    const __innerSet__ = this.#requireInnerSet(${defines.mapKeys.join(", ")});

    // level 2: inner map to set
    __array__.forEach(__set__ => __innerSet__.add(__set__[0]));

    return this;
  }

${docs.buildBlock("clearSets", 2)}
  clearSets(${defines.mapKeys.join(", ")}) {
    this.#requireValidMapKey(${defines.mapKeys.join(", ")});
    const __innerSet__ = this.#getExistingInnerSet(${defines.mapKeys.join(", ")});
    if (!__innerSet__)
      return;

    __innerSet__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.mapKeys.join(", ")}, ${defines.setKeys}) {
    this.#requireValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys});
    const __innerSet__ = this.#getExistingInnerSet(${defines.mapKeys.join(", ")});
    if (!__innerSet__)
      return false;

    // level 2: inner map to set
    const __returnValue__ = __innerSet__.delete(${defines.setKeys[0]});

    if (__innerSet__.size === 0) {
      this.deleteSets(${defines.mapKeys.join(", ")});
    }

    return __returnValue__;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${defines.mapKeys.join(", ")}) {
    this.#requireValidMapKey(${defines.mapKeys.join(", ")});

    const __mapKey__ = this.#mapKeyComposer.getKeyIfExists(
      [${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]
    );

    return __mapKey__ ? this.#root.delete(__mapKey__) : false;
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(${defines.mapKeys.join(", ")}, __callback__, __thisArg__) {
    this.#requireValidMapKey(${defines.mapKeys.join(", ")});
    const __innerSet__ = this.#getExistingInnerSet(${defines.mapKeys.join(", ")});
    if (!__innerSet__)
      return;

    __innerSet__.forEach(
      __element__ => __callback__.apply(__thisArg__, [${defines.mapKeys.join(", ")}, __element__, this])
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${defines.mapKeys.join(", ")}) {
    this.#requireValidMapKey(${defines.mapKeys.join(", ")});
    const __innerSet__ = this.#getExistingInnerSet(${defines.mapKeys.join(", ")});
    return __innerSet__?.size || 0;
  }

${docs.buildBlock("has", 2)}
  has(${defines.mapKeys.join(", ")}, ${defines.setKeys[0]}) {
    this.#requireValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys});
    const __innerSet__ = this.#getExistingInnerSet(${defines.mapKeys.join(", ")});
    if (!__innerSet__)
      return false;

    return __innerSet__.has(${defines.setKeys[0]});
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.mapKeys.join(", ")}) {
    this.#requireValidMapKey(${defines.mapKeys.join(", ")});
    return Boolean(this.#getExistingInnerSet(${defines.mapKeys.join(", ")}));
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys}) {
    return this.#isValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys});
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${defines.mapKeys.join(", ")}) {
    this.#requireValidMapKey(${defines.mapKeys.join(", ")});

    const __innerSet__ = this.#getExistingInnerSet(${defines.mapKeys.join(", ")});
    if (!__innerSet__)
      return;

    const __outerIter__ = __innerSet__.values();
    for (let __value__ of __outerIter__)
      yield [${defines.mapKeys.join(", ")}, __value__];
  }

${docs.buildBlock("requireInnerCollectionPrivate", 2)}
  #requireInnerSet(${defines.mapKeys.join(", ")}) {
    const __mapKey__ = this.#mapKeyComposer.getKey(
      [${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]
    );
    if (!this.#root.has(__mapKey__)) {
      this.#root.set(__mapKey__, new Set);
    }
    return this.#root.get(__mapKey__);
  }

${docs.buildBlock("getExistingInnerCollectionPrivate", 2)}
  #getExistingInnerSet(${defines.mapKeys.join(", ")}) {
    const __mapKey__ = this.#mapKeyComposer.getKeyIfExists(
      [${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]
    );

    return __mapKey__ ? this.#root.get(__mapKey__) : undefined;
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys}) {
    if (!this.#isValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys}) {
    return this.#isValidMapKey(${defines.mapKeys.join(", ")}) && this.#isValidSetKey(${defines.setKeys});
  }

${docs.buildBlock("requireValidMapKey", 2)}
  #requireValidMapKey(${defines.mapKeys.join(", ")}) {
    if (!this.#isValidMapKey(${defines.mapKeys.join(", ")}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  #isValidMapKey(${defines.mapKeys.join(", ")}) {
    if (!this.#mapKeyComposer.isValidForKey([${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]))
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFwT2ZPbmVTdHJvbmdTZXQuaW4ubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTWFwT2ZPbmVTdHJvbmdTZXQuaW4ubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsR0FBcUIsU0FBUyxVQUFVLENBQUMsT0FBd0IsRUFBRSxJQUFvQjtJQUNyRyxPQUFPO0VBQ1AsT0FBTyxDQUFDLFdBQVc7OztRQUdiLE9BQU8sQ0FBQyxTQUFTOzs7OzttQ0FLVSxPQUFPLENBQUMsZ0JBQWdCOzs7Ozs7Ozs7TUFTckQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDOzs7Ozs7Ozs7Ozs7RUFZakYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ25CLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDOzRCQUM3QixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztpREFDNUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzt1QkFFcEQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Ozs7RUFJdkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQ25CLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzsrQkFDUCxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7OzsrQkFHMUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNOzRFQUN1QixPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sZ0JBQ3hGLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNyQzs7OEJBRXNCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs7OztpREFJUCxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7Ozs7O0VBUXpFLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztjQUNuQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7K0JBQ1QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3FEQUNKLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs7OztFQU83RSxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7V0FDbkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssT0FBTyxDQUFDLE9BQU87NEJBQzdCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLE9BQU8sQ0FBQyxPQUFPO3FEQUNyQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7O2tEQUs3QixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzs7O3dCQUc1QyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7OztFQU1oRCxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7ZUFDbkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOytCQUNWLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs7O1NBR2hELE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs7O0VBTTVFLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztlQUN0QixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7K0JBQ1YsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3FEQUNKLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs7d0RBS3ZCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs7OztFQUloRixJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQzs7RUFFeEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO2lCQUNuQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7K0JBQ1osT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3FEQUNKLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs7OztFQUk3RSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDbkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7NEJBQzdCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLE9BQU8sQ0FBQyxPQUFPO3FEQUNyQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7OEJBSWpELE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDOzs7RUFHOUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ2xCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzsrQkFDUCxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7K0NBQ1YsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzs7RUFHdkUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7ZUFDekIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssT0FBTyxDQUFDLE9BQU87OEJBQy9CLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLE9BQU8sQ0FBQyxPQUFPOzs7RUFHMUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2dCQUNqQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7K0JBQ1gsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOztxREFFSixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7OztlQU1oRSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7OztFQUd2QyxJQUFJLENBQUMsVUFBVSxDQUFDLCtCQUErQixFQUFFLENBQUMsQ0FBQztxQkFDaEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOztTQUV0QyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Ozs7Ozs7O0VBUTVFLElBQUksQ0FBQyxVQUFVLENBQUMsbUNBQW1DLEVBQUUsQ0FBQyxDQUFDO3lCQUNoQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7O1NBRTFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs7Ozs7O0VBTTVFLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO3FCQUNsQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxPQUFPLENBQUMsT0FBTzs0QkFDdkMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssT0FBTyxDQUFDLE9BQU87Ozs7RUFJeEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7Z0JBQ3pCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLE9BQU8sQ0FBQyxPQUFPO2lDQUM3QixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsNEJBQTRCLE9BQU8sQ0FBQyxPQUFPOzs7RUFHcEcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7d0JBQ2xCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzsrQkFDbkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzs7O0VBSXZELElBQUksQ0FBQyxVQUFVLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO21CQUN6QixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7K0NBQ0UsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOztNQUU5RyxPQUFPLENBQUMsb0JBQW9CLElBQUksRUFBRTs7OztFQUl0QyxJQUFJLENBQUMsVUFBVSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQzttQkFDekIsT0FBTyxDQUFDLE9BQU87V0FDdkIsT0FBTyxDQUFDLE9BQU87O01BRXBCLE9BQU8sQ0FBQyxvQkFBb0IsSUFBSSxFQUFFOzs7OzRCQUlaLE9BQU8sQ0FBQyxTQUFTOzs7Z0JBRzdCLE9BQU8sQ0FBQyxTQUFTO2dCQUNqQixPQUFPLENBQUMsU0FBUztDQUNoQyxDQUFDO0FBQ0YsQ0FBQyxDQUFBO0FBRUQsZUFBZSxVQUFVLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFJlYWRvbmx5RGVmaW5lcywgSlNEb2NHZW5lcmF0b3IsIFRlbXBsYXRlRnVuY3Rpb24gfSBmcm9tIFwiLi4vc2hhcmVkVHlwZXMubWpzXCI7XG5cbi8qKlxuICogQHBhcmFtIHtNYXB9ICAgICAgICAgICAgZGVmaW5lcyBUaGUgcHJlcHJvY2Vzc29yIG1hY3Jvcy5cbiAqIEBwYXJhbSB7SlNEb2NHZW5lcmF0b3J9IGRvY3MgICAgVGhlIHByaW1hcnkgZG9jdW1lbnRhdGlvbiBnZW5lcmF0b3IuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSAgICAgICAgICAgICAgIFRoZSBnZW5lcmF0ZWQgc291cmNlIGNvZGUuXG4gKi9cbmNvbnN0IHByZXByb2Nlc3M6IFRlbXBsYXRlRnVuY3Rpb24gPSBmdW5jdGlvbiBwcmVwcm9jZXNzKGRlZmluZXM6IFJlYWRvbmx5RGVmaW5lcywgZG9jczogSlNEb2NHZW5lcmF0b3IpIHtcbiAgcmV0dXJuIGBcbiR7ZGVmaW5lcy5pbXBvcnRMaW5lc31cbmltcG9ydCBXZWFrS2V5Q29tcG9zZXIgZnJvbSBcIi4va2V5cy9Db21wb3NpdGUubWpzXCI7XG5cbmNsYXNzICR7ZGVmaW5lcy5jbGFzc05hbWV9IHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGpzZG9jL3JlcXVpcmUtcHJvcGVydHlcbiAgLyoqIEB0eXBlZGVmIHtvYmplY3R9IFdlYWtLZXkgKi9cblxuICAvKipcbiAgICogQHR5cGUge1dlYWtNYXA8V2Vha0tleSwgU2V0PCR7ZGVmaW5lcy5zZXRBcmd1bWVudDBUeXBlfT4+fVxuICAgKiBAY29uc3RhbnRcbiAgICogVGhpcyBpcyB0d28gbGV2ZWxzLiBUaGUgZmlyc3QgbGV2ZWwgaXMgdGhlIFdlYWtLZXkuXG4gICAqIFRoZSBzZWNvbmQgbGV2ZWwgaXMgdGhlIHN0cm9uZyBzZXQuXG4gICAqL1xuICAjcm9vdCA9IG5ldyBXZWFrTWFwKCk7XG5cbiAgLyoqIEB0eXBlIHtXZWFrS2V5Q29tcG9zZXJ9IEBjb25zdGFudCAqL1xuICAjbWFwS2V5Q29tcG9zZXIgPSBuZXcgV2Vha0tleUNvbXBvc2VyKFxuICAgICR7SlNPTi5zdHJpbmdpZnkoZGVmaW5lcy53ZWFrTWFwS2V5cyl9LCAke0pTT04uc3RyaW5naWZ5KGRlZmluZXMuc3Ryb25nTWFwS2V5cyl9XG4gICk7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBpdGVyYWJsZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgIGZvciAobGV0IGVudHJ5IG9mIGl0ZXJhYmxlKSB7XG4gICAgICAgIHRoaXMuYWRkKC4uLmVudHJ5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJhZGRcIiwgMil9XG4gIGFkZCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAke2RlZmluZXMuc2V0S2V5c1swXX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSwgJHtkZWZpbmVzLnNldEtleXNbMF19KTtcbiAgICBjb25zdCBfX2lubmVyU2V0X18gPSB0aGlzLiNyZXF1aXJlSW5uZXJTZXQoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG5cbiAgICBfX2lubmVyU2V0X18uYWRkKCR7ZGVmaW5lcy5zZXRLZXlzWzBdfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJhZGRTZXRzXCIsIDIpfVxuICBhZGRTZXRzKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0sIF9fc2V0c19fKSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xuICAgIGNvbnN0IF9fYXJyYXlfXyA9IEFycmF5LmZyb20oX19zZXRzX18pLm1hcCgoX19zZXRfXywgX19pbmRleF9fKSA9PiB7XG4gICAgICBfX3NldF9fID0gQXJyYXkuZnJvbShfX3NldF9fKTtcbiAgICAgIGlmIChfX3NldF9fLmxlbmd0aCAhPT0gJHtkZWZpbmVzLnNldEtleXMubGVuZ3RofSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXFxgU2V0IGF0IGluZGV4IFxcJHtfX2luZGV4X199IGRvZXNuJ3QgaGF2ZSBleGFjdGx5ICR7ZGVmaW5lcy5zZXRLZXlzLmxlbmd0aH0gc2V0IGFyZ3VtZW50JHtcbiAgICAgICAgICBkZWZpbmVzLnNldEtleXMubGVuZ3RoID4gMSA/IFwic1wiIDogXCJcIlxuICAgICAgICB9IVxcYCk7XG4gICAgICB9XG4gICAgICB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSwgLi4uX19zZXRfXyk7XG4gICAgICByZXR1cm4gX19zZXRfXztcbiAgICB9KTtcblxuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI3JlcXVpcmVJbm5lclNldCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KTtcblxuICAgIC8vIGxldmVsIDI6IGlubmVyIG1hcCB0byBzZXRcbiAgICBfX2FycmF5X18uZm9yRWFjaChfX3NldF9fID0+IF9faW5uZXJTZXRfXy5hZGQoX19zZXRfX1swXSkpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJjbGVhclNldHNcIiwgMil9XG4gIGNsZWFyU2V0cygke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkTWFwS2V5KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI2dldEV4aXN0aW5nSW5uZXJTZXQoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgaWYgKCFfX2lubmVyU2V0X18pXG4gICAgICByZXR1cm47XG5cbiAgICBfX2lubmVyU2V0X18uY2xlYXIoKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImRlbGV0ZVwiLCAyKX1cbiAgZGVsZXRlKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0sICR7ZGVmaW5lcy5zZXRLZXlzfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAke2RlZmluZXMuc2V0S2V5c30pO1xuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI2dldEV4aXN0aW5nSW5uZXJTZXQoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgaWYgKCFfX2lubmVyU2V0X18pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBsZXZlbCAyOiBpbm5lciBtYXAgdG8gc2V0XG4gICAgY29uc3QgX19yZXR1cm5WYWx1ZV9fID0gX19pbm5lclNldF9fLmRlbGV0ZSgke2RlZmluZXMuc2V0S2V5c1swXX0pO1xuXG4gICAgaWYgKF9faW5uZXJTZXRfXy5zaXplID09PSAwKSB7XG4gICAgICB0aGlzLmRlbGV0ZVNldHMoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIF9fcmV0dXJuVmFsdWVfXztcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImRlbGV0ZVNldHNcIiwgMil9XG4gIGRlbGV0ZVNldHMoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KTtcblxuICAgIGNvbnN0IF9fbWFwS2V5X18gPSB0aGlzLiNtYXBLZXlDb21wb3Nlci5nZXRLZXlJZkV4aXN0cyhcbiAgICAgIFske2RlZmluZXMud2Vha01hcEtleXMuam9pbihcIiwgXCIpfV0sIFske2RlZmluZXMuc3Ryb25nTWFwS2V5cy5qb2luKFwiLCBcIil9XVxuICAgICk7XG5cbiAgICByZXR1cm4gX19tYXBLZXlfXyA/IHRoaXMuI3Jvb3QuZGVsZXRlKF9fbWFwS2V5X18pIDogZmFsc2U7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJmb3JFYWNoTWFwU2V0XCIsIDIpfVxuICBmb3JFYWNoU2V0KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0sIF9fY2FsbGJhY2tfXywgX190aGlzQXJnX18pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgY29uc3QgX19pbm5lclNldF9fID0gdGhpcy4jZ2V0RXhpc3RpbmdJbm5lclNldCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KTtcbiAgICBpZiAoIV9faW5uZXJTZXRfXylcbiAgICAgIHJldHVybjtcblxuICAgIF9faW5uZXJTZXRfXy5mb3JFYWNoKFxuICAgICAgX19lbGVtZW50X18gPT4gX19jYWxsYmFja19fLmFwcGx5KF9fdGhpc0FyZ19fLCBbJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSwgX19lbGVtZW50X18sIHRoaXNdKVxuICAgICk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJmb3JFYWNoQ2FsbGJhY2tTZXRcIiwgMil9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZ2V0U2l6ZU9mU2V0XCIsIDIpfVxuICBnZXRTaXplT2ZTZXQoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KTtcbiAgICBjb25zdCBfX2lubmVyU2V0X18gPSB0aGlzLiNnZXRFeGlzdGluZ0lubmVyU2V0KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xuICAgIHJldHVybiBfX2lubmVyU2V0X18/LnNpemUgfHwgMDtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImhhc1wiLCAyKX1cbiAgaGFzKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0sICR7ZGVmaW5lcy5zZXRLZXlzWzBdfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAke2RlZmluZXMuc2V0S2V5c30pO1xuICAgIGNvbnN0IF9faW5uZXJTZXRfXyA9IHRoaXMuI2dldEV4aXN0aW5nSW5uZXJTZXQoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgaWYgKCFfX2lubmVyU2V0X18pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICByZXR1cm4gX19pbm5lclNldF9fLmhhcygke2RlZmluZXMuc2V0S2V5c1swXX0pO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaGFzU2V0XCIsIDIpfVxuICBoYXNTZXRzKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgcmV0dXJuIEJvb2xlYW4odGhpcy4jZ2V0RXhpc3RpbmdJbm5lclNldCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KSk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHVibGljXCIsIDIpfVxuICBpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0sICR7ZGVmaW5lcy5zZXRLZXlzfSkge1xuICAgIHJldHVybiB0aGlzLiNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0sICR7ZGVmaW5lcy5zZXRLZXlzfSk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJ2YWx1ZXNTZXRcIiwgMil9XG4gICogdmFsdWVzU2V0KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG5cbiAgICBjb25zdCBfX2lubmVyU2V0X18gPSB0aGlzLiNnZXRFeGlzdGluZ0lubmVyU2V0KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xuICAgIGlmICghX19pbm5lclNldF9fKVxuICAgICAgcmV0dXJuO1xuXG4gICAgY29uc3QgX19vdXRlckl0ZXJfXyA9IF9faW5uZXJTZXRfXy52YWx1ZXMoKTtcbiAgICBmb3IgKGxldCBfX3ZhbHVlX18gb2YgX19vdXRlckl0ZXJfXylcbiAgICAgIHlpZWxkIFske2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCBfX3ZhbHVlX19dO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZUlubmVyQ29sbGVjdGlvblByaXZhdGVcIiwgMil9XG4gICNyZXF1aXJlSW5uZXJTZXQoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSkge1xuICAgIGNvbnN0IF9fbWFwS2V5X18gPSB0aGlzLiNtYXBLZXlDb21wb3Nlci5nZXRLZXkoXG4gICAgICBbJHtkZWZpbmVzLndlYWtNYXBLZXlzLmpvaW4oXCIsIFwiKX1dLCBbJHtkZWZpbmVzLnN0cm9uZ01hcEtleXMuam9pbihcIiwgXCIpfV1cbiAgICApO1xuICAgIGlmICghdGhpcy4jcm9vdC5oYXMoX19tYXBLZXlfXykpIHtcbiAgICAgIHRoaXMuI3Jvb3Quc2V0KF9fbWFwS2V5X18sIG5ldyBTZXQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy4jcm9vdC5nZXQoX19tYXBLZXlfXyk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJnZXRFeGlzdGluZ0lubmVyQ29sbGVjdGlvblByaXZhdGVcIiwgMil9XG4gICNnZXRFeGlzdGluZ0lubmVyU2V0KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHtcbiAgICBjb25zdCBfX21hcEtleV9fID0gdGhpcy4jbWFwS2V5Q29tcG9zZXIuZ2V0S2V5SWZFeGlzdHMoXG4gICAgICBbJHtkZWZpbmVzLndlYWtNYXBLZXlzLmpvaW4oXCIsIFwiKX1dLCBbJHtkZWZpbmVzLnN0cm9uZ01hcEtleXMuam9pbihcIiwgXCIpfV1cbiAgICApO1xuXG4gICAgcmV0dXJuIF9fbWFwS2V5X18gPyB0aGlzLiNyb290LmdldChfX21hcEtleV9fKSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcInJlcXVpcmVWYWxpZEtleVwiLCAyKX1cbiAgI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAke2RlZmluZXMuc2V0S2V5c30pIHtcbiAgICBpZiAoIXRoaXMuI2lzVmFsaWRLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSwgJHtkZWZpbmVzLnNldEtleXN9KSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBvcmRlcmVkIGtleSBzZXQgaXMgbm90IHZhbGlkIVwiKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRLZXlQcml2YXRlXCIsIDIpfVxuICAjaXNWYWxpZEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAke2RlZmluZXMuc2V0S2V5c30pIHtcbiAgICByZXR1cm4gdGhpcy4jaXNWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KSAmJiB0aGlzLiNpc1ZhbGlkU2V0S2V5KCR7ZGVmaW5lcy5zZXRLZXlzfSk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJyZXF1aXJlVmFsaWRNYXBLZXlcIiwgMil9XG4gICNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSkge1xuICAgIGlmICghdGhpcy4jaXNWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBvcmRlcmVkIG1hcCBrZXkgc2V0IGlzIG5vdCB2YWxpZCFcIik7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkTWFwS2V5UHJpdmF0ZVwiLCAyKX1cbiAgI2lzVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSkge1xuICAgIGlmICghdGhpcy4jbWFwS2V5Q29tcG9zZXIuaXNWYWxpZEZvcktleShbJHtkZWZpbmVzLndlYWtNYXBLZXlzLmpvaW4oXCIsIFwiKX1dLCBbJHtkZWZpbmVzLnN0cm9uZ01hcEtleXMuam9pbihcIiwgXCIpfV0pKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICR7ZGVmaW5lcy52YWxpZGF0ZU1hcEFyZ3VtZW50cyB8fCBcIlwifVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZFNldEtleVByaXZhdGVcIiwgMil9XG4gICNpc1ZhbGlkU2V0S2V5KCR7ZGVmaW5lcy5zZXRLZXlzfSkge1xuICAgIHZvaWQoJHtkZWZpbmVzLnNldEtleXN9KTtcblxuICAgICR7ZGVmaW5lcy52YWxpZGF0ZVNldEFyZ3VtZW50cyB8fCBcIlwifVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgW1N5bWJvbC50b1N0cmluZ1RhZ10gPSBcIiR7ZGVmaW5lcy5jbGFzc05hbWV9XCI7XG59XG5cbk9iamVjdC5mcmVlemUoJHtkZWZpbmVzLmNsYXNzTmFtZX0pO1xuT2JqZWN0LmZyZWV6ZSgke2RlZmluZXMuY2xhc3NOYW1lfS5wcm90b3R5cGUpO1xuYDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgcHJlcHJvY2VzcztcbiJdfQ==