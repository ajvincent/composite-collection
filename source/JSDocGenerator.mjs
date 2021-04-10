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
  add(type, name, description) {
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
      let otherDescLines = [];
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
  /** @type {Map<string, MethodTemplate>} @readonly @private */
  #methodTemplates = new Map([
    ["rootContainer", {
      description: "The root map holding keys and values.",
      includeArgs: "none",
      headers: [
        "@type {Map}",
      ],
      footers: ["@private", "@readonly"],
    }],

    ["getSize", {
      description: "The number of elements in this map.",
      includeArgs: "none",
      footers: ["@public", "@readonly"],
    }],

    ["clear", {
      description: "Clear the map.",
      includeArgs: "none",
      footers: ["@public"],
    }],

    ["delete", {
      description: "Delete an element from the map by the given key sequence.",
      includeArgs: "excludeValue",
      returnType: "boolean",
      returnDescription: "True if we found the value and deleted it.",
      footers: ["@public"],
    }],

    ["entries", {
      description: "Return a new iterator for the key-value pairs of the map.",
      includeArgs: "none",
      returnType: "Iterator<__argList__, value>",
      footers: ["@public"],
    }],

    ["forEach", {
      description: "Iterate over the keys and values.",
      paramHeaders: [
        ["{__className__~ForEachCallback}", "callback", "A function to invoke for each key set."]
      ],
      includeArgs: "none",
      footers: ["@public"],
    }],

    ["forEachCallback", {
      description: "@callback __className__~ForEachCallback",
      includeArgs: "excludeValue",
      paramFooters: [
        ["__className__", "__map__", "The map."],
      ],
    }],

    ["get", {
      description: "Get a value for a key set.",
      includeArgs: "excludeValue",
      returnType: "__valueType__?",
      footers: ["@public"],
    }],

    ["has", {
      description: "Report if the map has a value for a key set.",
      includeArgs: "excludeValue",
      returnType: "boolean",
      returnDescription: "True if the key set refers to a value.",
      footers: ["@public"],
    }],

    ["keys", {
      description: "Return a new iterator for the key sets of the map.",
      includeArgs: "none",
      returnType: "Iterator<__argList__>",
      footers: ["@public"],
    }],

    ["set", {
      description: "Set a value for a key set.",
      includeArgs: "all",
      returnType: "__className__",
      returnDescription: "This map.",
      footers: ["@public"],
    }],

    ["add", {
      description: "Add a value for this key set.",
      includeArgs: "all",
      returnType: "__className__",
      returnDescription: "This set.",
      footers: ["@public"],
    }],

    ["values", {
      description: "Return a new iterator for the values of the map.",
      includeArgs: "none",
      returnType: "Iterator<void>",
      footers: ["@public"],
    }],

    ["wrapIteratorMap", {
      description: "Bootstrap from the native Map's values() iterator to the kind of iterator we want.",
      paramHeaders: [
        ["function", "unpacker", "The transforming function for values."]
      ],
      includeArgs: "none",
      returnType: "Iterator",
      footers: ["@private"],
    }],

    ["validateArguments", {
      description: "Validate the arguments.",
      includeArgs: "excludeValue",
      footers: ["@private"],
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

  /** @type {string} @private */
  #className = "";

  /** @type {string} @private */
  #valueType = "";

  /** @type {Param[]} @readonly @private */
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
   * @readonly
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
   * @param {string}   type         The parameter type.
   * @param {string}   name         The parameter name.
   * @param {string[]} description  The parameter description.
   *
   * @public
   */
  addParam(type, name, description) {
    this.#params.push({type, name, description});
    if (name === "value")
      this.#valueType = type;
  }

  /**
   * Replace all keys in our method templates.
   *
   * @private
   */
  #replaceAllKeys() {
    if (this.#methodTemplates.keysReplaced)
      return;

    let keyMap;
    {
      const regExpSequence = [
        [/__className__/g, this.#className],
        [/__valueType__/g, this.#valueType],
        [/__argList__/g, this.#params.map(param => param.name)],
      ]

      if (this.#isSet) {
        regExpSequence.unshift([/map/g, "set"], [/Map/g, "Set"]);
      }

      keyMap = new Map(regExpSequence);
    }

    this.#methodTemplates.forEach(template => {
      this.#replaceKeys(template, "description", keyMap);

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

      this.#replaceKeys(template, "returnType", keyMap);
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
    keyMap.forEach((newKey, regexp) => {
      object[propName] = object.propName.replace(regexp, newKey);
    });
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
    this.#replaceAllKeys();

    const lines = ["/**"];
    const template = JSDocGenerator.methodTemplates.get(templateName);

    lines.push(" * " + template.description, " *");

    if (Array.isArray(template.headers)) {
      lines.push(...template.headers, " *");
    }

    // parameters
    {
      const paramBlock = new ParamBlock;

      // first pass:  gather the parameters into one object.
      if (Array.isArray(template.paramHeaders)) {
        template.paramHeaders.forEach(row => paramBlock.add(...row));
      }

      if (template.includeArgs !== "none") {
        this.#params.forEach(param => {
          if ((param.name === "value") && (template.includeArgs === "excludeValue"))
            return;
          paramBlock.add(param.type, param.name, param.description);
        });
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

    lines.push(" */");

    return lines.map(line => " ".repeat(baseIndent) + line).join("\n");
  }
}
