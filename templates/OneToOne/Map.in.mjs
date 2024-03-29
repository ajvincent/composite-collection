import { RequiredMap } from "../../source/utilities/RequiredMap.mjs";
/**
 * Serialize keys.
 *
 * @param {string[]} keys The keys.
 * @returns {string} The keys serialized.
 */
function buildArgNameList(keys) {
    return keys.join(", ");
}
/**
 * Build an arguments list based on a suffix.
 *
 * @param {string[]}   args        The list of argument names.
 * @param {string}     suffix      The suffix to append.
 * @param {string}     weakKeyName The argument to exclude appending a suffix to.
 * @returns {string[]}             The resulting argument list.
 */
function buildNumberedArgs(args, suffix, weakKeyName) {
    return args.map(arg => arg + ((arg === weakKeyName) ? "" : suffix));
}
/**
 * Build an arguments list based on a suffix and a map of types.
 *
 * @param {string[]} args      -   The list of argument names.
 * @param {string}   suffix    -   The suffix to append.
 * @param {string[]} tsMapKeys -   The map keys.
 * @returns {string}               The resulting argument types.
 */
function buildNumberedTypes(args, suffix, tsMapKeys) {
    const map = new RequiredMap(tsMapKeys.map(argAndType => {
        const [key, type] = argAndType.split(": ");
        return [key, type];
    }));
    const keys = args.map(arg => arg + suffix + ": " + map.getRequired(arg));
    return keys.join(", ");
}
/**
 * @param {Map}            defines  The preprocessor macros.
 * @param {JSDocGenerator} soloDocs Provides documentation for single key-value methods.
 * @param {JSDocGenerator} duoDocs  Provides documentation for .bindOneToOne().
 * @returns {string}                The generated source code.
 */
const preprocess = function (defines, soloDocs, duoDocs) {
    const { bindArgList, baseArgList, weakKeyName } = defines;
    if (typeof weakKeyName !== "string")
        throw new Error("assertion: weakKeyName must be a string!");
    const bindOneToOneArgList1 = buildNumberedArgs(bindArgList, "_1", weakKeyName), bindOneToOneArgList2 = buildNumberedArgs(bindArgList, "_2", weakKeyName);
    const bindOneToOneTypeList1 = buildNumberedTypes(bindArgList, "_1", defines.tsMapKeys);
    const bindOneToOneTypeList2 = buildNumberedTypes(bindArgList, "_2", defines.tsMapKeys);
    const baseMapArgList1 = buildNumberedArgs(baseArgList, "_1", weakKeyName), baseMapArgList2 = buildNumberedArgs(baseArgList, "_2", weakKeyName);
    const baseMapArgs = buildArgNameList(baseArgList), baseMapArgs1 = buildArgNameList(baseMapArgList1), baseMapArgs2 = buildArgNameList(baseMapArgList2);
    const bindMapArgs = buildArgNameList(bindArgList);
    const bindMapArgsWithTypes = buildNumberedTypes(bindArgList, "", defines.tsMapKeys);
    const tsMapTypes = defines.tsMapTypes.join(", ").replace(defines.tsOneToOneKeyType, "object");
    const baseClass = defines.baseClassName + "<" + tsMapTypes + ", __V__>";
    const readonlyBaseTypes = defines.tsMapTypes.filter(t => t !== defines.tsOneToOneKeyType);
    const readonlyBase = defines.className + "<" + readonlyBaseTypes.join(", ") + ", __V__>";
    let classDefinition = "";
    if (defines.wrapBaseClass) {
        classDefinition = `
${defines.importLines}
class ${defines.className}${defines.tsGenericFull}
{
  /** @constant */
  #baseMap = new ${baseClass}();

  /** @type {WeakMap<object, object>} @constant */
  #weakValueToInternalKeyMap: WeakMap<__V__, object> = new WeakMap;

${duoDocs.buildBlock("bindOneToOne", 2)}
  bindOneToOne(${buildArgNameList([
            bindOneToOneTypeList1,
            "value_1: __V__",
            bindOneToOneTypeList2,
            "value_2: __V__"
        ])}) : void
  {${bindArgList.length ? `
    this.#requireValidKey("(${bindOneToOneArgList1.join(", ")})", ${bindOneToOneArgList1.join(", ")});
    this.#requireValidValue("value_1", value_1);
    this.#requireValidKey("(${bindOneToOneArgList2.join(", ")})", ${bindOneToOneArgList2.join(", ")});
    this.#requireValidValue("value_2", value_2);
` : `
    this.#requireValidValue("value_1", value_1);
    this.#requireValidValue("value_2", value_2);
`}
    let ${weakKeyName} = this.#weakValueToInternalKeyMap.get(value_1);
    const __otherWeakKey__ = this.#weakValueToInternalKeyMap.get(value_2);
    if (!${weakKeyName}) {
      ${weakKeyName} = __otherWeakKey__ || {};
    }
    else if (__otherWeakKey__ && (__otherWeakKey__ !== ${weakKeyName})) {
      throw new Error(${
        /*
        If we get here, we have a potentially unresolvable conflict.
        
        In the simplest case,
        
        map.bindOneToOne(red, "one", green: "two");
        map.bindOneToOne(blue, "two", yellow, "one");
        map.bindOneToOne(red, "one", blue, "two");
        
        This last can't be allowed because red is already bound to green, and blue is
        already bound to yellow.
        
        In the value plus namespace key case,
        
        map.bindOneToOne(red, "red", green, "green");
        map.bindOneToOne(blue, "blue", yellow, "yellow");
        map.bindOneToOne(red, "red", blue, "blue");
        
        This doesn't actually have a conflict, but we disallow it anyway for now.  The
        reason is proving there isn't a conflict without side effects is Hard.
        
        We'd have to prove several facts when evaluating the third line:
        
        1. map.has(red, "blue") === false
        2. map.has(red, "yellow") === false
        3. map.has(blue, "red") === false
        4. map.has(blue, "green") === false
        
        The "yellow" and "green" keys don't appear on the third line.  In other words
        we'd have to search for entries matching either of the private weak keys for
        all the key combinations belonging to them.
        
        With weak maps, such enumerations are generally impossible by design.
        
        Now, the one-to-one map could theoretically track this via exports/keys/Hasher.mjs:
        // @type {WeakMap<privateWeakKey, Set<hash>>} @constant
        // @type {WeakMapOfStrongSets<privateWeakKey, hash>} @constant
        #weakKeyToUserKeyHashes = new WeakMap;
        
        // @constant
        #userKeysHasher = new KeyHasher
        
        This means adding a key hasher to this class for the user's keys... and on top
        of that another composite collection - either the one this project provides, or
        a hand-written one.
        
        All of this just to make sure there isn't a conflict.  It's a lot of overhead,
        complicating this implementation immensely.
        
        Finally, the user could avoid this conflict simply by reordering the
        invocations, preferring existing entries over new ones:
        
        map.bindOneToOne(red, "red", green, "green");
        map.bindOneToOne(red, "red", blue, "blue");
        map.bindOneToOne(blue, "blue", yellow, "yellow");
        
        If there's a compelling use case that crashes into this problem, we can fix
        this by defining an option in the configuration's .configureOneToOne() options
        argument, to generate the additional code when the option is present.  That's
        the only way to convince me it's worth it, and that option must not be on by
        default.  Preserving this comment - or altering it slightly to emphasize the
        option - would also be required.
        
        -- Alex Vincent, Jan. 4, 2022
        */
        `"value_1 and value_2 are already in different one-to-one mappings!"`});
    }

    const __hasKeySet1__  = this.#baseMap.has(${baseMapArgs1});
    const __hasKeySet2__  = this.#baseMap.has(${baseMapArgs2});

    if (__hasKeySet1__ && (this.#baseMap.get(${baseMapArgs1}) !== value_1))
      throw new Error("value_1 mismatch!");
    if (__hasKeySet2__ && (this.#baseMap.get(${baseMapArgs2}) !== value_2))
      throw new Error("value_2 mismatch!");

    this.#weakValueToInternalKeyMap.set(value_1, ${weakKeyName});
    this.#weakValueToInternalKeyMap.set(value_2, ${weakKeyName});

    if (!__hasKeySet1__)
      this.#baseMap.set(${baseMapArgs1}, value_1);

    if (!__hasKeySet2__)
      this.#baseMap.set(${baseMapArgs2}, value_2);
  }

${soloDocs.buildBlock("delete", 2)}
  delete(value: __V__, ${bindMapArgsWithTypes}) : boolean
  {
    const ${weakKeyName} = this.#weakValueToInternalKeyMap.get(value);
    if (!${weakKeyName})
      return false;

    const __target__ = this.#baseMap.get(${baseMapArgs});
    if (!__target__)
      return false;

    const __returnValue__ = this.#baseMap.delete(${baseMapArgs});
    if (__returnValue__)
      this.#weakValueToInternalKeyMap.delete(__target__);
    return __returnValue__;
  }

${soloDocs.buildBlock("get", 2)}
  get(value: __V__, ${bindMapArgsWithTypes}) : __V__ | undefined
  {
    const ${weakKeyName} = this.#weakValueToInternalKeyMap.get(value);
    return ${weakKeyName} ? this.#baseMap.get(${baseMapArgs}) : undefined;
  }

${soloDocs.buildBlock("has", 2)}
  has(value: __V__, ${bindMapArgsWithTypes}) : boolean
  {
    const ${weakKeyName} = this.#weakValueToInternalKeyMap.get(value);
    return ${weakKeyName} ? this.#baseMap.has(${baseMapArgs}) : false;
  }

${soloDocs.buildBlock("hasIdentity", 2)}
  hasIdentity(value: __V__, ${bindMapArgsWithTypes}, allowNotDefined: boolean) : boolean
  {
    const ${weakKeyName} = this.#weakValueToInternalKeyMap.get(value);
    if (!${weakKeyName}) {
      return Boolean(allowNotDefined);
    }
    return this.#baseMap.get(${baseMapArgs}) === value;
  }

${soloDocs.buildBlock("isValidKey", 2)}
  isValidKey(${bindMapArgsWithTypes}) : boolean
  {
    return this.#isValidKey(${bindMapArgs});
  }

  #isValidKey(${bindMapArgsWithTypes}) : boolean
  {
    const ${weakKeyName} = {};
    return this.#baseMap.isValidKey(${baseMapArgs});
  }

${soloDocs.buildBlock("isValidValue", 2)}
  isValidValue(value: __V__) : boolean
  {
    return ${defines.baseClassValidatesValue ?
            "(Object(value) === value) && this.#baseMap.isValidValue(value)" :
            "Object(value) === value"};
  }

${bindArgList.length ? `
  #requireValidKey(__argNames__: string, ${bindMapArgsWithTypes}) : void
  {
    if (!this.#isValidKey(${bindMapArgs}))
      throw new Error("Invalid key tuple: " + __argNames__);
  }
` : ``}
  #requireValidValue(argName: string, value: __V__) : void
  {
    if (!this.isValidValue(value))
      throw new Error(argName + " is not a valid value!");
  }

  [Symbol.toStringTag] = "${defines.className}";
}

Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);

export type Readonly${defines.className}${defines.tsGenericFull} =
  Pick<
    ${readonlyBase},
    "get" | "has" | "hasIdentity" | "isValidKey" | "isValidValue"
  >
`;
    }
    else {
        classDefinition = `
${defines.importLines}
class ${defines.className}${defines.tsGenericFull} extends ${defines.baseClassName}<${defines.tsValueType}, ${defines.tsValueType}>
{
${duoDocs.buildBlock("bindOneToOneSimple", 2)}
  bindOneToOne(value_1: ${defines.tsValueType}, value_2: ${defines.tsValueType}) : void
  {${defines.baseClassValidatesKey ? `
    if (!this.isValidKey(value_1))
      throw new Error("value_1 mismatch!");
    if (!this.isValidKey(value_2))
      throw new Error("value_2 mismatch!");

` : ""}
    const __hasValue1__  = this.has(value_1);
    const __hasValue2__  = this.has(value_2);

    if (__hasValue1__ && (this.get(value_2) !== value_1))
      throw new Error("value_1 mismatch!");
    if (__hasValue2__ && (this.get(value_1) !== value_2))
      throw new Error("value_2 mismatch!");
    if (!this.isValidValue(value_1))
      throw new Error("value_1 is not a valid value!");
    if (!this.isValidValue(value_2))
      throw new Error("value_2 is not a valid value!");

    if (!__hasValue1__)
      super.set(value_1, value_2);
    if (!__hasValue2__)
      super.set(value_2, value_1);
  }

${soloDocs.buildBlock("hasIdentity", 2)}
  hasIdentity(value: __V__, allowNotDefined: boolean) : boolean
  {
    if (!this.has(value)) {
      return Boolean(allowNotDefined);
    }
    // Beyond this point we should return true.
    const __other__ = this.get(value) as __V__;
    return this.get(__other__) === value;
  }

  /**
   * Determine if a value is valid.
   *
   * @param {*} value The value.
   * @returns {boolean} True if the value is valid.${defines.baseClassName !== "WeakMap" ? `
   * @see the base map class for further constraints.` : ""}
   * @public
   */
  isValidValue(value: ${defines.tsValueType}) : boolean
  {
    return ${defines.baseClassValidatesValue ?
            "(Object(value) === value) && super.isValidValue(value)" :
            "Object(value) === value"};
  }

  set(key: ${defines.tsValueType}, value: ${defines.tsValueType}) : never
  {
    void(key);
    void(value);
    throw new Error("Not implemented, use .bindOneToOne(value_1, value_2);");
  }

  [Symbol.toStringTag] = "${defines.className}";
}

Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);

export type Readonly${defines.className}${defines.tsGenericFull} =
  Pick<
    ${defines.className}<${defines.tsValueType}>,
    "hasIdentity" | "isValidValue"
  >${defines.className === "Map" ? `& Readonly${defines.baseClassName}<${defines.tsValueType}, ${defines.tsValueType}>` : ``}
`;
    }
    return classDefinition;
};
export default preprocess;
//# sourceMappingURL=Map.in.mjs.map