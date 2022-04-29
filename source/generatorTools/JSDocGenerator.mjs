import CollectionType from "./CollectionType.mjs";
import defaultMethods from "../jsdoc-method-sets/default.mjs";
import MethodTemplate from "../jsdoc-method-sets/MethodTemplateType.mjs";
void (MethodTemplate);
void (CollectionType);
/**
 * @property {string}   type        The parameter type.
 * @property {string}   name        The name of the parameter.
 * @property {string}   firstDescLine The first description line.
 * @property {string[]} otherDescLines The remaining description lines.
 */
class ParamBag {
    type = "";
    name = "";
    firstDescLine = "";
    otherDescLines = [];
}
/**
 * This represents the parameters part of a JSDoc comment.
 *
 * @private
 */
class ParamBlock {
    /** @type {ParamBag[]} */
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
        this.#rows.push({ type, name, firstDescLine, otherDescLines });
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
                desc => " ".repeat(this.#typeColumnWidth + this.#nameColumnWidth + 10) + desc)];
        }).flat();
    }
}
/**
 * A generator of JSDoc block comments from Map/Set templates and user arguments.
 *
 * @package
 */
export default class JSDocGenerator {
    /** @type {Map<string, MethodTemplate>} */
    #methodTemplates = new Map;
    /** @type {boolean} */
    #templateKeysReplaced = false;
    /** @type {string} */
    #className;
    /** @type {string} */
    #valueType = "*";
    /** @type {string?} */
    #valueDesc = undefined;
    /** @type {Set<CollectionType>} @constant */
    #params = new Set;
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
        this.setMethodParametersDirectly(defaultMethods());
    }
    async setMethodParametersByModule(moduleName) {
        const paramFunction = (await import("#source/jsdoc-method-sets/" + moduleName + ".mjs")).default;
        this.setMethodParametersDirectly(paramFunction());
    }
    setMethodParametersDirectly(iterable) {
        if (!Array.isArray(iterable) || (iterable.length === 0))
            throw new Error("Method parameters must be a two-dimensional array!");
        const knownNames = new Set;
        iterable.forEach((row, index) => {
            if (!row[0].trim())
                throw new Error(`At row ${index}, key is not a non-empty string!`);
            if (knownNames.has(row[0]))
                throw new Error(`At row ${index}, key "${row[0]}" has already appeared!`);
            knownNames.add(row[0]);
            try {
                JSDocGenerator.#validateMethodTemplate(row[1]);
            }
            catch (msg) {
                throw new Error(`At row ${index} ("${row[0]}"), ${msg}`);
            }
        });
        this.#methodTemplates = new Map(iterable);
        this.#templateKeysReplaced = false;
    }
    static #validateMethodTemplate(template) {
        if (template.isTypeDef) {
            if (template.includeArgs !== "none")
                throw `value.includeArgs must be "none" for a type definition!`;
            JSDocGenerator.#propertyIsArrayOfStrings("value.headers", template.headers, false);
            return;
        }
        JSDocGenerator.#propertyIsNonWhitespaceString("value.description", template.description);
        if (!JSDocGenerator.#includeArgsValidSet.has(template.includeArgs))
            throw "value.includeArgs must be one of: " + Array.from(JSDocGenerator.#includeArgsValidSet.values()).map(t => `"${t}"`).join(", ");
        JSDocGenerator.#propertyIsArrayOfStrings("value.headers", template.headers, true);
        JSDocGenerator.#propertyIs2DArrayOfStrings("value.paramHeaders", template.paramHeaders);
        JSDocGenerator.#propertyIs2DArrayOfStrings("value.paramFooters", template.paramFooters);
        JSDocGenerator.#propertyIsArrayOfStrings("value.footers", template.footers, true);
        if (!template.isProperty && !template.returnVoid) {
            try {
                JSDocGenerator.#propertyIsNonWhitespaceString("value.returnType", template.returnType);
            }
            catch (ex) {
                throw ex + "  (Set value.returnVoid if there is no return value.)";
            }
            JSDocGenerator.#propertyIsNonWhitespaceString("value.returnDescription", template.returnDescription);
        }
    }
    static #propertyIs2DArrayOfStrings(name, value) {
        if (!value)
            return;
        value.forEach((subvalue, index) => {
            JSDocGenerator.#propertyIsArrayOfStrings(`${name}[${index}]`, subvalue, false);
        });
    }
    static #propertyIsArrayOfStrings(name, value, mayBeMissing) {
        if (!value && mayBeMissing)
            return;
        if (!Array.isArray(value) || (value.length === 0))
            throw name + " is not an array of non-empty strings!";
        value.forEach((subvalue, index) => {
            JSDocGenerator.#propertyIsNonWhitespaceString(`${name}[${index}]`, subvalue);
        });
    }
    static #propertyIsNonWhitespaceString(name, value) {
        if (!value?.trim())
            throw `${name} must be a non-empty string!`;
    }
    static #includeArgsValidSet = new Set([
        "none",
        "value",
        "all",
        "mapArguments",
        "setArguments",
        "excludeValue",
    ]);
    /**
     * Add a parameter definition.
     *
     * @param {CollectionType} parameter The parameter type information.
     * @public
     */
    addParameter(parameter) {
        this.#params.add(parameter);
        if (parameter.argumentName === "value") {
            this.#valueType = parameter.jsDocType;
            this.#valueDesc = parameter.description;
        }
    }
    /**
     * Replace all keys in our method templates.
     */
    #replaceAllKeys() {
        if (this.#templateKeysReplaced)
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
            ];
            keyMap = new Map(regExpSequence);
        }
        this.#methodTemplates.forEach((template) => {
            template.description = JSDocGenerator.#replaceKeys(template.description, keyMap);
            if (Array.isArray(template.headers)) {
                for (let i = 0; i < template.headers.length; i++) {
                    template.headers[i] = JSDocGenerator.#replaceKeys(template.headers[i], keyMap);
                }
            }
            if (Array.isArray(template.paramHeaders)) {
                template.paramHeaders.forEach(headerRow => {
                    for (let i = 0; i < headerRow.length; i++) {
                        headerRow[i] = JSDocGenerator.#replaceKeys(headerRow[i], keyMap);
                    }
                });
            }
            if (Array.isArray(template.paramFooters)) {
                template.paramFooters.forEach(footerRow => {
                    for (let i = 0; i < footerRow.length; i++) {
                        footerRow[i] = JSDocGenerator.#replaceKeys(footerRow[i], keyMap);
                    }
                });
            }
            if (Array.isArray(template.footers)) {
                for (let i = 0; i < template.footers.length; i++) {
                    template.footers[i] = JSDocGenerator.#replaceKeys(template.footers[i], keyMap);
                }
            }
            if (template.returnType)
                template.returnType = JSDocGenerator.#replaceKeys(template.returnType, keyMap);
            if (template.returnDescription)
                template.returnDescription = JSDocGenerator.#replaceKeys(template.returnDescription, keyMap);
        });
        this.#templateKeysReplaced = true;
    }
    /**
     * Replace keys in a string.
     *
     * @param {string}              value   The original value.
     * @param {Map<RegExp, string>} keyMap  The directions on what to replace.
     * @returns {string} The revised value.
     */
    static #replaceKeys(value, keyMap) {
        keyMap.forEach((newKey, regexp) => {
            value = value.replace(regexp, newKey);
        });
        return value;
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
        const template = this.#methodTemplates.get(templateName);
        if (!template)
            throw new Error("Missing template: " + templateName);
        this.#replaceAllKeys();
        const lines = ["/**"];
        if (template.description) {
            lines.push(" * " + template.description, " *");
        }
        if (Array.isArray(template.headers)) {
            lines.push(...template.headers.map(line => " * " + line));
        }
        // parameters
        {
            const paramBlock = new ParamBlock;
            // first pass:  gather the parameters into one object.
            if (Array.isArray(template.paramHeaders)) {
                template.paramHeaders.forEach(row => {
                    const [type, name, description] = row;
                    paramBlock.add(type, name, description);
                });
            }
            if (template.includeArgs === "value") {
                void null;
                const valueParam = Array.from(this.#params.values()).find(param => param.argumentName === "value");
                if (!valueParam)
                    throw new Error("value parameter is required!");
                paramBlock.add(valueParam.jsDocType || "*", valueParam.argumentName, valueParam.description || "");
            }
            else if (template.includeArgs !== "none") {
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
                    paramBlock.add(param.jsDocType || "*", param.argumentName, param.description || "");
                });
                if (!valueFound && !this.#isSet && (template.includeArgs === "all"))
                    paramBlock.add("*", "value", "The value.");
            }
            if (Array.isArray(template.paramFooters)) {
                template.paramFooters.forEach(row => {
                    const [type, name, description] = row;
                    paramBlock.add(type, name, description);
                });
            }
            const paramLines = paramBlock.getLines();
            if (paramLines.length) {
                lines.push(...paramLines.map(pLine => " * " + pLine));
            }
        }
        if (template.returnType) {
            let returnLine = ` * @${template.isGenerator ? "yields" : "returns"} {${template.returnType}}`;
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
//# sourceMappingURL=JSDocGenerator.mjs.map