/**
 * @module source/CodeGenerator.mjs
 */
/** @typedef {string} identifier */
import CollectionConfiguration from "./CollectionConfiguration.mjs";
import ConfigurationData from "./generatorTools/ConfigurationData.mjs";
import CompileTimeOptions from "./CompileTimeOptions.mjs";
import CollectionType from "./generatorTools/CollectionType.mjs";
import { GeneratorPromiseSet, CodeGeneratorBase, generatorToPromiseSet, } from "./generatorTools/GeneratorPromiseSet.mjs";
import { Deferred } from "./utilities/PromiseTypes.mjs";
import JSDocGenerator from "./generatorTools/JSDocGenerator.mjs";
import TemplateGenerators from "./generatorTools/TemplateGenerators.mjs";
import fs from "fs/promises";
import path from "path";
import beautify from "js-beautify";
/** @package */
export default class CodeGenerator extends CodeGeneratorBase {
    // #region static private fields
    /**
     * Stringify a list of keys into an argument name list suitable for macros.
     *
     * @param {string[]} keys The key names.
     * @returns {string} The serialized key names.
     */
    static buildArgNameList(keys) {
        return '[' + keys.map(key => `"${key}"`).join(", ") + ']';
    }
    /** @constant */
    static #generatorToInternalFlags = new Map;
    /** @type {Map<string, string>} @constant */
    static #mapOfStrongSetsTemplates = new Map([
        /*
        key:
          S: strong
          W: weak
          /: before a slash is Map, after is Set
          n: more than one
          1: one
    
        So:
          "1W/nS" = one weak map key, multiple strong set keys
        */
        ["1S/nS", "Strong/OneMapOfStrongSets"],
        ["nS/1S", "Strong/MapOfOneStrongSet"],
        ["1S/1S", "Strong/OneMapOfOneStrongSet"],
        ["1W/nS", "Weak/OneMapOfStrongSets"],
        ["nW/1S", "Weak/MapOfOneStrongSet"],
        ["1W/1S", "Weak/OneMapOfOneStrongSet"],
    ]);
    // #endregion static private fields
    // #region private properties
    /** @type {object} @constant */
    #configurationData;
    /** @type {string} @constant */
    #targetPath;
    /** @type {CompileTimeOptions} @constant */
    #compileOptions;
    #pendingStart;
    #runPromise;
    /** @type {string} */
    #status = "not started yet";
    /** @type {Map<string, *>} @constant */
    #defines = new Map();
    /** @type {JSDocGenerator[]} */
    #docGenerators = [];
    /** @type {string} */
    #generatedCode = "";
    /** @type {Set<string>?} @constant */
    #internalFlagSet = new Set;
    /** @type {CodeGenerator | null} */
    #oneToOneSubGenerator = null;
    // #endregion private properties
    // #region public members
    /**
     * @param {CollectionConfiguration} configuration  The configuration to use.
     * @param {string}                  targetPath     The directory to write the collection to.
     * @param {CompileTimeOptions}      compileOptions Flags from an owner which may override configurations.
     */
    constructor(configuration, targetPath, compileOptions = {}) {
        super();
        this.#compileOptions = (compileOptions instanceof CompileTimeOptions) ? compileOptions : new CompileTimeOptions({});
        if (!(configuration instanceof CollectionConfiguration)) {
            throw new Error("Configuration isn't a CollectionConfiguration");
        }
        if (typeof targetPath !== "string")
            throw new Error("Target path should be a path to a file!");
        configuration.lock(); // this may throw, but if so, it's good that it does so.
        this.#configurationData = ConfigurationData.cloneData(configuration);
        this.#targetPath = targetPath;
        const gpSet = new GeneratorPromiseSet(this, path.dirname(targetPath));
        generatorToPromiseSet.set(this, gpSet);
        let deferred = new Deferred;
        this.#pendingStart = deferred.resolve;
        this.#runPromise = deferred.promise.then(() => this.#run());
        Object.seal(this);
    }
    /** @type {string} */
    get status() {
        return this.#status;
    }
    /**
     * @public
     * @type {string}
     *
     * The generated code at this point.  Used in #buildOneToOneBase() by a parent CodeGenerator.
     */
    get generatedCode() {
        return this.#generatedCode;
    }
    get requiresKeyHasher() {
        return this.#generatedCode?.includes(" new KeyHasher(");
    }
    get requiresWeakKeyComposer() {
        return this.#generatedCode?.includes(" new WeakKeyComposer(");
    }
    async run() {
        this.#pendingStart(null);
        return await this.#runPromise;
    }
    /**
     * @returns {Promise<identifier>} The class name.
     */
    async #run() {
        {
            const flags = CodeGenerator.#generatorToInternalFlags.get(this);
            if (flags)
                this.#internalFlagSet = flags;
        }
        const gpSet = generatorToPromiseSet.get(this);
        const hasInitialTasks = gpSet.has(this.#targetPath);
        const bp = gpSet.get(this.#targetPath);
        if (!hasInitialTasks) {
            bp.addTask(async () => {
                try {
                    return await this.#buildCollection();
                }
                catch (ex) {
                    this.#status = "aborted";
                    throw ex;
                }
            });
        }
        if (gpSet.owner !== this)
            return "";
        if (!gpSet.generatorsTarget.deepTargets.includes(this.#targetPath))
            gpSet.generatorsTarget.addSubtarget(this.#targetPath);
        await gpSet.runMain();
        return this.#configurationData.className;
    }
    // #endregion public members
    // #region private methods
    /**
     * Generate the code!
     *
     * @returns {identifier} The class name.
     * @see https://www.youtube.com/watch?v=nUCoYcxNMBE s/love/code/g
     */
    async #buildCollection() {
        this.#status = "in progress";
        if (this.#configurationData.collectionTemplate === "OneToOne/Map") {
            const base = this.#configurationData.oneToOneBase;
            const data = ConfigurationData.cloneData(base);
            if (data.className !== "WeakMap") {
                await this.#buildOneToOneBase(base);
            }
            this.#buildOneToOneDefines(base);
            await this.#buildOneToOneDocGenerators(base);
        }
        else {
            this.#buildDefines();
            this.#buildDocGenerator();
        }
        this.#generateSource();
        const gpSet = generatorToPromiseSet.get(this);
        if (this.requiresKeyHasher)
            gpSet.requireKeyHasher();
        if (this.requiresWeakKeyComposer)
            gpSet.requireWeakKeyComposer();
        if (!this.#internalFlagSet?.has("prevent export"))
            await this.#writeSource();
        this.#status = "completed";
        return this.#configurationData.className;
    }
    #filePrologue() {
        let fileOverview = "";
        if (!this.#internalFlagSet?.has("no @file") && this.#configurationData.fileOverview) {
            fileOverview = this.#configurationData.fileOverview;
            fileOverview = fileOverview.split("\n").map(line => " *" + (line.trim() ? " " + line : "")).join("\n");
        }
        let lines = [
            this.#compileOptions.licenseText ? this.#compileOptions.licenseText + "\n\n" : "",
            `/**
 * @file
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
`.trim(),
            this.#compileOptions.license ? ` * @license ${this.#compileOptions.license}` : "",
            this.#compileOptions.author ? ` * @author ${this.#compileOptions.author}` : "",
            this.#compileOptions.copyright ? ` * @copyright ${this.#compileOptions.copyright}` : "",
            fileOverview,
            " */"
        ];
        lines = lines.filter(Boolean);
        lines = lines.map(line => line === " * " ? " *" : line);
        let generatedCodeNotice = lines.join("\n");
        const prologue = [
            generatedCodeNotice.trim(),
        ];
        return prologue.filter(Boolean).join("\n\n");
    }
    #buildDefines() {
        this.#defines.clear();
        const data = this.#configurationData;
        this.#defines.set("className", data.className);
        const mapKeys = data.weakMapKeys.concat(data.strongMapKeys);
        const setKeys = data.weakSetElements.concat(data.strongSetElements);
        this.#defines.set("importLines", data.importLines);
        {
            const keys = Array.from(data.parameterToTypeMap.keys());
            this.#defines.set("argList", keys.join(", "));
            this.#defines.set("argNameList", CodeGenerator.buildArgNameList(keys));
        }
        const paramsData = Array.from(data.parameterToTypeMap.values());
        if (/Solo|Weak\/?Map/.test(data.collectionTemplate)) {
            this.#defineArgCountAndLists("weakMap", data.weakMapKeys);
            this.#defineArgCountAndLists("strongMap", data.strongMapKeys);
        }
        if (/Solo|Weak\/?Set/.test(data.collectionTemplate)) {
            this.#defineArgCountAndLists("weakSet", data.weakSetElements);
            this.#defineArgCountAndLists("strongSet", data.strongSetElements);
        }
        if (data.collectionTemplate.includes("MapOf")) {
            this.#defineArgCountAndLists("map", mapKeys);
            this.#defineArgCountAndLists("set", setKeys);
        }
        if (this.#defineValidatorCode(paramsData, "validateArguments", () => true))
            this.#defines.set("invokeValidate", true);
        this.#defineValidatorCode(paramsData, "validateMapArguments", pd => mapKeys.includes(pd.argumentName));
        this.#defineValidatorCode(paramsData, "validateSetArguments", pd => setKeys.includes(pd.argumentName));
        if (mapKeys.length) {
            const collection = data.parameterToTypeMap.get(mapKeys[0]);
            this.#defines.set("mapArgument0Type", collection.argumentType);
        }
        if (setKeys.length) {
            const collection = data.parameterToTypeMap.get(setKeys[0]);
            this.#defines.set("setArgument0Type", collection.argumentType);
        }
        if (data.valueType) {
            let filter = (data.valueType.argumentValidator || "").trim();
            if (filter)
                this.#defines.set("validateValue", filter + "\n    ");
            this.#defines.set("valueType", data.valueType.argumentType);
        }
    }
    #defineArgCountAndLists(prefix, keyArray) {
        this.#defines.set(prefix + "Count", keyArray.length);
        this.#defines.set(prefix + "ArgList", keyArray.join(", "));
        this.#defines.set(prefix + "ArgNameList", JSON.stringify(keyArray));
        if (keyArray.length)
            this.#defines.set(prefix + "Argument0", keyArray[0]);
    }
    #defineValidatorCode(paramsData, defineName, filter) {
        const validatorCode = paramsData.filter(filter).map(pd => {
            return pd.argumentValidator || "";
        }).filter(Boolean).join("\n\n").trim();
        if (validatorCode) {
            this.#defines.set(defineName, validatorCode);
        }
        return Boolean(validatorCode);
    }
    #buildOneToOneDefines(base) {
        this.#defines.clear();
        const data = this.#configurationData;
        const baseData = ConfigurationData.cloneData(base);
        this.#defines.set("className", data.className);
        this.#defines.set("baseClassName", baseData.className);
        this.#defines.set("configureOptions", data.oneToOneOptions);
        const weakKeyName = data.oneToOneKeyName;
        this.#defines.set("weakKeyName", weakKeyName);
        // bindOneToOne arguments
        let keys = Array.from(baseData.parameterToTypeMap.keys());
        this.#defines.set("baseArgList", keys.slice());
        keys.splice(keys.indexOf(weakKeyName), 1);
        this.#defines.set("bindArgList", keys);
        const wrapBaseClass = baseData.weakMapKeys.length + baseData.strongMapKeys.length >= 2;
        this.#defines.set("wrapBaseClass", wrapBaseClass);
        const parameters = Array.from(baseData.parameterToTypeMap.values());
        this.#defines.set("baseClassValidatesKey", parameters.some(param => param.argumentValidator));
        this.#defines.set("baseClassValidatesValue", Boolean(baseData.valueType?.argumentValidator));
    }
    #buildDocGenerator() {
        const generator = new JSDocGenerator(this.#configurationData.className, !this.#configurationData.collectionTemplate.endsWith("Map"));
        this.#configurationData.parameterToTypeMap.forEach(typeData => {
            generator.addParameter(typeData);
        });
        if (this.#configurationData.valueType && !this.#configurationData.parameterToTypeMap.has("value")) {
            generator.addParameter(this.#configurationData.valueType);
        }
        this.#docGenerators.push(generator);
    }
    async #buildOneToOneDocGenerators(base) {
        const baseData = ConfigurationData.cloneData(base);
        // For the solo doc generator, the value argument comes first.
        let generator = await this.#createOneToOneGenerator("oneToOneSoloArg");
        generator.addParameter(baseData.valueType || new CollectionType("value", "Map", "*", "The value.", ""));
        this.#appendTypesToDocGenerator(base, generator, "", false);
        // For the duo doc generator, there are two of each argument, and two values.
        generator = await this.#createOneToOneGenerator("oneToOneDuoArg");
        this.#appendTypesToDocGenerator(base, generator, "_1", true);
        this.#appendTypesToDocGenerator(base, generator, "_2", true);
    }
    async #createOneToOneGenerator(moduleName) {
        const generator = new JSDocGenerator(this.#configurationData.className, false);
        await generator.setMethodParametersByModule(moduleName);
        this.#docGenerators.push(generator);
        return generator;
    }
    #appendTypesToDocGenerator(base, generator, typeSuffix, addValue) {
        const baseData = ConfigurationData.cloneData(base);
        baseData.parameterToTypeMap.delete(this.#configurationData.oneToOneKeyName);
        baseData.parameterToTypeMap.forEach(typeData => {
            generator.addParameter(new CollectionType(typeData.argumentName + typeSuffix, typeData.mapOrSetType, typeData.argumentType, typeData.description, typeData.argumentValidator));
        });
        if (addValue) {
            let { argumentName = "value", mapOrSetType = "Map", argumentType = "*", description = "The value.", argumentValidator = "" } = baseData.valueType || {};
            argumentName += typeSuffix;
            generator.addParameter(new CollectionType(argumentName, mapOrSetType, argumentType, description, argumentValidator));
        }
    }
    #generateSource() {
        const generator = TemplateGenerators.get(this.#chooseCollectionTemplate());
        let codeSegments = [
            this.#generatedCode,
            generator(this.#defines, ...this.#docGenerators),
        ];
        if (!this.#internalFlagSet?.has("prevent export")) {
            codeSegments = [
                this.#filePrologue(),
                ...codeSegments,
                `export default ${this.#configurationData.className};`
            ];
        }
        this.#generatedCode = codeSegments.flat(Infinity).filter(Boolean).join("\n\n");
        this.#generatedCode = beautify(this.#generatedCode, {
            "indent_size": 2,
            "indent_char": " ",
            "end_with_newline": true,
        });
        this.#generatedCode = this.#generatedCode.replace(/\n{3,}/g, "\n\n");
    }
    #chooseCollectionTemplate() {
        let startTemplate = this.#configurationData.collectionTemplate;
        const weakMapCount = this.#configurationData.weakMapKeys?.length || 0, strongMapCount = this.#configurationData.strongMapKeys?.length || 0, weakSetCount = this.#configurationData.weakSetElements?.length || 0, strongSetCount = this.#configurationData.strongSetElements?.length || 0;
        const mapCount = weakMapCount + strongMapCount, setCount = weakSetCount + strongSetCount;
        if (mapCount && setCount && !this.#compileOptions.disableKeyOptimization) {
            // Map of Sets, maybe optimized
            const shortKey = [
                mapCount > 1 ? "n" : "1",
                weakMapCount ? "W" : "S",
                "/",
                setCount > 1 ? "n" : "1",
                weakSetCount ? "W" : "S"
            ].join("");
            // console.log(`\n\n${shortKey} ${Array.from(this.#defines.keys()).join(", ")}\n\n`);
            return CodeGenerator.#mapOfStrongSetsTemplates.get(shortKey) || startTemplate;
        }
        return startTemplate;
    }
    async #writeSource() {
        return fs.writeFile(this.#targetPath, this.#generatedCode, { encoding: "utf-8" });
    }
    async #buildOneToOneBase(base) {
        const baseData = ConfigurationData.cloneData(base);
        if (baseData.className === "WeakMap")
            return;
        if (typeof base === "symbol")
            throw new Error("assertion: unreachable");
        if (this.#configurationData.oneToOneOptions?.pathToBaseModule) {
            this.#generatedCode += `import ${baseData.className} from "${this.#configurationData.oneToOneOptions.pathToBaseModule}";`;
            this.#generatedCode += baseData.importLines;
            this.#generatedCode += "\n";
            return;
        }
        const subCompileOptions = Object.create(this.#compileOptions);
        const internalFlags = new Set([
            "prevent export",
            "configuration ok",
            "no @file",
        ]);
        this.#oneToOneSubGenerator = new CodeGenerator(base, this.#targetPath, subCompileOptions);
        CodeGenerator.#generatorToInternalFlags.set(this.#oneToOneSubGenerator, internalFlags);
        await this.#oneToOneSubGenerator.run();
        this.#generatedCode += this.#oneToOneSubGenerator.generatedCode + "\n";
    }
}
Object.freeze(CodeGenerator);
Object.freeze(CodeGenerator.prototype);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29kZUdlbmVyYXRvci5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJDb2RlR2VuZXJhdG9yLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILG1DQUFtQztBQUVuQyxPQUFPLHVCQUF1QixNQUFNLCtCQUErQixDQUFDO0FBQ3BFLE9BQU8saUJBQXNDLE1BQU0sd0NBQXdDLENBQUM7QUFDNUYsT0FBTyxrQkFBa0IsTUFBTSwwQkFBMEIsQ0FBQztBQUUxRCxPQUFPLGNBQWMsTUFBTSxxQ0FBcUMsQ0FBQztBQUNqRSxPQUFPLEVBQ0wsbUJBQW1CLEVBQ25CLGlCQUFpQixFQUNqQixxQkFBcUIsR0FDdEIsTUFBTSwwQ0FBMEMsQ0FBQztBQUVsRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFHeEQsT0FBTyxjQUFjLE1BQU0scUNBQXFDLENBQUM7QUFDakUsT0FBTyxrQkFBd0MsTUFBTSx5Q0FBeUMsQ0FBQztBQUUvRixPQUFPLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDN0IsT0FBTyxJQUFJLE1BQU0sTUFBTSxDQUFDO0FBQ3hCLE9BQU8sUUFBUSxNQUFNLGFBQWEsQ0FBQztBQUtuQyxlQUFlO0FBQ2YsTUFBTSxDQUFDLE9BQU8sT0FBTyxhQUFjLFNBQVEsaUJBQWlCO0lBQzFELGdDQUFnQztJQUNoQzs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFjO1FBQ3BDLE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQTtJQUMzRCxDQUFDO0lBRUQsZ0JBQWdCO0lBQ2hCLE1BQU0sQ0FBQyx5QkFBeUIsR0FBc0MsSUFBSSxHQUFHLENBQUM7SUFFOUUsNENBQTRDO0lBQzVDLE1BQU0sQ0FBQyx5QkFBeUIsR0FBd0IsSUFBSSxHQUFH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b3VyY2UvQ29kZUdlbmVyYXRvci5tanNcbiAqL1xuXG4vKiogQHR5cGVkZWYge3N0cmluZ30gaWRlbnRpZmllciAqL1xuXG5pbXBvcnQgQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24gZnJvbSBcIi4vQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24ubWpzXCI7XG5pbXBvcnQgQ29uZmlndXJhdGlvbkRhdGEsIHsgb25lVG9PbmVPcHRpb25zIH0gZnJvbSBcIi4vZ2VuZXJhdG9yVG9vbHMvQ29uZmlndXJhdGlvbkRhdGEubWpzXCI7XG5pbXBvcnQgQ29tcGlsZVRpbWVPcHRpb25zIGZyb20gXCIuL0NvbXBpbGVUaW1lT3B0aW9ucy5tanNcIjtcblxuaW1wb3J0IENvbGxlY3Rpb25UeXBlIGZyb20gXCIuL2dlbmVyYXRvclRvb2xzL0NvbGxlY3Rpb25UeXBlLm1qc1wiO1xuaW1wb3J0IHtcbiAgR2VuZXJhdG9yUHJvbWlzZVNldCxcbiAgQ29kZUdlbmVyYXRvckJhc2UsXG4gIGdlbmVyYXRvclRvUHJvbWlzZVNldCxcbn0gZnJvbSBcIi4vZ2VuZXJhdG9yVG9vbHMvR2VuZXJhdG9yUHJvbWlzZVNldC5tanNcIjtcblxuaW1wb3J0IHsgRGVmZXJyZWQgfSBmcm9tIFwiLi91dGlsaXRpZXMvUHJvbWlzZVR5cGVzLm1qc1wiO1xuaW1wb3J0IHR5cGUgeyBQcm9taXNlUmVzb2x2ZXIgfSBmcm9tIFwiLi91dGlsaXRpZXMvUHJvbWlzZVR5cGVzLm1qc1wiO1xuXG5pbXBvcnQgSlNEb2NHZW5lcmF0b3IgZnJvbSBcIi4vZ2VuZXJhdG9yVG9vbHMvSlNEb2NHZW5lcmF0b3IubWpzXCI7XG5pbXBvcnQgVGVtcGxhdGVHZW5lcmF0b3JzLCB7IFRlbXBsYXRlRnVuY3Rpb24gfSBmcm9tIFwiLi9nZW5lcmF0b3JUb29scy9UZW1wbGF0ZUdlbmVyYXRvcnMubWpzXCI7XG5cbmltcG9ydCBmcyBmcm9tIFwiZnMvcHJvbWlzZXNcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgYmVhdXRpZnkgZnJvbSBcImpzLWJlYXV0aWZ5XCI7XG5cbnR5cGUgSW50ZXJuYWxGbGFncyA9IFNldDxzdHJpbmc+O1xuZXhwb3J0IHR5cGUgUHJlcHJvY2Vzc29yRGVmaW5lcyA9IE1hcDxzdHJpbmcsIHN0cmluZyB8IHN0cmluZ1tdIHwgYm9vbGVhbiB8IG51bWJlciB8IG9uZVRvT25lT3B0aW9ucyB8IG51bGw+XG5cbi8qKiBAcGFja2FnZSAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29kZUdlbmVyYXRvciBleHRlbmRzIENvZGVHZW5lcmF0b3JCYXNlIHtcbiAgLy8gI3JlZ2lvbiBzdGF0aWMgcHJpdmF0ZSBmaWVsZHNcbiAgLyoqXG4gICAqIFN0cmluZ2lmeSBhIGxpc3Qgb2Yga2V5cyBpbnRvIGFuIGFyZ3VtZW50IG5hbWUgbGlzdCBzdWl0YWJsZSBmb3IgbWFjcm9zLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBrZXlzIFRoZSBrZXkgbmFtZXMuXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzZXJpYWxpemVkIGtleSBuYW1lcy5cbiAgICovXG4gIHN0YXRpYyBidWlsZEFyZ05hbWVMaXN0KGtleXM6IHN0cmluZ1tdKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuICdbJyArIGtleXMubWFwKGtleSA9PiBgXCIke2tleX1cImApLmpvaW4oXCIsIFwiKSArICddJ1xuICB9XG5cbiAgLyoqIEBjb25zdGFudCAqL1xuICBzdGF0aWMgI2dlbmVyYXRvclRvSW50ZXJuYWxGbGFnczogTWFwPENvZGVHZW5lcmF0b3IsIEludGVybmFsRmxhZ3M+ID0gbmV3IE1hcDtcblxuICAvKiogQHR5cGUge01hcDxzdHJpbmcsIHN0cmluZz59IEBjb25zdGFudCAqL1xuICBzdGF0aWMgI21hcE9mU3Ryb25nU2V0c1RlbXBsYXRlczogTWFwPHN0cmluZywgc3RyaW5nPiA9IG5ldyBNYXAoW1xuICAgIC8qXG4gICAga2V5OlxuICAgICAgUzogc3Ryb25nXG4gICAgICBXOiB3ZWFrXG4gICAgICAvOiBiZWZvcmUgYSBzbGFzaCBpcyBNYXAsIGFmdGVyIGlzIFNldFxuICAgICAgbjogbW9yZSB0aGFuIG9uZVxuICAgICAgMTogb25lXG5cbiAgICBTbzpcbiAgICAgIFwiMVcvblNcIiA9IG9uZSB3ZWFrIG1hcCBrZXksIG11bHRpcGxlIHN0cm9uZyBzZXQga2V5c1xuICAgICovXG4gICAgW1wiMVMvblNcIiwgXCJTdHJvbmcvT25lTWFwT2ZTdHJvbmdTZXRzXCJdLFxuICAgIFtcIm5TLzFTXCIsIFwiU3Ryb25nL01hcE9mT25lU3Ryb25nU2V0XCJdLFxuICAgIFtcIjFTLzFTXCIsIFwiU3Ryb25nL09uZU1hcE9mT25lU3Ryb25nU2V0XCJdLFxuXG4gICAgW1wiMVcvblNcIiwgXCJXZWFrL09uZU1hcE9mU3Ryb25nU2V0c1wiXSxcbiAgICBbXCJuVy8xU1wiLCBcIldlYWsvTWFwT2ZPbmVTdHJvbmdTZXRcIl0sXG4gICAgW1wiMVcvMVNcIiwgXCJXZWFrL09uZU1hcE9mT25lU3Ryb25nU2V0XCJdLFxuICBdKTtcblxuICAvLyAjZW5kcmVnaW9uIHN0YXRpYyBwcml2YXRlIGZpZWxkc1xuXG4gIC8vICNyZWdpb24gcHJpdmF0ZSBwcm9wZXJ0aWVzXG4gIC8qKiBAdHlwZSB7b2JqZWN0fSBAY29uc3RhbnQgKi9cbiAgI2NvbmZpZ3VyYXRpb25EYXRhOiBDb25maWd1cmF0aW9uRGF0YTtcblxuICAvKiogQHR5cGUge3N0cmluZ30gQGNvbnN0YW50ICovXG4gICN0YXJnZXRQYXRoOiBzdHJpbmc7XG5cbiAgLyoqIEB0eXBlIHtDb21waWxlVGltZU9wdGlvbnN9IEBjb25zdGFudCAqL1xuICAjY29tcGlsZU9wdGlvbnM6IENvbXBpbGVUaW1lT3B0aW9ucztcblxuXG4gICNwZW5kaW5nU3RhcnQ6IFByb21pc2VSZXNvbHZlcjxudWxsPjtcblxuICAjcnVuUHJvbWlzZTogUmVhZG9ubHk8UHJvbWlzZTxzdHJpbmc+PjtcblxuICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgI3N0YXR1cyA9IFwibm90IHN0YXJ0ZWQgeWV0XCI7XG5cbiAgLyoqIEB0eXBlIHtNYXA8c3RyaW5nLCAqPn0gQGNvbnN0YW50ICovXG4gICNkZWZpbmVzOiBQcmVwcm9jZXNzb3JEZWZpbmVzID0gbmV3IE1hcCgpO1xuXG4gIC8qKiBAdHlwZSB7SlNEb2NHZW5lcmF0b3JbXX0gKi9cbiAgI2RvY0dlbmVyYXRvcnM6IEpTRG9jR2VuZXJhdG9yW10gPSBbXTtcblxuICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgI2dlbmVyYXRlZENvZGUgPSBcIlwiO1xuXG4gIC8qKiBAdHlwZSB7U2V0PHN0cmluZz4/fSBAY29uc3RhbnQgKi9cbiAgI2ludGVybmFsRmxhZ1NldDogSW50ZXJuYWxGbGFncyA9IG5ldyBTZXQ7XG5cbiAgLyoqIEB0eXBlIHtDb2RlR2VuZXJhdG9yIHwgbnVsbH0gKi9cbiAgI29uZVRvT25lU3ViR2VuZXJhdG9yOiBDb2RlR2VuZXJhdG9yIHwgbnVsbCA9IG51bGw7XG5cbiAgLy8gI2VuZHJlZ2lvbiBwcml2YXRlIHByb3BlcnRpZXNcblxuICAvLyAjcmVnaW9uIHB1YmxpYyBtZW1iZXJzXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbkNvbmZpZ3VyYXRpb259IGNvbmZpZ3VyYXRpb24gIFRoZSBjb25maWd1cmF0aW9uIHRvIHVzZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgdGFyZ2V0UGF0aCAgICAgVGhlIGRpcmVjdG9yeSB0byB3cml0ZSB0aGUgY29sbGVjdGlvbiB0by5cbiAgICogQHBhcmFtIHtDb21waWxlVGltZU9wdGlvbnN9ICAgICAgY29tcGlsZU9wdGlvbnMgRmxhZ3MgZnJvbSBhbiBvd25lciB3aGljaCBtYXkgb3ZlcnJpZGUgY29uZmlndXJhdGlvbnMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBjb25maWd1cmF0aW9uOiBDb2xsZWN0aW9uQ29uZmlndXJhdGlvbixcbiAgICB0YXJnZXRQYXRoOiBzdHJpbmcsXG4gICAgY29tcGlsZU9wdGlvbnM6IENvbXBpbGVUaW1lT3B0aW9ucyB8IG9iamVjdCA9IHt9XG4gIClcbiAge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLiNjb21waWxlT3B0aW9ucyA9IChjb21waWxlT3B0aW9ucyBpbnN0YW5jZW9mIENvbXBpbGVUaW1lT3B0aW9ucykgPyBjb21waWxlT3B0aW9ucyA6IG5ldyBDb21waWxlVGltZU9wdGlvbnMoe30pO1xuXG4gICAgaWYgKCEoY29uZmlndXJhdGlvbiBpbnN0YW5jZW9mIENvbGxlY3Rpb25Db25maWd1cmF0aW9uKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29uZmlndXJhdGlvbiBpc24ndCBhIENvbGxlY3Rpb25Db25maWd1cmF0aW9uXCIpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdGFyZ2V0UGF0aCAhPT0gXCJzdHJpbmdcIilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlRhcmdldCBwYXRoIHNob3VsZCBiZSBhIHBhdGggdG8gYSBmaWxlIVwiKTtcblxuICAgIGNvbmZpZ3VyYXRpb24ubG9jaygpOyAvLyB0aGlzIG1heSB0aHJvdywgYnV0IGlmIHNvLCBpdCdzIGdvb2QgdGhhdCBpdCBkb2VzIHNvLlxuICAgIHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhID0gQ29uZmlndXJhdGlvbkRhdGEuY2xvbmVEYXRhKGNvbmZpZ3VyYXRpb24pIGFzIENvbmZpZ3VyYXRpb25EYXRhO1xuICAgIHRoaXMuI3RhcmdldFBhdGggPSB0YXJnZXRQYXRoO1xuXG4gICAgY29uc3QgZ3BTZXQgPSBuZXcgR2VuZXJhdG9yUHJvbWlzZVNldCh0aGlzLCBwYXRoLmRpcm5hbWUodGFyZ2V0UGF0aCkpO1xuICAgIGdlbmVyYXRvclRvUHJvbWlzZVNldC5zZXQodGhpcywgZ3BTZXQpO1xuXG4gICAgbGV0IGRlZmVycmVkID0gbmV3IERlZmVycmVkO1xuICAgIHRoaXMuI3BlbmRpbmdTdGFydCA9IGRlZmVycmVkLnJlc29sdmU7XG4gICAgdGhpcy4jcnVuUHJvbWlzZSA9IGRlZmVycmVkLnByb21pc2UudGhlbigoKSA9PiB0aGlzLiNydW4oKSk7XG5cbiAgICBPYmplY3Quc2VhbCh0aGlzKTtcbiAgfVxuXG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICBnZXQgc3RhdHVzKCkgOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLiNzdGF0dXM7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKlxuICAgKiBUaGUgZ2VuZXJhdGVkIGNvZGUgYXQgdGhpcyBwb2ludC4gIFVzZWQgaW4gI2J1aWxkT25lVG9PbmVCYXNlKCkgYnkgYSBwYXJlbnQgQ29kZUdlbmVyYXRvci5cbiAgICovXG4gIGdldCBnZW5lcmF0ZWRDb2RlKCkgOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLiNnZW5lcmF0ZWRDb2RlO1xuICB9XG5cbiAgZ2V0IHJlcXVpcmVzS2V5SGFzaGVyKCkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy4jZ2VuZXJhdGVkQ29kZT8uaW5jbHVkZXMoXCIgbmV3IEtleUhhc2hlcihcIik7XG4gIH1cblxuICBnZXQgcmVxdWlyZXNXZWFrS2V5Q29tcG9zZXIoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLiNnZW5lcmF0ZWRDb2RlPy5pbmNsdWRlcyhcIiBuZXcgV2Vha0tleUNvbXBvc2VyKFwiKTtcbiAgfVxuXG4gIGFzeW5jIHJ1bigpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHRoaXMuI3BlbmRpbmdTdGFydChudWxsKTtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy4jcnVuUHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxpZGVudGlmaWVyPn0gVGhlIGNsYXNzIG5hbWUuXG4gICAqL1xuICBhc3luYyAjcnVuKCkgOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHtcbiAgICAgIGNvbnN0IGZsYWdzOiBJbnRlcm5hbEZsYWdzIHwgdW5kZWZpbmVkID0gQ29kZUdlbmVyYXRvci4jZ2VuZXJhdG9yVG9JbnRlcm5hbEZsYWdzLmdldCh0aGlzKTtcbiAgICAgIGlmIChmbGFncylcbiAgICAgICAgdGhpcy4jaW50ZXJuYWxGbGFnU2V0ID0gZmxhZ3M7XG4gICAgfVxuXG4gICAgY29uc3QgZ3BTZXQgPSBnZW5lcmF0b3JUb1Byb21pc2VTZXQuZ2V0KHRoaXMpIGFzIEdlbmVyYXRvclByb21pc2VTZXQ7XG4gICAgY29uc3QgaGFzSW5pdGlhbFRhc2tzID0gZ3BTZXQuaGFzKHRoaXMuI3RhcmdldFBhdGgpO1xuICAgIGNvbnN0IGJwID0gZ3BTZXQuZ2V0KHRoaXMuI3RhcmdldFBhdGgpO1xuXG4gICAgaWYgKCFoYXNJbml0aWFsVGFza3MpIHtcbiAgICAgIGJwLmFkZFRhc2soYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLiNidWlsZENvbGxlY3Rpb24oKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgICB0aGlzLiNzdGF0dXMgPSBcImFib3J0ZWRcIjtcbiAgICAgICAgICB0aHJvdyBleDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGdwU2V0Lm93bmVyICE9PSB0aGlzKVxuICAgICAgcmV0dXJuIFwiXCI7XG5cbiAgICBpZiAoIWdwU2V0LmdlbmVyYXRvcnNUYXJnZXQuZGVlcFRhcmdldHMuaW5jbHVkZXModGhpcy4jdGFyZ2V0UGF0aCkpXG4gICAgICBncFNldC5nZW5lcmF0b3JzVGFyZ2V0LmFkZFN1YnRhcmdldCh0aGlzLiN0YXJnZXRQYXRoKTtcblxuICAgIGF3YWl0IGdwU2V0LnJ1bk1haW4oKTtcblxuICAgIHJldHVybiB0aGlzLiNjb25maWd1cmF0aW9uRGF0YS5jbGFzc05hbWU7XG4gIH1cblxuICAvLyAjZW5kcmVnaW9uIHB1YmxpYyBtZW1iZXJzXG5cbiAgLy8gI3JlZ2lvbiBwcml2YXRlIG1ldGhvZHNcblxuICAvKipcbiAgICogR2VuZXJhdGUgdGhlIGNvZGUhXG4gICAqXG4gICAqIEByZXR1cm5zIHtpZGVudGlmaWVyfSBUaGUgY2xhc3MgbmFtZS5cbiAgICogQHNlZSBodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PW5VQ29ZY3hOTUJFIHMvbG92ZS9jb2RlL2dcbiAgICovXG4gIGFzeW5jICNidWlsZENvbGxlY3Rpb24oKSA6IFByb21pc2U8c3RyaW5nPlxuICB7XG4gICAgdGhpcy4jc3RhdHVzID0gXCJpbiBwcm9ncmVzc1wiO1xuXG4gICAgaWYgKHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLmNvbGxlY3Rpb25UZW1wbGF0ZSA9PT0gXCJPbmVUb09uZS9NYXBcIikge1xuICAgICAgY29uc3QgYmFzZSA9IHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLm9uZVRvT25lQmFzZSBhcyBDb2xsZWN0aW9uQ29uZmlndXJhdGlvbjtcbiAgICAgIGNvbnN0IGRhdGEgPSBDb25maWd1cmF0aW9uRGF0YS5jbG9uZURhdGEoYmFzZSkgYXMgQ29uZmlndXJhdGlvbkRhdGE7XG4gICAgICBpZiAoZGF0YS5jbGFzc05hbWUgIT09IFwiV2Vha01hcFwiKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuI2J1aWxkT25lVG9PbmVCYXNlKGJhc2UpO1xuICAgICAgfVxuICAgICAgdGhpcy4jYnVpbGRPbmVUb09uZURlZmluZXMoYmFzZSk7XG4gICAgICBhd2FpdCB0aGlzLiNidWlsZE9uZVRvT25lRG9jR2VuZXJhdG9ycyhiYXNlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLiNidWlsZERlZmluZXMoKTtcbiAgICAgIHRoaXMuI2J1aWxkRG9jR2VuZXJhdG9yKCk7XG4gICAgfVxuXG4gICAgdGhpcy4jZ2VuZXJhdGVTb3VyY2UoKTtcbiAgICBjb25zdCBncFNldCA9IGdlbmVyYXRvclRvUHJvbWlzZVNldC5nZXQodGhpcykgYXMgR2VuZXJhdG9yUHJvbWlzZVNldDtcbiAgICBpZiAodGhpcy5yZXF1aXJlc0tleUhhc2hlcilcbiAgICAgIGdwU2V0LnJlcXVpcmVLZXlIYXNoZXIoKTtcbiAgICBpZiAodGhpcy5yZXF1aXJlc1dlYWtLZXlDb21wb3NlcilcbiAgICAgIGdwU2V0LnJlcXVpcmVXZWFrS2V5Q29tcG9zZXIoKTtcblxuICAgIGlmICghdGhpcy4jaW50ZXJuYWxGbGFnU2V0Py5oYXMoXCJwcmV2ZW50IGV4cG9ydFwiKSlcbiAgICAgIGF3YWl0IHRoaXMuI3dyaXRlU291cmNlKCk7XG5cbiAgICB0aGlzLiNzdGF0dXMgPSBcImNvbXBsZXRlZFwiO1xuICAgIHJldHVybiB0aGlzLiNjb25maWd1cmF0aW9uRGF0YS5jbGFzc05hbWU7XG4gIH1cblxuICAjZmlsZVByb2xvZ3VlKCkgOiBzdHJpbmcge1xuICAgIGxldCBmaWxlT3ZlcnZpZXcgPSBcIlwiO1xuICAgIGlmICghdGhpcy4jaW50ZXJuYWxGbGFnU2V0Py5oYXMoXCJubyBAZmlsZVwiKSAmJiB0aGlzLiNjb25maWd1cmF0aW9uRGF0YS5maWxlT3ZlcnZpZXcpIHtcbiAgICAgIGZpbGVPdmVydmlldyA9IHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLmZpbGVPdmVydmlldztcbiAgICAgIGZpbGVPdmVydmlldyA9IGZpbGVPdmVydmlldy5zcGxpdChcIlxcblwiKS5tYXAobGluZSA9PiBcIiAqXCIgKyAobGluZS50cmltKCkgPyBcIiBcIiArIGxpbmUgOiBcIlwiKSkuam9pbihcIlxcblwiKTtcbiAgICB9XG5cbiAgICBsZXQgbGluZXMgPSBbXG4gICAgICB0aGlzLiNjb21waWxlT3B0aW9ucy5saWNlbnNlVGV4dCA/IHRoaXMuI2NvbXBpbGVPcHRpb25zLmxpY2Vuc2VUZXh0ICsgXCJcXG5cXG5cIiA6IFwiXCIsXG4gICAgICBgLyoqXG4gKiBAZmlsZVxuICogVGhpcyBpcyBnZW5lcmF0ZWQgY29kZS4gIERvIG5vdCBlZGl0LlxuICpcbiAqIEdlbmVyYXRvcjogaHR0cHM6Ly9naXRodWIuY29tL2FqdmluY2VudC9jb21wb3NpdGUtY29sbGVjdGlvbi9cbmAudHJpbSgpLFxuICAgICAgdGhpcy4jY29tcGlsZU9wdGlvbnMubGljZW5zZSA/IGAgKiBAbGljZW5zZSAke3RoaXMuI2NvbXBpbGVPcHRpb25zLmxpY2Vuc2V9YCA6IFwiXCIsXG4gICAgICB0aGlzLiNjb21waWxlT3B0aW9ucy5hdXRob3IgPyBgICogQGF1dGhvciAke3RoaXMuI2NvbXBpbGVPcHRpb25zLmF1dGhvcn1gIDogXCJcIixcbiAgICAgIHRoaXMuI2NvbXBpbGVPcHRpb25zLmNvcHlyaWdodCA/IGAgKiBAY29weXJpZ2h0ICR7dGhpcy4jY29tcGlsZU9wdGlvbnMuY29weXJpZ2h0fWAgOiBcIlwiLFxuICAgICAgZmlsZU92ZXJ2aWV3LFxuICAgICAgXCIgKi9cIlxuICAgIF07XG5cbiAgICBsaW5lcyA9IGxpbmVzLmZpbHRlcihCb29sZWFuKTtcbiAgICBsaW5lcyA9IGxpbmVzLm1hcChsaW5lID0+IGxpbmUgPT09IFwiICogXCIgPyBcIiAqXCIgOiBsaW5lKTtcblxuICAgIGxldCBnZW5lcmF0ZWRDb2RlTm90aWNlID0gbGluZXMuam9pbihcIlxcblwiKTtcbiAgICBjb25zdCBwcm9sb2d1ZSA9IFtcbiAgICAgIGdlbmVyYXRlZENvZGVOb3RpY2UudHJpbSgpLFxuICAgIF07XG5cbiAgICByZXR1cm4gcHJvbG9ndWUuZmlsdGVyKEJvb2xlYW4pLmpvaW4oXCJcXG5cXG5cIik7XG4gIH1cblxuICAjYnVpbGREZWZpbmVzKCkgOiB2b2lkIHtcbiAgICB0aGlzLiNkZWZpbmVzLmNsZWFyKCk7XG5cbiAgICBjb25zdCBkYXRhID0gdGhpcy4jY29uZmlndXJhdGlvbkRhdGE7XG4gICAgdGhpcy4jZGVmaW5lcy5zZXQoXCJjbGFzc05hbWVcIiwgZGF0YS5jbGFzc05hbWUpO1xuXG4gICAgY29uc3QgbWFwS2V5cyA9IGRhdGEud2Vha01hcEtleXMuY29uY2F0KGRhdGEuc3Ryb25nTWFwS2V5cyk7XG4gICAgY29uc3Qgc2V0S2V5cyA9IGRhdGEud2Vha1NldEVsZW1lbnRzLmNvbmNhdChkYXRhLnN0cm9uZ1NldEVsZW1lbnRzKTtcblxuICAgIHRoaXMuI2RlZmluZXMuc2V0KFwiaW1wb3J0TGluZXNcIiwgZGF0YS5pbXBvcnRMaW5lcyk7XG5cbiAgICB7XG4gICAgICBjb25zdCBrZXlzID0gQXJyYXkuZnJvbShkYXRhLnBhcmFtZXRlclRvVHlwZU1hcC5rZXlzKCkpO1xuICAgICAgdGhpcy4jZGVmaW5lcy5zZXQoXCJhcmdMaXN0XCIsIGtleXMuam9pbihcIiwgXCIpKTtcbiAgICAgIHRoaXMuI2RlZmluZXMuc2V0KFwiYXJnTmFtZUxpc3RcIiwgQ29kZUdlbmVyYXRvci5idWlsZEFyZ05hbWVMaXN0KGtleXMpKTtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJhbXNEYXRhID0gQXJyYXkuZnJvbShkYXRhLnBhcmFtZXRlclRvVHlwZU1hcC52YWx1ZXMoKSk7XG5cbiAgICBpZiAoL1NvbG98V2Vha1xcLz9NYXAvLnRlc3QoZGF0YS5jb2xsZWN0aW9uVGVtcGxhdGUpKSB7XG4gICAgICB0aGlzLiNkZWZpbmVBcmdDb3VudEFuZExpc3RzKFwid2Vha01hcFwiLCBkYXRhLndlYWtNYXBLZXlzKTtcbiAgICAgIHRoaXMuI2RlZmluZUFyZ0NvdW50QW5kTGlzdHMoXCJzdHJvbmdNYXBcIiwgZGF0YS5zdHJvbmdNYXBLZXlzKTtcbiAgICB9XG5cbiAgICBpZiAoL1NvbG98V2Vha1xcLz9TZXQvLnRlc3QoZGF0YS5jb2xsZWN0aW9uVGVtcGxhdGUpKSB7XG4gICAgICB0aGlzLiNkZWZpbmVBcmdDb3VudEFuZExpc3RzKFwid2Vha1NldFwiLCBkYXRhLndlYWtTZXRFbGVtZW50cyk7XG4gICAgICB0aGlzLiNkZWZpbmVBcmdDb3VudEFuZExpc3RzKFwic3Ryb25nU2V0XCIsIGRhdGEuc3Ryb25nU2V0RWxlbWVudHMpO1xuICAgIH1cblxuICAgIGlmIChkYXRhLmNvbGxlY3Rpb25UZW1wbGF0ZS5pbmNsdWRlcyhcIk1hcE9mXCIpKSB7XG4gICAgICB0aGlzLiNkZWZpbmVBcmdDb3VudEFuZExpc3RzKFwibWFwXCIsIG1hcEtleXMpO1xuICAgICAgdGhpcy4jZGVmaW5lQXJnQ291bnRBbmRMaXN0cyhcInNldFwiLCBzZXRLZXlzKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy4jZGVmaW5lVmFsaWRhdG9yQ29kZShwYXJhbXNEYXRhLCBcInZhbGlkYXRlQXJndW1lbnRzXCIsICgpID0+IHRydWUpKVxuICAgICAgdGhpcy4jZGVmaW5lcy5zZXQoXCJpbnZva2VWYWxpZGF0ZVwiLCB0cnVlKTtcbiAgICB0aGlzLiNkZWZpbmVWYWxpZGF0b3JDb2RlKHBhcmFtc0RhdGEsIFwidmFsaWRhdGVNYXBBcmd1bWVudHNcIiwgcGQgPT4gbWFwS2V5cy5pbmNsdWRlcyhwZC5hcmd1bWVudE5hbWUpKTtcbiAgICB0aGlzLiNkZWZpbmVWYWxpZGF0b3JDb2RlKHBhcmFtc0RhdGEsIFwidmFsaWRhdGVTZXRBcmd1bWVudHNcIiwgcGQgPT4gc2V0S2V5cy5pbmNsdWRlcyhwZC5hcmd1bWVudE5hbWUpKTtcblxuICAgIGlmIChtYXBLZXlzLmxlbmd0aCkge1xuICAgICAgY29uc3QgY29sbGVjdGlvbiA9IGRhdGEucGFyYW1ldGVyVG9UeXBlTWFwLmdldChtYXBLZXlzWzBdKSBhcyBDb2xsZWN0aW9uVHlwZVxuICAgICAgdGhpcy4jZGVmaW5lcy5zZXQoXCJtYXBBcmd1bWVudDBUeXBlXCIsIGNvbGxlY3Rpb24uYXJndW1lbnRUeXBlKTtcbiAgICB9XG5cbiAgICBpZiAoc2V0S2V5cy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGNvbGxlY3Rpb24gPSBkYXRhLnBhcmFtZXRlclRvVHlwZU1hcC5nZXQoc2V0S2V5c1swXSkgYXMgQ29sbGVjdGlvblR5cGU7XG4gICAgICB0aGlzLiNkZWZpbmVzLnNldChcInNldEFyZ3VtZW50MFR5cGVcIiwgY29sbGVjdGlvbi5hcmd1bWVudFR5cGUpO1xuICAgIH1cblxuICAgIGlmIChkYXRhLnZhbHVlVHlwZSkge1xuICAgICAgbGV0IGZpbHRlciA9IChkYXRhLnZhbHVlVHlwZS5hcmd1bWVudFZhbGlkYXRvciB8fCBcIlwiKS50cmltKCk7XG4gICAgICBpZiAoZmlsdGVyKVxuICAgICAgICB0aGlzLiNkZWZpbmVzLnNldChcInZhbGlkYXRlVmFsdWVcIiwgZmlsdGVyICsgXCJcXG4gICAgXCIpO1xuXG4gICAgICB0aGlzLiNkZWZpbmVzLnNldChcbiAgICAgICAgXCJ2YWx1ZVR5cGVcIixcbiAgICAgICAgZGF0YS52YWx1ZVR5cGUuYXJndW1lbnRUeXBlXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gICNkZWZpbmVBcmdDb3VudEFuZExpc3RzKFxuICAgIHByZWZpeDogc3RyaW5nLFxuICAgIGtleUFycmF5OiBzdHJpbmdbXVxuICApIDogdm9pZFxuICB7XG4gICAgdGhpcy4jZGVmaW5lcy5zZXQocHJlZml4ICsgXCJDb3VudFwiLCBrZXlBcnJheS5sZW5ndGgpO1xuICAgIHRoaXMuI2RlZmluZXMuc2V0KHByZWZpeCArIFwiQXJnTGlzdFwiLCBrZXlBcnJheS5qb2luKFwiLCBcIikpO1xuICAgIHRoaXMuI2RlZmluZXMuc2V0KHByZWZpeCArIFwiQXJnTmFtZUxpc3RcIiwgSlNPTi5zdHJpbmdpZnkoa2V5QXJyYXkpKTtcbiAgICBpZiAoa2V5QXJyYXkubGVuZ3RoKVxuICAgICAgdGhpcy4jZGVmaW5lcy5zZXQocHJlZml4ICsgXCJBcmd1bWVudDBcIiwga2V5QXJyYXlbMF0pO1xuICB9XG5cbiAgI2RlZmluZVZhbGlkYXRvckNvZGUoXG4gICAgcGFyYW1zRGF0YTogQ29sbGVjdGlvblR5cGVbXSxcbiAgICBkZWZpbmVOYW1lOiBzdHJpbmcsXG4gICAgZmlsdGVyOiAodmFsdWU6IENvbGxlY3Rpb25UeXBlKSA9PiBib29sZWFuXG4gICkgOiBib29sZWFuXG4gIHtcbiAgICBjb25zdCB2YWxpZGF0b3JDb2RlID0gcGFyYW1zRGF0YS5maWx0ZXIoZmlsdGVyKS5tYXAocGQgPT4ge1xuICAgICAgcmV0dXJuIHBkLmFyZ3VtZW50VmFsaWRhdG9yIHx8IFwiXCI7XG4gICAgfSkuZmlsdGVyKEJvb2xlYW4pLmpvaW4oXCJcXG5cXG5cIikudHJpbSgpO1xuXG4gICAgaWYgKHZhbGlkYXRvckNvZGUpIHtcbiAgICAgIHRoaXMuI2RlZmluZXMuc2V0KGRlZmluZU5hbWUsIHZhbGlkYXRvckNvZGUpO1xuICAgIH1cbiAgICByZXR1cm4gQm9vbGVhbih2YWxpZGF0b3JDb2RlKTtcbiAgfVxuXG4gICNidWlsZE9uZVRvT25lRGVmaW5lcyhiYXNlOiBDb2xsZWN0aW9uQ29uZmlndXJhdGlvbiB8IHN5bWJvbCkgOiB2b2lkIHtcbiAgICB0aGlzLiNkZWZpbmVzLmNsZWFyKCk7XG5cbiAgICBjb25zdCBkYXRhID0gdGhpcy4jY29uZmlndXJhdGlvbkRhdGE7XG4gICAgY29uc3QgYmFzZURhdGEgPSBDb25maWd1cmF0aW9uRGF0YS5jbG9uZURhdGEoYmFzZSkgYXMgQ29uZmlndXJhdGlvbkRhdGE7XG4gICAgdGhpcy4jZGVmaW5lcy5zZXQoXCJjbGFzc05hbWVcIiwgZGF0YS5jbGFzc05hbWUpO1xuICAgIHRoaXMuI2RlZmluZXMuc2V0KFwiYmFzZUNsYXNzTmFtZVwiLCBiYXNlRGF0YS5jbGFzc05hbWUpO1xuICAgIHRoaXMuI2RlZmluZXMuc2V0KFwiY29uZmlndXJlT3B0aW9uc1wiLCBkYXRhLm9uZVRvT25lT3B0aW9ucyk7XG5cbiAgICBjb25zdCB3ZWFrS2V5TmFtZSA9IGRhdGEub25lVG9PbmVLZXlOYW1lO1xuICAgIHRoaXMuI2RlZmluZXMuc2V0KFwid2Vha0tleU5hbWVcIiwgd2Vha0tleU5hbWUpO1xuXG4gICAgLy8gYmluZE9uZVRvT25lIGFyZ3VtZW50c1xuICAgIGxldCBrZXlzID0gQXJyYXkuZnJvbShiYXNlRGF0YS5wYXJhbWV0ZXJUb1R5cGVNYXAua2V5cygpKTtcbiAgICB0aGlzLiNkZWZpbmVzLnNldChcImJhc2VBcmdMaXN0XCIsIGtleXMuc2xpY2UoKSk7XG5cbiAgICBrZXlzLnNwbGljZShrZXlzLmluZGV4T2Yod2Vha0tleU5hbWUpLCAxKTtcbiAgICB0aGlzLiNkZWZpbmVzLnNldChcImJpbmRBcmdMaXN0XCIsIGtleXMpO1xuXG4gICAgY29uc3Qgd3JhcEJhc2VDbGFzcyA9IGJhc2VEYXRhLndlYWtNYXBLZXlzLmxlbmd0aCArIGJhc2VEYXRhLnN0cm9uZ01hcEtleXMubGVuZ3RoID49IDI7XG4gICAgdGhpcy4jZGVmaW5lcy5zZXQoXCJ3cmFwQmFzZUNsYXNzXCIsIHdyYXBCYXNlQ2xhc3MpO1xuXG4gICAgY29uc3QgcGFyYW1ldGVycyA9IEFycmF5LmZyb20oYmFzZURhdGEucGFyYW1ldGVyVG9UeXBlTWFwLnZhbHVlcygpKTtcbiAgICB0aGlzLiNkZWZpbmVzLnNldChcImJhc2VDbGFzc1ZhbGlkYXRlc0tleVwiLCBwYXJhbWV0ZXJzLnNvbWUocGFyYW0gPT4gcGFyYW0uYXJndW1lbnRWYWxpZGF0b3IpKTtcbiAgICB0aGlzLiNkZWZpbmVzLnNldChcImJhc2VDbGFzc1ZhbGlkYXRlc1ZhbHVlXCIsIEJvb2xlYW4oYmFzZURhdGEudmFsdWVUeXBlPy5hcmd1bWVudFZhbGlkYXRvcikpO1xuICB9XG5cbiAgI2J1aWxkRG9jR2VuZXJhdG9yKCkgOiB2b2lkIHtcbiAgICBjb25zdCBnZW5lcmF0b3IgPSBuZXcgSlNEb2NHZW5lcmF0b3IoXG4gICAgICB0aGlzLiNjb25maWd1cmF0aW9uRGF0YS5jbGFzc05hbWUsXG4gICAgICAhdGhpcy4jY29uZmlndXJhdGlvbkRhdGEuY29sbGVjdGlvblRlbXBsYXRlLmVuZHNXaXRoKFwiTWFwXCIpXG4gICAgKTtcblxuICAgIHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLnBhcmFtZXRlclRvVHlwZU1hcC5mb3JFYWNoKHR5cGVEYXRhID0+IHtcbiAgICAgIGdlbmVyYXRvci5hZGRQYXJhbWV0ZXIodHlwZURhdGEpO1xuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLnZhbHVlVHlwZSAmJiAhdGhpcy4jY29uZmlndXJhdGlvbkRhdGEucGFyYW1ldGVyVG9UeXBlTWFwLmhhcyhcInZhbHVlXCIpKSB7XG4gICAgICBnZW5lcmF0b3IuYWRkUGFyYW1ldGVyKHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLnZhbHVlVHlwZSk7XG4gICAgfVxuXG4gICAgdGhpcy4jZG9jR2VuZXJhdG9ycy5wdXNoKGdlbmVyYXRvcik7XG4gIH1cblxuICBhc3luYyAjYnVpbGRPbmVUb09uZURvY0dlbmVyYXRvcnMoYmFzZTogQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24gfCBzeW1ib2wpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgYmFzZURhdGEgPSBDb25maWd1cmF0aW9uRGF0YS5jbG9uZURhdGEoYmFzZSkgYXMgQ29uZmlndXJhdGlvbkRhdGE7XG5cbiAgICAvLyBGb3IgdGhlIHNvbG8gZG9jIGdlbmVyYXRvciwgdGhlIHZhbHVlIGFyZ3VtZW50IGNvbWVzIGZpcnN0LlxuICAgIGxldCBnZW5lcmF0b3IgPSBhd2FpdCB0aGlzLiNjcmVhdGVPbmVUb09uZUdlbmVyYXRvcihcIm9uZVRvT25lU29sb0FyZ1wiKTtcbiAgICBnZW5lcmF0b3IuYWRkUGFyYW1ldGVyKGJhc2VEYXRhLnZhbHVlVHlwZSB8fCBuZXcgQ29sbGVjdGlvblR5cGUoXCJ2YWx1ZVwiLCBcIk1hcFwiLCBcIipcIiwgXCJUaGUgdmFsdWUuXCIsIFwiXCIpKTtcbiAgICB0aGlzLiNhcHBlbmRUeXBlc1RvRG9jR2VuZXJhdG9yKGJhc2UsIGdlbmVyYXRvciwgXCJcIiwgZmFsc2UpO1xuXG4gICAgLy8gRm9yIHRoZSBkdW8gZG9jIGdlbmVyYXRvciwgdGhlcmUgYXJlIHR3byBvZiBlYWNoIGFyZ3VtZW50LCBhbmQgdHdvIHZhbHVlcy5cbiAgICBnZW5lcmF0b3IgPSBhd2FpdCB0aGlzLiNjcmVhdGVPbmVUb09uZUdlbmVyYXRvcihcIm9uZVRvT25lRHVvQXJnXCIpO1xuICAgIHRoaXMuI2FwcGVuZFR5cGVzVG9Eb2NHZW5lcmF0b3IoYmFzZSwgZ2VuZXJhdG9yLCBcIl8xXCIsIHRydWUpO1xuICAgIHRoaXMuI2FwcGVuZFR5cGVzVG9Eb2NHZW5lcmF0b3IoYmFzZSwgZ2VuZXJhdG9yLCBcIl8yXCIsIHRydWUpO1xuICB9XG5cbiAgYXN5bmMgI2NyZWF0ZU9uZVRvT25lR2VuZXJhdG9yKG1vZHVsZU5hbWU6IHN0cmluZykgOiBQcm9taXNlPEpTRG9jR2VuZXJhdG9yPiB7XG4gICAgY29uc3QgZ2VuZXJhdG9yID0gbmV3IEpTRG9jR2VuZXJhdG9yKFxuICAgICAgdGhpcy4jY29uZmlndXJhdGlvbkRhdGEuY2xhc3NOYW1lLFxuICAgICAgZmFsc2VcbiAgICApO1xuXG4gICAgYXdhaXQgZ2VuZXJhdG9yLnNldE1ldGhvZFBhcmFtZXRlcnNCeU1vZHVsZShtb2R1bGVOYW1lKTtcbiAgICB0aGlzLiNkb2NHZW5lcmF0b3JzLnB1c2goZ2VuZXJhdG9yKTtcbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG5cbiAgI2FwcGVuZFR5cGVzVG9Eb2NHZW5lcmF0b3IoXG4gICAgYmFzZTogQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24gfCBzeW1ib2wsXG4gICAgZ2VuZXJhdG9yOiBKU0RvY0dlbmVyYXRvcixcbiAgICB0eXBlU3VmZml4OiBzdHJpbmcsXG4gICAgYWRkVmFsdWU6IGJvb2xlYW5cbiAgKSA6IHZvaWRcbiAge1xuICAgIGNvbnN0IGJhc2VEYXRhID0gQ29uZmlndXJhdGlvbkRhdGEuY2xvbmVEYXRhKGJhc2UpIGFzIENvbmZpZ3VyYXRpb25EYXRhO1xuXG4gICAgYmFzZURhdGEucGFyYW1ldGVyVG9UeXBlTWFwLmRlbGV0ZSh0aGlzLiNjb25maWd1cmF0aW9uRGF0YS5vbmVUb09uZUtleU5hbWUpO1xuXG4gICAgYmFzZURhdGEucGFyYW1ldGVyVG9UeXBlTWFwLmZvckVhY2godHlwZURhdGEgPT4ge1xuICAgICAgZ2VuZXJhdG9yLmFkZFBhcmFtZXRlcihuZXcgQ29sbGVjdGlvblR5cGUoXG4gICAgICAgIHR5cGVEYXRhLmFyZ3VtZW50TmFtZSArIHR5cGVTdWZmaXgsXG4gICAgICAgIHR5cGVEYXRhLm1hcE9yU2V0VHlwZSxcbiAgICAgICAgdHlwZURhdGEuYXJndW1lbnRUeXBlLFxuICAgICAgICB0eXBlRGF0YS5kZXNjcmlwdGlvbixcbiAgICAgICAgdHlwZURhdGEuYXJndW1lbnRWYWxpZGF0b3JcbiAgICAgICkpO1xuICAgIH0pO1xuXG4gICAgaWYgKGFkZFZhbHVlKSB7XG4gICAgICBsZXQge1xuICAgICAgICBhcmd1bWVudE5hbWUgPSBcInZhbHVlXCIsXG4gICAgICAgIG1hcE9yU2V0VHlwZSA9IFwiTWFwXCIsXG4gICAgICAgIGFyZ3VtZW50VHlwZSA9IFwiKlwiLFxuICAgICAgICBkZXNjcmlwdGlvbiA9IFwiVGhlIHZhbHVlLlwiLFxuICAgICAgICBhcmd1bWVudFZhbGlkYXRvciA9IFwiXCJcbiAgICAgIH0gPSBiYXNlRGF0YS52YWx1ZVR5cGUgfHwge307XG4gICAgICBhcmd1bWVudE5hbWUgKz0gdHlwZVN1ZmZpeDtcbiAgICAgIGdlbmVyYXRvci5hZGRQYXJhbWV0ZXIobmV3IENvbGxlY3Rpb25UeXBlKFxuICAgICAgICBhcmd1bWVudE5hbWUsIG1hcE9yU2V0VHlwZSwgYXJndW1lbnRUeXBlLCBkZXNjcmlwdGlvbiwgYXJndW1lbnRWYWxpZGF0b3JcbiAgICAgICkpO1xuICAgIH1cbiAgfVxuXG4gICNnZW5lcmF0ZVNvdXJjZSgpIDogdm9pZCB7XG4gICAgY29uc3QgZ2VuZXJhdG9yID0gVGVtcGxhdGVHZW5lcmF0b3JzLmdldCh0aGlzLiNjaG9vc2VDb2xsZWN0aW9uVGVtcGxhdGUoKSkgYXMgVGVtcGxhdGVGdW5jdGlvbjtcblxuICAgIGxldCBjb2RlU2VnbWVudHMgPSBbXG4gICAgICB0aGlzLiNnZW5lcmF0ZWRDb2RlLFxuICAgICAgZ2VuZXJhdG9yKHRoaXMuI2RlZmluZXMsIC4uLnRoaXMuI2RvY0dlbmVyYXRvcnMpLFxuICAgIF07XG5cbiAgICBpZiAoIXRoaXMuI2ludGVybmFsRmxhZ1NldD8uaGFzKFwicHJldmVudCBleHBvcnRcIikpIHtcbiAgICAgIGNvZGVTZWdtZW50cyA9IFtcbiAgICAgICAgdGhpcy4jZmlsZVByb2xvZ3VlKCksXG4gICAgICAgIC4uLmNvZGVTZWdtZW50cyxcbiAgICAgICAgYGV4cG9ydCBkZWZhdWx0ICR7dGhpcy4jY29uZmlndXJhdGlvbkRhdGEuY2xhc3NOYW1lfTtgXG4gICAgICBdO1xuICAgIH1cblxuICAgIHRoaXMuI2dlbmVyYXRlZENvZGUgPSBjb2RlU2VnbWVudHMuZmxhdChJbmZpbml0eSkuZmlsdGVyKEJvb2xlYW4pLmpvaW4oXCJcXG5cXG5cIik7XG5cbiAgICB0aGlzLiNnZW5lcmF0ZWRDb2RlID0gYmVhdXRpZnkoXG4gICAgICB0aGlzLiNnZW5lcmF0ZWRDb2RlLFxuICAgICAge1xuICAgICAgICBcImluZGVudF9zaXplXCI6IDIsXG4gICAgICAgIFwiaW5kZW50X2NoYXJcIjogXCIgXCIsXG4gICAgICAgIFwiZW5kX3dpdGhfbmV3bGluZVwiOiB0cnVlLFxuICAgICAgfVxuICAgICk7XG5cbiAgICB0aGlzLiNnZW5lcmF0ZWRDb2RlID0gdGhpcy4jZ2VuZXJhdGVkQ29kZS5yZXBsYWNlKC9cXG57Myx9L2csIFwiXFxuXFxuXCIpO1xuICB9XG5cbiAgI2Nob29zZUNvbGxlY3Rpb25UZW1wbGF0ZSgpIDogc3RyaW5nIHtcbiAgICBsZXQgc3RhcnRUZW1wbGF0ZSA9IHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLmNvbGxlY3Rpb25UZW1wbGF0ZTtcblxuICAgIGNvbnN0IHdlYWtNYXBDb3VudCA9IHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLndlYWtNYXBLZXlzPy5sZW5ndGggfHwgMCxcbiAgICAgICAgICBzdHJvbmdNYXBDb3VudCA9IHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLnN0cm9uZ01hcEtleXM/Lmxlbmd0aCB8fCAwLFxuICAgICAgICAgIHdlYWtTZXRDb3VudCA9IHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLndlYWtTZXRFbGVtZW50cz8ubGVuZ3RoIHx8IDAsXG4gICAgICAgICAgc3Ryb25nU2V0Q291bnQgPSB0aGlzLiNjb25maWd1cmF0aW9uRGF0YS5zdHJvbmdTZXRFbGVtZW50cz8ubGVuZ3RoIHx8IDA7XG5cbiAgICBjb25zdCBtYXBDb3VudCA9IHdlYWtNYXBDb3VudCArIHN0cm9uZ01hcENvdW50LFxuICAgICAgICAgIHNldENvdW50ID0gd2Vha1NldENvdW50ICsgc3Ryb25nU2V0Q291bnQ7XG5cbiAgICBpZiAobWFwQ291bnQgJiYgc2V0Q291bnQgJiYgIXRoaXMuI2NvbXBpbGVPcHRpb25zLmRpc2FibGVLZXlPcHRpbWl6YXRpb24pIHtcbiAgICAgIC8vIE1hcCBvZiBTZXRzLCBtYXliZSBvcHRpbWl6ZWRcbiAgICAgIGNvbnN0IHNob3J0S2V5ID0gW1xuICAgICAgICBtYXBDb3VudCA+IDEgPyBcIm5cIiA6IFwiMVwiLFxuICAgICAgICB3ZWFrTWFwQ291bnQgPyBcIldcIiA6IFwiU1wiLFxuICAgICAgICBcIi9cIixcbiAgICAgICAgc2V0Q291bnQgPiAxID8gXCJuXCIgOiBcIjFcIixcbiAgICAgICAgd2Vha1NldENvdW50ID8gXCJXXCIgOiBcIlNcIlxuICAgICAgXS5qb2luKFwiXCIpO1xuICAgICAgLy8gY29uc29sZS5sb2coYFxcblxcbiR7c2hvcnRLZXl9ICR7QXJyYXkuZnJvbSh0aGlzLiNkZWZpbmVzLmtleXMoKSkuam9pbihcIiwgXCIpfVxcblxcbmApO1xuICAgICAgcmV0dXJuIENvZGVHZW5lcmF0b3IuI21hcE9mU3Ryb25nU2V0c1RlbXBsYXRlcy5nZXQoc2hvcnRLZXkpIHx8IHN0YXJ0VGVtcGxhdGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0YXJ0VGVtcGxhdGU7XG4gIH1cblxuICBhc3luYyAjd3JpdGVTb3VyY2UoKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBmcy53cml0ZUZpbGUoXG4gICAgICB0aGlzLiN0YXJnZXRQYXRoLFxuICAgICAgdGhpcy4jZ2VuZXJhdGVkQ29kZSxcbiAgICAgIHsgZW5jb2Rpbmc6IFwidXRmLThcIiB9XG4gICAgKTtcbiAgfVxuXG4gIGFzeW5jICNidWlsZE9uZVRvT25lQmFzZShiYXNlOiBDb2xsZWN0aW9uQ29uZmlndXJhdGlvbiB8IHN5bWJvbCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBiYXNlRGF0YSA9IENvbmZpZ3VyYXRpb25EYXRhLmNsb25lRGF0YShiYXNlKSBhcyBDb25maWd1cmF0aW9uRGF0YTtcbiAgICBpZiAoYmFzZURhdGEuY2xhc3NOYW1lID09PSBcIldlYWtNYXBcIilcbiAgICAgIHJldHVybjtcbiAgICBpZiAodHlwZW9mIGJhc2UgPT09IFwic3ltYm9sXCIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJhc3NlcnRpb246IHVucmVhY2hhYmxlXCIpO1xuXG4gICAgaWYgKHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLm9uZVRvT25lT3B0aW9ucz8ucGF0aFRvQmFzZU1vZHVsZSkge1xuICAgICAgdGhpcy4jZ2VuZXJhdGVkQ29kZSArPSBgaW1wb3J0ICR7YmFzZURhdGEuY2xhc3NOYW1lfSBmcm9tIFwiJHt0aGlzLiNjb25maWd1cmF0aW9uRGF0YS5vbmVUb09uZU9wdGlvbnMucGF0aFRvQmFzZU1vZHVsZX1cIjtgO1xuICAgICAgdGhpcy4jZ2VuZXJhdGVkQ29kZSArPSBiYXNlRGF0YS5pbXBvcnRMaW5lcztcbiAgICAgIHRoaXMuI2dlbmVyYXRlZENvZGUgKz0gXCJcXG5cIjtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzdWJDb21waWxlT3B0aW9ucyA9IE9iamVjdC5jcmVhdGUodGhpcy4jY29tcGlsZU9wdGlvbnMpO1xuICAgIGNvbnN0IGludGVybmFsRmxhZ3M6IEludGVybmFsRmxhZ3MgPSBuZXcgU2V0KFtcbiAgICAgIFwicHJldmVudCBleHBvcnRcIixcbiAgICAgIFwiY29uZmlndXJhdGlvbiBva1wiLFxuICAgICAgXCJubyBAZmlsZVwiLFxuICAgIF0pO1xuXG4gICAgdGhpcy4jb25lVG9PbmVTdWJHZW5lcmF0b3IgPSBuZXcgQ29kZUdlbmVyYXRvcihcbiAgICAgIGJhc2UsXG4gICAgICB0aGlzLiN0YXJnZXRQYXRoLFxuICAgICAgc3ViQ29tcGlsZU9wdGlvbnNcbiAgICApO1xuICAgIENvZGVHZW5lcmF0b3IuI2dlbmVyYXRvclRvSW50ZXJuYWxGbGFncy5zZXQodGhpcy4jb25lVG9PbmVTdWJHZW5lcmF0b3IsIGludGVybmFsRmxhZ3MpO1xuXG4gICAgYXdhaXQgdGhpcy4jb25lVG9PbmVTdWJHZW5lcmF0b3IucnVuKCk7XG5cbiAgICB0aGlzLiNnZW5lcmF0ZWRDb2RlICs9IHRoaXMuI29uZVRvT25lU3ViR2VuZXJhdG9yLmdlbmVyYXRlZENvZGUgKyBcIlxcblwiO1xuICB9XG5cbiAgLy8gI2VuZHJlZ2lvbiBwcml2YXRlIG1ldGhvZHNcbn1cbk9iamVjdC5mcmVlemUoQ29kZUdlbmVyYXRvcik7XG5PYmplY3QuZnJlZXplKENvZGVHZW5lcmF0b3IucHJvdG90eXBlKTtcbiJdfQ==