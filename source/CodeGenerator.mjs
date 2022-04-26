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
            if (!base)
                throw new Error("assertion: unreachable");
            if (ConfigurationData.cloneData(base).className !== "WeakMap") {
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
            this.#defines.set("mapArgument0Type", data.parameterToTypeMap.get(mapKeys[0]).argumentType);
        }
        if (setKeys.length) {
            this.#defines.set("setArgument0Type", data.parameterToTypeMap.get(setKeys[0]).argumentType);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29kZUdlbmVyYXRvci5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJDb2RlR2VuZXJhdG9yLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILG1DQUFtQztBQUVuQyxPQUFPLHVCQUF1QixNQUFNLCtCQUErQixDQUFDO0FBQ3BFLE9BQU8saUJBQXNDLE1BQU0sd0NBQXdDLENBQUM7QUFDNUYsT0FBTyxrQkFBa0IsTUFBTSwwQkFBMEIsQ0FBQztBQUUxRCxPQUFPLGNBQWMsTUFBTSxxQ0FBcUMsQ0FBQztBQUNqRSxPQUFPLEVBQ0wsbUJBQW1CLEVBQ25CLGlCQUFpQixFQUNqQixxQkFBcUIsR0FDdEIsTUFBTSwwQ0FBMEMsQ0FBQztBQUVsRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFHeEQsT0FBTyxjQUFjLE1BQU0scUNBQXFDLENBQUM7QUFDakUsT0FBTyxrQkFBa0IsTUFBTSx5Q0FBeUMsQ0FBQztBQUV6RSxPQUFPLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDN0IsT0FBTyxJQUFJLE1BQU0sTUFBTSxDQUFDO0FBQ3hCLE9BQU8sUUFBUSxNQUFNLGFBQWEsQ0FBQztBQUtuQyxlQUFlO0FBQ2YsTUFBTSxDQUFDLE9BQU8sT0FBTyxhQUFjLFNBQVEsaUJBQWlCO0lBQzFELGdDQUFnQztJQUNoQzs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFjO1FBQ3BDLE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQTtJQUMzRCxDQUFDO0lBRUQsZ0JBQWdCO0lBQ2hCLE1BQU0sQ0FBQyx5QkFBeUIsR0FBc0MsSUFBSSxHQUFHLENBQUM7SUFFOUUsNENBQTRDO0lBQzVDLE1BQU0sQ0FBQyx5QkFBeUIsR0FBd0IsSUFBSSxHQUFH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QUksS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFFNUMsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxFQUFFLGdCQUFnQixFQUFFO1lBQzdELElBQUksQ0FBQyxjQUFjLElBQUksVUFBVSxRQUFRLENBQUMsU0FBUyxVQUFVLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLElBQUksQ0FBQztZQUMxSCxJQUFJLENBQUMsY0FBYyxJQUFJLFFBQVEsQ0FBQyxXQUFXLENBQUM7WUFDNUMsSUFBSSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUM7WUFDNUIsT0FBTztTQUNSO1FBRUQsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM5RCxNQUFNLGFBQWEsR0FBa0IsSUFBSSxHQUFHLENBQUM7WUFDM0MsZ0JBQWdCO1lBQ2hCLGtCQUFrQjtZQUNsQixVQUFVO1NBQ1gsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksYUFBYSxDQUM1QyxJQUFJLEVBQ0osSUFBSSxDQUFDLFdBQVcsRUFDaEIsaUJBQWlCLENBQ2xCLENBQUM7UUFDRixhQUFhLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUV2RixNQUFNLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUV2QyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0lBQ3pFLENBQUM7O0FBSUgsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM3QixNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQG1vZHVsZSBzb3VyY2UvQ29kZUdlbmVyYXRvci5tanNcbiAqL1xuXG4vKiogQHR5cGVkZWYge3N0cmluZ30gaWRlbnRpZmllciAqL1xuXG5pbXBvcnQgQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24gZnJvbSBcIi4vQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24ubWpzXCI7XG5pbXBvcnQgQ29uZmlndXJhdGlvbkRhdGEsIHsgb25lVG9PbmVPcHRpb25zIH0gZnJvbSBcIi4vZ2VuZXJhdG9yVG9vbHMvQ29uZmlndXJhdGlvbkRhdGEubWpzXCI7XG5pbXBvcnQgQ29tcGlsZVRpbWVPcHRpb25zIGZyb20gXCIuL0NvbXBpbGVUaW1lT3B0aW9ucy5tanNcIjtcblxuaW1wb3J0IENvbGxlY3Rpb25UeXBlIGZyb20gXCIuL2dlbmVyYXRvclRvb2xzL0NvbGxlY3Rpb25UeXBlLm1qc1wiO1xuaW1wb3J0IHtcbiAgR2VuZXJhdG9yUHJvbWlzZVNldCxcbiAgQ29kZUdlbmVyYXRvckJhc2UsXG4gIGdlbmVyYXRvclRvUHJvbWlzZVNldCxcbn0gZnJvbSBcIi4vZ2VuZXJhdG9yVG9vbHMvR2VuZXJhdG9yUHJvbWlzZVNldC5tanNcIjtcblxuaW1wb3J0IHsgRGVmZXJyZWQgfSBmcm9tIFwiLi91dGlsaXRpZXMvUHJvbWlzZVR5cGVzLm1qc1wiO1xuaW1wb3J0IHR5cGUgeyBQcm9taXNlUmVzb2x2ZXIgfSBmcm9tIFwiLi91dGlsaXRpZXMvUHJvbWlzZVR5cGVzLm1qc1wiO1xuXG5pbXBvcnQgSlNEb2NHZW5lcmF0b3IgZnJvbSBcIi4vZ2VuZXJhdG9yVG9vbHMvSlNEb2NHZW5lcmF0b3IubWpzXCI7XG5pbXBvcnQgVGVtcGxhdGVHZW5lcmF0b3JzIGZyb20gXCIuL2dlbmVyYXRvclRvb2xzL1RlbXBsYXRlR2VuZXJhdG9ycy5tanNcIjtcblxuaW1wb3J0IGZzIGZyb20gXCJmcy9wcm9taXNlc1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCBiZWF1dGlmeSBmcm9tIFwianMtYmVhdXRpZnlcIjtcblxudHlwZSBJbnRlcm5hbEZsYWdzID0gU2V0PHN0cmluZz47XG5leHBvcnQgdHlwZSBQcmVwcm9jZXNzb3JEZWZpbmVzID0gTWFwPHN0cmluZywgc3RyaW5nIHwgc3RyaW5nW10gfCBib29sZWFuIHwgbnVtYmVyIHwgb25lVG9PbmVPcHRpb25zIHwgbnVsbD5cblxuLyoqIEBwYWNrYWdlICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb2RlR2VuZXJhdG9yIGV4dGVuZHMgQ29kZUdlbmVyYXRvckJhc2Uge1xuICAvLyAjcmVnaW9uIHN0YXRpYyBwcml2YXRlIGZpZWxkc1xuICAvKipcbiAgICogU3RyaW5naWZ5IGEgbGlzdCBvZiBrZXlzIGludG8gYW4gYXJndW1lbnQgbmFtZSBsaXN0IHN1aXRhYmxlIGZvciBtYWNyb3MuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IGtleXMgVGhlIGtleSBuYW1lcy5cbiAgICogQHJldHVybnMge3N0cmluZ30gVGhlIHNlcmlhbGl6ZWQga2V5IG5hbWVzLlxuICAgKi9cbiAgc3RhdGljIGJ1aWxkQXJnTmFtZUxpc3Qoa2V5czogc3RyaW5nW10pIDogc3RyaW5nIHtcbiAgICByZXR1cm4gJ1snICsga2V5cy5tYXAoa2V5ID0+IGBcIiR7a2V5fVwiYCkuam9pbihcIiwgXCIpICsgJ10nXG4gIH1cblxuICAvKiogQGNvbnN0YW50ICovXG4gIHN0YXRpYyAjZ2VuZXJhdG9yVG9JbnRlcm5hbEZsYWdzOiBNYXA8Q29kZUdlbmVyYXRvciwgSW50ZXJuYWxGbGFncz4gPSBuZXcgTWFwO1xuXG4gIC8qKiBAdHlwZSB7TWFwPHN0cmluZywgc3RyaW5nPn0gQGNvbnN0YW50ICovXG4gIHN0YXRpYyAjbWFwT2ZTdHJvbmdTZXRzVGVtcGxhdGVzOiBNYXA8c3RyaW5nLCBzdHJpbmc+ID0gbmV3IE1hcChbXG4gICAgLypcbiAgICBrZXk6XG4gICAgICBTOiBzdHJvbmdcbiAgICAgIFc6IHdlYWtcbiAgICAgIC86IGJlZm9yZSBhIHNsYXNoIGlzIE1hcCwgYWZ0ZXIgaXMgU2V0XG4gICAgICBuOiBtb3JlIHRoYW4gb25lXG4gICAgICAxOiBvbmVcblxuICAgIFNvOlxuICAgICAgXCIxVy9uU1wiID0gb25lIHdlYWsgbWFwIGtleSwgbXVsdGlwbGUgc3Ryb25nIHNldCBrZXlzXG4gICAgKi9cbiAgICBbXCIxUy9uU1wiLCBcIlN0cm9uZy9PbmVNYXBPZlN0cm9uZ1NldHNcIl0sXG4gICAgW1wiblMvMVNcIiwgXCJTdHJvbmcvTWFwT2ZPbmVTdHJvbmdTZXRcIl0sXG4gICAgW1wiMVMvMVNcIiwgXCJTdHJvbmcvT25lTWFwT2ZPbmVTdHJvbmdTZXRcIl0sXG5cbiAgICBbXCIxVy9uU1wiLCBcIldlYWsvT25lTWFwT2ZTdHJvbmdTZXRzXCJdLFxuICAgIFtcIm5XLzFTXCIsIFwiV2Vhay9NYXBPZk9uZVN0cm9uZ1NldFwiXSxcbiAgICBbXCIxVy8xU1wiLCBcIldlYWsvT25lTWFwT2ZPbmVTdHJvbmdTZXRcIl0sXG4gIF0pO1xuXG4gIC8vICNlbmRyZWdpb24gc3RhdGljIHByaXZhdGUgZmllbGRzXG5cbiAgLy8gI3JlZ2lvbiBwcml2YXRlIHByb3BlcnRpZXNcbiAgLyoqIEB0eXBlIHtvYmplY3R9IEBjb25zdGFudCAqL1xuICAjY29uZmlndXJhdGlvbkRhdGE6IENvbmZpZ3VyYXRpb25EYXRhO1xuXG4gIC8qKiBAdHlwZSB7c3RyaW5nfSBAY29uc3RhbnQgKi9cbiAgI3RhcmdldFBhdGg6IHN0cmluZztcblxuICAvKiogQHR5cGUge0NvbXBpbGVUaW1lT3B0aW9uc30gQGNvbnN0YW50ICovXG4gICNjb21waWxlT3B0aW9uczogQ29tcGlsZVRpbWVPcHRpb25zO1xuXG5cbiAgI3BlbmRpbmdTdGFydDogUHJvbWlzZVJlc29sdmVyPG51bGw+O1xuXG4gICNydW5Qcm9taXNlOiBSZWFkb25seTxQcm9taXNlPHN0cmluZz4+O1xuXG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICAjc3RhdHVzID0gXCJub3Qgc3RhcnRlZCB5ZXRcIjtcblxuICAvKiogQHR5cGUge01hcDxzdHJpbmcsICo+fSBAY29uc3RhbnQgKi9cbiAgI2RlZmluZXM6IFByZXByb2Nlc3NvckRlZmluZXMgPSBuZXcgTWFwKCk7XG5cbiAgLyoqIEB0eXBlIHtKU0RvY0dlbmVyYXRvcltdfSAqL1xuICAjZG9jR2VuZXJhdG9yczogSlNEb2NHZW5lcmF0b3JbXSA9IFtdO1xuXG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICAjZ2VuZXJhdGVkQ29kZSA9IFwiXCI7XG5cbiAgLyoqIEB0eXBlIHtTZXQ8c3RyaW5nPj99IEBjb25zdGFudCAqL1xuICAjaW50ZXJuYWxGbGFnU2V0OiBJbnRlcm5hbEZsYWdzID0gbmV3IFNldDtcblxuICAvKiogQHR5cGUge0NvZGVHZW5lcmF0b3IgfCBudWxsfSAqL1xuICAjb25lVG9PbmVTdWJHZW5lcmF0b3I6IENvZGVHZW5lcmF0b3IgfCBudWxsID0gbnVsbDtcblxuICAvLyAjZW5kcmVnaW9uIHByaXZhdGUgcHJvcGVydGllc1xuXG4gIC8vICNyZWdpb24gcHVibGljIG1lbWJlcnNcblxuICAvKipcbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uQ29uZmlndXJhdGlvbn0gY29uZmlndXJhdGlvbiAgVGhlIGNvbmZpZ3VyYXRpb24gdG8gdXNlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICB0YXJnZXRQYXRoICAgICBUaGUgZGlyZWN0b3J5IHRvIHdyaXRlIHRoZSBjb2xsZWN0aW9uIHRvLlxuICAgKiBAcGFyYW0ge0NvbXBpbGVUaW1lT3B0aW9uc30gICAgICBjb21waWxlT3B0aW9ucyBGbGFncyBmcm9tIGFuIG93bmVyIHdoaWNoIG1heSBvdmVycmlkZSBjb25maWd1cmF0aW9ucy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIGNvbmZpZ3VyYXRpb246IENvbGxlY3Rpb25Db25maWd1cmF0aW9uLFxuICAgIHRhcmdldFBhdGg6IHN0cmluZyxcbiAgICBjb21waWxlT3B0aW9uczogQ29tcGlsZVRpbWVPcHRpb25zIHwgb2JqZWN0ID0ge31cbiAgKVxuICB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuI2NvbXBpbGVPcHRpb25zID0gKGNvbXBpbGVPcHRpb25zIGluc3RhbmNlb2YgQ29tcGlsZVRpbWVPcHRpb25zKSA/IGNvbXBpbGVPcHRpb25zIDogbmV3IENvbXBpbGVUaW1lT3B0aW9ucyh7fSk7XG5cbiAgICBpZiAoIShjb25maWd1cmF0aW9uIGluc3RhbmNlb2YgQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb25maWd1cmF0aW9uIGlzbid0IGEgQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb25cIik7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB0YXJnZXRQYXRoICE9PSBcInN0cmluZ1wiKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGFyZ2V0IHBhdGggc2hvdWxkIGJlIGEgcGF0aCB0byBhIGZpbGUhXCIpO1xuXG4gICAgY29uZmlndXJhdGlvbi5sb2NrKCk7IC8vIHRoaXMgbWF5IHRocm93LCBidXQgaWYgc28sIGl0J3MgZ29vZCB0aGF0IGl0IGRvZXMgc28uXG4gICAgdGhpcy4jY29uZmlndXJhdGlvbkRhdGEgPSBDb25maWd1cmF0aW9uRGF0YS5jbG9uZURhdGEoY29uZmlndXJhdGlvbikhO1xuICAgIHRoaXMuI3RhcmdldFBhdGggPSB0YXJnZXRQYXRoO1xuXG4gICAgY29uc3QgZ3BTZXQgPSBuZXcgR2VuZXJhdG9yUHJvbWlzZVNldCh0aGlzLCBwYXRoLmRpcm5hbWUodGFyZ2V0UGF0aCkpO1xuICAgIGdlbmVyYXRvclRvUHJvbWlzZVNldC5zZXQodGhpcywgZ3BTZXQpO1xuXG4gICAgbGV0IGRlZmVycmVkID0gbmV3IERlZmVycmVkO1xuICAgIHRoaXMuI3BlbmRpbmdTdGFydCA9IGRlZmVycmVkLnJlc29sdmU7XG4gICAgdGhpcy4jcnVuUHJvbWlzZSA9IGRlZmVycmVkLnByb21pc2UudGhlbigoKSA9PiB0aGlzLiNydW4oKSk7XG5cbiAgICBPYmplY3Quc2VhbCh0aGlzKTtcbiAgfVxuXG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICBnZXQgc3RhdHVzKCkgOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLiNzdGF0dXM7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKlxuICAgKiBUaGUgZ2VuZXJhdGVkIGNvZGUgYXQgdGhpcyBwb2ludC4gIFVzZWQgaW4gI2J1aWxkT25lVG9PbmVCYXNlKCkgYnkgYSBwYXJlbnQgQ29kZUdlbmVyYXRvci5cbiAgICovXG4gIGdldCBnZW5lcmF0ZWRDb2RlKCkgOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLiNnZW5lcmF0ZWRDb2RlO1xuICB9XG5cbiAgZ2V0IHJlcXVpcmVzS2V5SGFzaGVyKCkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy4jZ2VuZXJhdGVkQ29kZT8uaW5jbHVkZXMoXCIgbmV3IEtleUhhc2hlcihcIik7XG4gIH1cblxuICBnZXQgcmVxdWlyZXNXZWFrS2V5Q29tcG9zZXIoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLiNnZW5lcmF0ZWRDb2RlPy5pbmNsdWRlcyhcIiBuZXcgV2Vha0tleUNvbXBvc2VyKFwiKTtcbiAgfVxuXG4gIGFzeW5jIHJ1bigpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHRoaXMuI3BlbmRpbmdTdGFydChudWxsKTtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy4jcnVuUHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxpZGVudGlmaWVyPn0gVGhlIGNsYXNzIG5hbWUuXG4gICAqL1xuICBhc3luYyAjcnVuKCkgOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHtcbiAgICAgIGNvbnN0IGZsYWdzOiBJbnRlcm5hbEZsYWdzIHwgdW5kZWZpbmVkID0gQ29kZUdlbmVyYXRvci4jZ2VuZXJhdG9yVG9JbnRlcm5hbEZsYWdzLmdldCh0aGlzKTtcbiAgICAgIGlmIChmbGFncylcbiAgICAgICAgdGhpcy4jaW50ZXJuYWxGbGFnU2V0ID0gZmxhZ3M7XG4gICAgfVxuXG4gICAgY29uc3QgZ3BTZXQgPSBnZW5lcmF0b3JUb1Byb21pc2VTZXQuZ2V0KHRoaXMpITtcbiAgICBjb25zdCBoYXNJbml0aWFsVGFza3MgPSBncFNldC5oYXModGhpcy4jdGFyZ2V0UGF0aCk7XG4gICAgY29uc3QgYnAgPSBncFNldC5nZXQodGhpcy4jdGFyZ2V0UGF0aCk7XG5cbiAgICBpZiAoIWhhc0luaXRpYWxUYXNrcykge1xuICAgICAgYnAuYWRkVGFzayhhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuI2J1aWxkQ29sbGVjdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChleCkge1xuICAgICAgICAgIHRoaXMuI3N0YXR1cyA9IFwiYWJvcnRlZFwiO1xuICAgICAgICAgIHRocm93IGV4O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoZ3BTZXQub3duZXIgIT09IHRoaXMpXG4gICAgICByZXR1cm4gXCJcIjtcblxuICAgIGlmICghZ3BTZXQuZ2VuZXJhdG9yc1RhcmdldC5kZWVwVGFyZ2V0cy5pbmNsdWRlcyh0aGlzLiN0YXJnZXRQYXRoKSlcbiAgICAgIGdwU2V0LmdlbmVyYXRvcnNUYXJnZXQuYWRkU3VidGFyZ2V0KHRoaXMuI3RhcmdldFBhdGgpO1xuXG4gICAgYXdhaXQgZ3BTZXQucnVuTWFpbigpO1xuXG4gICAgcmV0dXJuIHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLmNsYXNzTmFtZTtcbiAgfVxuXG4gIC8vICNlbmRyZWdpb24gcHVibGljIG1lbWJlcnNcblxuICAvLyAjcmVnaW9uIHByaXZhdGUgbWV0aG9kc1xuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSB0aGUgY29kZSFcbiAgICpcbiAgICogQHJldHVybnMge2lkZW50aWZpZXJ9IFRoZSBjbGFzcyBuYW1lLlxuICAgKiBAc2VlIGh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9blVDb1ljeE5NQkUgcy9sb3ZlL2NvZGUvZ1xuICAgKi9cbiAgYXN5bmMgI2J1aWxkQ29sbGVjdGlvbigpIDogUHJvbWlzZTxzdHJpbmc+XG4gIHtcbiAgICB0aGlzLiNzdGF0dXMgPSBcImluIHByb2dyZXNzXCI7XG5cbiAgICBpZiAodGhpcy4jY29uZmlndXJhdGlvbkRhdGEuY29sbGVjdGlvblRlbXBsYXRlID09PSBcIk9uZVRvT25lL01hcFwiKSB7XG4gICAgICBjb25zdCBiYXNlID0gdGhpcy4jY29uZmlndXJhdGlvbkRhdGEub25lVG9PbmVCYXNlO1xuICAgICAgaWYgKCFiYXNlKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJhc3NlcnRpb246IHVucmVhY2hhYmxlXCIpO1xuICAgICAgaWYgKENvbmZpZ3VyYXRpb25EYXRhLmNsb25lRGF0YShiYXNlKSEuY2xhc3NOYW1lICE9PSBcIldlYWtNYXBcIikge1xuICAgICAgICBhd2FpdCB0aGlzLiNidWlsZE9uZVRvT25lQmFzZShiYXNlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuI2J1aWxkT25lVG9PbmVEZWZpbmVzKGJhc2UpO1xuICAgICAgYXdhaXQgdGhpcy4jYnVpbGRPbmVUb09uZURvY0dlbmVyYXRvcnMoYmFzZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy4jYnVpbGREZWZpbmVzKCk7XG4gICAgICB0aGlzLiNidWlsZERvY0dlbmVyYXRvcigpO1xuICAgIH1cblxuICAgIHRoaXMuI2dlbmVyYXRlU291cmNlKCk7XG4gICAgY29uc3QgZ3BTZXQgPSBnZW5lcmF0b3JUb1Byb21pc2VTZXQuZ2V0KHRoaXMpITtcbiAgICBpZiAodGhpcy5yZXF1aXJlc0tleUhhc2hlcilcbiAgICAgIGdwU2V0LnJlcXVpcmVLZXlIYXNoZXIoKTtcbiAgICBpZiAodGhpcy5yZXF1aXJlc1dlYWtLZXlDb21wb3NlcilcbiAgICAgIGdwU2V0LnJlcXVpcmVXZWFrS2V5Q29tcG9zZXIoKTtcblxuICAgIGlmICghdGhpcy4jaW50ZXJuYWxGbGFnU2V0Py5oYXMoXCJwcmV2ZW50IGV4cG9ydFwiKSlcbiAgICAgIGF3YWl0IHRoaXMuI3dyaXRlU291cmNlKCk7XG5cbiAgICB0aGlzLiNzdGF0dXMgPSBcImNvbXBsZXRlZFwiO1xuICAgIHJldHVybiB0aGlzLiNjb25maWd1cmF0aW9uRGF0YS5jbGFzc05hbWU7XG4gIH1cblxuICAjZmlsZVByb2xvZ3VlKCkgOiBzdHJpbmcge1xuICAgIGxldCBmaWxlT3ZlcnZpZXcgPSBcIlwiO1xuICAgIGlmICghdGhpcy4jaW50ZXJuYWxGbGFnU2V0Py5oYXMoXCJubyBAZmlsZVwiKSAmJiB0aGlzLiNjb25maWd1cmF0aW9uRGF0YS5maWxlT3ZlcnZpZXcpIHtcbiAgICAgIGZpbGVPdmVydmlldyA9IHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLmZpbGVPdmVydmlldztcbiAgICAgIGZpbGVPdmVydmlldyA9IGZpbGVPdmVydmlldy5zcGxpdChcIlxcblwiKS5tYXAobGluZSA9PiBcIiAqXCIgKyAobGluZS50cmltKCkgPyBcIiBcIiArIGxpbmUgOiBcIlwiKSkuam9pbihcIlxcblwiKTtcbiAgICB9XG5cbiAgICBsZXQgbGluZXMgPSBbXG4gICAgICB0aGlzLiNjb21waWxlT3B0aW9ucy5saWNlbnNlVGV4dCA/IHRoaXMuI2NvbXBpbGVPcHRpb25zLmxpY2Vuc2VUZXh0ICsgXCJcXG5cXG5cIiA6IFwiXCIsXG4gICAgICBgLyoqXG4gKiBAZmlsZVxuICogVGhpcyBpcyBnZW5lcmF0ZWQgY29kZS4gIERvIG5vdCBlZGl0LlxuICpcbiAqIEdlbmVyYXRvcjogaHR0cHM6Ly9naXRodWIuY29tL2FqdmluY2VudC9jb21wb3NpdGUtY29sbGVjdGlvbi9cbmAudHJpbSgpLFxuICAgICAgdGhpcy4jY29tcGlsZU9wdGlvbnMubGljZW5zZSA/IGAgKiBAbGljZW5zZSAke3RoaXMuI2NvbXBpbGVPcHRpb25zLmxpY2Vuc2V9YCA6IFwiXCIsXG4gICAgICB0aGlzLiNjb21waWxlT3B0aW9ucy5hdXRob3IgPyBgICogQGF1dGhvciAke3RoaXMuI2NvbXBpbGVPcHRpb25zLmF1dGhvcn1gIDogXCJcIixcbiAgICAgIHRoaXMuI2NvbXBpbGVPcHRpb25zLmNvcHlyaWdodCA/IGAgKiBAY29weXJpZ2h0ICR7dGhpcy4jY29tcGlsZU9wdGlvbnMuY29weXJpZ2h0fWAgOiBcIlwiLFxuICAgICAgZmlsZU92ZXJ2aWV3LFxuICAgICAgXCIgKi9cIlxuICAgIF07XG5cbiAgICBsaW5lcyA9IGxpbmVzLmZpbHRlcihCb29sZWFuKTtcbiAgICBsaW5lcyA9IGxpbmVzLm1hcChsaW5lID0+IGxpbmUgPT09IFwiICogXCIgPyBcIiAqXCIgOiBsaW5lKTtcblxuICAgIGxldCBnZW5lcmF0ZWRDb2RlTm90aWNlID0gbGluZXMuam9pbihcIlxcblwiKTtcbiAgICBjb25zdCBwcm9sb2d1ZSA9IFtcbiAgICAgIGdlbmVyYXRlZENvZGVOb3RpY2UudHJpbSgpLFxuICAgIF07XG5cbiAgICByZXR1cm4gcHJvbG9ndWUuZmlsdGVyKEJvb2xlYW4pLmpvaW4oXCJcXG5cXG5cIik7XG4gIH1cblxuICAjYnVpbGREZWZpbmVzKCkgOiB2b2lkIHtcbiAgICB0aGlzLiNkZWZpbmVzLmNsZWFyKCk7XG5cbiAgICBjb25zdCBkYXRhID0gdGhpcy4jY29uZmlndXJhdGlvbkRhdGE7XG4gICAgdGhpcy4jZGVmaW5lcy5zZXQoXCJjbGFzc05hbWVcIiwgZGF0YS5jbGFzc05hbWUpO1xuXG4gICAgY29uc3QgbWFwS2V5cyA9IGRhdGEud2Vha01hcEtleXMuY29uY2F0KGRhdGEuc3Ryb25nTWFwS2V5cyk7XG4gICAgY29uc3Qgc2V0S2V5cyA9IGRhdGEud2Vha1NldEVsZW1lbnRzLmNvbmNhdChkYXRhLnN0cm9uZ1NldEVsZW1lbnRzKTtcblxuICAgIHRoaXMuI2RlZmluZXMuc2V0KFwiaW1wb3J0TGluZXNcIiwgZGF0YS5pbXBvcnRMaW5lcyk7XG5cbiAgICB7XG4gICAgICBjb25zdCBrZXlzID0gQXJyYXkuZnJvbShkYXRhLnBhcmFtZXRlclRvVHlwZU1hcC5rZXlzKCkpO1xuICAgICAgdGhpcy4jZGVmaW5lcy5zZXQoXCJhcmdMaXN0XCIsIGtleXMuam9pbihcIiwgXCIpKTtcbiAgICAgIHRoaXMuI2RlZmluZXMuc2V0KFwiYXJnTmFtZUxpc3RcIiwgQ29kZUdlbmVyYXRvci5idWlsZEFyZ05hbWVMaXN0KGtleXMpKTtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJhbXNEYXRhID0gQXJyYXkuZnJvbShkYXRhLnBhcmFtZXRlclRvVHlwZU1hcC52YWx1ZXMoKSk7XG5cbiAgICBpZiAoL1NvbG98V2Vha1xcLz9NYXAvLnRlc3QoZGF0YS5jb2xsZWN0aW9uVGVtcGxhdGUpKSB7XG4gICAgICB0aGlzLiNkZWZpbmVBcmdDb3VudEFuZExpc3RzKFwid2Vha01hcFwiLCBkYXRhLndlYWtNYXBLZXlzKTtcbiAgICAgIHRoaXMuI2RlZmluZUFyZ0NvdW50QW5kTGlzdHMoXCJzdHJvbmdNYXBcIiwgZGF0YS5zdHJvbmdNYXBLZXlzKTtcbiAgICB9XG5cbiAgICBpZiAoL1NvbG98V2Vha1xcLz9TZXQvLnRlc3QoZGF0YS5jb2xsZWN0aW9uVGVtcGxhdGUpKSB7XG4gICAgICB0aGlzLiNkZWZpbmVBcmdDb3VudEFuZExpc3RzKFwid2Vha1NldFwiLCBkYXRhLndlYWtTZXRFbGVtZW50cyk7XG4gICAgICB0aGlzLiNkZWZpbmVBcmdDb3VudEFuZExpc3RzKFwic3Ryb25nU2V0XCIsIGRhdGEuc3Ryb25nU2V0RWxlbWVudHMpO1xuICAgIH1cblxuICAgIGlmIChkYXRhLmNvbGxlY3Rpb25UZW1wbGF0ZS5pbmNsdWRlcyhcIk1hcE9mXCIpKSB7XG4gICAgICB0aGlzLiNkZWZpbmVBcmdDb3VudEFuZExpc3RzKFwibWFwXCIsIG1hcEtleXMpO1xuICAgICAgdGhpcy4jZGVmaW5lQXJnQ291bnRBbmRMaXN0cyhcInNldFwiLCBzZXRLZXlzKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy4jZGVmaW5lVmFsaWRhdG9yQ29kZShwYXJhbXNEYXRhLCBcInZhbGlkYXRlQXJndW1lbnRzXCIsICgpID0+IHRydWUpKVxuICAgICAgdGhpcy4jZGVmaW5lcy5zZXQoXCJpbnZva2VWYWxpZGF0ZVwiLCB0cnVlKTtcbiAgICB0aGlzLiNkZWZpbmVWYWxpZGF0b3JDb2RlKHBhcmFtc0RhdGEsIFwidmFsaWRhdGVNYXBBcmd1bWVudHNcIiwgcGQgPT4gbWFwS2V5cy5pbmNsdWRlcyhwZC5hcmd1bWVudE5hbWUpKTtcbiAgICB0aGlzLiNkZWZpbmVWYWxpZGF0b3JDb2RlKHBhcmFtc0RhdGEsIFwidmFsaWRhdGVTZXRBcmd1bWVudHNcIiwgcGQgPT4gc2V0S2V5cy5pbmNsdWRlcyhwZC5hcmd1bWVudE5hbWUpKTtcblxuICAgIGlmIChtYXBLZXlzLmxlbmd0aCkge1xuICAgICAgdGhpcy4jZGVmaW5lcy5zZXQoXG4gICAgICAgIFwibWFwQXJndW1lbnQwVHlwZVwiLFxuICAgICAgICBkYXRhLnBhcmFtZXRlclRvVHlwZU1hcC5nZXQobWFwS2V5c1swXSkhLmFyZ3VtZW50VHlwZVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoc2V0S2V5cy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuI2RlZmluZXMuc2V0KFxuICAgICAgICBcInNldEFyZ3VtZW50MFR5cGVcIixcbiAgICAgICAgZGF0YS5wYXJhbWV0ZXJUb1R5cGVNYXAuZ2V0KHNldEtleXNbMF0pIS5hcmd1bWVudFR5cGVcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKGRhdGEudmFsdWVUeXBlKSB7XG4gICAgICBsZXQgZmlsdGVyID0gKGRhdGEudmFsdWVUeXBlLmFyZ3VtZW50VmFsaWRhdG9yIHx8IFwiXCIpLnRyaW0oKTtcbiAgICAgIGlmIChmaWx0ZXIpXG4gICAgICAgIHRoaXMuI2RlZmluZXMuc2V0KFwidmFsaWRhdGVWYWx1ZVwiLCBmaWx0ZXIgKyBcIlxcbiAgICBcIik7XG5cbiAgICAgIHRoaXMuI2RlZmluZXMuc2V0KFxuICAgICAgICBcInZhbHVlVHlwZVwiLFxuICAgICAgICBkYXRhLnZhbHVlVHlwZS5hcmd1bWVudFR5cGVcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgI2RlZmluZUFyZ0NvdW50QW5kTGlzdHMoXG4gICAgcHJlZml4OiBzdHJpbmcsXG4gICAga2V5QXJyYXk6IHN0cmluZ1tdXG4gICkgOiB2b2lkXG4gIHtcbiAgICB0aGlzLiNkZWZpbmVzLnNldChwcmVmaXggKyBcIkNvdW50XCIsIGtleUFycmF5Lmxlbmd0aCk7XG4gICAgdGhpcy4jZGVmaW5lcy5zZXQocHJlZml4ICsgXCJBcmdMaXN0XCIsIGtleUFycmF5LmpvaW4oXCIsIFwiKSk7XG4gICAgdGhpcy4jZGVmaW5lcy5zZXQocHJlZml4ICsgXCJBcmdOYW1lTGlzdFwiLCBKU09OLnN0cmluZ2lmeShrZXlBcnJheSkpO1xuICAgIGlmIChrZXlBcnJheS5sZW5ndGgpXG4gICAgICB0aGlzLiNkZWZpbmVzLnNldChwcmVmaXggKyBcIkFyZ3VtZW50MFwiLCBrZXlBcnJheVswXSk7XG4gIH1cblxuICAjZGVmaW5lVmFsaWRhdG9yQ29kZShcbiAgICBwYXJhbXNEYXRhOiBDb2xsZWN0aW9uVHlwZVtdLFxuICAgIGRlZmluZU5hbWU6IHN0cmluZyxcbiAgICBmaWx0ZXI6ICh2YWx1ZTogQ29sbGVjdGlvblR5cGUpID0+IGJvb2xlYW5cbiAgKSA6IGJvb2xlYW5cbiAge1xuICAgIGNvbnN0IHZhbGlkYXRvckNvZGUgPSBwYXJhbXNEYXRhLmZpbHRlcihmaWx0ZXIpLm1hcChwZCA9PiB7XG4gICAgICByZXR1cm4gcGQuYXJndW1lbnRWYWxpZGF0b3IgfHwgXCJcIjtcbiAgICB9KS5maWx0ZXIoQm9vbGVhbikuam9pbihcIlxcblxcblwiKS50cmltKCk7XG5cbiAgICBpZiAodmFsaWRhdG9yQ29kZSkge1xuICAgICAgdGhpcy4jZGVmaW5lcy5zZXQoZGVmaW5lTmFtZSwgdmFsaWRhdG9yQ29kZSk7XG4gICAgfVxuICAgIHJldHVybiBCb29sZWFuKHZhbGlkYXRvckNvZGUpO1xuICB9XG5cbiAgI2J1aWxkT25lVG9PbmVEZWZpbmVzKGJhc2U6IENvbGxlY3Rpb25Db25maWd1cmF0aW9uIHwgc3ltYm9sKSA6IHZvaWQge1xuICAgIHRoaXMuI2RlZmluZXMuY2xlYXIoKTtcblxuICAgIGNvbnN0IGRhdGEgPSB0aGlzLiNjb25maWd1cmF0aW9uRGF0YTtcbiAgICBjb25zdCBiYXNlRGF0YSA9IENvbmZpZ3VyYXRpb25EYXRhLmNsb25lRGF0YShiYXNlKSE7XG4gICAgdGhpcy4jZGVmaW5lcy5zZXQoXCJjbGFzc05hbWVcIiwgZGF0YS5jbGFzc05hbWUpO1xuICAgIHRoaXMuI2RlZmluZXMuc2V0KFwiYmFzZUNsYXNzTmFtZVwiLCBiYXNlRGF0YS5jbGFzc05hbWUpO1xuICAgIHRoaXMuI2RlZmluZXMuc2V0KFwiY29uZmlndXJlT3B0aW9uc1wiLCBkYXRhLm9uZVRvT25lT3B0aW9ucyk7XG5cbiAgICBjb25zdCB3ZWFrS2V5TmFtZSA9IGRhdGEub25lVG9PbmVLZXlOYW1lO1xuICAgIHRoaXMuI2RlZmluZXMuc2V0KFwid2Vha0tleU5hbWVcIiwgd2Vha0tleU5hbWUpO1xuXG4gICAgLy8gYmluZE9uZVRvT25lIGFyZ3VtZW50c1xuICAgIGxldCBrZXlzID0gQXJyYXkuZnJvbShiYXNlRGF0YS5wYXJhbWV0ZXJUb1R5cGVNYXAua2V5cygpKTtcbiAgICB0aGlzLiNkZWZpbmVzLnNldChcImJhc2VBcmdMaXN0XCIsIGtleXMuc2xpY2UoKSk7XG5cbiAgICBrZXlzLnNwbGljZShrZXlzLmluZGV4T2Yod2Vha0tleU5hbWUpLCAxKTtcbiAgICB0aGlzLiNkZWZpbmVzLnNldChcImJpbmRBcmdMaXN0XCIsIGtleXMpO1xuXG4gICAgY29uc3Qgd3JhcEJhc2VDbGFzcyA9IGJhc2VEYXRhLndlYWtNYXBLZXlzLmxlbmd0aCArIGJhc2VEYXRhLnN0cm9uZ01hcEtleXMubGVuZ3RoID49IDI7XG4gICAgdGhpcy4jZGVmaW5lcy5zZXQoXCJ3cmFwQmFzZUNsYXNzXCIsIHdyYXBCYXNlQ2xhc3MpO1xuXG4gICAgY29uc3QgcGFyYW1ldGVycyA9IEFycmF5LmZyb20oYmFzZURhdGEucGFyYW1ldGVyVG9UeXBlTWFwLnZhbHVlcygpKTtcbiAgICB0aGlzLiNkZWZpbmVzLnNldChcImJhc2VDbGFzc1ZhbGlkYXRlc0tleVwiLCBwYXJhbWV0ZXJzLnNvbWUocGFyYW0gPT4gcGFyYW0uYXJndW1lbnRWYWxpZGF0b3IpKTtcbiAgICB0aGlzLiNkZWZpbmVzLnNldChcImJhc2VDbGFzc1ZhbGlkYXRlc1ZhbHVlXCIsIEJvb2xlYW4oYmFzZURhdGEudmFsdWVUeXBlPy5hcmd1bWVudFZhbGlkYXRvcikpO1xuICB9XG5cbiAgI2J1aWxkRG9jR2VuZXJhdG9yKCkgOiB2b2lkIHtcbiAgICBjb25zdCBnZW5lcmF0b3IgPSBuZXcgSlNEb2NHZW5lcmF0b3IoXG4gICAgICB0aGlzLiNjb25maWd1cmF0aW9uRGF0YS5jbGFzc05hbWUsXG4gICAgICAhdGhpcy4jY29uZmlndXJhdGlvbkRhdGEuY29sbGVjdGlvblRlbXBsYXRlLmVuZHNXaXRoKFwiTWFwXCIpXG4gICAgKTtcblxuICAgIHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLnBhcmFtZXRlclRvVHlwZU1hcC5mb3JFYWNoKHR5cGVEYXRhID0+IHtcbiAgICAgIGdlbmVyYXRvci5hZGRQYXJhbWV0ZXIodHlwZURhdGEpO1xuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLnZhbHVlVHlwZSAmJiAhdGhpcy4jY29uZmlndXJhdGlvbkRhdGEucGFyYW1ldGVyVG9UeXBlTWFwLmhhcyhcInZhbHVlXCIpKSB7XG4gICAgICBnZW5lcmF0b3IuYWRkUGFyYW1ldGVyKHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLnZhbHVlVHlwZSk7XG4gICAgfVxuXG4gICAgdGhpcy4jZG9jR2VuZXJhdG9ycy5wdXNoKGdlbmVyYXRvcik7XG4gIH1cblxuICBhc3luYyAjYnVpbGRPbmVUb09uZURvY0dlbmVyYXRvcnMoYmFzZTogQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24gfCBzeW1ib2wpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgYmFzZURhdGEgPSBDb25maWd1cmF0aW9uRGF0YS5jbG9uZURhdGEoYmFzZSkhO1xuXG4gICAgLy8gRm9yIHRoZSBzb2xvIGRvYyBnZW5lcmF0b3IsIHRoZSB2YWx1ZSBhcmd1bWVudCBjb21lcyBmaXJzdC5cbiAgICBsZXQgZ2VuZXJhdG9yID0gYXdhaXQgdGhpcy4jY3JlYXRlT25lVG9PbmVHZW5lcmF0b3IoXCJvbmVUb09uZVNvbG9BcmdcIik7XG4gICAgZ2VuZXJhdG9yLmFkZFBhcmFtZXRlcihiYXNlRGF0YS52YWx1ZVR5cGUgfHwgbmV3IENvbGxlY3Rpb25UeXBlKFwidmFsdWVcIiwgXCJNYXBcIiwgXCIqXCIsIFwiVGhlIHZhbHVlLlwiLCBcIlwiKSk7XG4gICAgdGhpcy4jYXBwZW5kVHlwZXNUb0RvY0dlbmVyYXRvcihiYXNlLCBnZW5lcmF0b3IsIFwiXCIsIGZhbHNlKTtcblxuICAgIC8vIEZvciB0aGUgZHVvIGRvYyBnZW5lcmF0b3IsIHRoZXJlIGFyZSB0d28gb2YgZWFjaCBhcmd1bWVudCwgYW5kIHR3byB2YWx1ZXMuXG4gICAgZ2VuZXJhdG9yID0gYXdhaXQgdGhpcy4jY3JlYXRlT25lVG9PbmVHZW5lcmF0b3IoXCJvbmVUb09uZUR1b0FyZ1wiKTtcbiAgICB0aGlzLiNhcHBlbmRUeXBlc1RvRG9jR2VuZXJhdG9yKGJhc2UsIGdlbmVyYXRvciwgXCJfMVwiLCB0cnVlKTtcbiAgICB0aGlzLiNhcHBlbmRUeXBlc1RvRG9jR2VuZXJhdG9yKGJhc2UsIGdlbmVyYXRvciwgXCJfMlwiLCB0cnVlKTtcbiAgfVxuXG4gIGFzeW5jICNjcmVhdGVPbmVUb09uZUdlbmVyYXRvcihtb2R1bGVOYW1lOiBzdHJpbmcpIDogUHJvbWlzZTxKU0RvY0dlbmVyYXRvcj4ge1xuICAgIGNvbnN0IGdlbmVyYXRvciA9IG5ldyBKU0RvY0dlbmVyYXRvcihcbiAgICAgIHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLmNsYXNzTmFtZSxcbiAgICAgIGZhbHNlXG4gICAgKTtcblxuICAgIGF3YWl0IGdlbmVyYXRvci5zZXRNZXRob2RQYXJhbWV0ZXJzQnlNb2R1bGUobW9kdWxlTmFtZSk7XG4gICAgdGhpcy4jZG9jR2VuZXJhdG9ycy5wdXNoKGdlbmVyYXRvcik7XG4gICAgcmV0dXJuIGdlbmVyYXRvcjtcbiAgfVxuXG4gICNhcHBlbmRUeXBlc1RvRG9jR2VuZXJhdG9yKFxuICAgIGJhc2U6IENvbGxlY3Rpb25Db25maWd1cmF0aW9uIHwgc3ltYm9sLFxuICAgIGdlbmVyYXRvcjogSlNEb2NHZW5lcmF0b3IsXG4gICAgdHlwZVN1ZmZpeDogc3RyaW5nLFxuICAgIGFkZFZhbHVlOiBib29sZWFuXG4gICkgOiB2b2lkXG4gIHtcbiAgICBjb25zdCBiYXNlRGF0YSA9IENvbmZpZ3VyYXRpb25EYXRhLmNsb25lRGF0YShiYXNlKSE7XG5cbiAgICBiYXNlRGF0YS5wYXJhbWV0ZXJUb1R5cGVNYXAuZGVsZXRlKHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLm9uZVRvT25lS2V5TmFtZSk7XG5cbiAgICBiYXNlRGF0YS5wYXJhbWV0ZXJUb1R5cGVNYXAuZm9yRWFjaCh0eXBlRGF0YSA9PiB7XG4gICAgICBnZW5lcmF0b3IuYWRkUGFyYW1ldGVyKG5ldyBDb2xsZWN0aW9uVHlwZShcbiAgICAgICAgdHlwZURhdGEuYXJndW1lbnROYW1lICsgdHlwZVN1ZmZpeCxcbiAgICAgICAgdHlwZURhdGEubWFwT3JTZXRUeXBlLFxuICAgICAgICB0eXBlRGF0YS5hcmd1bWVudFR5cGUsXG4gICAgICAgIHR5cGVEYXRhLmRlc2NyaXB0aW9uLFxuICAgICAgICB0eXBlRGF0YS5hcmd1bWVudFZhbGlkYXRvclxuICAgICAgKSk7XG4gICAgfSk7XG5cbiAgICBpZiAoYWRkVmFsdWUpIHtcbiAgICAgIGxldCB7XG4gICAgICAgIGFyZ3VtZW50TmFtZSA9IFwidmFsdWVcIixcbiAgICAgICAgbWFwT3JTZXRUeXBlID0gXCJNYXBcIixcbiAgICAgICAgYXJndW1lbnRUeXBlID0gXCIqXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uID0gXCJUaGUgdmFsdWUuXCIsXG4gICAgICAgIGFyZ3VtZW50VmFsaWRhdG9yID0gXCJcIlxuICAgICAgfSA9IGJhc2VEYXRhLnZhbHVlVHlwZSB8fCB7fTtcbiAgICAgIGFyZ3VtZW50TmFtZSArPSB0eXBlU3VmZml4O1xuICAgICAgZ2VuZXJhdG9yLmFkZFBhcmFtZXRlcihuZXcgQ29sbGVjdGlvblR5cGUoXG4gICAgICAgIGFyZ3VtZW50TmFtZSwgbWFwT3JTZXRUeXBlLCBhcmd1bWVudFR5cGUsIGRlc2NyaXB0aW9uLCBhcmd1bWVudFZhbGlkYXRvclxuICAgICAgKSk7XG4gICAgfVxuICB9XG5cbiAgI2dlbmVyYXRlU291cmNlKCkgOiB2b2lkIHtcbiAgICBjb25zdCBnZW5lcmF0b3IgPSBUZW1wbGF0ZUdlbmVyYXRvcnMuZ2V0KHRoaXMuI2Nob29zZUNvbGxlY3Rpb25UZW1wbGF0ZSgpKSE7XG5cbiAgICBsZXQgY29kZVNlZ21lbnRzID0gW1xuICAgICAgdGhpcy4jZ2VuZXJhdGVkQ29kZSxcbiAgICAgIGdlbmVyYXRvcih0aGlzLiNkZWZpbmVzLCAuLi50aGlzLiNkb2NHZW5lcmF0b3JzKSxcbiAgICBdO1xuXG4gICAgaWYgKCF0aGlzLiNpbnRlcm5hbEZsYWdTZXQ/LmhhcyhcInByZXZlbnQgZXhwb3J0XCIpKSB7XG4gICAgICBjb2RlU2VnbWVudHMgPSBbXG4gICAgICAgIHRoaXMuI2ZpbGVQcm9sb2d1ZSgpLFxuICAgICAgICAuLi5jb2RlU2VnbWVudHMsXG4gICAgICAgIGBleHBvcnQgZGVmYXVsdCAke3RoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLmNsYXNzTmFtZX07YFxuICAgICAgXTtcbiAgICB9XG5cbiAgICB0aGlzLiNnZW5lcmF0ZWRDb2RlID0gY29kZVNlZ21lbnRzLmZsYXQoSW5maW5pdHkpLmZpbHRlcihCb29sZWFuKS5qb2luKFwiXFxuXFxuXCIpO1xuXG4gICAgdGhpcy4jZ2VuZXJhdGVkQ29kZSA9IGJlYXV0aWZ5KFxuICAgICAgdGhpcy4jZ2VuZXJhdGVkQ29kZSxcbiAgICAgIHtcbiAgICAgICAgXCJpbmRlbnRfc2l6ZVwiOiAyLFxuICAgICAgICBcImluZGVudF9jaGFyXCI6IFwiIFwiLFxuICAgICAgICBcImVuZF93aXRoX25ld2xpbmVcIjogdHJ1ZSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy4jZ2VuZXJhdGVkQ29kZSA9IHRoaXMuI2dlbmVyYXRlZENvZGUucmVwbGFjZSgvXFxuezMsfS9nLCBcIlxcblxcblwiKTtcbiAgfVxuXG4gICNjaG9vc2VDb2xsZWN0aW9uVGVtcGxhdGUoKSA6IHN0cmluZyB7XG4gICAgbGV0IHN0YXJ0VGVtcGxhdGUgPSB0aGlzLiNjb25maWd1cmF0aW9uRGF0YS5jb2xsZWN0aW9uVGVtcGxhdGU7XG5cbiAgICBjb25zdCB3ZWFrTWFwQ291bnQgPSB0aGlzLiNjb25maWd1cmF0aW9uRGF0YS53ZWFrTWFwS2V5cz8ubGVuZ3RoIHx8IDAsXG4gICAgICAgICAgc3Ryb25nTWFwQ291bnQgPSB0aGlzLiNjb25maWd1cmF0aW9uRGF0YS5zdHJvbmdNYXBLZXlzPy5sZW5ndGggfHwgMCxcbiAgICAgICAgICB3ZWFrU2V0Q291bnQgPSB0aGlzLiNjb25maWd1cmF0aW9uRGF0YS53ZWFrU2V0RWxlbWVudHM/Lmxlbmd0aCB8fCAwLFxuICAgICAgICAgIHN0cm9uZ1NldENvdW50ID0gdGhpcy4jY29uZmlndXJhdGlvbkRhdGEuc3Ryb25nU2V0RWxlbWVudHM/Lmxlbmd0aCB8fCAwO1xuXG4gICAgY29uc3QgbWFwQ291bnQgPSB3ZWFrTWFwQ291bnQgKyBzdHJvbmdNYXBDb3VudCxcbiAgICAgICAgICBzZXRDb3VudCA9IHdlYWtTZXRDb3VudCArIHN0cm9uZ1NldENvdW50O1xuXG4gICAgaWYgKG1hcENvdW50ICYmIHNldENvdW50ICYmICF0aGlzLiNjb21waWxlT3B0aW9ucy5kaXNhYmxlS2V5T3B0aW1pemF0aW9uKSB7XG4gICAgICAvLyBNYXAgb2YgU2V0cywgbWF5YmUgb3B0aW1pemVkXG4gICAgICBjb25zdCBzaG9ydEtleSA9IFtcbiAgICAgICAgbWFwQ291bnQgPiAxID8gXCJuXCIgOiBcIjFcIixcbiAgICAgICAgd2Vha01hcENvdW50ID8gXCJXXCIgOiBcIlNcIixcbiAgICAgICAgXCIvXCIsXG4gICAgICAgIHNldENvdW50ID4gMSA/IFwiblwiIDogXCIxXCIsXG4gICAgICAgIHdlYWtTZXRDb3VudCA/IFwiV1wiIDogXCJTXCJcbiAgICAgIF0uam9pbihcIlwiKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGBcXG5cXG4ke3Nob3J0S2V5fSAke0FycmF5LmZyb20odGhpcy4jZGVmaW5lcy5rZXlzKCkpLmpvaW4oXCIsIFwiKX1cXG5cXG5gKTtcbiAgICAgIHJldHVybiBDb2RlR2VuZXJhdG9yLiNtYXBPZlN0cm9uZ1NldHNUZW1wbGF0ZXMuZ2V0KHNob3J0S2V5KSB8fCBzdGFydFRlbXBsYXRlO1xuICAgIH1cblxuICAgIHJldHVybiBzdGFydFRlbXBsYXRlO1xuICB9XG5cbiAgYXN5bmMgI3dyaXRlU291cmNlKCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gZnMud3JpdGVGaWxlKFxuICAgICAgdGhpcy4jdGFyZ2V0UGF0aCxcbiAgICAgIHRoaXMuI2dlbmVyYXRlZENvZGUsXG4gICAgICB7IGVuY29kaW5nOiBcInV0Zi04XCIgfVxuICAgICk7XG4gIH1cblxuICBhc3luYyAjYnVpbGRPbmVUb09uZUJhc2UoYmFzZTogQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24gfCBzeW1ib2wpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgYmFzZURhdGEgPSBDb25maWd1cmF0aW9uRGF0YS5jbG9uZURhdGEoYmFzZSkhO1xuICAgIGlmIChiYXNlRGF0YS5jbGFzc05hbWUgPT09IFwiV2Vha01hcFwiKVxuICAgICAgcmV0dXJuO1xuICAgIGlmICh0eXBlb2YgYmFzZSA9PT0gXCJzeW1ib2xcIilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImFzc2VydGlvbjogdW5yZWFjaGFibGVcIik7XG5cbiAgICBpZiAodGhpcy4jY29uZmlndXJhdGlvbkRhdGEub25lVG9PbmVPcHRpb25zPy5wYXRoVG9CYXNlTW9kdWxlKSB7XG4gICAgICB0aGlzLiNnZW5lcmF0ZWRDb2RlICs9IGBpbXBvcnQgJHtiYXNlRGF0YS5jbGFzc05hbWV9IGZyb20gXCIke3RoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLm9uZVRvT25lT3B0aW9ucy5wYXRoVG9CYXNlTW9kdWxlfVwiO2A7XG4gICAgICB0aGlzLiNnZW5lcmF0ZWRDb2RlICs9IGJhc2VEYXRhLmltcG9ydExpbmVzO1xuICAgICAgdGhpcy4jZ2VuZXJhdGVkQ29kZSArPSBcIlxcblwiO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHN1YkNvbXBpbGVPcHRpb25zID0gT2JqZWN0LmNyZWF0ZSh0aGlzLiNjb21waWxlT3B0aW9ucyk7XG4gICAgY29uc3QgaW50ZXJuYWxGbGFnczogSW50ZXJuYWxGbGFncyA9IG5ldyBTZXQoW1xuICAgICAgXCJwcmV2ZW50IGV4cG9ydFwiLFxuICAgICAgXCJjb25maWd1cmF0aW9uIG9rXCIsXG4gICAgICBcIm5vIEBmaWxlXCIsXG4gICAgXSk7XG5cbiAgICB0aGlzLiNvbmVUb09uZVN1YkdlbmVyYXRvciA9IG5ldyBDb2RlR2VuZXJhdG9yKFxuICAgICAgYmFzZSxcbiAgICAgIHRoaXMuI3RhcmdldFBhdGgsXG4gICAgICBzdWJDb21waWxlT3B0aW9uc1xuICAgICk7XG4gICAgQ29kZUdlbmVyYXRvci4jZ2VuZXJhdG9yVG9JbnRlcm5hbEZsYWdzLnNldCh0aGlzLiNvbmVUb09uZVN1YkdlbmVyYXRvciwgaW50ZXJuYWxGbGFncyk7XG5cbiAgICBhd2FpdCB0aGlzLiNvbmVUb09uZVN1YkdlbmVyYXRvci5ydW4oKTtcblxuICAgIHRoaXMuI2dlbmVyYXRlZENvZGUgKz0gdGhpcy4jb25lVG9PbmVTdWJHZW5lcmF0b3IuZ2VuZXJhdGVkQ29kZSArIFwiXFxuXCI7XG4gIH1cblxuICAvLyAjZW5kcmVnaW9uIHByaXZhdGUgbWV0aG9kc1xufVxuT2JqZWN0LmZyZWV6ZShDb2RlR2VuZXJhdG9yKTtcbk9iamVjdC5mcmVlemUoQ29kZUdlbmVyYXRvci5wcm90b3R5cGUpO1xuIl19