/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    return `
${defines.importLines}
import KeyHasher from "./keys/Hasher.mjs";
import WeakKeyComposer from "./keys/Composite.mjs";

/** @typedef {Map<hash, *[]>} ${defines.className}~InnerMap */

class ${defines.className} {
  /** @typedef {string} hash */

  // eslint-disable-next-line jsdoc/require-property
  /** @typedef {object} WeakKey */

  /**
   * @type {WeakMap<WeakKey, ${defines.className}~InnerMap>}
   * @constant
   * This is two levels. The first level is the WeakKey.
   * The second level is the strong set.
   */
  #root = new WeakMap();

  /** @type {WeakKeyComposer} @constant */
  #mapKeyComposer = new WeakKeyComposer(
    ${JSON.stringify(defines.weakMapKeys)}, ${JSON.stringify(defines.strongMapKeys)}
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
    const __innerMap__ = this.#getExistingInnerMap(${defines.mapKeys.join(", ")});
    if (!__innerMap__)
      return;

    __innerMap__.clear();
  }

${docs.buildBlock("delete", 2)}
  delete(${defines.mapKeys.join(", ")}, ${defines.setKeys}) {
    this.#requireValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys});
    const __innerMap__ = this.#getExistingInnerMap(${defines.mapKeys.join(", ")});
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
    const __innerMap__ = this.#getExistingInnerMap(${defines.mapKeys.join(", ")});
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
    const __innerMap__ = this.#getExistingInnerMap(${defines.mapKeys.join(", ")});
    if (!__innerMap__)
      return 0;

    return __innerMap__.size;
  }

${docs.buildBlock("has", 2)}
  has(${defines.mapKeys.join(", ")}, ${defines.setKeys}) {
    this.#requireValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys});
    const __innerMap__ = this.#getExistingInnerMap(${defines.mapKeys.join(", ")});
    if (!__innerMap__)
      return false;

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHashIfExists(${defines.setKeys});
    return __setKeyHash__ ? __innerMap__.has(__setKeyHash__) : false;
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${defines.mapKeys.join(", ")}) {
    this.#requireValidMapKey(${defines.mapKeys.join(", ")});
    return Boolean(this.#getExistingInnerMap(${defines.mapKeys.join(", ")}));
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys}) {
    return this.#isValidKey(${defines.mapKeys.join(", ")}, ${defines.setKeys});
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${defines.mapKeys.join(", ")}) {
    this.#requireValidMapKey(${defines.mapKeys.join(", ")});

    const __innerMap__ = this.#getExistingInnerMap(${defines.mapKeys.join(", ")});
    if (!__innerMap__)
      return;

    const __outerIter__ = __innerMap__.values();
    for (let __value__ of __outerIter__)
      yield [${defines.mapKeys.join(", ")}, ...__value__];
  }

${docs.buildBlock("requireInnerCollectionPrivate", 2)}
  #requireInnerMap(${defines.mapKeys.join(", ")}) {
    const __mapKey__ = this.#mapKeyComposer.getKey(
      [${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]
    );
    if (!this.#root.has(__mapKey__)) {
      this.#root.set(__mapKey__, new Map);
    }
    return this.#root.get(__mapKey__);
  }

${docs.buildBlock("getExistingInnerCollectionPrivate", 2)}
  #getExistingInnerMap(${defines.mapKeys.join(", ")}) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFwT2ZTdHJvbmdTZXRzLmluLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1hcE9mU3Ryb25nU2V0cy5pbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxHQUFxQixTQUFTLFVBQVUsQ0FBQyxPQUF3QixFQUFFLElBQW9CO0lBQ3JHLE9BQU87RUFDUCxPQUFPLENBQUMsV0FBVzs7OztnQ0FJVyxPQUFPLENBQUMsU0FBUzs7UUFFekMsT0FBTyxDQUFDLFNBQVM7Ozs7Ozs7K0JBT00sT0FBTyxDQUFDLFNBQVM7Ozs7Ozs7OztNQVMxQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUM7Ozs7Ozs7Ozs7Ozs7OztFQWVqRixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDbkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssT0FBTyxDQUFDLE9BQU87NEJBQzFCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLE9BQU8sQ0FBQyxPQUFPO2lEQUN6QixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7OztxREFHdEIsT0FBTyxDQUFDLE9BQU87OzBDQUUxQixPQUFPLENBQUMsT0FBTzs7Ozs7O0VBTXZELElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUNuQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7K0JBQ1AsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzs7K0JBRzFCLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTTs0RUFDdUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLGdCQUN4RixPQUFPLENB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QUFFRCxlQUFlLFVBQVUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUmVhZG9ubHlEZWZpbmVzLCBKU0RvY0dlbmVyYXRvciwgVGVtcGxhdGVGdW5jdGlvbiB9IGZyb20gXCIuLi9zaGFyZWRUeXBlcy5tanNcIjtcblxuLyoqXG4gKiBAcGFyYW0ge01hcH0gICAgICAgICAgICBkZWZpbmVzIFRoZSBwcmVwcm9jZXNzb3IgbWFjcm9zLlxuICogQHBhcmFtIHtKU0RvY0dlbmVyYXRvcn0gZG9jcyAgICBUaGUgcHJpbWFyeSBkb2N1bWVudGF0aW9uIGdlbmVyYXRvci5cbiAqIEByZXR1cm5zIHtzdHJpbmd9ICAgICAgICAgICAgICAgVGhlIGdlbmVyYXRlZCBzb3VyY2UgY29kZS5cbiAqL1xuY29uc3QgcHJlcHJvY2VzczogVGVtcGxhdGVGdW5jdGlvbiA9IGZ1bmN0aW9uIHByZXByb2Nlc3MoZGVmaW5lczogUmVhZG9ubHlEZWZpbmVzLCBkb2NzOiBKU0RvY0dlbmVyYXRvcikge1xuICByZXR1cm4gYFxuJHtkZWZpbmVzLmltcG9ydExpbmVzfVxuaW1wb3J0IEtleUhhc2hlciBmcm9tIFwiLi9rZXlzL0hhc2hlci5tanNcIjtcbmltcG9ydCBXZWFrS2V5Q29tcG9zZXIgZnJvbSBcIi4va2V5cy9Db21wb3NpdGUubWpzXCI7XG5cbi8qKiBAdHlwZWRlZiB7TWFwPGhhc2gsICpbXT59ICR7ZGVmaW5lcy5jbGFzc05hbWV9fklubmVyTWFwICovXG5cbmNsYXNzICR7ZGVmaW5lcy5jbGFzc05hbWV9IHtcbiAgLyoqIEB0eXBlZGVmIHtzdHJpbmd9IGhhc2ggKi9cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUganNkb2MvcmVxdWlyZS1wcm9wZXJ0eVxuICAvKiogQHR5cGVkZWYge29iamVjdH0gV2Vha0tleSAqL1xuXG4gIC8qKlxuICAgKiBAdHlwZSB7V2Vha01hcDxXZWFrS2V5LCAke2RlZmluZXMuY2xhc3NOYW1lfX5Jbm5lck1hcD59XG4gICAqIEBjb25zdGFudFxuICAgKiBUaGlzIGlzIHR3byBsZXZlbHMuIFRoZSBmaXJzdCBsZXZlbCBpcyB0aGUgV2Vha0tleS5cbiAgICogVGhlIHNlY29uZCBsZXZlbCBpcyB0aGUgc3Ryb25nIHNldC5cbiAgICovXG4gICNyb290ID0gbmV3IFdlYWtNYXAoKTtcblxuICAvKiogQHR5cGUge1dlYWtLZXlDb21wb3Nlcn0gQGNvbnN0YW50ICovXG4gICNtYXBLZXlDb21wb3NlciA9IG5ldyBXZWFrS2V5Q29tcG9zZXIoXG4gICAgJHtKU09OLnN0cmluZ2lmeShkZWZpbmVzLndlYWtNYXBLZXlzKX0sICR7SlNPTi5zdHJpbmdpZnkoZGVmaW5lcy5zdHJvbmdNYXBLZXlzKX1cbiAgKTtcblxuICAvKiogQHR5cGUge0tleUhhc2hlcn0gQGNvbnN0YW50ICovXG4gICNzZXRIYXNoZXIgPSBuZXcgS2V5SGFzaGVyKCk7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBpdGVyYWJsZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgIGZvciAobGV0IGVudHJ5IG9mIGl0ZXJhYmxlKSB7XG4gICAgICAgIHRoaXMuYWRkKC4uLmVudHJ5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJhZGRcIiwgMil9XG4gIGFkZCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAke2RlZmluZXMuc2V0S2V5c30pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSwgJHtkZWZpbmVzLnNldEtleXN9KTtcbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNyZXF1aXJlSW5uZXJNYXAoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG5cbiAgICAvLyBsZXZlbCAyOiBpbm5lciBtYXAgdG8gc2V0XG4gICAgY29uc3QgX19zZXRLZXlIYXNoX18gPSB0aGlzLiNzZXRIYXNoZXIuZ2V0SGFzaCgke2RlZmluZXMuc2V0S2V5c30pO1xuICAgIGlmICghX19pbm5lck1hcF9fLmhhcyhfX3NldEtleUhhc2hfXykpIHtcbiAgICAgIF9faW5uZXJNYXBfXy5zZXQoX19zZXRLZXlIYXNoX18sIFske2RlZmluZXMuc2V0S2V5c31dKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImFkZFNldHNcIiwgMil9XG4gIGFkZFNldHMoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSwgX19zZXRzX18pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgY29uc3QgX19hcnJheV9fID0gQXJyYXkuZnJvbShfX3NldHNfXykubWFwKChfX3NldF9fLCBfX2luZGV4X18pID0+IHtcbiAgICAgIF9fc2V0X18gPSBBcnJheS5mcm9tKF9fc2V0X18pO1xuICAgICAgaWYgKF9fc2V0X18ubGVuZ3RoICE9PSAke2RlZmluZXMuc2V0S2V5cy5sZW5ndGh9KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcXGBTZXQgYXQgaW5kZXggXFwke19faW5kZXhfX30gZG9lc24ndCBoYXZlIGV4YWN0bHkgJHtkZWZpbmVzLnNldEtleXMubGVuZ3RofSBzZXQgYXJndW1lbnQke1xuICAgICAgICAgIGRlZmluZXMuc2V0S2V5cy5sZW5ndGggPiAxID8gXCJzXCIgOiBcIlwiXG4gICAgICAgIH0hXFxgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAuLi5fX3NldF9fKTtcbiAgICAgIHJldHVybiBfX3NldF9fO1xuICAgIH0pO1xuXG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jcmVxdWlyZUlubmVyTWFwKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xuXG4gICAgLy8gbGV2ZWwgMjogaW5uZXIgbWFwIHRvIHNldFxuICAgIF9fYXJyYXlfXy5mb3JFYWNoKF9fc2V0X18gPT4ge1xuICAgICAgY29uc3QgX19zZXRLZXlIYXNoX18gPSB0aGlzLiNzZXRIYXNoZXIuZ2V0SGFzaCguLi5fX3NldF9fKTtcbiAgICAgIGlmICghX19pbm5lck1hcF9fLmhhcyhfX3NldEtleUhhc2hfXykpIHtcbiAgICAgICAgX19pbm5lck1hcF9fLnNldChfX3NldEtleUhhc2hfXywgX19zZXRfXyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImNsZWFyU2V0c1wiLCAyKX1cbiAgY2xlYXJTZXRzKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jZ2V0RXhpc3RpbmdJbm5lck1hcCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybjtcblxuICAgIF9faW5uZXJNYXBfXy5jbGVhcigpO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZGVsZXRlXCIsIDIpfVxuICBkZWxldGUoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSwgJHtkZWZpbmVzLnNldEtleXN9KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0sICR7ZGVmaW5lcy5zZXRLZXlzfSk7XG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jZ2V0RXhpc3RpbmdJbm5lck1hcCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGxldmVsIDI6IGlubmVyIG1hcCB0byBzZXRcbiAgICBjb25zdCBfX3NldEtleUhhc2hfXyA9IHRoaXMuI3NldEhhc2hlci5nZXRIYXNoSWZFeGlzdHMoJHtkZWZpbmVzLnNldEtleXN9KTtcbiAgICBpZiAoIV9fc2V0S2V5SGFzaF9fKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IF9fcmV0dXJuVmFsdWVfXyA9IF9faW5uZXJNYXBfXy5kZWxldGUoX19zZXRLZXlIYXNoX18pO1xuXG4gICAgaWYgKF9faW5uZXJNYXBfXy5zaXplID09PSAwKSB7XG4gICAgICB0aGlzLmRlbGV0ZVNldHMoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIF9fcmV0dXJuVmFsdWVfXztcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImRlbGV0ZVNldHNcIiwgMil9XG4gIGRlbGV0ZVNldHMoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSkge1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KTtcblxuICAgIGNvbnN0IF9fbWFwS2V5X18gPSB0aGlzLiNtYXBLZXlDb21wb3Nlci5nZXRLZXlJZkV4aXN0cyhcbiAgICAgIFske2RlZmluZXMud2Vha01hcEtleXMuam9pbihcIiwgXCIpfV0sIFske2RlZmluZXMuc3Ryb25nTWFwS2V5cy5qb2luKFwiLCBcIil9XVxuICAgICk7XG5cbiAgICByZXR1cm4gX19tYXBLZXlfXyA/IHRoaXMuI3Jvb3QuZGVsZXRlKF9fbWFwS2V5X18pIDogZmFsc2U7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJmb3JFYWNoTWFwU2V0XCIsIDIpfVxuICBmb3JFYWNoU2V0KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0sIF9fY2FsbGJhY2tfXywgX190aGlzQXJnX18pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jZ2V0RXhpc3RpbmdJbm5lck1hcCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybjtcblxuICAgIF9faW5uZXJNYXBfXy5mb3JFYWNoKFxuICAgICAgX19rZXlTZXRfXyA9PiBfX2NhbGxiYWNrX18uYXBwbHkoX190aGlzQXJnX18sIFske2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAuLi5fX2tleVNldF9fLCB0aGlzXSlcbiAgICApO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiZm9yRWFjaENhbGxiYWNrU2V0XCIsIDIpfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImdldFNpemVPZlNldFwiLCAyKX1cbiAgZ2V0U2l6ZU9mU2V0KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jZ2V0RXhpc3RpbmdJbm5lck1hcCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybiAwO1xuXG4gICAgcmV0dXJuIF9faW5uZXJNYXBfXy5zaXplO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaGFzXCIsIDIpfVxuICBoYXMoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSwgJHtkZWZpbmVzLnNldEtleXN9KSB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0sICR7ZGVmaW5lcy5zZXRLZXlzfSk7XG4gICAgY29uc3QgX19pbm5lck1hcF9fID0gdGhpcy4jZ2V0RXhpc3RpbmdJbm5lck1hcCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KTtcbiAgICBpZiAoIV9faW5uZXJNYXBfXylcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGxldmVsIDI6IGlubmVyIG1hcCB0byBzZXRcbiAgICBjb25zdCBfX3NldEtleUhhc2hfXyA9IHRoaXMuI3NldEhhc2hlci5nZXRIYXNoSWZFeGlzdHMoJHtkZWZpbmVzLnNldEtleXN9KTtcbiAgICByZXR1cm4gX19zZXRLZXlIYXNoX18gPyBfX2lubmVyTWFwX18uaGFzKF9fc2V0S2V5SGFzaF9fKSA6IGZhbHNlO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaGFzU2V0XCIsIDIpfVxuICBoYXNTZXRzKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG4gICAgcmV0dXJuIEJvb2xlYW4odGhpcy4jZ2V0RXhpc3RpbmdJbm5lck1hcCgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KSk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5UHVibGljXCIsIDIpfVxuICBpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0sICR7ZGVmaW5lcy5zZXRLZXlzfSkge1xuICAgIHJldHVybiB0aGlzLiNpc1ZhbGlkS2V5KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0sICR7ZGVmaW5lcy5zZXRLZXlzfSk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJ2YWx1ZXNTZXRcIiwgMil9XG4gICogdmFsdWVzU2V0KCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSk7XG5cbiAgICBjb25zdCBfX2lubmVyTWFwX18gPSB0aGlzLiNnZXRFeGlzdGluZ0lubmVyTWFwKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pO1xuICAgIGlmICghX19pbm5lck1hcF9fKVxuICAgICAgcmV0dXJuO1xuXG4gICAgY29uc3QgX19vdXRlckl0ZXJfXyA9IF9faW5uZXJNYXBfXy52YWx1ZXMoKTtcbiAgICBmb3IgKGxldCBfX3ZhbHVlX18gb2YgX19vdXRlckl0ZXJfXylcbiAgICAgIHlpZWxkIFske2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAuLi5fX3ZhbHVlX19dO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwicmVxdWlyZUlubmVyQ29sbGVjdGlvblByaXZhdGVcIiwgMil9XG4gICNyZXF1aXJlSW5uZXJNYXAoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSkge1xuICAgIGNvbnN0IF9fbWFwS2V5X18gPSB0aGlzLiNtYXBLZXlDb21wb3Nlci5nZXRLZXkoXG4gICAgICBbJHtkZWZpbmVzLndlYWtNYXBLZXlzLmpvaW4oXCIsIFwiKX1dLCBbJHtkZWZpbmVzLnN0cm9uZ01hcEtleXMuam9pbihcIiwgXCIpfV1cbiAgICApO1xuICAgIGlmICghdGhpcy4jcm9vdC5oYXMoX19tYXBLZXlfXykpIHtcbiAgICAgIHRoaXMuI3Jvb3Quc2V0KF9fbWFwS2V5X18sIG5ldyBNYXApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy4jcm9vdC5nZXQoX19tYXBLZXlfXyk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJnZXRFeGlzdGluZ0lubmVyQ29sbGVjdGlvblByaXZhdGVcIiwgMil9XG4gICNnZXRFeGlzdGluZ0lubmVyTWFwKCR7ZGVmaW5lcy5tYXBLZXlzLmpvaW4oXCIsIFwiKX0pIHtcbiAgICBjb25zdCBfX21hcEtleV9fID0gdGhpcy4jbWFwS2V5Q29tcG9zZXIuZ2V0S2V5SWZFeGlzdHMoXG4gICAgICBbJHtkZWZpbmVzLndlYWtNYXBLZXlzLmpvaW4oXCIsIFwiKX1dLCBbJHtkZWZpbmVzLnN0cm9uZ01hcEtleXMuam9pbihcIiwgXCIpfV1cbiAgICApO1xuXG4gICAgcmV0dXJuIF9fbWFwS2V5X18gPyB0aGlzLiNyb290LmdldChfX21hcEtleV9fKSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcInJlcXVpcmVWYWxpZEtleVwiLCAyKX1cbiAgI3JlcXVpcmVWYWxpZEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAke2RlZmluZXMuc2V0S2V5c30pIHtcbiAgICBpZiAoIXRoaXMuI2lzVmFsaWRLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSwgJHtkZWZpbmVzLnNldEtleXN9KSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBvcmRlcmVkIGtleSBzZXQgaXMgbm90IHZhbGlkIVwiKTtcbiAgfVxuXG4ke2RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRLZXlQcml2YXRlXCIsIDIpfVxuICAjaXNWYWxpZEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9LCAke2RlZmluZXMuc2V0S2V5c30pIHtcbiAgICByZXR1cm4gdGhpcy4jaXNWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KSAmJiB0aGlzLiNpc1ZhbGlkU2V0S2V5KCR7ZGVmaW5lcy5zZXRLZXlzfSk7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJyZXF1aXJlVmFsaWRNYXBLZXlcIiwgMil9XG4gICNyZXF1aXJlVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSkge1xuICAgIGlmICghdGhpcy4jaXNWYWxpZE1hcEtleSgke2RlZmluZXMubWFwS2V5cy5qb2luKFwiLCBcIil9KSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBvcmRlcmVkIG1hcCBrZXkgc2V0IGlzIG5vdCB2YWxpZCFcIik7XG4gIH1cblxuJHtkb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkTWFwS2V5UHJpdmF0ZVwiLCAyKX1cbiAgI2lzVmFsaWRNYXBLZXkoJHtkZWZpbmVzLm1hcEtleXMuam9pbihcIiwgXCIpfSkge1xuICAgIGlmICghdGhpcy4jbWFwS2V5Q29tcG9zZXIuaXNWYWxpZEZvcktleShbJHtkZWZpbmVzLndlYWtNYXBLZXlzLmpvaW4oXCIsIFwiKX1dLCBbJHtkZWZpbmVzLnN0cm9uZ01hcEtleXMuam9pbihcIiwgXCIpfV0pKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICR7ZGVmaW5lcy52YWxpZGF0ZU1hcEFyZ3VtZW50cyB8fCBcIlwifVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiR7ZG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZFNldEtleVByaXZhdGVcIiwgMil9XG4gICNpc1ZhbGlkU2V0S2V5KCR7ZGVmaW5lcy5zZXRLZXlzfSkge1xuICAgIHZvaWQoJHtkZWZpbmVzLnNldEtleXN9KTtcblxuICAgICR7ZGVmaW5lcy52YWxpZGF0ZVNldEFyZ3VtZW50cyB8fCBcIlwifVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgW1N5bWJvbC50b1N0cmluZ1RhZ10gPSBcIiR7ZGVmaW5lcy5jbGFzc05hbWV9XCI7XG59XG5cbk9iamVjdC5mcmVlemUoJHtkZWZpbmVzLmNsYXNzTmFtZX0pO1xuT2JqZWN0LmZyZWV6ZSgke2RlZmluZXMuY2xhc3NOYW1lfS5wcm90b3R5cGUpO1xuYDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgcHJlcHJvY2VzcztcbiJdfQ==