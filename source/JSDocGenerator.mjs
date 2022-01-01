import CollectionType from "./CollectionType.mjs";

/** @private */
class ParamBlock {
  /** @type {object} */
  #rows = [];

  /** @type {number} */
  #typeColumnWidth = 0;

  /** @type {number} */
  #nameColumnWidth = 0;

  /**
   * Add a parameter.
   * @param {string} type
   * @param {string} name
   * @param {string} description
   *
   * @public
   */
  add(type, name, description = "") {
    const [firstDescLine, ...otherDescLines] = description.split("\n");
    this.#rows.push({type, name, firstDescLine, otherDescLines});

    if (this.#typeColumnWidth < type.length + 2)
      this.#typeColumnWidth = type.length + 2;

    if (this.#nameColumnWidth < name.length)
      this.#nameColumnWidth = name.length;
  }

  /**
   * Get the formatted parameter lines.
   *
   * @returns {string[]}
   * @public
   */
  getLines() {
    return this.#rows.map(row => {
      const type = `{${row.type}}`.padEnd(this.#typeColumnWidth);
      const name = row.name.padEnd(this.#nameColumnWidth);
      let firstDescLine = `@param ${type} ${name} ${row.firstDescLine}`;
      return [firstDescLine, ...row.otherDescLines.map(
        desc => " ".repeat(this.#typeColumnWidth + this.#nameColumnWidth + 10) + desc
      )];
    }).flat();
  }
}

/**
 * A generator of JSDoc block comments from Map/Set templates and user arguments.
 * @package
 */
export default class JSDocGenerator {
  /** @type {Map<string, MethodTemplate>} @constant */
  #methodTemplates = new Map([
    ["rootContainerMap", {
      description: "The root map holding keys and values.",
      includeArgs: "none",
      headers: [
        "@type {Map<string, __className__~valueAndKeySet>}",
      ],
      footers: ["@constant"],
    }],

    ["rootContainerWeakMap", {
      description: "The root map holding weak composite keys and values.",
      includeArgs: "none",
      headers: [
        "@type {WeakMap<WeakKey, *>}"
      ],
      footers: ["@constant"],
    }],

    ["rootContainerSet", {
      description: "Storage of the Set's contents for quick iteration in .values().  The values are always frozen arrays.",
      includeArgs: "none",
      headers: [
        "@type {Map<hash, *[]>}",
      ],
      footers: ["@constant"],
    }],

    ["valueAndKeySet", {
      includeArgs: "none",
      headers: [
        "@typedef __className__~valueAndKeySet",
        "@property {*}   value  The actual value we store.",
        "@property {*[]} keySet The set of keys we hashed.",
      ],
    }],

    ["getSize", {
      description: "The number of elements in this collection.",
      includeArgs: "none",
      footers: ["@public", "@constant"],
    }],

    ["getSizeOfSet", {
      description: "The number of elements in a particular set.",
      includeArgs: "mapArguments",
      footers: ["@public"],
    }],

    ["mapSize", {
      description: "The number of maps in this collection.",
      includeArgs: "none",
      footers: ["@public", "@constant"],
    }],

    ["clear", {
      description: "Clear the collection.",
      includeArgs: "none",
      footers: ["@public"],
    }],

    ["clearSets", {
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
      footers: ["@public"],
    }],

    ["forEachMap", {
      description: "Iterate over the keys and values.",
      paramHeaders: [
        ["__className__~ForEachCallback", "callback", "A function to invoke for each iteration."]
      ],
      includeArgs: "none",
      footers: ["@public"],
    }],

    ["forEachSet", {
      description: "Iterate over the keys.",
      paramHeaders: [
        ["__className__~ForEachCallback", "callback", "A function to invoke for each iteration."]
      ],
      includeArgs: "none",
      footers: ["@public"],
    }],

    ["forEachMapSet", {
      description: "Iterate over the keys under a map in this collection.",
      paramHeaders: [
        ["__className__~ForEachCallback", "callback", "A function to invoke for each iteration."]
      ],
      includeArgs: "none",
      footers: ["@public"],
    }],

    ["forEachCallbackMap", {
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
      footers: ["@public"],
    }],

    ["valuesSet", {
      description: "Return a new iterator for the sets of the collection in a map.",
      includeArgs: "none",
      returnType: "Iterator<__valueType__>",
      footers: ["@public"],
    }],

    ["wrapIteratorMap", {
      description: "Bootstrap from the native Map's values() iterator to the kind of iterator we want.",
      paramHeaders: [
        ["function", "unpacker", "The transforming function for values."]
      ],
      includeArgs: "none",
      returnType: "Iterator<*>",
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
      description: "Throw if the key set is not valid.",
      includeArgs: "excludeValue",
      footers: ["@throws for an invalid key set."]
    }],

    ["requireInnerCollectionPrivate", {
      description: "Require an inner collection exist for the given map keys.",
      includeArgs: "mapArguments",
    }],

    ["getExistingInnerCollectionPrivate", {
      description: "Get an existing inner collection for the given map keys.",
      includeArgs: "mapArguments",
      returnType: "__className__~InnerMap",
    }],

    ["requireValidMapKey", {
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
      includeArgs: "none",
      returnType: "boolean",
      returnDescription: "True if the validation passes, false if it doesn't.",
      footers: ["@public"],
    }],

    ["isValidValuePrivate", {
      description: "Determine if a value is valid.",
      includeArgs: "none",
      returnType: "boolean",
      returnDescription: "True if the validation passes, false if it doesn't.",
    }],
  ]);

  /**
   * @typedef MethodTemplate
   * @property {string}     description
   * @property {string[]}   headers
   * @property {string[][]} paramHeaders
   * @property {string}     includeArgs
   * @property {string[][]} paramFooters
   * @property {string}     returnType
   * @property {string?}    returnDescription
   * @property {string[]}   footers
   */

  /** @type {string} */
  #className = "";

  /** @type {string} */
  #valueType = "*";

  /** @type {string?} */
  #valueDesc = undefined;

  /** @type {Param[]} @constant */
  #params = [];

  /**
   * @typedef Param
   * @property {string}   type         The parameter type.
   * @property {string}   name         The parameter name.
   * @property {string[]} description  The parameter description.
   */

  /**
   * True if we should replace the word "map" with "set" in our main descriptions.
   * @type {boolean}
   * @constant
   */
  #isSet;

  /**
   * @param {string}  className The class name.
   * @param {boolean} isSet     True if we're documenting a set, false if a map.
   */
  constructor(className, isSet) {
    this.#className = className;
    this.#isSet = isSet;

    this.#methodTemplates.keysReplaced = false;
  }

  /**
   * Add a parameter definition.
   * @param {CollectionType} parameter The parameter type information.
   * @public
   */
  addParameter(parameter) {
    if (!(parameter instanceof CollectionType))
      throw new Error("parameter must be a CollectionType!")
    this.#params.push(parameter);
    if (parameter.argumentName === "value") {
      this.#valueType = parameter.argumentType;
      this.#valueDesc = parameter.description;
    }
  }

  /**
   * Replace all keys in our method templates.
   */
  #replaceAllKeys() {
    if (this.#methodTemplates.keysReplaced)
      return;

    let keyMap;
    {
      const argList = this.#params.map(param => param.argumentName);
      {
        let index = argList.indexOf("value");
        if (index !== -1)
          argList.splice(index, 1);
      }
      const regExpSequence = [
        [/__className__/g, this.#className],
        [/__valueType__/g, this.#valueType || "*"],
        [/__valueDesc__/g, this.#valueDesc || "The value."],
        [/__argList__/g, argList.join(", ")],
      ]

      keyMap = new Map(regExpSequence);
    }

    this.#methodTemplates.forEach(template => {
      this.#replaceKeys(template, "description", keyMap);

      if (Array.isArray(template.headers)) {
        for (let i = 0; i < template.headers.length; i++) {
          this.#replaceKeys(template.headers, i, keyMap);
        }
      }

      if (Array.isArray(template.paramHeaders)) {
        template.paramHeaders.forEach(headerRow => {
          for (let i = 0; i < headerRow.length; i++) {
            this.#replaceKeys(headerRow, i, keyMap);
          }
        });
      }

      if (Array.isArray(template.paramFooters)) {
        template.paramFooters.forEach(footerRow => {
          for (let i = 0; i < footerRow.length; i++) {
            this.#replaceKeys(footerRow, i, keyMap);
          }
        });
      }

      if (Array.isArray(template.footers)) {
        for (let i = 0; i < template.footers.length; i++) {
          this.#replaceKeys(template.footers, i, keyMap);
        }
      }

      this.#replaceKeys(template, "returnType", keyMap);
      this.#replaceKeys(template, "returnDescription", keyMap);
    });

    this.#methodTemplates.keysReplaced = true;
  }

  /**
   * Replace a key in an object's single property.
   *
   * @param {object} object               The object.
   * @param {string} propName             The name of the property.
   * @param {Map<RegExp, string>} keyMap  The directions on what to replace.
   */
  #replaceKeys(object, propName, keyMap) {
    if (!(propName in object))
      return;
    keyMap.forEach(
      (newKey, regexp) => object[propName] = object[propName].replace(regexp, newKey)
    );
  }

  /**
   * Build a JSDoc comment block.
   *
   * @param {string} templateName  The name of the template to use.
   * @param {number} baseIndent    The number of spaces each line should be indented.
   *
   * @returns {string}
   * @public
   */
  buildBlock(templateName, baseIndent) {
    if (!this.#methodTemplates.has(templateName))
      throw new Error("Missing template: " + templateName);

    this.#replaceAllKeys();

    const lines = ["/**"];
    const template = this.#methodTemplates.get(templateName);

    if (template.description) {
      lines.push(" * " + template.description, " *");
    }

    if (Array.isArray(template.headers)) {
      lines.push(...template.headers.map(line => " * " + line), " *");
    }

    // parameters
    {
      const paramBlock = new ParamBlock;

      // first pass:  gather the parameters into one object.
      if (Array.isArray(template.paramHeaders)) {
        template.paramHeaders.forEach(row => paramBlock.add(...row));
      }

      if (template.includeArgs !== "none") {
        let valueFound = false;
        this.#params.forEach(param => {
          if ((template.includeArgs === "mapArguments") && !param.mapOrSetType.endsWith("Map"))
            return;
          if ((template.includeArgs === "setArguments") && !param.mapOrSetType.endsWith("Set"))
            return;
          if (!this.#isSet && param.argumentName === "value") {
            valueFound = true;
            if ((template.includeArgs === "excludeValue"))
              return;
          }
          paramBlock.add(
            param.argumentType || "*",
            param.argumentName,
            param.description || ""
          );
        });

        if (!valueFound && !this.#isSet && (template.includeArgs === "all"))
          paramBlock.add("*", "value", "The value.")
      }

      if (Array.isArray(template.paramFooters)) {
        template.paramFooters.forEach(row => paramBlock.add(...row));
      }

      const paramLines = paramBlock.getLines();
      if (paramLines.length) {
        lines.push(...paramLines.map(pLine => " * " + pLine), " *");
      }
    }

    if (template.returnType) {
      let returnLine = ` * @returns {${template.returnType}}`;
      if (template.returnDescription)
        returnLine += " " + template.returnDescription;
      lines.push(returnLine);
    }

    if (Array.isArray(template.footers)) {
      lines.push(...template.footers.map(line => " * " + line));
    }

    while (lines[lines.length - 1] === " *")
      lines.pop();

    lines.push(" */");

    return lines.map(line => " ".repeat(baseIndent) + line).join("\n");
  }
}
