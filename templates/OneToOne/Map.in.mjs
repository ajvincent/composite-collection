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
 * @param {Map}            defines  The preprocessor macros.
 * @param {JSDocGenerator} soloDocs Provides documentation for single key-value methods.
 * @param {JSDocGenerator} duoDocs  Provides documentation for .bindOneToOne().
 * @returns {string}                The generated source code.
 */
const preprocess = function (defines, soloDocs, duoDocs) {
    const bindArgList = defines.bindArgList;
    if (!Array.isArray(bindArgList))
        throw new Error("assertion: bindArgList must be an array!");
    const baseArgList = defines.baseArgList;
    if (!Array.isArray(baseArgList))
        throw new Error("assertion: baseArgList must be an array!");
    const weakKeyName = defines.weakKeyName;
    if (typeof weakKeyName !== "string")
        throw new Error("assertion: weakKeyName must be a string!");
    const bindOneToOneArgList1 = buildNumberedArgs(bindArgList, "_1", weakKeyName), bindOneToOneArgList2 = buildNumberedArgs(bindArgList, "_2", weakKeyName);
    const baseMapArgList1 = buildNumberedArgs(baseArgList, "_1", weakKeyName), baseMapArgList2 = buildNumberedArgs(baseArgList, "_2", weakKeyName);
    const baseMapArgs = buildArgNameList(baseArgList), baseMapArgs1 = buildArgNameList(baseMapArgList1), baseMapArgs2 = buildArgNameList(baseMapArgList2);
    const bindMapArgsWithValue = buildArgNameList(["value", ...bindArgList]);
    const bindMapArgs = buildArgNameList(bindArgList);
    let classDefinition = "";
    if (defines.wrapBaseClass) {
        classDefinition = `
class ${defines.className} {
  /** @constant */
  #baseMap = new ${defines.baseClassName};

  /** @type {WeakMap<object, object>} @constant */
  #weakValueToInternalKeyMap = new WeakMap;

${duoDocs.buildBlock("bindOneToOne", 2)}
  bindOneToOne(${buildArgNameList([
            ...bindOneToOneArgList1,
            "value_1",
            ...bindOneToOneArgList2,
            "value_2"
        ])}) {${bindArgList.length ? `
    this.#requireValidKey("(${bindOneToOneArgList1})", ${bindOneToOneArgList1});
    this.#requireValidValue("value_1", value_1);
    this.#requireValidKey("(${bindOneToOneArgList2})", ${bindOneToOneArgList2});
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
        
        map.bindOneToOne(red, green);
        map.bindOneToOne(blue, yellow);
        map.bindOneToOne(red, blue);
        
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
  delete(${bindMapArgsWithValue}) {
    const ${weakKeyName} = this.#weakValueToInternalKeyMap.has(value);
    if (!${weakKeyName})
      return false;

    if (!this.#baseMap.has(${baseMapArgs}))
      return false;

    const __target__ = this.#baseMap.get(${baseMapArgs});

    const __returnValue__ = this.#baseMap.delete(${baseMapArgs});
    if (__returnValue__)
      this.#weakValueToInternalKeyMap.delete(__target__);
    return __returnValue__;
  }

${soloDocs.buildBlock("get", 2)}
  get(${bindMapArgsWithValue}) {
    const ${weakKeyName} = this.#weakValueToInternalKeyMap.get(value);
    return ${weakKeyName} ? this.#baseMap.get(${baseMapArgs}) : undefined;
  }

${soloDocs.buildBlock("has", 2)}
  has(${bindMapArgsWithValue}) {
    const ${weakKeyName} = this.#weakValueToInternalKeyMap.has(value);
    return ${weakKeyName} ? this.#baseMap.has(${baseMapArgs}) : false;
  }

${soloDocs.buildBlock("isValidKey", 2)}
  isValidKey(${bindMapArgs}) {
    return this.#isValidKey(${bindMapArgs});
  }

  #isValidKey(${bindMapArgs}) {
    const ${weakKeyName} = {};
    return this.#baseMap.isValidKey(${baseMapArgs});
  }

${soloDocs.buildBlock("isValidValue", 2)}
  isValidValue(value) {
    return ${defines.baseClassValidatesValue ?
            "(Object(value) === value) && this.#baseMap.isValidValue(value)" :
            "Object(value) === value"};
  }

${bindArgList.length ? `
  #requireValidKey(__argNames__, ${bindMapArgs}) {
    if (!this.#isValidKey(${bindMapArgs}))
      throw new Error("Invalid key tuple: " + __argNames__);
  }
` : ``}
  #requireValidValue(argName, value) {
    if (!this.isValidValue(value))
      throw new Error(argName + " is not a valid value!");
  }

  [Symbol.toStringTag] = "${defines.className}";
}
    `;
    }
    else {
        classDefinition = `
class ${defines.className} extends ${defines.baseClassName} {
${duoDocs.buildBlock("bindOneToOneSimple", 2)}
  bindOneToOne(value_1, value_2) {${defines.baseClassValidatesKey ? `
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

  /**
   * Determine if a value is valid.
   *
   * @param {*} value The value.
   * @returns {boolean} True if the value is valid.${defines.baseClassName !== "WeakMap" ? `
   * @see the base map class for further constraints.` : ""}
   * @public
   */
  isValidValue(value) {
    return ${defines.baseClassValidatesValue ?
            "(Object(value) === value) && super.isValidValue(value)" :
            "Object(value) === value"};
  }

  set() {
    throw new Error("Not implemented, use .bindOneToOne(value_1, value_2);");
  }

  [Symbol.toStringTag] = "${defines.className}";
}
    `;
    }
    return classDefinition + `
Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`;
};
export default preprocess;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFwLmluLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1hcC5pbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7Ozs7O0dBS0c7QUFDSCxTQUFTLGdCQUFnQixDQUFDLElBQWM7SUFDdEMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLENBQUM7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsU0FBUyxpQkFBaUIsQ0FBQyxJQUFjLEVBQUUsTUFBYyxFQUFFLFdBQW1CO0lBQzVFLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDdEUsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLEdBQXFCLFVBQ25DLE9BQXdCLEVBQ3hCLFFBQXdCLEVBQ3hCLE9BQXVCO0lBR3ZCLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7SUFDeEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztJQUU5RCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO0lBQ3hDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztRQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7SUFFOUQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztJQUN4QyxJQUFJLE9BQU8sV0FBVyxLQUFLLFFBQVE7UUFDakMsTUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO0lBRTlELE1BQU0sb0JBQW9CLEdBQUcsaUJBQWlCLENBQUMsV0FB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QUN4RCxPQUFPLENBQUMsVUFBVSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQztvQ0FFekMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQzs7Ozs7O0NBTW5DLENBQUMsQ0FBQyxDQUFDLEVBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3FEQXdCRixPQUFPLENBQUMsYUFBYSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7c0RBQ2dCLENBQUMsQ0FBQyxDQUFDLEVBQ3REOzs7O2FBS0csT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFDL0Isd0RBQXdELENBQUMsQ0FBQztZQUMxRCx5QkFDSjs7Ozs7Ozs0QkFPd0IsT0FBTyxDQUFDLFNBQVM7O0tBRXhDLENBQUM7S0FDSDtJQUVELE9BQU8sZUFBZSxHQUFHO2dCQUNYLE9BQU8sQ0FBQyxTQUFTO2dCQUNqQixPQUFPLENBQUMsU0FBUztDQUNoQyxDQUFBO0FBQUEsQ0FBQyxDQUFBO0FBRUYsZUFBZSxVQUFVLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFJlYWRvbmx5RGVmaW5lcywgSlNEb2NHZW5lcmF0b3IsIFRlbXBsYXRlRnVuY3Rpb24gfSBmcm9tIFwiLi4vc2hhcmVkVHlwZXMubWpzXCI7XG5cbi8qKlxuICogU2VyaWFsaXplIGtleXMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmdbXX0ga2V5cyBUaGUga2V5cy5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBrZXlzIHNlcmlhbGl6ZWQuXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkQXJnTmFtZUxpc3Qoa2V5czogc3RyaW5nW10pOiBzdHJpbmcge1xuICByZXR1cm4ga2V5cy5qb2luKFwiLCBcIik7XG59XG5cbi8qKlxuICogQnVpbGQgYW4gYXJndW1lbnRzIGxpc3QgYmFzZWQgb24gYSBzdWZmaXguXG4gKlxuICogQHBhcmFtIHtzdHJpbmdbXX0gICBhcmdzICAgICAgICBUaGUgbGlzdCBvZiBhcmd1bWVudCBuYW1lcy5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgc3VmZml4ICAgICAgVGhlIHN1ZmZpeCB0byBhcHBlbmQuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgIHdlYWtLZXlOYW1lIFRoZSBhcmd1bWVudCB0byBleGNsdWRlIGFwcGVuZGluZyBhIHN1ZmZpeCB0by5cbiAqIEByZXR1cm5zIHtzdHJpbmdbXX0gICAgICAgICAgICAgVGhlIHJlc3VsdGluZyBhcmd1bWVudCBsaXN0LlxuICovXG5mdW5jdGlvbiBidWlsZE51bWJlcmVkQXJncyhhcmdzOiBzdHJpbmdbXSwgc3VmZml4OiBzdHJpbmcsIHdlYWtLZXlOYW1lOiBzdHJpbmcpIDogc3RyaW5nW10ge1xuICByZXR1cm4gYXJncy5tYXAoYXJnID0+IGFyZyArICgoYXJnID09PSB3ZWFrS2V5TmFtZSkgPyBcIlwiIDogc3VmZml4KSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtNYXB9ICAgICAgICAgICAgZGVmaW5lcyAgVGhlIHByZXByb2Nlc3NvciBtYWNyb3MuXG4gKiBAcGFyYW0ge0pTRG9jR2VuZXJhdG9yfSBzb2xvRG9jcyBQcm92aWRlcyBkb2N1bWVudGF0aW9uIGZvciBzaW5nbGUga2V5LXZhbHVlIG1ldGhvZHMuXG4gKiBAcGFyYW0ge0pTRG9jR2VuZXJhdG9yfSBkdW9Eb2NzICBQcm92aWRlcyBkb2N1bWVudGF0aW9uIGZvciAuYmluZE9uZVRvT25lKCkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSAgICAgICAgICAgICAgICBUaGUgZ2VuZXJhdGVkIHNvdXJjZSBjb2RlLlxuICovXG5jb25zdCBwcmVwcm9jZXNzOiBUZW1wbGF0ZUZ1bmN0aW9uID0gZnVuY3Rpb24oXG4gIGRlZmluZXM6IFJlYWRvbmx5RGVmaW5lcyxcbiAgc29sb0RvY3M6IEpTRG9jR2VuZXJhdG9yLFxuICBkdW9Eb2NzOiBKU0RvY0dlbmVyYXRvclxuKVxue1xuICBjb25zdCBiaW5kQXJnTGlzdCA9IGRlZmluZXMuYmluZEFyZ0xpc3Q7XG4gIGlmICghQXJyYXkuaXNBcnJheShiaW5kQXJnTGlzdCkpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiYXNzZXJ0aW9uOiBiaW5kQXJnTGlzdCBtdXN0IGJlIGFuIGFycmF5IVwiKTtcblxuICBjb25zdCBiYXNlQXJnTGlzdCA9IGRlZmluZXMuYmFzZUFyZ0xpc3Q7XG4gIGlmICghQXJyYXkuaXNBcnJheShiYXNlQXJnTGlzdCkpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiYXNzZXJ0aW9uOiBiYXNlQXJnTGlzdCBtdXN0IGJlIGFuIGFycmF5IVwiKTtcblxuICBjb25zdCB3ZWFrS2V5TmFtZSA9IGRlZmluZXMud2Vha0tleU5hbWU7XG4gIGlmICh0eXBlb2Ygd2Vha0tleU5hbWUgIT09IFwic3RyaW5nXCIpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiYXNzZXJ0aW9uOiB3ZWFrS2V5TmFtZSBtdXN0IGJlIGEgc3RyaW5nIVwiKTtcblxuICBjb25zdCBiaW5kT25lVG9PbmVBcmdMaXN0MSA9IGJ1aWxkTnVtYmVyZWRBcmdzKGJpbmRBcmdMaXN0LCBcIl8xXCIsIHdlYWtLZXlOYW1lKSxcbiAgICAgICAgYmluZE9uZVRvT25lQXJnTGlzdDIgPSBidWlsZE51bWJlcmVkQXJncyhiaW5kQXJnTGlzdCwgXCJfMlwiLCB3ZWFrS2V5TmFtZSk7XG5cbiAgY29uc3QgYmFzZU1hcEFyZ0xpc3QxID0gYnVpbGROdW1iZXJlZEFyZ3MoYmFzZUFyZ0xpc3QsIFwiXzFcIiwgd2Vha0tleU5hbWUpLFxuICAgICAgICBiYXNlTWFwQXJnTGlzdDIgPSBidWlsZE51bWJlcmVkQXJncyhiYXNlQXJnTGlzdCwgXCJfMlwiLCB3ZWFrS2V5TmFtZSk7XG5cbiAgY29uc3QgYmFzZU1hcEFyZ3MgPSBidWlsZEFyZ05hbWVMaXN0KGJhc2VBcmdMaXN0KSxcbiAgICAgICAgYmFzZU1hcEFyZ3MxID0gYnVpbGRBcmdOYW1lTGlzdChiYXNlTWFwQXJnTGlzdDEpLFxuICAgICAgICBiYXNlTWFwQXJnczIgPSBidWlsZEFyZ05hbWVMaXN0KGJhc2VNYXBBcmdMaXN0Mik7XG5cbiAgY29uc3QgYmluZE1hcEFyZ3NXaXRoVmFsdWUgPSBidWlsZEFyZ05hbWVMaXN0KFtcInZhbHVlXCIsLi4uYmluZEFyZ0xpc3RdKTtcbiAgY29uc3QgYmluZE1hcEFyZ3MgPSBidWlsZEFyZ05hbWVMaXN0KGJpbmRBcmdMaXN0KTtcblxuICBsZXQgY2xhc3NEZWZpbml0aW9uID0gXCJcIjtcbiAgaWYgKGRlZmluZXMud3JhcEJhc2VDbGFzcykge1xuICAgIGNsYXNzRGVmaW5pdGlvbiA9IGBcbmNsYXNzICR7ZGVmaW5lcy5jbGFzc05hbWV9IHtcbiAgLyoqIEBjb25zdGFudCAqL1xuICAjYmFzZU1hcCA9IG5ldyAke2RlZmluZXMuYmFzZUNsYXNzTmFtZX07XG5cbiAgLyoqIEB0eXBlIHtXZWFrTWFwPG9iamVjdCwgb2JqZWN0Pn0gQGNvbnN0YW50ICovXG4gICN3ZWFrVmFsdWVUb0ludGVybmFsS2V5TWFwID0gbmV3IFdlYWtNYXA7XG5cbiR7ZHVvRG9jcy5idWlsZEJsb2NrKFwiYmluZE9uZVRvT25lXCIsIDIpfVxuICBiaW5kT25lVG9PbmUoJHtcbiAgICBidWlsZEFyZ05hbWVMaXN0KFtcbiAgICAuLi5iaW5kT25lVG9PbmVBcmdMaXN0MSxcbiAgICBcInZhbHVlXzFcIixcbiAgICAuLi5iaW5kT25lVG9PbmVBcmdMaXN0MixcbiAgICBcInZhbHVlXzJcIlxuICAgIF0pfSkgeyR7YmluZEFyZ0xpc3QubGVuZ3RoID8gYFxuICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleShcIigke2JpbmRPbmVUb09uZUFyZ0xpc3QxfSlcIiwgJHtiaW5kT25lVG9PbmVBcmdMaXN0MX0pO1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZFZhbHVlKFwidmFsdWVfMVwiLCB2YWx1ZV8xKTtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRLZXkoXCIoJHtiaW5kT25lVG9PbmVBcmdMaXN0Mn0pXCIsICR7YmluZE9uZVRvT25lQXJnTGlzdDJ9KTtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRWYWx1ZShcInZhbHVlXzJcIiwgdmFsdWVfMik7XG5gIDogYFxuICAgIHRoaXMuI3JlcXVpcmVWYWxpZFZhbHVlKFwidmFsdWVfMVwiLCB2YWx1ZV8xKTtcbiAgICB0aGlzLiNyZXF1aXJlVmFsaWRWYWx1ZShcInZhbHVlXzJcIiwgdmFsdWVfMik7XG5gfVxuICBsZXQgJHt3ZWFrS2V5TmFtZX0gPSB0aGlzLiN3ZWFrVmFsdWVUb0ludGVybmFsS2V5TWFwLmdldCh2YWx1ZV8xKTtcbiAgY29uc3QgX19vdGhlcldlYWtLZXlfXyA9IHRoaXMuI3dlYWtWYWx1ZVRvSW50ZXJuYWxLZXlNYXAuZ2V0KHZhbHVlXzIpO1xuICBpZiAoISR7d2Vha0tleU5hbWV9KSB7XG4gICAgJHt3ZWFrS2V5TmFtZX0gPSBfX290aGVyV2Vha0tleV9fIHx8IHt9O1xuICB9XG4gIGVsc2UgaWYgKF9fb3RoZXJXZWFrS2V5X18gJiYgKF9fb3RoZXJXZWFrS2V5X18gIT09ICR7d2Vha0tleU5hbWV9KSkge1xuICAgIHRocm93IG5ldyBFcnJvcigke1xuLypcbklmIHdlIGdldCBoZXJlLCB3ZSBoYXZlIGEgcG90ZW50aWFsbHkgdW5yZXNvbHZhYmxlIGNvbmZsaWN0LlxuXG5JbiB0aGUgc2ltcGxlc3QgY2FzZSxcblxubWFwLmJpbmRPbmVUb09uZShyZWQsIGdyZWVuKTtcbm1hcC5iaW5kT25lVG9PbmUoYmx1ZSwgeWVsbG93KTtcbm1hcC5iaW5kT25lVG9PbmUocmVkLCBibHVlKTtcblxuVGhpcyBsYXN0IGNhbid0IGJlIGFsbG93ZWQgYmVjYXVzZSByZWQgaXMgYWxyZWFkeSBib3VuZCB0byBncmVlbiwgYW5kIGJsdWUgaXNcbmFscmVhZHkgYm91bmQgdG8geWVsbG93LlxuXG5JbiB0aGUgdmFsdWUgcGx1cyBuYW1lc3BhY2Uga2V5IGNhc2UsXG5cbm1hcC5iaW5kT25lVG9PbmUocmVkLCBcInJlZFwiLCBncmVlbiwgXCJncmVlblwiKTtcbm1hcC5iaW5kT25lVG9PbmUoYmx1ZSwgXCJibHVlXCIsIHllbGxvdywgXCJ5ZWxsb3dcIik7XG5tYXAuYmluZE9uZVRvT25lKHJlZCwgXCJyZWRcIiwgYmx1ZSwgXCJibHVlXCIpO1xuXG5UaGlzIGRvZXNuJ3QgYWN0dWFsbHkgaGF2ZSBhIGNvbmZsaWN0LCBidXQgd2UgZGlzYWxsb3cgaXQgYW55d2F5IGZvciBub3cuICBUaGVcbnJlYXNvbiBpcyBwcm92aW5nIHRoZXJlIGlzbid0IGEgY29uZmxpY3Qgd2l0aG91dCBzaWRlIGVmZmVjdHMgaXMgSGFyZC5cblxuV2UnZCBoYXZlIHRvIHByb3ZlIHNldmVyYWwgZmFjdHMgd2hlbiBldmFsdWF0aW5nIHRoZSB0aGlyZCBsaW5lOlxuXG4xLiBtYXAuaGFzKHJlZCwgXCJibHVlXCIpID09PSBmYWxzZVxuMi4gbWFwLmhhcyhyZWQsIFwieWVsbG93XCIpID09PSBmYWxzZVxuMy4gbWFwLmhhcyhibHVlLCBcInJlZFwiKSA9PT0gZmFsc2VcbjQuIG1hcC5oYXMoYmx1ZSwgXCJncmVlblwiKSA9PT0gZmFsc2VcblxuVGhlIFwieWVsbG93XCIgYW5kIFwiZ3JlZW5cIiBrZXlzIGRvbid0IGFwcGVhciBvbiB0aGUgdGhpcmQgbGluZS4gIEluIG90aGVyIHdvcmRzXG53ZSdkIGhhdmUgdG8gc2VhcmNoIGZvciBlbnRyaWVzIG1hdGNoaW5nIGVpdGhlciBvZiB0aGUgcHJpdmF0ZSB3ZWFrIGtleXMgZm9yXG5hbGwgdGhlIGtleSBjb21iaW5hdGlvbnMgYmVsb25naW5nIHRvIHRoZW0uXG5cbldpdGggd2VhayBtYXBzLCBzdWNoIGVudW1lcmF0aW9ucyBhcmUgZ2VuZXJhbGx5IGltcG9zc2libGUgYnkgZGVzaWduLlxuXG5Ob3csIHRoZSBvbmUtdG8tb25lIG1hcCBjb3VsZCB0aGVvcmV0aWNhbGx5IHRyYWNrIHRoaXMgdmlhIGV4cG9ydHMva2V5cy9IYXNoZXIubWpzOlxuLy8gQHR5cGUge1dlYWtNYXA8cHJpdmF0ZVdlYWtLZXksIFNldDxoYXNoPj59IEBjb25zdGFudFxuLy8gQHR5cGUge1dlYWtNYXBPZlN0cm9uZ1NldHM8cHJpdmF0ZVdlYWtLZXksIGhhc2g+fSBAY29uc3RhbnRcbiN3ZWFrS2V5VG9Vc2VyS2V5SGFzaGVzID0gbmV3IFdlYWtNYXA7XG5cbi8vIEBjb25zdGFudFxuI3VzZXJLZXlzSGFzaGVyID0gbmV3IEtleUhhc2hlclxuXG5UaGlzIG1lYW5zIGFkZGluZyBhIGtleSBoYXNoZXIgdG8gdGhpcyBjbGFzcyBmb3IgdGhlIHVzZXIncyBrZXlzLi4uIGFuZCBvbiB0b3Bcbm9mIHRoYXQgYW5vdGhlciBjb21wb3NpdGUgY29sbGVjdGlvbiAtIGVpdGhlciB0aGUgb25lIHRoaXMgcHJvamVjdCBwcm92aWRlcywgb3JcbmEgaGFuZC13cml0dGVuIG9uZS5cblxuQWxsIG9mIHRoaXMganVzdCB0byBtYWtlIHN1cmUgdGhlcmUgaXNuJ3QgYSBjb25mbGljdC4gIEl0J3MgYSBsb3Qgb2Ygb3ZlcmhlYWQsXG5jb21wbGljYXRpbmcgdGhpcyBpbXBsZW1lbnRhdGlvbiBpbW1lbnNlbHkuXG5cbkZpbmFsbHksIHRoZSB1c2VyIGNvdWxkIGF2b2lkIHRoaXMgY29uZmxpY3Qgc2ltcGx5IGJ5IHJlb3JkZXJpbmcgdGhlXG5pbnZvY2F0aW9ucywgcHJlZmVycmluZyBleGlzdGluZyBlbnRyaWVzIG92ZXIgbmV3IG9uZXM6XG5cbm1hcC5iaW5kT25lVG9PbmUocmVkLCBcInJlZFwiLCBncmVlbiwgXCJncmVlblwiKTtcbm1hcC5iaW5kT25lVG9PbmUocmVkLCBcInJlZFwiLCBibHVlLCBcImJsdWVcIik7XG5tYXAuYmluZE9uZVRvT25lKGJsdWUsIFwiYmx1ZVwiLCB5ZWxsb3csIFwieWVsbG93XCIpO1xuXG5JZiB0aGVyZSdzIGEgY29tcGVsbGluZyB1c2UgY2FzZSB0aGF0IGNyYXNoZXMgaW50byB0aGlzIHByb2JsZW0sIHdlIGNhbiBmaXhcbnRoaXMgYnkgZGVmaW5pbmcgYW4gb3B0aW9uIGluIHRoZSBjb25maWd1cmF0aW9uJ3MgLmNvbmZpZ3VyZU9uZVRvT25lKCkgb3B0aW9uc1xuYXJndW1lbnQsIHRvIGdlbmVyYXRlIHRoZSBhZGRpdGlvbmFsIGNvZGUgd2hlbiB0aGUgb3B0aW9uIGlzIHByZXNlbnQuICBUaGF0J3NcbnRoZSBvbmx5IHdheSB0byBjb252aW5jZSBtZSBpdCdzIHdvcnRoIGl0LCBhbmQgdGhhdCBvcHRpb24gbXVzdCBub3QgYmUgb24gYnlcbmRlZmF1bHQuICBQcmVzZXJ2aW5nIHRoaXMgY29tbWVudCAtIG9yIGFsdGVyaW5nIGl0IHNsaWdodGx5IHRvIGVtcGhhc2l6ZSB0aGVcbm9wdGlvbiAtIHdvdWxkIGFsc28gYmUgcmVxdWlyZWQuXG5cbi0tIEFsZXggVmluY2VudCwgSmFuLiA0LCAyMDIyXG4qL1xuICAgICAgYFwidmFsdWVfMSBhbmQgdmFsdWVfMiBhcmUgYWxyZWFkeSBpbiBkaWZmZXJlbnQgb25lLXRvLW9uZSBtYXBwaW5ncyFcImBcbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0IF9faGFzS2V5U2V0MV9fICA9IHRoaXMuI2Jhc2VNYXAuaGFzKCR7YmFzZU1hcEFyZ3MxfSk7XG4gIGNvbnN0IF9faGFzS2V5U2V0Ml9fICA9IHRoaXMuI2Jhc2VNYXAuaGFzKCR7YmFzZU1hcEFyZ3MyfSk7XG5cbiAgaWYgKF9faGFzS2V5U2V0MV9fICYmICh0aGlzLiNiYXNlTWFwLmdldCgke2Jhc2VNYXBBcmdzMX0pICE9PSB2YWx1ZV8xKSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJ2YWx1ZV8xIG1pc21hdGNoIVwiKTtcbiAgaWYgKF9faGFzS2V5U2V0Ml9fICYmICh0aGlzLiNiYXNlTWFwLmdldCgke2Jhc2VNYXBBcmdzMn0pICE9PSB2YWx1ZV8yKSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJ2YWx1ZV8yIG1pc21hdGNoIVwiKTtcblxuICB0aGlzLiN3ZWFrVmFsdWVUb0ludGVybmFsS2V5TWFwLnNldCh2YWx1ZV8xLCAke3dlYWtLZXlOYW1lfSk7XG4gIHRoaXMuI3dlYWtWYWx1ZVRvSW50ZXJuYWxLZXlNYXAuc2V0KHZhbHVlXzIsICR7d2Vha0tleU5hbWV9KTtcblxuICBpZiAoIV9faGFzS2V5U2V0MV9fKVxuICAgIHRoaXMuI2Jhc2VNYXAuc2V0KCR7YmFzZU1hcEFyZ3MxfSwgdmFsdWVfMSk7XG5cbiAgaWYgKCFfX2hhc0tleVNldDJfXylcbiAgICB0aGlzLiNiYXNlTWFwLnNldCgke2Jhc2VNYXBBcmdzMn0sIHZhbHVlXzIpO1xufVxuXG4ke3NvbG9Eb2NzLmJ1aWxkQmxvY2soXCJkZWxldGVcIiwgMil9XG4gIGRlbGV0ZSgke2JpbmRNYXBBcmdzV2l0aFZhbHVlfSkge1xuICAgIGNvbnN0ICR7d2Vha0tleU5hbWV9ID0gdGhpcy4jd2Vha1ZhbHVlVG9JbnRlcm5hbEtleU1hcC5oYXModmFsdWUpO1xuICAgIGlmICghJHt3ZWFrS2V5TmFtZX0pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBpZiAoIXRoaXMuI2Jhc2VNYXAuaGFzKCR7YmFzZU1hcEFyZ3N9KSlcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IF9fdGFyZ2V0X18gPSB0aGlzLiNiYXNlTWFwLmdldCgke2Jhc2VNYXBBcmdzfSk7XG5cbiAgICBjb25zdCBfX3JldHVyblZhbHVlX18gPSB0aGlzLiNiYXNlTWFwLmRlbGV0ZSgke2Jhc2VNYXBBcmdzfSk7XG4gICAgaWYgKF9fcmV0dXJuVmFsdWVfXylcbiAgICAgIHRoaXMuI3dlYWtWYWx1ZVRvSW50ZXJuYWxLZXlNYXAuZGVsZXRlKF9fdGFyZ2V0X18pO1xuICAgIHJldHVybiBfX3JldHVyblZhbHVlX187XG4gIH1cblxuJHtzb2xvRG9jcy5idWlsZEJsb2NrKFwiZ2V0XCIsIDIpfVxuICBnZXQoJHtiaW5kTWFwQXJnc1dpdGhWYWx1ZX0pIHtcbiAgICBjb25zdCAke3dlYWtLZXlOYW1lfSA9IHRoaXMuI3dlYWtWYWx1ZVRvSW50ZXJuYWxLZXlNYXAuZ2V0KHZhbHVlKTtcbiAgICByZXR1cm4gJHt3ZWFrS2V5TmFtZX0gPyB0aGlzLiNiYXNlTWFwLmdldCgke2Jhc2VNYXBBcmdzfSkgOiB1bmRlZmluZWQ7XG4gIH1cblxuJHtzb2xvRG9jcy5idWlsZEJsb2NrKFwiaGFzXCIsIDIpfVxuICBoYXMoJHtiaW5kTWFwQXJnc1dpdGhWYWx1ZX0pIHtcbiAgICBjb25zdCAke3dlYWtLZXlOYW1lfSA9IHRoaXMuI3dlYWtWYWx1ZVRvSW50ZXJuYWxLZXlNYXAuaGFzKHZhbHVlKTtcbiAgICByZXR1cm4gJHt3ZWFrS2V5TmFtZX0gPyB0aGlzLiNiYXNlTWFwLmhhcygke2Jhc2VNYXBBcmdzfSkgOiBmYWxzZTtcbiAgfVxuXG4ke3NvbG9Eb2NzLmJ1aWxkQmxvY2soXCJpc1ZhbGlkS2V5XCIsIDIpfVxuICBpc1ZhbGlkS2V5KCR7YmluZE1hcEFyZ3N9KSB7XG4gICAgcmV0dXJuIHRoaXMuI2lzVmFsaWRLZXkoJHtiaW5kTWFwQXJnc30pO1xuICB9XG5cbiAgI2lzVmFsaWRLZXkoJHtiaW5kTWFwQXJnc30pIHtcbiAgICBjb25zdCAke3dlYWtLZXlOYW1lfSA9IHt9O1xuICAgIHJldHVybiB0aGlzLiNiYXNlTWFwLmlzVmFsaWRLZXkoJHtiYXNlTWFwQXJnc30pO1xuICB9XG5cbiR7c29sb0RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRWYWx1ZVwiLCAyKX1cbiAgaXNWYWxpZFZhbHVlKHZhbHVlKSB7XG4gICAgcmV0dXJuICR7XG4gICAgICBkZWZpbmVzLmJhc2VDbGFzc1ZhbGlkYXRlc1ZhbHVlID9cbiAgICAgIFwiKE9iamVjdCh2YWx1ZSkgPT09IHZhbHVlKSAmJiB0aGlzLiNiYXNlTWFwLmlzVmFsaWRWYWx1ZSh2YWx1ZSlcIiA6XG4gICAgICBcIk9iamVjdCh2YWx1ZSkgPT09IHZhbHVlXCJcbiAgICB9O1xuICB9XG5cbiR7YmluZEFyZ0xpc3QubGVuZ3RoID8gYFxuICAjcmVxdWlyZVZhbGlkS2V5KF9fYXJnTmFtZXNfXywgJHtiaW5kTWFwQXJnc30pIHtcbiAgICBpZiAoIXRoaXMuI2lzVmFsaWRLZXkoJHtiaW5kTWFwQXJnc30pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBrZXkgdHVwbGU6IFwiICsgX19hcmdOYW1lc19fKTtcbiAgfVxuYCA6IGBgXG59XG4gICNyZXF1aXJlVmFsaWRWYWx1ZShhcmdOYW1lLCB2YWx1ZSkge1xuICAgIGlmICghdGhpcy5pc1ZhbGlkVmFsdWUodmFsdWUpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGFyZ05hbWUgKyBcIiBpcyBub3QgYSB2YWxpZCB2YWx1ZSFcIik7XG4gIH1cblxuICBbU3ltYm9sLnRvU3RyaW5nVGFnXSA9IFwiJHtkZWZpbmVzLmNsYXNzTmFtZX1cIjtcbn1cbiAgICBgO1xuICB9XG4gIGVsc2Uge1xuICAgIGNsYXNzRGVmaW5pdGlvbiA9IGBcbmNsYXNzICR7ZGVmaW5lcy5jbGFzc05hbWV9IGV4dGVuZHMgJHtkZWZpbmVzLmJhc2VDbGFzc05hbWV9IHtcbiR7ZHVvRG9jcy5idWlsZEJsb2NrKFwiYmluZE9uZVRvT25lU2ltcGxlXCIsIDIpfVxuICBiaW5kT25lVG9PbmUodmFsdWVfMSwgdmFsdWVfMikgeyR7XG4gICAgZGVmaW5lcy5iYXNlQ2xhc3NWYWxpZGF0ZXNLZXkgPyBgXG4gICAgaWYgKCF0aGlzLmlzVmFsaWRLZXkodmFsdWVfMSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ2YWx1ZV8xIG1pc21hdGNoIVwiKTtcbiAgICBpZiAoIXRoaXMuaXNWYWxpZEtleSh2YWx1ZV8yKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInZhbHVlXzIgbWlzbWF0Y2ghXCIpO1xuXG5gIDogXCJcIlxuICB9XG4gICAgY29uc3QgX19oYXNWYWx1ZTFfXyAgPSB0aGlzLmhhcyh2YWx1ZV8xKTtcbiAgICBjb25zdCBfX2hhc1ZhbHVlMl9fICA9IHRoaXMuaGFzKHZhbHVlXzIpO1xuXG4gICAgaWYgKF9faGFzVmFsdWUxX18gJiYgKHRoaXMuZ2V0KHZhbHVlXzIpICE9PSB2YWx1ZV8xKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInZhbHVlXzEgbWlzbWF0Y2ghXCIpO1xuICAgIGlmIChfX2hhc1ZhbHVlMl9fICYmICh0aGlzLmdldCh2YWx1ZV8xKSAhPT0gdmFsdWVfMikpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ2YWx1ZV8yIG1pc21hdGNoIVwiKTtcbiAgICBpZiAoIXRoaXMuaXNWYWxpZFZhbHVlKHZhbHVlXzEpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwidmFsdWVfMSBpcyBub3QgYSB2YWxpZCB2YWx1ZSFcIik7XG4gICAgaWYgKCF0aGlzLmlzVmFsaWRWYWx1ZSh2YWx1ZV8yKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInZhbHVlXzIgaXMgbm90IGEgdmFsaWQgdmFsdWUhXCIpO1xuXG4gICAgaWYgKCFfX2hhc1ZhbHVlMV9fKVxuICAgICAgc3VwZXIuc2V0KHZhbHVlXzEsIHZhbHVlXzIpO1xuICAgIGlmICghX19oYXNWYWx1ZTJfXylcbiAgICAgIHN1cGVyLnNldCh2YWx1ZV8yLCB2YWx1ZV8xKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB2YWxpZC5cbiAgICpcbiAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUuXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSB2YWx1ZSBpcyB2YWxpZC4ke1xuZGVmaW5lcy5iYXNlQ2xhc3NOYW1lICE9PSBcIldlYWtNYXBcIiA/IGBcbiAgICogQHNlZSB0aGUgYmFzZSBtYXAgY2xhc3MgZm9yIGZ1cnRoZXIgY29uc3RyYWludHMuYCA6IFwiXCJcbiAgIH1cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgaXNWYWxpZFZhbHVlKHZhbHVlKSB7XG4gICAgcmV0dXJuICR7XG4gICAgICBkZWZpbmVzLmJhc2VDbGFzc1ZhbGlkYXRlc1ZhbHVlID9cbiAgICAgICAgXCIoT2JqZWN0KHZhbHVlKSA9PT0gdmFsdWUpICYmIHN1cGVyLmlzVmFsaWRWYWx1ZSh2YWx1ZSlcIiA6XG4gICAgICAgIFwiT2JqZWN0KHZhbHVlKSA9PT0gdmFsdWVcIlxuICAgIH07XG4gIH1cblxuICBzZXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTm90IGltcGxlbWVudGVkLCB1c2UgLmJpbmRPbmVUb09uZSh2YWx1ZV8xLCB2YWx1ZV8yKTtcIik7XG4gIH1cblxuICBbU3ltYm9sLnRvU3RyaW5nVGFnXSA9IFwiJHtkZWZpbmVzLmNsYXNzTmFtZX1cIjtcbn1cbiAgICBgO1xuICB9XG5cbiAgcmV0dXJuIGNsYXNzRGVmaW5pdGlvbiArIGBcbk9iamVjdC5mcmVlemUoJHtkZWZpbmVzLmNsYXNzTmFtZX0pO1xuT2JqZWN0LmZyZWV6ZSgke2RlZmluZXMuY2xhc3NOYW1lfS5wcm90b3R5cGUpO1xuYH1cblxuZXhwb3J0IGRlZmF1bHQgcHJlcHJvY2VzcztcbiJdfQ==