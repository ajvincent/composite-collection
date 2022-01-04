function buildArgNameList(keys) {
  return keys.join(", ")
}

function buildNumberedArgs(args, suffix, weakKeyName) {
  return args.map(arg => arg + ((arg === weakKeyName) ? "" : suffix));
}

/**
 * @param {Map} defines
 * @param {JSDocGenerator} soloDocs
 * @param {JSDocGenerator} duoDocs
 * @returns {string}
 */
export default function preprocess(defines, soloDocs, duoDocs) {
  void soloDocs, duoDocs;

  /*
  @type {Map<*, object>}
  #strongValueToInternalKeyMap = new Map;

  #getValueMap(baseValue) {
    return Object(value) === value ?
            this.#weakValueToInternalKeyMap :
            this.#strongValueToInternalKeyMap;
  }

  defines.get("getKeyMap") returns:
    "#strongValueToInternalKeyMap" if configuration.holdValuesStrongly
    "#weakValueToInternalKeyMap" if configuration.valuesMustBeObjects
    "#getValueMap(value)" otherwise
  */

  const weakKeyName = defines.get("weakKeyName");
  const bindOneToOneArgList1 = buildNumberedArgs(defines.get("bindArgList"), "_1", weakKeyName),
        bindOneToOneArgList2 = buildNumberedArgs(defines.get("bindArgList"), "_2", weakKeyName);

  const baseMapArgList1 = buildNumberedArgs(defines.get("baseArgList"), "_1", weakKeyName),
        baseMapArgList2 = buildNumberedArgs(defines.get("baseArgList"), "_2", weakKeyName);

  const baseMapArgs = buildArgNameList(defines.get("baseArgList")),
        baseMapArgs1 = buildArgNameList(baseMapArgList1),
        baseMapArgs2 = buildArgNameList(baseMapArgList2);

  const bindMapArgsWithValue = buildArgNameList(["value",...defines.get("bindArgList")]);
  const bindMapArgs = buildArgNameList(defines.get("bindArgList"));

  return `
class ${defines.get("className")} {
  /** @constant */
  #baseMap = new ${defines.get("baseClassName")};

  /** @type {WeakMap<object, object>} @constant */
  #weakValueToInternalKeyMap = new WeakMap;

${duoDocs.buildBlock("bindOneToOne")}
  bindOneToOne(${
    buildArgNameList([
      ...bindOneToOneArgList1,
      "value_1",
      ...bindOneToOneArgList2,
      "value_2"
    ])}) {
${defines.get("bindArgList").length ? `${
      bindOneToOneArgList1.map(argName =>`this.#requireValidKey("(${argName})", ${argName});`).join("\n    ")
    }
    this.#requireValidValue("value_1", value_1);
    ${
      bindOneToOneArgList2.map(argName =>`this.#requireValidKey("(${argName})", ${argName});`).join("\n    ")
    }
    this.#requireValidValue("value_2", value_2);
` : `this.#requireValidValue("value_1", value_1);
    this.#requireValidValue("value_2", value_2);
`}

    if (this.#weakValueToInternalKeyMap.has(value_2))
      throw new Error("value_2 already has a bound key set!");

    let ${weakKeyName} = this.#weakValueToInternalKeyMap.get(value_1);
    if (!${weakKeyName}) {
      ${weakKeyName} = {};
      this.#weakValueToInternalKeyMap.set(value_1, ${weakKeyName});
    }

    const __hasKeySet1__  = this.#baseMap.has(${baseMapArgs1});
    const __hasKeySet2__  = this.#baseMap.has(${baseMapArgs2});
    const __matchvalue_1__ = this.#baseMap.get(${baseMapArgs1}) === value_1;
    const __matchvalue_2__ = this.#baseMap.get(${baseMapArgs2}) === value_2;

    if (!__hasKeySet1__) {
      this.#baseMap.set(${baseMapArgs1}, value_1);
    }
    else if (!__matchvalue_1__) {
      throw new Error("value_1 mismatch!");
    }

    if (!__hasKeySet2__)
      this.#baseMap.set(${baseMapArgs2}, value_2);
    else if (!__matchvalue_2__)
    {
      throw new Error("value_2 mismatch!");
    }

    this.#weakValueToInternalKeyMap.set(value_2, ${weakKeyName});
  }

${soloDocs.buildBlock("delete")}
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

${soloDocs.buildBlock("get")}
  get(${bindMapArgsWithValue}) {
    const ${weakKeyName} = this.#weakValueToInternalKeyMap.get(value);
    return ${weakKeyName} ? this.#baseMap.get(${baseMapArgs}) : undefined;
  }

${soloDocs.buildBlock("has")}
  has(${bindMapArgsWithValue}) {
    const ${weakKeyName} = this.#weakValueToInternalKeyMap.has(value);
    return ${weakKeyName} ? this.#baseMap.has(${baseMapArgs}) : false;
  }

${soloDocs.buildBlock("isValidKey")}
  isValidKey(${bindMapArgs}) {
    return this.#isValidKey(${bindMapArgs});
  }

  #isValidKey(${bindMapArgs}) {
    const ${weakKeyName} = {};
    return this.#baseMap.isValidKey(${baseMapArgs});
  }

${soloDocs.buildBlock("isValidValue")}
  isValidValue(value) {
    void value;
    return true;
    // configuration.valuesMustBeObjects: Object(value) === value;
    // baseConfiguration.valueType.argumentValidator: this.#baseMap.isValidValue(value);
  }

${defines.get("bindArgList").length ? `
  #requireValidKey(__argNames__, strongKey) {
    if (!this.isValidKey(strongKey))
      throw new Error("Invalid key tuple: " + __argNames__);
  }
` : ``
}
  #requireValidValue(argName, value) {
    if (!this.isValidValue(value))
      throw new Error(argName + " is not a valid value!");
  }
}

Reflect.defineProperty(${defines.get("className")}, Symbol.toStringTag, {
  value: "${defines.get("className")}",
  writable: false,
  enumerable: false,
  configurable: true
});

Object.freeze(${defines.get("className")});
Object.freeze(${defines.get("className")}.prototype);
`}
