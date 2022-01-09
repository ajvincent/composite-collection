/**
 * @returns {Array<string, MethodTemplate>[]} The templates to feed into a Map.
 */
export default function defaultMethods() {
  return [
    ["rootContainerMap", {
      isProperty: true,
      description: "The root map holding keys and values.",
      includeArgs: "none",
      headers: [
        "@type {Map<string, __className__~valueAndKeySet>}",
      ],
      footers: ["@constant"],
    }],

    ["rootContainerWeakMap", {
      isProperty: true,
      description: "The root map holding weak composite keys and values.",
      includeArgs: "none",
      headers: [
        "@type {WeakMap<WeakKey, *>}"
      ],
      footers: ["@constant"],
    }],

    ["rootContainerSet", {
      isProperty: true,
      description: "Storage of the Set's contents for quick iteration in .values().  The values are always frozen arrays.",
      includeArgs: "none",
      headers: [
        "@type {Map<hash, *[]>}",
      ],
      footers: ["@constant"],
    }],

    ["valueAndKeySet", {
      isTypeDef: true,
      includeArgs: "none",
      headers: [
        "@typedef __className__~valueAndKeySet",
        "@property {*}   value  The actual value we store.",
        "@property {*[]} keySet The set of keys we hashed.",
      ],
    }],

    ["getSize", {
      isProperty: true,
      description: "The number of elements in this collection.",
      includeArgs: "none",
      returnType: "number",
      footers: ["@public", "@constant"],
    }],

    ["getSizeOfSet", {
      description: "Get the size of a particular set.",
      includeArgs: "mapArguments",
      footers: ["@public"],
      returnType: "number",
      returnDescription: "The set size."
    }],

    ["mapSize", {
      isProperty: true,
      description: "The number of maps in this collection.",
      includeArgs: "none",
      returnType: "number",
      footers: ["@public", "@constant"],
    }],

    ["clear", {
      returnVoid: true,
      description: "Clear the collection.",
      includeArgs: "none",
      footers: ["@public"],
    }],

    ["clearSets", {
      returnVoid: true,
      description: "Clear all sets from the collection for a given map keyset.",
      includeArgs: "mapArguments",
      footers: ["@public"],
    }],

    ["delete", {
      description: "Delete an element from the collection by the given key sequence.",
      includeArgs: "excludeValue",
      returnType: "boolean",
      returnDescription: "True if we found the value and deleted it.",
      footers: ["@public"],
    }],

    ["deleteSets", {
      description: "Delete all sets from the collection by the given map sequence.",
      includeArgs: "mapArguments",
      returnType: "boolean",
      returnDescription: "True if we found the value and deleted it.",
      footers: ["@public"],
    }],

    ["entries", {
      description: "Return a new iterator for the key-value pairs of the collection.",
      includeArgs: "none",
      returnType: "Iterator<[__argList__, value]>",
      returnDescription: "The iterator.",
      footers: ["@public"],
    }],

    ["forEachMap", {
      returnVoid: true,
      description: "Iterate over the keys and values.",
      paramHeaders: [
        ["__className__~ForEachCallback", "callback", "A function to invoke for each iteration."]
      ],
      includeArgs: "none",
      footers: ["@public"],
    }],

    ["forEachSet", {
      returnVoid: true,
      description: "Iterate over the keys.",
      paramHeaders: [
        ["__className__~ForEachCallback", "callback", "A function to invoke for each iteration."]
      ],
      includeArgs: "none",
      footers: ["@public"],
    }],

    ["forEachMapSet", {
      returnVoid: true,
      description: "Iterate over the keys under a map in this collection.",
      paramHeaders: [
        ["__className__~ForEachCallback", "callback", "A function to invoke for each iteration."]
      ],
      includeArgs: "none",
      footers: ["@public"],
    }],

    ["forEachCallbackMap", {
      returnVoid: true,
      description: "@callback __className__~ForEachCallback",
      includeArgs: "excludeValue",
      paramHeaders: [
        ["__valueType__", "value", "__valueDesc__"],
      ],
      paramFooters: [
        ["__className__", "__collection__", "This collection."]
      ],
    }],

    ["forEachCallbackSet", {
      returnVoid: true,
      description: "@callback __className__~ForEachCallback",
      includeArgs: "all",
      paramFooters: [
        ["__className__", "__collection__", "This collection."]
      ],
    }],

    ["get", {
      description: "Get a value for a key set.",
      includeArgs: "excludeValue",
      returnType: "__valueType__?",
      returnDescription: "__valueDesc__  Undefined if it isn't in the collection.",
      footers: ["@public"],
    }],

    ["has", {
      description: "Report if the collection has a value for a key set.",
      includeArgs: "excludeValue",
      returnType: "boolean",
      returnDescription: "True if the key set refers to a value in the collection.",
      footers: ["@public"],
    }],

    ["hasSet", {
      description: "Report if the collection has any sets for a map.",
      includeArgs: "excludeValue",
      returnType: "boolean",
      returnDescription: "True if the key set refers to a value in the collection.",
      footers: ["@public"],
    }],

    ["keys", {
      description: "Return a new iterator for the key sets of the collection.",
      includeArgs: "none",
      returnType: "Iterator<[__argList__]>",
      returnDescription: "The iterator.",
      footers: ["@public"],
    }],

    ["set", {
      description: "Set a value for a key set.",
      includeArgs: "all",
      returnType: "__className__",
      returnDescription: "This collection.",
      footers: ["@public"],
    }],

    ["add", {
      description: "Add a key set to this collection.",
      includeArgs: "excludeValue",
      returnType: "__className__",
      returnDescription: "This collection.",
      footers: ["@public"],
    }],

    ["addSets", {
      description: "Add several sets to a map in this collection.",
      includeArgs: "mapArguments",
      paramFooters: [
        ['Set[]', '__sets__', "The sets to add."],
      ],
      returnType: "__className__",
      returnDescription: "This collection.",
      footers: ["@public"],
    }],

    ["values", {
      description: "Return a new iterator for the values of the collection.",
      includeArgs: "none",
      returnType: "Iterator<__valueType__>",
      returnDescription: "The iterator.",
      footers: ["@public"],
    }],

    ["valuesSet", {
      description: "Return a new iterator for the sets of the collection in a map.",
      includeArgs: "none",
      returnType: "Iterator<__valueType__>",
      returnDescription: "The set iterator.",
      footers: ["@public"],
    }],

    ["wrapIteratorMap", {
      description: "Bootstrap from the native Map's values() iterator to the kind of iterator we want.",
      paramHeaders: [
        ["function", "unpacker", "The transforming function for values."]
      ],
      includeArgs: "none",
      returnType: "Iterator<*>",
      returnDescription: "The caller's iterator."
    }],

    ["isValidKeyPublic", {
      description: "Determine if a set of keys is valid.",
      includeArgs: "excludeValue",
      returnType: "boolean",
      returnDescription: "True if the validation passes, false if it doesn't.",
      footers: ["@public"],
    }],

    ["isValidKeyPrivate", {
      description: "Determine if a set of keys is valid.",
      includeArgs: "excludeValue",
      returnType: "boolean",
      returnDescription: "True if the validation passes, false if it doesn't.",
    }],

    ["requireValidKey", {
      returnVoid: true,
      description: "Throw if the key set is not valid.",
      includeArgs: "excludeValue",
      footers: ["@throws for an invalid key set."]
    }],

    ["requireInnerCollectionPrivate", {
      description: "Require an inner collection exist for the given map keys.",
      includeArgs: "mapArguments",
      returnType: "__className__~InnerMap",
      returnDescription: "The inner collection."
    }],

    ["getExistingInnerCollectionPrivate", {
      description: "Get an existing inner collection for the given map keys.",
      includeArgs: "mapArguments",
      returnType: "__className__~InnerMap?",
      returnDescription: "The inner collection."
    }],

    ["requireValidMapKey", {
      returnVoid: true,
      description: "Throw if the map key set is not valid.",
      includeArgs: "mapArguments",
      footers: ["@throws for an invalid key set."]
    }],

    ["isValidMapKeyPrivate", {
      description: "Determine if a set of map keys is valid.",
      includeArgs: "mapArguments",
      returnType: "boolean",
      returnDescription: "True if the validation passes, false if it doesn't.",
    }],

    ["isValidSetKeyPrivate", {
      description: "Determine if a set of set keys is valid.",
      includeArgs: "setArguments",
      returnType: "boolean",
      returnDescription: "True if the validation passes, false if it doesn't.",
    }],

    ["isValidValuePublic", {
      description: "Determine if a value is valid.",
      includeArgs: "value",
      returnType: "boolean",
      returnDescription: "True if the validation passes, false if it doesn't.",
      footers: ["@public"],
    }],

    ["isValidValuePrivate", {
      description: "Determine if a value is valid.",
      includeArgs: "value",
      returnType: "boolean",
      returnDescription: "True if the validation passes, false if it doesn't.",
    }],
  ];
}
