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
            this.#valueType = parameter.argumentType;
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
                paramBlock.add(valueParam.argumentType || "*", valueParam.argumentName, valueParam.description || "");
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
                    paramBlock.add(param.argumentType || "*", param.argumentName, param.description || "");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSlNEb2NHZW5lcmF0b3IubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiSlNEb2NHZW5lcmF0b3IubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sY0FBYyxNQUFNLHNCQUFzQixDQUFDO0FBQ2xELE9BQU8sY0FBYyxNQUFNLGtDQUFrQyxDQUFDO0FBRTlELE9BQU8sY0FBYyxNQUFNLDZDQUE2QyxDQUFDO0FBR3pFLEtBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNyQixLQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7QUFFckI7Ozs7O0dBS0c7QUFDSCxNQUFlLFFBQVE7SUFDckIsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNWLElBQUksR0FBRyxFQUFFLENBQUM7SUFDVixhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQ25CLGNBQWMsR0FBYSxFQUFFLENBQUM7Q0FDL0I7QUFFRDs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVO0lBQ2QseUJBQXlCO0lBQ3pCLEtBQUssR0FBZSxFQUFFLENBQUM7SUFFdkIscUJBQXFCO0lBQ3JCLGdCQUFnQixHQUFHLENBQUMsQ0FBQztJQUVyQixxQkFBcUI7SUFDckIsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0lBRXJCOzs7Ozs7O09BT0c7SUFDSCxHQUFHLENBQUMsSUFBWSxFQUFFLElBQVksRUFBRSxXQUFXLEdBQUcsRUFBRTtRQUM5QyxNQUFNLENBQUMsYUFBYSxFQUFFLEdBQUcsY0FBYyxDQUFDLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFBQyxDQUFDLENBQUM7UUFFN0QsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxH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LElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVsQixPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENvbGxlY3Rpb25UeXBlIGZyb20gXCIuL0NvbGxlY3Rpb25UeXBlLm1qc1wiO1xuaW1wb3J0IGRlZmF1bHRNZXRob2RzIGZyb20gXCIuLi9qc2RvYy1tZXRob2Qtc2V0cy9kZWZhdWx0Lm1qc1wiO1xuXG5pbXBvcnQgTWV0aG9kVGVtcGxhdGUgZnJvbSBcIi4uL2pzZG9jLW1ldGhvZC1zZXRzL01ldGhvZFRlbXBsYXRlVHlwZS5tanNcIjtcbmltcG9ydCB0eXBlIHsgc3RyaW5nQW5kVGVtcGxhdGUgfSBmcm9tIFwiLi4vanNkb2MtbWV0aG9kLXNldHMvTWV0aG9kVGVtcGxhdGVUeXBlLm1qc1wiO1xuXG52b2lkKE1ldGhvZFRlbXBsYXRlKTtcbnZvaWQoQ29sbGVjdGlvblR5cGUpO1xuXG4vKipcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSAgIHR5cGUgICAgICAgIFRoZSBwYXJhbWV0ZXIgdHlwZS5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSAgIG5hbWUgICAgICAgIFRoZSBuYW1lIG9mIHRoZSBwYXJhbWV0ZXIuXG4gKiBAcHJvcGVydHkge3N0cmluZ30gICBmaXJzdERlc2NMaW5lIFRoZSBmaXJzdCBkZXNjcmlwdGlvbiBsaW5lLlxuICogQHByb3BlcnR5IHtzdHJpbmdbXX0gb3RoZXJEZXNjTGluZXMgVGhlIHJlbWFpbmluZyBkZXNjcmlwdGlvbiBsaW5lcy5cbiAqL1xuYWJzdHJhY3QgY2xhc3MgUGFyYW1CYWcge1xuICB0eXBlID0gXCJcIjtcbiAgbmFtZSA9IFwiXCI7XG4gIGZpcnN0RGVzY0xpbmUgPSBcIlwiO1xuICBvdGhlckRlc2NMaW5lczogc3RyaW5nW10gPSBbXTtcbn1cblxuLyoqXG4gKiBUaGlzIHJlcHJlc2VudHMgdGhlIHBhcmFtZXRlcnMgcGFydCBvZiBhIEpTRG9jIGNvbW1lbnQuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuY2xhc3MgUGFyYW1CbG9jayB7XG4gIC8qKiBAdHlwZSB7UGFyYW1CYWdbXX0gKi9cbiAgI3Jvd3M6IFBhcmFtQmFnW10gPSBbXTtcblxuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgI3R5cGVDb2x1bW5XaWR0aCA9IDA7XG5cbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICNuYW1lQ29sdW1uV2lkdGggPSAwO1xuXG4gIC8qKlxuICAgKiBBZGQgYSBwYXJhbWV0ZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlICAgICAgICBUaGUgcGFyYW1ldGVyIHR5cGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lICAgICAgICBUaGUgbmFtZSBvZiB0aGUgcGFyYW1ldGVyLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZGVzY3JpcHRpb24gVGhlIHBhcmFtZXRlcidzIGRlc2NyaXB0aW9uIHN0cmluZy5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgYWRkKHR5cGU6IHN0cmluZywgbmFtZTogc3RyaW5nLCBkZXNjcmlwdGlvbiA9IFwiXCIpIDogdm9pZCB7XG4gICAgY29uc3QgW2ZpcnN0RGVzY0xpbmUsIC4uLm90aGVyRGVzY0xpbmVzXSA9IGRlc2NyaXB0aW9uLnNwbGl0KFwiXFxuXCIpO1xuICAgIHRoaXMuI3Jvd3MucHVzaCh7dHlwZSwgbmFtZSwgZmlyc3REZXNjTGluZSwgb3RoZXJEZXNjTGluZXN9KTtcblxuICAgIGlmICh0aGlzLiN0eXBlQ29sdW1uV2lkdGggPCB0eXBlLmxlbmd0aCArIDIpXG4gICAgICB0aGlzLiN0eXBlQ29sdW1uV2lkdGggPSB0eXBlLmxlbmd0aCArIDI7XG5cbiAgICBpZiAodGhpcy4jbmFtZUNvbHVtbldpZHRoIDwgbmFtZS5sZW5ndGgpXG4gICAgICB0aGlzLiNuYW1lQ29sdW1uV2lkdGggPSBuYW1lLmxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGZvcm1hdHRlZCBwYXJhbWV0ZXIgbGluZXMuXG4gICAqXG4gICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gVGhlIGZvcm1hdHRlZCBKU0RvYyBzZWN0aW9uIGZvciBhcmd1bWVudHMuLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBnZXRMaW5lcygpIDogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLiNyb3dzLm1hcChyb3cgPT4ge1xuICAgICAgY29uc3QgdHlwZSA9IGB7JHtyb3cudHlwZX19YC5wYWRFbmQodGhpcy4jdHlwZUNvbHVtbldpZHRoKTtcbiAgICAgIGNvbnN0IG5hbWUgPSByb3cubmFtZS5wYWRFbmQodGhpcy4jbmFtZUNvbHVtbldpZHRoKTtcblxuICAgICAgbGV0IGZpcnN0RGVzY0xpbmUgPSBgQHBhcmFtICR7dHlwZX0gJHtuYW1lfSAke3Jvdy5maXJzdERlc2NMaW5lfWA7XG4gICAgICByZXR1cm4gW2ZpcnN0RGVzY0xpbmUsIC4uLnJvdy5vdGhlckRlc2NMaW5lcy5tYXAoXG4gICAgICAgIC8vIFdoeSAxMD8gIFwiICogQHBhcmFtIFwiLmxlbmd0aC4gIFRoaXMgaXMgdG8gaW5kZW50IHRoZSBvdGhlciBkZXNjcmlwdGlvbiBsaW5lcy5cbiAgICAgICAgZGVzYyA9PiBcIiBcIi5yZXBlYXQodGhpcy4jdHlwZUNvbHVtbldpZHRoICsgdGhpcy4jbmFtZUNvbHVtbldpZHRoICsgMTApICsgZGVzY1xuICAgICAgKV07XG4gICAgfSkuZmxhdCgpO1xuICB9XG59XG5cbi8qKlxuICogQSBnZW5lcmF0b3Igb2YgSlNEb2MgYmxvY2sgY29tbWVudHMgZnJvbSBNYXAvU2V0IHRlbXBsYXRlcyBhbmQgdXNlciBhcmd1bWVudHMuXG4gKlxuICogQHBhY2thZ2VcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSlNEb2NHZW5lcmF0b3Ige1xuICAvKiogQHR5cGUge01hcDxzdHJpbmcsIE1ldGhvZFRlbXBsYXRlPn0gKi9cbiAgI21ldGhvZFRlbXBsYXRlczogTWFwPHN0cmluZywgTWV0aG9kVGVtcGxhdGU+ID0gbmV3IE1hcDtcblxuICAvKiogQHR5cGUge2Jvb2xlYW59ICovXG4gICN0ZW1wbGF0ZUtleXNSZXBsYWNlZCA9IGZhbHNlO1xuXG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICAjY2xhc3NOYW1lOiBzdHJpbmc7XG5cbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICN2YWx1ZVR5cGUgPSBcIipcIjtcblxuICAvKiogQHR5cGUge3N0cmluZz99ICovXG4gICN2YWx1ZURlc2M6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAvKiogQHR5cGUge1NldDxDb2xsZWN0aW9uVHlwZT59IEBjb25zdGFudCAqL1xuICAjcGFyYW1zOiBTZXQ8Q29sbGVjdGlvblR5cGU+ID0gbmV3IFNldDtcblxuICAvKipcbiAgICogVHJ1ZSBpZiB3ZSBzaG91bGQgcmVwbGFjZSB0aGUgd29yZCBcIm1hcFwiIHdpdGggXCJzZXRcIiBpbiBvdXIgbWFpbiBkZXNjcmlwdGlvbnMuXG4gICAqXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAY29uc3RhbnRcbiAgICovXG4gICNpc1NldDogYm9vbGVhbjtcblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9ICBjbGFzc05hbWUgVGhlIGNsYXNzIG5hbWUuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNTZXQgICAgIFRydWUgaWYgd2UncmUgZG9jdW1lbnRpbmcgYSBzZXQsIGZhbHNlIGlmIGEgbWFwLlxuICAgKi9cbiAgY29uc3RydWN0b3IoY2xhc3NOYW1lOiBzdHJpbmcsIGlzU2V0OiBib29sZWFuKSB7XG4gICAgdGhpcy4jY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xuICAgIHRoaXMuI2lzU2V0ID0gaXNTZXQ7XG5cbiAgICB0aGlzLnNldE1ldGhvZFBhcmFtZXRlcnNEaXJlY3RseShkZWZhdWx0TWV0aG9kcygpKTtcbiAgfVxuXG4gIGFzeW5jIHNldE1ldGhvZFBhcmFtZXRlcnNCeU1vZHVsZShtb2R1bGVOYW1lOiBzdHJpbmcpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGFyYW1GdW5jdGlvbiA9IChhd2FpdCBpbXBvcnQoXCIjc291cmNlL2pzZG9jLW1ldGhvZC1zZXRzL1wiICsgbW9kdWxlTmFtZSArIFwiLm1qc1wiKSkuZGVmYXVsdDtcbiAgICB0aGlzLnNldE1ldGhvZFBhcmFtZXRlcnNEaXJlY3RseShwYXJhbUZ1bmN0aW9uKCkpO1xuICB9XG5cbiAgc2V0TWV0aG9kUGFyYW1ldGVyc0RpcmVjdGx5KGl0ZXJhYmxlOiBzdHJpbmdBbmRUZW1wbGF0ZVtdKSA6IHZvaWRcbiAge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShpdGVyYWJsZSkgfHwgKGl0ZXJhYmxlLmxlbmd0aCA9PT0gMCkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2QgcGFyYW1ldGVycyBtdXN0IGJlIGEgdHdvLWRpbWVuc2lvbmFsIGFycmF5IVwiKTtcblxuICAgIGNvbnN0IGtub3duTmFtZXM6IFNldDxzdHJpbmc+ID0gbmV3IFNldDtcbiAgICBpdGVyYWJsZS5mb3JFYWNoKChyb3c6IHN0cmluZ0FuZFRlbXBsYXRlLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBpZiAoIXJvd1swXS50cmltKCkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQXQgcm93ICR7aW5kZXh9LCBrZXkgaXMgbm90IGEgbm9uLWVtcHR5IHN0cmluZyFgKTtcbiAgICAgIGlmIChrbm93bk5hbWVzLmhhcyhyb3dbMF0pKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEF0IHJvdyAke2luZGV4fSwga2V5IFwiJHtyb3dbMF19XCIgaGFzIGFscmVhZHkgYXBwZWFyZWQhYCk7XG4gICAgICBrbm93bk5hbWVzLmFkZChyb3dbMF0pO1xuXG4gICAgICB0cnkge1xuICAgICAgICBKU0RvY0dlbmVyYXRvci4jdmFsaWRhdGVNZXRob2RUZW1wbGF0ZShyb3dbMV0pO1xuICAgICAgfVxuICAgICAgY2F0Y2ggKG1zZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEF0IHJvdyAke2luZGV4fSAoXCIke3Jvd1swXX1cIiksICR7bXNnfWApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy4jbWV0aG9kVGVtcGxhdGVzID0gbmV3IE1hcChpdGVyYWJsZSk7XG4gICAgdGhpcy4jdGVtcGxhdGVLZXlzUmVwbGFjZWQgPSBmYWxzZTtcbiAgfVxuXG4gIHN0YXRpYyAjdmFsaWRhdGVNZXRob2RUZW1wbGF0ZSh0ZW1wbGF0ZTogTWV0aG9kVGVtcGxhdGUpIDogdm9pZFxuICB7XG4gICAgaWYgKHRlbXBsYXRlLmlzVHlwZURlZikge1xuICAgICAgaWYgKHRlbXBsYXRlLmluY2x1ZGVBcmdzICE9PSBcIm5vbmVcIilcbiAgICAgICAgdGhyb3cgYHZhbHVlLmluY2x1ZGVBcmdzIG11c3QgYmUgXCJub25lXCIgZm9yIGEgdHlwZSBkZWZpbml0aW9uIWA7XG5cbiAgICAgIEpTRG9jR2VuZXJhdG9yLiNwcm9wZXJ0eUlzQXJyYXlPZlN0cmluZ3MoXCJ2YWx1ZS5oZWFkZXJzXCIsIHRlbXBsYXRlLmhlYWRlcnMsIGZhbHNlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBKU0RvY0dlbmVyYXRvci4jcHJvcGVydHlJc05vbldoaXRlc3BhY2VTdHJpbmcoXCJ2YWx1ZS5kZXNjcmlwdGlvblwiLCB0ZW1wbGF0ZS5kZXNjcmlwdGlvbik7XG5cbiAgICBpZiAoIUpTRG9jR2VuZXJhdG9yLiNpbmNsdWRlQXJnc1ZhbGlkU2V0Lmhhcyh0ZW1wbGF0ZS5pbmNsdWRlQXJncykpXG4gICAgICB0aHJvdyBcInZhbHVlLmluY2x1ZGVBcmdzIG11c3QgYmUgb25lIG9mOiBcIiArIEFycmF5LmZyb20oSlNEb2NHZW5lcmF0b3IuI2luY2x1ZGVBcmdzVmFsaWRTZXQudmFsdWVzKCkpLm1hcCh0ID0+IGBcIiR7dH1cImApLmpvaW4oXCIsIFwiKTtcblxuICAgIEpTRG9jR2VuZXJhdG9yLiNwcm9wZXJ0eUlzQXJyYXlPZlN0cmluZ3MoXCJ2YWx1ZS5oZWFkZXJzXCIsIHRlbXBsYXRlLmhlYWRlcnMsIHRydWUpO1xuICAgIEpTRG9jR2VuZXJhdG9yLiNwcm9wZXJ0eUlzMkRBcnJheU9mU3RyaW5ncyhcInZhbHVlLnBhcmFtSGVhZGVyc1wiLCB0ZW1wbGF0ZS5wYXJhbUhlYWRlcnMpO1xuICAgIEpTRG9jR2VuZXJhdG9yLiNwcm9wZXJ0eUlzMkRBcnJheU9mU3RyaW5ncyhcInZhbHVlLnBhcmFtRm9vdGVyc1wiLCB0ZW1wbGF0ZS5wYXJhbUZvb3RlcnMpO1xuICAgIEpTRG9jR2VuZXJhdG9yLiNwcm9wZXJ0eUlzQXJyYXlPZlN0cmluZ3MoXCJ2YWx1ZS5mb290ZXJzXCIsIHRlbXBsYXRlLmZvb3RlcnMsIHRydWUpO1xuXG4gICAgaWYgKCF0ZW1wbGF0ZS5pc1Byb3BlcnR5ICYmICF0ZW1wbGF0ZS5yZXR1cm5Wb2lkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBKU0RvY0dlbmVyYXRvci4jcHJvcGVydHlJc05vbldoaXRlc3BhY2VTdHJpbmcoXCJ2YWx1ZS5yZXR1cm5UeXBlXCIsIHRlbXBsYXRlLnJldHVyblR5cGUpO1xuICAgICAgfVxuICAgICAgY2F0Y2ggKGV4KSB7XG4gICAgICAgIHRocm93IGV4ICsgXCIgIChTZXQgdmFsdWUucmV0dXJuVm9pZCBpZiB0aGVyZSBpcyBubyByZXR1cm4gdmFsdWUuKVwiO1xuICAgICAgfVxuICAgICAgSlNEb2NHZW5lcmF0b3IuI3Byb3BlcnR5SXNOb25XaGl0ZXNwYWNlU3RyaW5nKFwidmFsdWUucmV0dXJuRGVzY3JpcHRpb25cIiwgdGVtcGxhdGUucmV0dXJuRGVzY3JpcHRpb24pO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyAjcHJvcGVydHlJczJEQXJyYXlPZlN0cmluZ3MoXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHZhbHVlOiBzdHJpbmdbXVtdIHwgdW5kZWZpbmVkXG4gICkgOiB2b2lkXG4gIHtcbiAgICBpZiAoIXZhbHVlKVxuICAgICAgcmV0dXJuO1xuICAgIHZhbHVlLmZvckVhY2goKHN1YnZhbHVlOiBzdHJpbmdbXSwgaW5kZXgpID0+IHtcbiAgICAgIEpTRG9jR2VuZXJhdG9yLiNwcm9wZXJ0eUlzQXJyYXlPZlN0cmluZ3MoXG4gICAgICAgIGAke25hbWV9WyR7aW5kZXh9XWAsIHN1YnZhbHVlLCBmYWxzZVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyAjcHJvcGVydHlJc0FycmF5T2ZTdHJpbmdzKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICB2YWx1ZTogc3RyaW5nW10gfCB1bmRlZmluZWQsXG4gICAgbWF5QmVNaXNzaW5nOiBib29sZWFuXG4gICkgOiB2b2lkXG4gIHtcbiAgICBpZiAoIXZhbHVlICYmIG1heUJlTWlzc2luZylcbiAgICAgIHJldHVybjtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpIHx8ICh2YWx1ZS5sZW5ndGggPT09IDApKVxuICAgICAgdGhyb3cgbmFtZSArIFwiIGlzIG5vdCBhbiBhcnJheSBvZiBub24tZW1wdHkgc3RyaW5ncyFcIjtcblxuICAgIHZhbHVlLmZvckVhY2goKHN1YnZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQsIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIEpTRG9jR2VuZXJhdG9yLiNwcm9wZXJ0eUlzTm9uV2hpdGVzcGFjZVN0cmluZyhcbiAgICAgICAgYCR7bmFtZX1bJHtpbmRleH1dYCwgc3VidmFsdWVcbiAgICAgIClcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyAjcHJvcGVydHlJc05vbldoaXRlc3BhY2VTdHJpbmcobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkKSA6IHZvaWRcbiAge1xuICAgIGlmICghdmFsdWU/LnRyaW0oKSlcbiAgICAgIHRocm93IGAke25hbWV9IG11c3QgYmUgYSBub24tZW1wdHkgc3RyaW5nIWA7XG4gIH1cblxuICBzdGF0aWMgI2luY2x1ZGVBcmdzVmFsaWRTZXQgPSBuZXcgU2V0KFtcbiAgICBcIm5vbmVcIixcbiAgICBcInZhbHVlXCIsXG4gICAgXCJhbGxcIixcbiAgICBcIm1hcEFyZ3VtZW50c1wiLFxuICAgIFwic2V0QXJndW1lbnRzXCIsXG4gICAgXCJleGNsdWRlVmFsdWVcIixcbiAgXSk7XG5cbiAgLyoqXG4gICAqIEFkZCBhIHBhcmFtZXRlciBkZWZpbml0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0ge0NvbGxlY3Rpb25UeXBlfSBwYXJhbWV0ZXIgVGhlIHBhcmFtZXRlciB0eXBlIGluZm9ybWF0aW9uLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBhZGRQYXJhbWV0ZXIocGFyYW1ldGVyOiBDb2xsZWN0aW9uVHlwZSkgOiB2b2lkIHtcbiAgICB0aGlzLiNwYXJhbXMuYWRkKHBhcmFtZXRlcik7XG4gICAgaWYgKHBhcmFtZXRlci5hcmd1bWVudE5hbWUgPT09IFwidmFsdWVcIikge1xuICAgICAgdGhpcy4jdmFsdWVUeXBlID0gcGFyYW1ldGVyLmFyZ3VtZW50VHlwZTtcbiAgICAgIHRoaXMuI3ZhbHVlRGVzYyA9IHBhcmFtZXRlci5kZXNjcmlwdGlvbjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVwbGFjZSBhbGwga2V5cyBpbiBvdXIgbWV0aG9kIHRlbXBsYXRlcy5cbiAgICovXG4gICNyZXBsYWNlQWxsS2V5cygpIDogdm9pZCB7XG4gICAgaWYgKHRoaXMuI3RlbXBsYXRlS2V5c1JlcGxhY2VkKVxuICAgICAgcmV0dXJuO1xuXG4gICAgbGV0IGtleU1hcDogTWFwPFJlZ0V4cCwgc3RyaW5nPjtcbiAgICB7XG4gICAgICBjb25zdCBhcmdMaXN0ID0gQXJyYXkuZnJvbSh0aGlzLiNwYXJhbXMudmFsdWVzKCkpLm1hcChwYXJhbSA9PiBwYXJhbS5hcmd1bWVudE5hbWUpO1xuICAgICAge1xuICAgICAgICBsZXQgaW5kZXggPSBhcmdMaXN0LmluZGV4T2YoXCJ2YWx1ZVwiKTtcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSlcbiAgICAgICAgICBhcmdMaXN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgICBjb25zdCByZWdFeHBTZXF1ZW5jZTogW1JlZ0V4cCwgc3RyaW5nXVtdID0gW1xuICAgICAgICBbL19fY2xhc3NOYW1lX18vZywgdGhpcy4jY2xhc3NOYW1lXSxcbiAgICAgICAgWy9fX3ZhbHVlVHlwZV9fL2csIHRoaXMuI3ZhbHVlVHlwZSB8fCBcIipcIl0sXG4gICAgICAgIFsvX192YWx1ZURlc2NfXy9nLCB0aGlzLiN2YWx1ZURlc2MgfHwgXCJUaGUgdmFsdWUuXCJdLFxuICAgICAgICBbL19fYXJnTGlzdF9fL2csIGFyZ0xpc3Quam9pbihcIiwgXCIpXSxcbiAgICAgIF07XG5cbiAgICAgIGtleU1hcCA9IG5ldyBNYXAocmVnRXhwU2VxdWVuY2UpO1xuICAgIH1cblxuICAgIHRoaXMuI21ldGhvZFRlbXBsYXRlcy5mb3JFYWNoKCh0ZW1wbGF0ZTogTWV0aG9kVGVtcGxhdGUpID0+IHtcbiAgICAgIHRlbXBsYXRlLmRlc2NyaXB0aW9uID0gSlNEb2NHZW5lcmF0b3IuI3JlcGxhY2VLZXlzKHRlbXBsYXRlLmRlc2NyaXB0aW9uLCBrZXlNYXApO1xuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh0ZW1wbGF0ZS5oZWFkZXJzKSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRlbXBsYXRlLmhlYWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0ZW1wbGF0ZS5oZWFkZXJzW2ldID0gSlNEb2NHZW5lcmF0b3IuI3JlcGxhY2VLZXlzKHRlbXBsYXRlLmhlYWRlcnNbaV0sIGtleU1hcCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGVtcGxhdGUucGFyYW1IZWFkZXJzKSkge1xuICAgICAgICB0ZW1wbGF0ZS5wYXJhbUhlYWRlcnMuZm9yRWFjaChoZWFkZXJSb3cgPT4ge1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGVhZGVyUm93Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoZWFkZXJSb3dbaV0gPSBKU0RvY0dlbmVyYXRvci4jcmVwbGFjZUtleXMoaGVhZGVyUm93W2ldLCBrZXlNYXApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHRlbXBsYXRlLnBhcmFtRm9vdGVycykpIHtcbiAgICAgICAgdGVtcGxhdGUucGFyYW1Gb290ZXJzLmZvckVhY2goZm9vdGVyUm93ID0+IHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZvb3RlclJvdy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZm9vdGVyUm93W2ldID0gSlNEb2NHZW5lcmF0b3IuI3JlcGxhY2VLZXlzKGZvb3RlclJvd1tpXSwga2V5TWFwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh0ZW1wbGF0ZS5mb290ZXJzKSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRlbXBsYXRlLmZvb3RlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0ZW1wbGF0ZS5mb290ZXJzW2ldID0gSlNEb2NHZW5lcmF0b3IuI3JlcGxhY2VLZXlzKHRlbXBsYXRlLmZvb3RlcnNbaV0sIGtleU1hcCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRlbXBsYXRlLnJldHVyblR5cGUpXG4gICAgICAgIHRlbXBsYXRlLnJldHVyblR5cGUgPSBKU0RvY0dlbmVyYXRvci4jcmVwbGFjZUtleXModGVtcGxhdGUucmV0dXJuVHlwZSwga2V5TWFwKTtcblxuICAgICAgaWYgKHRlbXBsYXRlLnJldHVybkRlc2NyaXB0aW9uKVxuICAgICAgICB0ZW1wbGF0ZS5yZXR1cm5EZXNjcmlwdGlvbiA9IEpTRG9jR2VuZXJhdG9yLiNyZXBsYWNlS2V5cyh0ZW1wbGF0ZS5yZXR1cm5EZXNjcmlwdGlvbiwga2V5TWFwKTtcbiAgICB9KTtcblxuICAgIHRoaXMuI3RlbXBsYXRlS2V5c1JlcGxhY2VkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlIGtleXMgaW4gYSBzdHJpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgdmFsdWUgICBUaGUgb3JpZ2luYWwgdmFsdWUuXG4gICAqIEBwYXJhbSB7TWFwPFJlZ0V4cCwgc3RyaW5nPn0ga2V5TWFwICBUaGUgZGlyZWN0aW9ucyBvbiB3aGF0IHRvIHJlcGxhY2UuXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSByZXZpc2VkIHZhbHVlLlxuICAgKi9cbiAgc3RhdGljICNyZXBsYWNlS2V5cyh2YWx1ZTogc3RyaW5nLCBrZXlNYXA6IE1hcDxSZWdFeHAsIHN0cmluZz4pOiBzdHJpbmcge1xuICAgIGtleU1hcC5mb3JFYWNoKFxuICAgICAgKG5ld0tleTogc3RyaW5nLCByZWdleHA6IFJlZ0V4cCkgPT4ge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UocmVnZXhwLCBuZXdLZXkpXG4gICAgICB9XG4gICAgKTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgYSBKU0RvYyBjb21tZW50IGJsb2NrLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGVtcGxhdGVOYW1lICBUaGUgbmFtZSBvZiB0aGUgdGVtcGxhdGUgdG8gdXNlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gYmFzZUluZGVudCAgICBUaGUgbnVtYmVyIG9mIHNwYWNlcyBlYWNoIGxpbmUgc2hvdWxkIGJlIGluZGVudGVkLlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tcGxldGVkIEpTRG9jIGNvbW1lbnQgdG8gaW5zZXJ0IGludG8gdGhlIHRlbXBsYXRlLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBidWlsZEJsb2NrKHRlbXBsYXRlTmFtZTogc3RyaW5nLCBiYXNlSW5kZW50OiBudW1iZXIpIDogc3RyaW5nXG4gIHtcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuI21ldGhvZFRlbXBsYXRlcy5nZXQodGVtcGxhdGVOYW1lKTtcblxuICAgIGlmICghdGVtcGxhdGUpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIHRlbXBsYXRlOiBcIiArIHRlbXBsYXRlTmFtZSk7XG5cbiAgICB0aGlzLiNyZXBsYWNlQWxsS2V5cygpO1xuXG4gICAgY29uc3QgbGluZXMgPSBbXCIvKipcIl07XG5cbiAgICBpZiAodGVtcGxhdGUuZGVzY3JpcHRpb24pIHtcbiAgICAgIGxpbmVzLnB1c2goXCIgKiBcIiArIHRlbXBsYXRlLmRlc2NyaXB0aW9uLCBcIiAqXCIpO1xuICAgIH1cblxuICAgIGlmIChBcnJheS5pc0FycmF5KHRlbXBsYXRlLmhlYWRlcnMpKSB7XG4gICAgICBsaW5lcy5wdXNoKC4uLnRlbXBsYXRlLmhlYWRlcnMubWFwKGxpbmUgPT4gXCIgKiBcIiArIGxpbmUpKTtcbiAgICB9XG5cbiAgICAvLyBwYXJhbWV0ZXJzXG4gICAge1xuICAgICAgY29uc3QgcGFyYW1CbG9jayA9IG5ldyBQYXJhbUJsb2NrO1xuXG4gICAgICAvLyBmaXJzdCBwYXNzOiAgZ2F0aGVyIHRoZSBwYXJhbWV0ZXJzIGludG8gb25lIG9iamVjdC5cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHRlbXBsYXRlLnBhcmFtSGVhZGVycykpIHtcbiAgICAgICAgdGVtcGxhdGUucGFyYW1IZWFkZXJzLmZvckVhY2gocm93ID0+IHtcbiAgICAgICAgICBjb25zdCBbdHlwZSwgbmFtZSwgZGVzY3JpcHRpb25dID0gcm93O1xuICAgICAgICAgIHBhcmFtQmxvY2suYWRkKHR5cGUsIG5hbWUsIGRlc2NyaXB0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0ZW1wbGF0ZS5pbmNsdWRlQXJncyA9PT0gXCJ2YWx1ZVwiKSB7XG4gICAgICAgIHZvaWQgbnVsbDtcbiAgICAgICAgY29uc3QgdmFsdWVQYXJhbSA9IEFycmF5LmZyb20odGhpcy4jcGFyYW1zLnZhbHVlcygpKS5maW5kKHBhcmFtID0+IHBhcmFtLmFyZ3VtZW50TmFtZSA9PT0gXCJ2YWx1ZVwiKTtcbiAgICAgICAgaWYgKCF2YWx1ZVBhcmFtKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInZhbHVlIHBhcmFtZXRlciBpcyByZXF1aXJlZCFcIik7XG4gICAgICAgIHBhcmFtQmxvY2suYWRkKFxuICAgICAgICAgIHZhbHVlUGFyYW0uYXJndW1lbnRUeXBlIHx8IFwiKlwiLFxuICAgICAgICAgIHZhbHVlUGFyYW0uYXJndW1lbnROYW1lLFxuICAgICAgICAgIHZhbHVlUGFyYW0uZGVzY3JpcHRpb24gfHwgXCJcIlxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAodGVtcGxhdGUuaW5jbHVkZUFyZ3MgIT09IFwibm9uZVwiKSB7XG4gICAgICAgIGxldCB2YWx1ZUZvdW5kID0gZmFsc2U7XG4gICAgICAgIHRoaXMuI3BhcmFtcy5mb3JFYWNoKHBhcmFtID0+IHtcbiAgICAgICAgICBpZiAoKHRlbXBsYXRlLmluY2x1ZGVBcmdzID09PSBcIm1hcEFyZ3VtZW50c1wiKSAmJiAhcGFyYW0ubWFwT3JTZXRUeXBlLmVuZHNXaXRoKFwiTWFwXCIpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIGlmICgodGVtcGxhdGUuaW5jbHVkZUFyZ3MgPT09IFwic2V0QXJndW1lbnRzXCIpICYmICFwYXJhbS5tYXBPclNldFR5cGUuZW5kc1dpdGgoXCJTZXRcIikpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgaWYgKCF0aGlzLiNpc1NldCAmJiBwYXJhbS5hcmd1bWVudE5hbWUgPT09IFwidmFsdWVcIikge1xuICAgICAgICAgICAgdmFsdWVGb3VuZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoKHRlbXBsYXRlLmluY2x1ZGVBcmdzID09PSBcImV4Y2x1ZGVWYWx1ZVwiKSlcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXJhbUJsb2NrLmFkZChcbiAgICAgICAgICAgIHBhcmFtLmFyZ3VtZW50VHlwZSB8fCBcIipcIixcbiAgICAgICAgICAgIHBhcmFtLmFyZ3VtZW50TmFtZSxcbiAgICAgICAgICAgIHBhcmFtLmRlc2NyaXB0aW9uIHx8IFwiXCJcbiAgICAgICAgICApO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXZhbHVlRm91bmQgJiYgIXRoaXMuI2lzU2V0ICYmICh0ZW1wbGF0ZS5pbmNsdWRlQXJncyA9PT0gXCJhbGxcIikpXG4gICAgICAgICAgcGFyYW1CbG9jay5hZGQoXCIqXCIsIFwidmFsdWVcIiwgXCJUaGUgdmFsdWUuXCIpXG4gICAgICB9XG5cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHRlbXBsYXRlLnBhcmFtRm9vdGVycykpIHtcbiAgICAgICAgdGVtcGxhdGUucGFyYW1Gb290ZXJzLmZvckVhY2gocm93ID0+IHtcbiAgICAgICAgICBjb25zdCBbdHlwZSwgbmFtZSwgZGVzY3JpcHRpb25dID0gcm93O1xuICAgICAgICAgIHBhcmFtQmxvY2suYWRkKHR5cGUsIG5hbWUsIGRlc2NyaXB0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhcmFtTGluZXMgPSBwYXJhbUJsb2NrLmdldExpbmVzKCk7XG4gICAgICBpZiAocGFyYW1MaW5lcy5sZW5ndGgpIHtcbiAgICAgICAgbGluZXMucHVzaCguLi5wYXJhbUxpbmVzLm1hcChwTGluZSA9PiBcIiAqIFwiICsgcExpbmUpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGVtcGxhdGUucmV0dXJuVHlwZSkge1xuICAgICAgbGV0IHJldHVybkxpbmUgPSBgICogQCR7dGVtcGxhdGUuaXNHZW5lcmF0b3IgPyBcInlpZWxkc1wiIDogXCJyZXR1cm5zXCJ9IHske3RlbXBsYXRlLnJldHVyblR5cGV9fWA7XG4gICAgICBpZiAodGVtcGxhdGUucmV0dXJuRGVzY3JpcHRpb24pXG4gICAgICAgIHJldHVybkxpbmUgKz0gXCIgXCIgKyB0ZW1wbGF0ZS5yZXR1cm5EZXNjcmlwdGlvbjtcbiAgICAgIGxpbmVzLnB1c2gocmV0dXJuTGluZSk7XG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodGVtcGxhdGUuZm9vdGVycykpIHtcbiAgICAgIGxpbmVzLnB1c2goLi4udGVtcGxhdGUuZm9vdGVycy5tYXAobGluZSA9PiBcIiAqIFwiICsgbGluZSkpO1xuICAgIH1cblxuICAgIHdoaWxlIChsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9PT0gXCIgKlwiKVxuICAgICAgbGluZXMucG9wKCk7XG5cbiAgICBsaW5lcy5wdXNoKFwiICovXCIpO1xuXG4gICAgcmV0dXJuIGxpbmVzLm1hcChsaW5lID0+IFwiIFwiLnJlcGVhdChiYXNlSW5kZW50KSArIGxpbmUpLmpvaW4oXCJcXG5cIik7XG4gIH1cbn1cbiJdfQ==