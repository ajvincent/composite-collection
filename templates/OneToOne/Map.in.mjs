const buildArgNameList = (keys) => keys.join(", ");
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
    const bindArgList = defines.get("bindArgList");
    if (!Array.isArray(bindArgList))
        throw new Error("assertion: bindArgList must be an array!");
    const baseArgList = defines.get("baseArgList");
    if (!Array.isArray(baseArgList))
        throw new Error("assertion: baseArgList must be an array!");
    const weakKeyName = defines.get("weakKeyName");
    if (typeof weakKeyName !== "string")
        throw new Error("assertion: weakKeyName must be a string!");
    const bindOneToOneArgList1 = buildNumberedArgs(bindArgList, "_1", weakKeyName), bindOneToOneArgList2 = buildNumberedArgs(bindArgList, "_2", weakKeyName);
    const baseMapArgList1 = buildNumberedArgs(baseArgList, "_1", weakKeyName), baseMapArgList2 = buildNumberedArgs(baseArgList, "_2", weakKeyName);
    const baseMapArgs = buildArgNameList(baseArgList), baseMapArgs1 = buildArgNameList(baseMapArgList1), baseMapArgs2 = buildArgNameList(baseMapArgList2);
    const bindMapArgsWithValue = buildArgNameList(["value", ...bindArgList]);
    const bindMapArgs = buildArgNameList(bindArgList);
    let classDefinition = "";
    if (defines.get("wrapBaseClass")) {
        classDefinition = `
class ${defines.get("className")} {
  /** @constant */
  #baseMap = new ${defines.get("baseClassName")};

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
    return ${defines.get("baseClassValidatesValue") ?
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

  [Symbol.toStringTag] = "${defines.get("className")}";
}
    `;
    }
    else {
        classDefinition = `
class ${defines.get("className")} extends ${defines.get("baseClassName")} {
${duoDocs.buildBlock("bindOneToOneSimple", 2)}
  bindOneToOne(value_1, value_2) {${defines.get("baseClassValidatesKey") ? `
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
   * @returns {boolean} True if the value is valid.${defines.get("baseClassName") !== "WeakMap" ? `
   * @see the base map class for further constraints.` : ""}
   * @public
   */
  isValidValue(value) {
    return ${defines.get("baseClassValidatesValue") ?
            "(Object(value) === value) && super.isValidValue(value)" :
            "Object(value) === value"};
  }

  set() {
    throw new Error("Not implemented, use .bindOneToOne(value_1, value_2);");
  }

  [Symbol.toStringTag] = "${defines.get("className")}";
}
    `;
    }
    return classDefinition + `
Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`;
};
export default preprocess;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFwLmluLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1hcC5pbi5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLElBQWMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUU3RDs7Ozs7OztHQU9HO0FBQ0gsU0FBUyxpQkFBaUIsQ0FBQyxJQUFjLEVBQUUsTUFBYyxFQUFFLFdBQW1CO0lBQzVFLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDdEUsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLEdBQXFCLFVBQ25DLE9BQTRCLEVBQzVCLFFBQXdCLEVBQ3hCLE9BQXVCO0lBR3ZCLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDL0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztJQUU5RCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQy9DLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztRQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7SUFFOUQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUMvQyxJQUFJLE9BQU8sV0FBVyxLQUFLLFFBQVE7UUFDakMsTUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO0lBRTlELE1B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TyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7O0tBRS9DLENBQUM7S0FDSDtTQUNJO1FBQ0gsZUFBZSxHQUFHO1FBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsWUFBWSxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQztFQUN0RSxPQUFPLENBQUMsVUFBVSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQztvQ0FFekMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7O0NBTTFDLENBQUMsQ0FBQyxDQUFDLEVBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3FEQXdCRixPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7c0RBQ1MsQ0FBQyxDQUFDLENBQUMsRUFDdEQ7Ozs7YUFLRyxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQztZQUN0Qyx3REFBd0QsQ0FBQyxDQUFDO1lBQzFELHlCQUNKOzs7Ozs7OzRCQU93QixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQzs7S0FFL0MsQ0FBQztLQUNIO0lBRUQsT0FBTyxlQUFlLEdBQUc7Z0JBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7Z0JBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO0NBQ3ZDLENBQUE7QUFBQSxDQUFDLENBQUE7QUFFRixlQUFlLFVBQVUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUHJlcHJvY2Vzc29yRGVmaW5lcywgSlNEb2NHZW5lcmF0b3IsIFRlbXBsYXRlRnVuY3Rpb24gfSBmcm9tIFwiLi4vc2hhcmVkVHlwZXMubWpzXCI7XG5cbmNvbnN0IGJ1aWxkQXJnTmFtZUxpc3QgPSAoa2V5czogc3RyaW5nW10pID0+IGtleXMuam9pbihcIiwgXCIpO1xuXG4vKipcbiAqIEJ1aWxkIGFuIGFyZ3VtZW50cyBsaXN0IGJhc2VkIG9uIGEgc3VmZml4LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nW119ICAgYXJncyAgICAgICAgVGhlIGxpc3Qgb2YgYXJndW1lbnQgbmFtZXMuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgIHN1ZmZpeCAgICAgIFRoZSBzdWZmaXggdG8gYXBwZW5kLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICB3ZWFrS2V5TmFtZSBUaGUgYXJndW1lbnQgdG8gZXhjbHVkZSBhcHBlbmRpbmcgYSBzdWZmaXggdG8uXG4gKiBAcmV0dXJucyB7c3RyaW5nW119ICAgICAgICAgICAgIFRoZSByZXN1bHRpbmcgYXJndW1lbnQgbGlzdC5cbiAqL1xuZnVuY3Rpb24gYnVpbGROdW1iZXJlZEFyZ3MoYXJnczogc3RyaW5nW10sIHN1ZmZpeDogc3RyaW5nLCB3ZWFrS2V5TmFtZTogc3RyaW5nKSA6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIGFyZ3MubWFwKGFyZyA9PiBhcmcgKyAoKGFyZyA9PT0gd2Vha0tleU5hbWUpID8gXCJcIiA6IHN1ZmZpeCkpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7TWFwfSAgICAgICAgICAgIGRlZmluZXMgIFRoZSBwcmVwcm9jZXNzb3IgbWFjcm9zLlxuICogQHBhcmFtIHtKU0RvY0dlbmVyYXRvcn0gc29sb0RvY3MgUHJvdmlkZXMgZG9jdW1lbnRhdGlvbiBmb3Igc2luZ2xlIGtleS12YWx1ZSBtZXRob2RzLlxuICogQHBhcmFtIHtKU0RvY0dlbmVyYXRvcn0gZHVvRG9jcyAgUHJvdmlkZXMgZG9jdW1lbnRhdGlvbiBmb3IgLmJpbmRPbmVUb09uZSgpLlxuICogQHJldHVybnMge3N0cmluZ30gICAgICAgICAgICAgICAgVGhlIGdlbmVyYXRlZCBzb3VyY2UgY29kZS5cbiAqL1xuY29uc3QgcHJlcHJvY2VzczogVGVtcGxhdGVGdW5jdGlvbiA9IGZ1bmN0aW9uKFxuICBkZWZpbmVzOiBQcmVwcm9jZXNzb3JEZWZpbmVzLFxuICBzb2xvRG9jczogSlNEb2NHZW5lcmF0b3IsXG4gIGR1b0RvY3M6IEpTRG9jR2VuZXJhdG9yXG4pXG57XG4gIGNvbnN0IGJpbmRBcmdMaXN0ID0gZGVmaW5lcy5nZXQoXCJiaW5kQXJnTGlzdFwiKTtcbiAgaWYgKCFBcnJheS5pc0FycmF5KGJpbmRBcmdMaXN0KSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJhc3NlcnRpb246IGJpbmRBcmdMaXN0IG11c3QgYmUgYW4gYXJyYXkhXCIpO1xuXG4gIGNvbnN0IGJhc2VBcmdMaXN0ID0gZGVmaW5lcy5nZXQoXCJiYXNlQXJnTGlzdFwiKTtcbiAgaWYgKCFBcnJheS5pc0FycmF5KGJhc2VBcmdMaXN0KSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJhc3NlcnRpb246IGJhc2VBcmdMaXN0IG11c3QgYmUgYW4gYXJyYXkhXCIpO1xuXG4gIGNvbnN0IHdlYWtLZXlOYW1lID0gZGVmaW5lcy5nZXQoXCJ3ZWFrS2V5TmFtZVwiKTtcbiAgaWYgKHR5cGVvZiB3ZWFrS2V5TmFtZSAhPT0gXCJzdHJpbmdcIilcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJhc3NlcnRpb246IHdlYWtLZXlOYW1lIG11c3QgYmUgYSBzdHJpbmchXCIpO1xuXG4gIGNvbnN0IGJpbmRPbmVUb09uZUFyZ0xpc3QxID0gYnVpbGROdW1iZXJlZEFyZ3MoYmluZEFyZ0xpc3QsIFwiXzFcIiwgd2Vha0tleU5hbWUpLFxuICAgICAgICBiaW5kT25lVG9PbmVBcmdMaXN0MiA9IGJ1aWxkTnVtYmVyZWRBcmdzKGJpbmRBcmdMaXN0LCBcIl8yXCIsIHdlYWtLZXlOYW1lKTtcblxuICBjb25zdCBiYXNlTWFwQXJnTGlzdDEgPSBidWlsZE51bWJlcmVkQXJncyhiYXNlQXJnTGlzdCwgXCJfMVwiLCB3ZWFrS2V5TmFtZSksXG4gICAgICAgIGJhc2VNYXBBcmdMaXN0MiA9IGJ1aWxkTnVtYmVyZWRBcmdzKGJhc2VBcmdMaXN0LCBcIl8yXCIsIHdlYWtLZXlOYW1lKTtcblxuICBjb25zdCBiYXNlTWFwQXJncyA9IGJ1aWxkQXJnTmFtZUxpc3QoYmFzZUFyZ0xpc3QpLFxuICAgICAgICBiYXNlTWFwQXJnczEgPSBidWlsZEFyZ05hbWVMaXN0KGJhc2VNYXBBcmdMaXN0MSksXG4gICAgICAgIGJhc2VNYXBBcmdzMiA9IGJ1aWxkQXJnTmFtZUxpc3QoYmFzZU1hcEFyZ0xpc3QyKTtcblxuICBjb25zdCBiaW5kTWFwQXJnc1dpdGhWYWx1ZSA9IGJ1aWxkQXJnTmFtZUxpc3QoW1widmFsdWVcIiwuLi5iaW5kQXJnTGlzdF0pO1xuICBjb25zdCBiaW5kTWFwQXJncyA9IGJ1aWxkQXJnTmFtZUxpc3QoYmluZEFyZ0xpc3QpO1xuXG4gIGxldCBjbGFzc0RlZmluaXRpb24gPSBcIlwiO1xuICBpZiAoZGVmaW5lcy5nZXQoXCJ3cmFwQmFzZUNsYXNzXCIpKSB7XG4gICAgY2xhc3NEZWZpbml0aW9uID0gYFxuY2xhc3MgJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX0ge1xuICAvKiogQGNvbnN0YW50ICovXG4gICNiYXNlTWFwID0gbmV3ICR7ZGVmaW5lcy5nZXQoXCJiYXNlQ2xhc3NOYW1lXCIpfTtcblxuICAvKiogQHR5cGUge1dlYWtNYXA8b2JqZWN0LCBvYmplY3Q+fSBAY29uc3RhbnQgKi9cbiAgI3dlYWtWYWx1ZVRvSW50ZXJuYWxLZXlNYXAgPSBuZXcgV2Vha01hcDtcblxuJHtkdW9Eb2NzLmJ1aWxkQmxvY2soXCJiaW5kT25lVG9PbmVcIiwgMil9XG4gIGJpbmRPbmVUb09uZSgke1xuICAgIGJ1aWxkQXJnTmFtZUxpc3QoW1xuICAgIC4uLmJpbmRPbmVUb09uZUFyZ0xpc3QxLFxuICAgIFwidmFsdWVfMVwiLFxuICAgIC4uLmJpbmRPbmVUb09uZUFyZ0xpc3QyLFxuICAgIFwidmFsdWVfMlwiXG4gICAgXSl9KSB7JHtiaW5kQXJnTGlzdC5sZW5ndGggPyBgXG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KFwiKCR7YmluZE9uZVRvT25lQXJnTGlzdDF9KVwiLCAke2JpbmRPbmVUb09uZUFyZ0xpc3QxfSk7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkVmFsdWUoXCJ2YWx1ZV8xXCIsIHZhbHVlXzEpO1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZEtleShcIigke2JpbmRPbmVUb09uZUFyZ0xpc3QyfSlcIiwgJHtiaW5kT25lVG9PbmVBcmdMaXN0Mn0pO1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZFZhbHVlKFwidmFsdWVfMlwiLCB2YWx1ZV8yKTtcbmAgOiBgXG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkVmFsdWUoXCJ2YWx1ZV8xXCIsIHZhbHVlXzEpO1xuICAgIHRoaXMuI3JlcXVpcmVWYWxpZFZhbHVlKFwidmFsdWVfMlwiLCB2YWx1ZV8yKTtcbmB9XG4gIGxldCAke3dlYWtLZXlOYW1lfSA9IHRoaXMuI3dlYWtWYWx1ZVRvSW50ZXJuYWxLZXlNYXAuZ2V0KHZhbHVlXzEpO1xuICBjb25zdCBfX290aGVyV2Vha0tleV9fID0gdGhpcy4jd2Vha1ZhbHVlVG9JbnRlcm5hbEtleU1hcC5nZXQodmFsdWVfMik7XG4gIGlmICghJHt3ZWFrS2V5TmFtZX0pIHtcbiAgICAke3dlYWtLZXlOYW1lfSA9IF9fb3RoZXJXZWFrS2V5X18gfHwge307XG4gIH1cbiAgZWxzZSBpZiAoX19vdGhlcldlYWtLZXlfXyAmJiAoX19vdGhlcldlYWtLZXlfXyAhPT0gJHt3ZWFrS2V5TmFtZX0pKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCR7XG4vKlxuSWYgd2UgZ2V0IGhlcmUsIHdlIGhhdmUgYSBwb3RlbnRpYWxseSB1bnJlc29sdmFibGUgY29uZmxpY3QuXG5cbkluIHRoZSBzaW1wbGVzdCBjYXNlLFxuXG5tYXAuYmluZE9uZVRvT25lKHJlZCwgZ3JlZW4pO1xubWFwLmJpbmRPbmVUb09uZShibHVlLCB5ZWxsb3cpO1xubWFwLmJpbmRPbmVUb09uZShyZWQsIGJsdWUpO1xuXG5UaGlzIGxhc3QgY2FuJ3QgYmUgYWxsb3dlZCBiZWNhdXNlIHJlZCBpcyBhbHJlYWR5IGJvdW5kIHRvIGdyZWVuLCBhbmQgYmx1ZSBpc1xuYWxyZWFkeSBib3VuZCB0byB5ZWxsb3cuXG5cbkluIHRoZSB2YWx1ZSBwbHVzIG5hbWVzcGFjZSBrZXkgY2FzZSxcblxubWFwLmJpbmRPbmVUb09uZShyZWQsIFwicmVkXCIsIGdyZWVuLCBcImdyZWVuXCIpO1xubWFwLmJpbmRPbmVUb09uZShibHVlLCBcImJsdWVcIiwgeWVsbG93LCBcInllbGxvd1wiKTtcbm1hcC5iaW5kT25lVG9PbmUocmVkLCBcInJlZFwiLCBibHVlLCBcImJsdWVcIik7XG5cblRoaXMgZG9lc24ndCBhY3R1YWxseSBoYXZlIGEgY29uZmxpY3QsIGJ1dCB3ZSBkaXNhbGxvdyBpdCBhbnl3YXkgZm9yIG5vdy4gIFRoZVxucmVhc29uIGlzIHByb3ZpbmcgdGhlcmUgaXNuJ3QgYSBjb25mbGljdCB3aXRob3V0IHNpZGUgZWZmZWN0cyBpcyBIYXJkLlxuXG5XZSdkIGhhdmUgdG8gcHJvdmUgc2V2ZXJhbCBmYWN0cyB3aGVuIGV2YWx1YXRpbmcgdGhlIHRoaXJkIGxpbmU6XG5cbjEuIG1hcC5oYXMocmVkLCBcImJsdWVcIikgPT09IGZhbHNlXG4yLiBtYXAuaGFzKHJlZCwgXCJ5ZWxsb3dcIikgPT09IGZhbHNlXG4zLiBtYXAuaGFzKGJsdWUsIFwicmVkXCIpID09PSBmYWxzZVxuNC4gbWFwLmhhcyhibHVlLCBcImdyZWVuXCIpID09PSBmYWxzZVxuXG5UaGUgXCJ5ZWxsb3dcIiBhbmQgXCJncmVlblwiIGtleXMgZG9uJ3QgYXBwZWFyIG9uIHRoZSB0aGlyZCBsaW5lLiAgSW4gb3RoZXIgd29yZHNcbndlJ2QgaGF2ZSB0byBzZWFyY2ggZm9yIGVudHJpZXMgbWF0Y2hpbmcgZWl0aGVyIG9mIHRoZSBwcml2YXRlIHdlYWsga2V5cyBmb3JcbmFsbCB0aGUga2V5IGNvbWJpbmF0aW9ucyBiZWxvbmdpbmcgdG8gdGhlbS5cblxuV2l0aCB3ZWFrIG1hcHMsIHN1Y2ggZW51bWVyYXRpb25zIGFyZSBnZW5lcmFsbHkgaW1wb3NzaWJsZSBieSBkZXNpZ24uXG5cbk5vdywgdGhlIG9uZS10by1vbmUgbWFwIGNvdWxkIHRoZW9yZXRpY2FsbHkgdHJhY2sgdGhpcyB2aWEgZXhwb3J0cy9rZXlzL0hhc2hlci5tanM6XG4vLyBAdHlwZSB7V2Vha01hcDxwcml2YXRlV2Vha0tleSwgU2V0PGhhc2g+Pn0gQGNvbnN0YW50XG4vLyBAdHlwZSB7V2Vha01hcE9mU3Ryb25nU2V0czxwcml2YXRlV2Vha0tleSwgaGFzaD59IEBjb25zdGFudFxuI3dlYWtLZXlUb1VzZXJLZXlIYXNoZXMgPSBuZXcgV2Vha01hcDtcblxuLy8gQGNvbnN0YW50XG4jdXNlcktleXNIYXNoZXIgPSBuZXcgS2V5SGFzaGVyXG5cblRoaXMgbWVhbnMgYWRkaW5nIGEga2V5IGhhc2hlciB0byB0aGlzIGNsYXNzIGZvciB0aGUgdXNlcidzIGtleXMuLi4gYW5kIG9uIHRvcFxub2YgdGhhdCBhbm90aGVyIGNvbXBvc2l0ZSBjb2xsZWN0aW9uIC0gZWl0aGVyIHRoZSBvbmUgdGhpcyBwcm9qZWN0IHByb3ZpZGVzLCBvclxuYSBoYW5kLXdyaXR0ZW4gb25lLlxuXG5BbGwgb2YgdGhpcyBqdXN0IHRvIG1ha2Ugc3VyZSB0aGVyZSBpc24ndCBhIGNvbmZsaWN0LiAgSXQncyBhIGxvdCBvZiBvdmVyaGVhZCxcbmNvbXBsaWNhdGluZyB0aGlzIGltcGxlbWVudGF0aW9uIGltbWVuc2VseS5cblxuRmluYWxseSwgdGhlIHVzZXIgY291bGQgYXZvaWQgdGhpcyBjb25mbGljdCBzaW1wbHkgYnkgcmVvcmRlcmluZyB0aGVcbmludm9jYXRpb25zLCBwcmVmZXJyaW5nIGV4aXN0aW5nIGVudHJpZXMgb3ZlciBuZXcgb25lczpcblxubWFwLmJpbmRPbmVUb09uZShyZWQsIFwicmVkXCIsIGdyZWVuLCBcImdyZWVuXCIpO1xubWFwLmJpbmRPbmVUb09uZShyZWQsIFwicmVkXCIsIGJsdWUsIFwiYmx1ZVwiKTtcbm1hcC5iaW5kT25lVG9PbmUoYmx1ZSwgXCJibHVlXCIsIHllbGxvdywgXCJ5ZWxsb3dcIik7XG5cbklmIHRoZXJlJ3MgYSBjb21wZWxsaW5nIHVzZSBjYXNlIHRoYXQgY3Jhc2hlcyBpbnRvIHRoaXMgcHJvYmxlbSwgd2UgY2FuIGZpeFxudGhpcyBieSBkZWZpbmluZyBhbiBvcHRpb24gaW4gdGhlIGNvbmZpZ3VyYXRpb24ncyAuY29uZmlndXJlT25lVG9PbmUoKSBvcHRpb25zXG5hcmd1bWVudCwgdG8gZ2VuZXJhdGUgdGhlIGFkZGl0aW9uYWwgY29kZSB3aGVuIHRoZSBvcHRpb24gaXMgcHJlc2VudC4gIFRoYXQnc1xudGhlIG9ubHkgd2F5IHRvIGNvbnZpbmNlIG1lIGl0J3Mgd29ydGggaXQsIGFuZCB0aGF0IG9wdGlvbiBtdXN0IG5vdCBiZSBvbiBieVxuZGVmYXVsdC4gIFByZXNlcnZpbmcgdGhpcyBjb21tZW50IC0gb3IgYWx0ZXJpbmcgaXQgc2xpZ2h0bHkgdG8gZW1waGFzaXplIHRoZVxub3B0aW9uIC0gd291bGQgYWxzbyBiZSByZXF1aXJlZC5cblxuLS0gQWxleCBWaW5jZW50LCBKYW4uIDQsIDIwMjJcbiovXG4gICAgICBgXCJ2YWx1ZV8xIGFuZCB2YWx1ZV8yIGFyZSBhbHJlYWR5IGluIGRpZmZlcmVudCBvbmUtdG8tb25lIG1hcHBpbmdzIVwiYFxuICAgIH0pO1xuICB9XG5cbiAgY29uc3QgX19oYXNLZXlTZXQxX18gID0gdGhpcy4jYmFzZU1hcC5oYXMoJHtiYXNlTWFwQXJnczF9KTtcbiAgY29uc3QgX19oYXNLZXlTZXQyX18gID0gdGhpcy4jYmFzZU1hcC5oYXMoJHtiYXNlTWFwQXJnczJ9KTtcblxuICBpZiAoX19oYXNLZXlTZXQxX18gJiYgKHRoaXMuI2Jhc2VNYXAuZ2V0KCR7YmFzZU1hcEFyZ3MxfSkgIT09IHZhbHVlXzEpKVxuICAgIHRocm93IG5ldyBFcnJvcihcInZhbHVlXzEgbWlzbWF0Y2ghXCIpO1xuICBpZiAoX19oYXNLZXlTZXQyX18gJiYgKHRoaXMuI2Jhc2VNYXAuZ2V0KCR7YmFzZU1hcEFyZ3MyfSkgIT09IHZhbHVlXzIpKVxuICAgIHRocm93IG5ldyBFcnJvcihcInZhbHVlXzIgbWlzbWF0Y2ghXCIpO1xuXG4gIHRoaXMuI3dlYWtWYWx1ZVRvSW50ZXJuYWxLZXlNYXAuc2V0KHZhbHVlXzEsICR7d2Vha0tleU5hbWV9KTtcbiAgdGhpcy4jd2Vha1ZhbHVlVG9JbnRlcm5hbEtleU1hcC5zZXQodmFsdWVfMiwgJHt3ZWFrS2V5TmFtZX0pO1xuXG4gIGlmICghX19oYXNLZXlTZXQxX18pXG4gICAgdGhpcy4jYmFzZU1hcC5zZXQoJHtiYXNlTWFwQXJnczF9LCB2YWx1ZV8xKTtcblxuICBpZiAoIV9faGFzS2V5U2V0Ml9fKVxuICAgIHRoaXMuI2Jhc2VNYXAuc2V0KCR7YmFzZU1hcEFyZ3MyfSwgdmFsdWVfMik7XG59XG5cbiR7c29sb0RvY3MuYnVpbGRCbG9jayhcImRlbGV0ZVwiLCAyKX1cbiAgZGVsZXRlKCR7YmluZE1hcEFyZ3NXaXRoVmFsdWV9KSB7XG4gICAgY29uc3QgJHt3ZWFrS2V5TmFtZX0gPSB0aGlzLiN3ZWFrVmFsdWVUb0ludGVybmFsS2V5TWFwLmhhcyh2YWx1ZSk7XG4gICAgaWYgKCEke3dlYWtLZXlOYW1lfSlcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGlmICghdGhpcy4jYmFzZU1hcC5oYXMoJHtiYXNlTWFwQXJnc30pKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgX190YXJnZXRfXyA9IHRoaXMuI2Jhc2VNYXAuZ2V0KCR7YmFzZU1hcEFyZ3N9KTtcblxuICAgIGNvbnN0IF9fcmV0dXJuVmFsdWVfXyA9IHRoaXMuI2Jhc2VNYXAuZGVsZXRlKCR7YmFzZU1hcEFyZ3N9KTtcbiAgICBpZiAoX19yZXR1cm5WYWx1ZV9fKVxuICAgICAgdGhpcy4jd2Vha1ZhbHVlVG9JbnRlcm5hbEtleU1hcC5kZWxldGUoX190YXJnZXRfXyk7XG4gICAgcmV0dXJuIF9fcmV0dXJuVmFsdWVfXztcbiAgfVxuXG4ke3NvbG9Eb2NzLmJ1aWxkQmxvY2soXCJnZXRcIiwgMil9XG4gIGdldCgke2JpbmRNYXBBcmdzV2l0aFZhbHVlfSkge1xuICAgIGNvbnN0ICR7d2Vha0tleU5hbWV9ID0gdGhpcy4jd2Vha1ZhbHVlVG9JbnRlcm5hbEtleU1hcC5nZXQodmFsdWUpO1xuICAgIHJldHVybiAke3dlYWtLZXlOYW1lfSA/IHRoaXMuI2Jhc2VNYXAuZ2V0KCR7YmFzZU1hcEFyZ3N9KSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4ke3NvbG9Eb2NzLmJ1aWxkQmxvY2soXCJoYXNcIiwgMil9XG4gIGhhcygke2JpbmRNYXBBcmdzV2l0aFZhbHVlfSkge1xuICAgIGNvbnN0ICR7d2Vha0tleU5hbWV9ID0gdGhpcy4jd2Vha1ZhbHVlVG9JbnRlcm5hbEtleU1hcC5oYXModmFsdWUpO1xuICAgIHJldHVybiAke3dlYWtLZXlOYW1lfSA/IHRoaXMuI2Jhc2VNYXAuaGFzKCR7YmFzZU1hcEFyZ3N9KSA6IGZhbHNlO1xuICB9XG5cbiR7c29sb0RvY3MuYnVpbGRCbG9jayhcImlzVmFsaWRLZXlcIiwgMil9XG4gIGlzVmFsaWRLZXkoJHtiaW5kTWFwQXJnc30pIHtcbiAgICByZXR1cm4gdGhpcy4jaXNWYWxpZEtleSgke2JpbmRNYXBBcmdzfSk7XG4gIH1cblxuICAjaXNWYWxpZEtleSgke2JpbmRNYXBBcmdzfSkge1xuICAgIGNvbnN0ICR7d2Vha0tleU5hbWV9ID0ge307XG4gICAgcmV0dXJuIHRoaXMuI2Jhc2VNYXAuaXNWYWxpZEtleSgke2Jhc2VNYXBBcmdzfSk7XG4gIH1cblxuJHtzb2xvRG9jcy5idWlsZEJsb2NrKFwiaXNWYWxpZFZhbHVlXCIsIDIpfVxuICBpc1ZhbGlkVmFsdWUodmFsdWUpIHtcbiAgICByZXR1cm4gJHtcbiAgICAgIGRlZmluZXMuZ2V0KFwiYmFzZUNsYXNzVmFsaWRhdGVzVmFsdWVcIikgP1xuICAgICAgXCIoT2JqZWN0KHZhbHVlKSA9PT0gdmFsdWUpICYmIHRoaXMuI2Jhc2VNYXAuaXNWYWxpZFZhbHVlKHZhbHVlKVwiIDpcbiAgICAgIFwiT2JqZWN0KHZhbHVlKSA9PT0gdmFsdWVcIlxuICAgIH07XG4gIH1cblxuJHtiaW5kQXJnTGlzdC5sZW5ndGggPyBgXG4gICNyZXF1aXJlVmFsaWRLZXkoX19hcmdOYW1lc19fLCAke2JpbmRNYXBBcmdzfSkge1xuICAgIGlmICghdGhpcy4jaXNWYWxpZEtleSgke2JpbmRNYXBBcmdzfSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGtleSB0dXBsZTogXCIgKyBfX2FyZ05hbWVzX18pO1xuICB9XG5gIDogYGBcbn1cbiAgI3JlcXVpcmVWYWxpZFZhbHVlKGFyZ05hbWUsIHZhbHVlKSB7XG4gICAgaWYgKCF0aGlzLmlzVmFsaWRWYWx1ZSh2YWx1ZSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYXJnTmFtZSArIFwiIGlzIG5vdCBhIHZhbGlkIHZhbHVlIVwiKTtcbiAgfVxuXG4gIFtTeW1ib2wudG9TdHJpbmdUYWddID0gXCIke2RlZmluZXMuZ2V0KFwiY2xhc3NOYW1lXCIpfVwiO1xufVxuICAgIGA7XG4gIH1cbiAgZWxzZSB7XG4gICAgY2xhc3NEZWZpbml0aW9uID0gYFxuY2xhc3MgJHtkZWZpbmVzLmdldChcImNsYXNzTmFtZVwiKX0gZXh0ZW5kcyAke2RlZmluZXMuZ2V0KFwiYmFzZUNsYXNzTmFtZVwiKX0ge1xuJHtkdW9Eb2NzLmJ1aWxkQmxvY2soXCJiaW5kT25lVG9PbmVTaW1wbGVcIiwgMil9XG4gIGJpbmRPbmVUb09uZSh2YWx1ZV8xLCB2YWx1ZV8yKSB7JHtcbiAgICBkZWZpbmVzLmdldChcImJhc2VDbGFzc1ZhbGlkYXRlc0tleVwiKSA/IGBcbiAgICBpZiAoIXRoaXMuaXNWYWxpZEtleSh2YWx1ZV8xKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInZhbHVlXzEgbWlzbWF0Y2ghXCIpO1xuICAgIGlmICghdGhpcy5pc1ZhbGlkS2V5KHZhbHVlXzIpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwidmFsdWVfMiBtaXNtYXRjaCFcIik7XG5cbmAgOiBcIlwiXG4gIH1cbiAgICBjb25zdCBfX2hhc1ZhbHVlMV9fICA9IHRoaXMuaGFzKHZhbHVlXzEpO1xuICAgIGNvbnN0IF9faGFzVmFsdWUyX18gID0gdGhpcy5oYXModmFsdWVfMik7XG5cbiAgICBpZiAoX19oYXNWYWx1ZTFfXyAmJiAodGhpcy5nZXQodmFsdWVfMikgIT09IHZhbHVlXzEpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwidmFsdWVfMSBtaXNtYXRjaCFcIik7XG4gICAgaWYgKF9faGFzVmFsdWUyX18gJiYgKHRoaXMuZ2V0KHZhbHVlXzEpICE9PSB2YWx1ZV8yKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInZhbHVlXzIgbWlzbWF0Y2ghXCIpO1xuICAgIGlmICghdGhpcy5pc1ZhbGlkVmFsdWUodmFsdWVfMSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ2YWx1ZV8xIGlzIG5vdCBhIHZhbGlkIHZhbHVlIVwiKTtcbiAgICBpZiAoIXRoaXMuaXNWYWxpZFZhbHVlKHZhbHVlXzIpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwidmFsdWVfMiBpcyBub3QgYSB2YWxpZCB2YWx1ZSFcIik7XG5cbiAgICBpZiAoIV9faGFzVmFsdWUxX18pXG4gICAgICBzdXBlci5zZXQodmFsdWVfMSwgdmFsdWVfMik7XG4gICAgaWYgKCFfX2hhc1ZhbHVlMl9fKVxuICAgICAgc3VwZXIuc2V0KHZhbHVlXzIsIHZhbHVlXzEpO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIHZhbGlkLlxuICAgKlxuICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZS5cbiAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHZhbGlkLiR7XG5kZWZpbmVzLmdldChcImJhc2VDbGFzc05hbWVcIikgIT09IFwiV2Vha01hcFwiID8gYFxuICAgKiBAc2VlIHRoZSBiYXNlIG1hcCBjbGFzcyBmb3IgZnVydGhlciBjb25zdHJhaW50cy5gIDogXCJcIlxuICAgfVxuICAgKiBAcHVibGljXG4gICAqL1xuICBpc1ZhbGlkVmFsdWUodmFsdWUpIHtcbiAgICByZXR1cm4gJHtcbiAgICAgIGRlZmluZXMuZ2V0KFwiYmFzZUNsYXNzVmFsaWRhdGVzVmFsdWVcIikgP1xuICAgICAgICBcIihPYmplY3QodmFsdWUpID09PSB2YWx1ZSkgJiYgc3VwZXIuaXNWYWxpZFZhbHVlKHZhbHVlKVwiIDpcbiAgICAgICAgXCJPYmplY3QodmFsdWUpID09PSB2YWx1ZVwiXG4gICAgfTtcbiAgfVxuXG4gIHNldCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWQsIHVzZSAuYmluZE9uZVRvT25lKHZhbHVlXzEsIHZhbHVlXzIpO1wiKTtcbiAgfVxuXG4gIFtTeW1ib2wudG9TdHJpbmdUYWddID0gXCIke2RlZmluZXMuZ2V0KFwiY2xhc3NOYW1lXCIpfVwiO1xufVxuICAgIGA7XG4gIH1cblxuICByZXR1cm4gY2xhc3NEZWZpbml0aW9uICsgYFxuT2JqZWN0LmZyZWV6ZSgke2RlZmluZXMuZ2V0KFwiY2xhc3NOYW1lXCIpfSk7XG5PYmplY3QuZnJlZXplKCR7ZGVmaW5lcy5nZXQoXCJjbGFzc05hbWVcIil9LnByb3RvdHlwZSk7XG5gfVxuXG5leHBvcnQgZGVmYXVsdCBwcmVwcm9jZXNzO1xuIl19