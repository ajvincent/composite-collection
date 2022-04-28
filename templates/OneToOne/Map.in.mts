import type { ReadonlyDefines, JSDocGenerator, TemplateFunction } from "../sharedTypes.mjs";

/**
 * Serialize keys.
 *
 * @param {string[]} keys The keys.
 * @returns {string} The keys serialized.
 */
function buildArgNameList(keys: string[]): string {
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
function buildNumberedArgs(args: string[], suffix: string, weakKeyName: string) : string[] {
  return args.map(arg => arg + ((arg === weakKeyName) ? "" : suffix));
}

/**
 * @param {Map}            defines  The preprocessor macros.
 * @param {JSDocGenerator} soloDocs Provides documentation for single key-value methods.
 * @param {JSDocGenerator} duoDocs  Provides documentation for .bindOneToOne().
 * @returns {string}                The generated source code.
 */
const preprocess: TemplateFunction = function(
  defines: ReadonlyDefines,
  soloDocs: JSDocGenerator,
  duoDocs: JSDocGenerator
)
{
  const bindArgList = defines.bindArgList;
  if (!Array.isArray(bindArgList))
    throw new Error("assertion: bindArgList must be an array!");

  const baseArgList = defines.baseArgList;
  if (!Array.isArray(baseArgList))
    throw new Error("assertion: baseArgList must be an array!");

  const weakKeyName = defines.weakKeyName;
  if (typeof weakKeyName !== "string")
    throw new Error("assertion: weakKeyName must be a string!");

  const bindOneToOneArgList1 = buildNumberedArgs(bindArgList, "_1", weakKeyName),
        bindOneToOneArgList2 = buildNumberedArgs(bindArgList, "_2", weakKeyName);

  const baseMapArgList1 = buildNumberedArgs(baseArgList, "_1", weakKeyName),
        baseMapArgList2 = buildNumberedArgs(baseArgList, "_2", weakKeyName);

  const baseMapArgs = buildArgNameList(baseArgList),
        baseMapArgs1 = buildArgNameList(baseMapArgList1),
        baseMapArgs2 = buildArgNameList(baseMapArgList2);

  const bindMapArgsWithValue = buildArgNameList(["value",...bindArgList]);
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
  bindOneToOne(${
    buildArgNameList([
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
      `"value_1 and value_2 are already in different one-to-one mappings!"`
    });
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
    return ${
      defines.baseClassValidatesValue ?
      "(Object(value) === value) && this.#baseMap.isValidValue(value)" :
      "Object(value) === value"
    };
  }

${bindArgList.length ? `
  #requireValidKey(__argNames__, ${bindMapArgs}) {
    if (!this.#isValidKey(${bindMapArgs}))
      throw new Error("Invalid key tuple: " + __argNames__);
  }
` : ``
}
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
  bindOneToOne(value_1, value_2) {${
    defines.baseClassValidatesKey ? `
    if (!this.isValidKey(value_1))
      throw new Error("value_1 mismatch!");
    if (!this.isValidKey(value_2))
      throw new Error("value_2 mismatch!");

` : ""
  }
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
   * @returns {boolean} True if the value is valid.${
defines.baseClassName !== "WeakMap" ? `
   * @see the base map class for further constraints.` : ""
   }
   * @public
   */
  isValidValue(value) {
    return ${
      defines.baseClassValidatesValue ?
        "(Object(value) === value) && super.isValidValue(value)" :
        "Object(value) === value"
    };
  }

  set(key, value) {
    void(key);
    void(value);
    throw new Error("Not implemented, use .bindOneToOne(value_1, value_2);");
  }

  [Symbol.toStringTag] = "${defines.className}";
}
    `;
  }

  return classDefinition + `
Object.freeze(${defines.className});
Object.freeze(${defines.className}.prototype);
`}

export default preprocess;
