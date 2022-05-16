/**
 * @param {Map}            defines The preprocessor macros.
 * @param {JSDocGenerator} docs    The primary documentation generator.
 * @returns {string}               The generated source code.
 */
const preprocess = function preprocess(defines, docs) {
    const tsAllTypes = [...defines.tsMapTypes, ...defines.tsSetTypes].join(", ");
    const tsAllKeys = [...defines.tsMapKeys, ...defines.tsSetKeys].join(", ");
    const tsSetTypes = defines.tsSetTypes.join(", ");
    const tsMapKeys = defines.tsMapKeys.join(", ");
    const tsSetKeys = defines.tsSetKeys.join(", ");
    const allKeys = defines.mapArgList + ", " + defines.setArgList;
    const mapKeys = defines.mapArgList;
    const setKeys = defines.setArgList;
    return `
${defines.importLines}
import KeyHasher from "./keys/Hasher.mjs";
import WeakKeyComposer from "./keys/Composite.mjs";

/** @typedef {Map<hash, *[]>} __${defines.className}_InnerMap__ */

class ${defines.className}${defines.tsGenericFull} {
  /** @typedef {string} hash */

  // eslint-disable-next-line jsdoc/require-property
  /** @typedef {object} WeakKey */

  /**
   * @type {WeakMap<WeakKey, __${defines.className}_InnerMap__>}
   * @constant
   * This is two levels. The first level is the WeakKey.
   * The second level is the strong set.
   */
  #root: WeakMap<object, Map<string, [${tsSetTypes}]>> = new WeakMap();

  /** @type {WeakKeyComposer} @constant */
  #mapKeyComposer = new WeakKeyComposer(
    ${JSON.stringify(defines.weakMapKeys)}, ${JSON.stringify(defines.strongMapKeys)}
  );

  /** @type {KeyHasher} @constant */
  #setHasher = new KeyHasher();

  constructor(iterable? : [${tsAllTypes}][])
  {
    if (iterable) {
      for (let [${allKeys}] of iterable) {
        this.add(${allKeys});
      }
    }
  }

${docs.buildBlock("add", 2)}
  add(${tsAllKeys}) : this
  {
    this.#requireValidKey(${allKeys});
    const __innerMap__ = this.#requireInnerMap(${mapKeys});

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHash(${setKeys});
    if (!__innerMap__.has(__setKeyHash__)) {
      __innerMap__.set(__setKeyHash__, [${setKeys}]);
    }

    return this;
  }

${docs.buildBlock("addSets", 2)}
  addSets(${tsMapKeys}, __sets__: [${tsSetTypes}][]) : this
  {
    this.#requireValidMapKey(${mapKeys});

    if (__sets__.length === 0)
      return this;
    __sets__.forEach(([${setKeys}]) => {
      this.#requireValidKey(${allKeys});
    });

    const __innerMap__ = this.#requireInnerMap(${mapKeys});

    // level 2: inner map to set
    __sets__.forEach(([${setKeys}]) => {
      const __setKeyHash__ = this.#setHasher.getHash(${setKeys});
      if (!__innerMap__.has(__setKeyHash__)) {
        __innerMap__.set(__setKeyHash__, [${setKeys}]);
      }
    });

    return this;
  }

${docs.buildBlock("delete", 2)}
  delete(${tsAllKeys}) : boolean
  {
    this.#requireValidKey(${allKeys});
    const __innerMap__ = this.#getExistingInnerMap(${mapKeys});
    if (!__innerMap__)
      return false;

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHashIfExists(${setKeys});
    if (!__setKeyHash__)
      return false;
    const __returnValue__ = __innerMap__.delete(__setKeyHash__);

    if (__innerMap__.size === 0) {
      this.deleteSets(${mapKeys});
    }

    return __returnValue__;
  }

${docs.buildBlock("deleteSets", 2)}
  deleteSets(${tsMapKeys}) : boolean
  {
    this.#requireValidMapKey(${mapKeys});

    const __mapKey__ = this.#mapKeyComposer.getKeyIfExists(
      [${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]
    );

    return __mapKey__ ? this.#root.delete(__mapKey__) : false;
  }

${docs.buildBlock("forEachMapSet", 2)}
  forEachSet(
    ${tsMapKeys},
    __callback__: (
      ${defines.tsMapTypes.join(",\n      ")},
      ${defines.tsSetTypes.join(",\n      ")},
      __collection__: ${defines.className}<${tsAllTypes}>
    ) => void,
    __thisArg__: unknown
  ) : void
  {
    this.#requireValidMapKey(${mapKeys});
    const __innerMap__ = this.#getExistingInnerMap(${mapKeys});
    if (!__innerMap__)
      return;

    __innerMap__.forEach(
      ([${setKeys}]) => __callback__.apply(__thisArg__, [${allKeys}, this])
    );
  }

${docs.buildBlock("forEachCallbackSet", 2)}

${docs.buildBlock("getSizeOfSet", 2)}
  getSizeOfSet(${tsMapKeys}) : number
  {
    this.#requireValidMapKey(${mapKeys});
    const __innerMap__ = this.#getExistingInnerMap(${mapKeys});
    if (!__innerMap__)
      return 0;

    return __innerMap__.size;
  }

${docs.buildBlock("has", 2)}
  has(${tsAllKeys}) : boolean
  {
    this.#requireValidKey(${allKeys});
    const __innerMap__ = this.#getExistingInnerMap(${mapKeys});
    if (!__innerMap__)
      return false;

    // level 2: inner map to set
    const __setKeyHash__ = this.#setHasher.getHashIfExists(${setKeys});
    return __setKeyHash__ ? __innerMap__.has(__setKeyHash__) : false;
  }

${docs.buildBlock("hasSet", 2)}
  hasSets(${tsMapKeys}) : boolean
  {
    this.#requireValidMapKey(${mapKeys});
    return Boolean(this.#getExistingInnerMap(${mapKeys}));
  }

${docs.buildBlock("isValidKeyPublic", 2)}
  isValidKey(${tsAllKeys}) : boolean
  {
    return this.#isValidKey(${allKeys});
  }

${docs.buildBlock("valuesSet", 2)}
  * valuesSet(${tsMapKeys}) : Iterator<[${tsAllTypes}]>
  {
    this.#requireValidMapKey(${mapKeys});

    const __innerMap__ = this.#getExistingInnerMap(${mapKeys});
    if (!__innerMap__)
      return;

    const __outerIter__ = __innerMap__.values();
    for (let [${setKeys}] of __outerIter__)
      yield [${allKeys}];
  }

${docs.buildBlock("requireInnerCollectionPrivate", 2)}
  #requireInnerMap(${tsMapKeys}) : Map<string, [${tsSetTypes}]>
  {
    const __mapKey__ = this.#mapKeyComposer.getKey(
      [${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]
    );
    if (!this.#root.has(__mapKey__)) {
      this.#root.set(__mapKey__, new Map);
    }
    return this.#root.get(__mapKey__);
  }

${docs.buildBlock("getExistingInnerCollectionPrivate", 2)}
  #getExistingInnerMap(${tsMapKeys}) : Map<string, [${tsSetTypes}]> | undefined
  {
    const __mapKey__ = this.#mapKeyComposer.getKeyIfExists(
      [${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]
    );

    return __mapKey__ ? this.#root.get(__mapKey__) : undefined;
  }

${docs.buildBlock("requireValidKey", 2)}
  #requireValidKey(${tsAllKeys}) : void
  {
    if (!this.#isValidKey(${allKeys}))
      throw new Error("The ordered key set is not valid!");
  }

${docs.buildBlock("isValidKeyPrivate", 2)}
  #isValidKey(${tsAllKeys}) : boolean
  {
    return this.#isValidMapKey(${mapKeys}) && this.#isValidSetKey(${setKeys});
  }

${docs.buildBlock("requireValidMapKey", 2)}
  #requireValidMapKey(${tsMapKeys}) : void
  {
    if (!this.#isValidMapKey(${mapKeys}))
      throw new Error("The ordered map key set is not valid!");
  }

${docs.buildBlock("isValidMapKeyPrivate", 2)}
  #isValidMapKey(${tsMapKeys}) : boolean
  {
    if (!this.#mapKeyComposer.isValidForKey([${defines.weakMapKeys.join(", ")}], [${defines.strongMapKeys.join(", ")}]))
      return false;
    ${defines.validateMapArguments || ""}
    return true;
  }

${docs.buildBlock("isValidSetKeyPrivate", 2)}
  #isValidSetKey(${tsSetKeys}) : boolean
  {
    ${defines.setKeys.map(key => `void(${key})\n`).join("\n    ")}

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
//# sourceMappingURL=MapOfStrongSets.in.mjs.map