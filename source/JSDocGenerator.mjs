import CollectionType from "./CollectionType.mjs";
import defaultMethods from "./jsdoc-method-sets/default.mjs";

/**
 * This represents the parameters part of a JSDoc comment.
 *
 * @private
 */
class ParamBlock {
  /** @type {object} */
  #rows = [];

  /** @type {number} */
  #typeColumnWidth = 0;

  /** @type {number} */
  #nameColumnWidth = 0;

  /**
   * Add a parameter.
   *
   * @param {string} type        The parameter type.
   * @param {string} name        The name of the parameter.
   * @param {string} description The parameter's description string.
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
   * @returns {string[]} The formatted JSDoc section for arguments..
   * @public
   */
  getLines() {
    return this.#rows.map(row => {
      const type = `{${row.type}}`.padEnd(this.#typeColumnWidth);
      const name = row.name.padEnd(this.#nameColumnWidth);

      let firstDescLine = `@param ${type} ${name} ${row.firstDescLine}`;
      return [firstDescLine, ...row.otherDescLines.map(
        // Why 10?  " * @param ".length.  This is to indent the other description lines.
        desc => " ".repeat(this.#typeColumnWidth + this.#nameColumnWidth + 10) + desc
      )];
    }).flat();
  }
}

/**
 * A generator of JSDoc block comments from Map/Set templates and user arguments.
 *
 * @package
 */
export default class JSDocGenerator {
  /**
   * @typedef MethodTemplate
   * @property {string}      description        The descrption of the method's purpose.
   * @property {string[]?}   headers            JSDoc header lines before the parameter block.
   * @property {string[][]?} paramHeaders       Parameters from the template (not the user)
   * @property {string}      includeArgs        A flag to determine how public keys (and values) should be in the API.
   * @property {string[][]?} paramFooters       Parameters from the template (not the user)
   * @property {string?}     returnType         The return type for the specified function.
   * @property {string?}     returnDescription  A description of the return value to provide.
   * @property {string[]?}   footers            JSDoc footer lines after the parameters (and the return value).
   * @see jsdoc-method-sets/default.mjs for typical objects.
   */

  /** @type {Map<string, MethodTemplate>} @constant */
  #methodTemplates = new Map(defaultMethods());

  /** @type {string} */
  #className = "";

  /** @type {string} */
  #valueType = "*";

  /** @type {string?} */
  #valueDesc = undefined;

  /** @type {Set<Param>} @constant */
  #params = new Set;

  /**
   * @typedef Param
   * @property {string}   type         The parameter type.
   * @property {string}   name         The parameter name.
   * @property {string[]} description  The parameter description.
   */

  /**
   * True if we should replace the word "map" with "set" in our main descriptions.
   *
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

  async setMethodParameters(moduleName) {
    const paramFunction = (await import("#source/jsdoc-method-sets/" + moduleName + ".mjs")).default;
    this.#methodTemplates = new Map(paramFunction());
  }

  /**
   * Add a parameter definition.
   *
   * @param {CollectionType} parameter The parameter type information.
   * @public
   */
  addParameter(parameter) {
    if (!(parameter instanceof CollectionType))
      throw new Error("parameter must be a CollectionType!")
    this.#params.add(parameter);
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
      const argList = Array.from(this.#params.values()).map(param => param.argumentName);
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
   * @returns {string} The completed JSDoc comment to insert into the template.
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
