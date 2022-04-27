/**
 * @module source/CodeGenerator.mjs
 */
/** @typedef {string} identifier */
import CollectionConfiguration from "./CollectionConfiguration.mjs";
import CompileTimeOptions from "./CompileTimeOptions.mjs";
import CollectionType from "./generatorTools/CollectionType.mjs";
import ConfigurationData from "./generatorTools/ConfigurationData.mjs";
import JSDocGenerator from "./generatorTools/JSDocGenerator.mjs";
import PreprocessorDefines from "./generatorTools/PreprocessorDefines.mjs";
import TemplateGenerators from "./generatorTools/TemplateGenerators.mjs";
import { GeneratorPromiseSet, CodeGeneratorBase, generatorToPromiseSet, } from "./generatorTools/GeneratorPromiseSet.mjs";
import { Deferred } from "./utilities/PromiseTypes.mjs";
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
    #defines = new PreprocessorDefines();
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
        const data = this.#configurationData;
        this.#defines.className = data.className;
        const mapKeys = data.weakMapKeys.concat(data.strongMapKeys);
        const setKeys = data.weakSetElements.concat(data.strongSetElements);
        this.#defines.importLines = data.importLines;
        {
            const keys = Array.from(data.parameterToTypeMap.keys());
            this.#defines.argList = keys.join(", ");
            this.#defines.argNameList = CodeGenerator.buildArgNameList(keys);
        }
        const paramsData = Array.from(data.parameterToTypeMap.values());
        if (/Solo|Weak\/?Map/.test(data.collectionTemplate)) {
            this.#defines.weakMapKeys = data.weakMapKeys.slice();
            this.#defines.strongMapKeys = data.strongMapKeys.slice();
        }
        if (/Solo|Weak\/?Set/.test(data.collectionTemplate)) {
            this.#defines.weakSetElements = data.weakSetElements.slice();
            this.#defines.strongSetElements = data.strongSetElements.slice();
        }
        if (data.collectionTemplate.includes("MapOf")) {
            this.#defines.mapKeys = mapKeys;
            this.#defines.setKeys = setKeys;
        }
        if (this.#defineValidatorCode(paramsData, "validateArguments", () => true))
            this.#defines.invokeValidate = true;
        this.#defineValidatorCode(paramsData, "validateMapArguments", pd => mapKeys.includes(pd.argumentName));
        this.#defineValidatorCode(paramsData, "validateSetArguments", pd => setKeys.includes(pd.argumentName));
        if (mapKeys.length) {
            const collection = data.parameterToTypeMap.get(mapKeys[0]);
            this.#defines.mapArgument0Type = collection.argumentType;
        }
        if (setKeys.length) {
            const collection = data.parameterToTypeMap.get(setKeys[0]);
            this.#defines.setArgument0Type = collection.argumentType;
        }
        if (data.valueType) {
            let filter = (data.valueType.argumentValidator || "").trim();
            if (filter)
                this.#defines.validateValue = filter + "\n    ";
            this.#defines.valueType = data.valueType.argumentType;
        }
    }
    #defineValidatorCode(paramsData, defineName, filter) {
        const validatorCode = paramsData.filter(filter).map(pd => {
            return pd.argumentValidator || "";
        }).filter(Boolean).join("\n\n").trim();
        if (validatorCode) {
            this.#defines[defineName] = validatorCode;
        }
        return Boolean(validatorCode);
    }
    #buildOneToOneDefines(base) {
        const data = this.#configurationData;
        const baseData = ConfigurationData.cloneData(base);
        this.#defines.className = data.className;
        this.#defines.baseClassName = baseData.className;
        this.#defines.configureOptions = data.oneToOneOptions;
        const weakKeyName = data.oneToOneKeyName;
        this.#defines.weakKeyName = weakKeyName;
        // bindOneToOne arguments
        let keys = Array.from(baseData.parameterToTypeMap.keys());
        this.#defines.baseArgList = keys.slice();
        keys.splice(keys.indexOf(weakKeyName), 1);
        this.#defines.bindArgList = keys;
        const wrapBaseClass = baseData.weakMapKeys.length + baseData.strongMapKeys.length >= 2;
        this.#defines.wrapBaseClass = wrapBaseClass;
        const parameters = Array.from(baseData.parameterToTypeMap.values());
        this.#defines.baseClassValidatesKey = parameters.some(param => param.argumentValidator);
        this.#defines.baseClassValidatesValue = Boolean(baseData.valueType?.argumentValidator);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29kZUdlbmVyYXRvci5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJDb2RlR2VuZXJhdG9yLm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILG1DQUFtQztBQUVuQyxPQUFPLHVCQUF1QixNQUFNLCtCQUErQixDQUFDO0FBQ3BFLE9BQU8sa0JBQWtCLE1BQU0sMEJBQTBCLENBQUM7QUFFMUQsT0FBTyxjQUFjLE1BQU0scUNBQXFDLENBQUM7QUFDakUsT0FBTyxpQkFBaUIsTUFBTSx3Q0FBd0MsQ0FBQztBQUN2RSxPQUFPLGNBQWMsTUFBTSxxQ0FBcUMsQ0FBQztBQUNqRSxPQUFPLG1CQUFtQixNQUFNLDBDQUEwQyxDQUFDO0FBQzNFLE9BQU8sa0JBQXdDLE1BQU0seUNBQXlDLENBQUM7QUFDL0YsT0FBTyxFQUNMLG1CQUFtQixFQUNuQixpQkFBaUIsRUFDakIscUJBQXFCLEdBQ3RCLE1BQU0sMENBQTBDLENBQUM7QUFFbEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBSXhELE9BQU8sRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUM3QixPQUFPLElBQUksTUFBTSxNQUFNLENBQUM7QUFDeEIsT0FBTyxRQUFRLE1BQU0sYUFBYSxDQUFDO0FBSW5DLGVBQWU7QUFDZixNQUFNLENBQUMsT0FBTyxPQUFPLGFBQWMsU0FBUSxpQkFBaUI7SUFDMUQsZ0NBQWdDO0lBQ2hDOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQWM7UUFDcEMsT0FBTyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFBO0lBQzNELENBQUM7SUFFRCxnQkFBZ0I7SUFDaEIsTUFBTSxDQUFDLHlCQUF5QixHQUFzQyxJQUFJLEdBQUcsQ0FBQztJQUU5RSw0Q0FBNEM7SUFD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QUMsYUFBYSxHQUFHLElBQUksQ0FBQztJQUN6RSxDQUFDOztBQUlILE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDN0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBtb2R1bGUgc291cmNlL0NvZGVHZW5lcmF0b3IubWpzXG4gKi9cblxuLyoqIEB0eXBlZGVmIHtzdHJpbmd9IGlkZW50aWZpZXIgKi9cblxuaW1wb3J0IENvbGxlY3Rpb25Db25maWd1cmF0aW9uIGZyb20gXCIuL0NvbGxlY3Rpb25Db25maWd1cmF0aW9uLm1qc1wiO1xuaW1wb3J0IENvbXBpbGVUaW1lT3B0aW9ucyBmcm9tIFwiLi9Db21waWxlVGltZU9wdGlvbnMubWpzXCI7XG5cbmltcG9ydCBDb2xsZWN0aW9uVHlwZSBmcm9tIFwiLi9nZW5lcmF0b3JUb29scy9Db2xsZWN0aW9uVHlwZS5tanNcIjtcbmltcG9ydCBDb25maWd1cmF0aW9uRGF0YSBmcm9tIFwiLi9nZW5lcmF0b3JUb29scy9Db25maWd1cmF0aW9uRGF0YS5tanNcIjtcbmltcG9ydCBKU0RvY0dlbmVyYXRvciBmcm9tIFwiLi9nZW5lcmF0b3JUb29scy9KU0RvY0dlbmVyYXRvci5tanNcIjtcbmltcG9ydCBQcmVwcm9jZXNzb3JEZWZpbmVzIGZyb20gXCIuL2dlbmVyYXRvclRvb2xzL1ByZXByb2Nlc3NvckRlZmluZXMubWpzXCI7XG5pbXBvcnQgVGVtcGxhdGVHZW5lcmF0b3JzLCB7IFRlbXBsYXRlRnVuY3Rpb24gfSBmcm9tIFwiLi9nZW5lcmF0b3JUb29scy9UZW1wbGF0ZUdlbmVyYXRvcnMubWpzXCI7XG5pbXBvcnQge1xuICBHZW5lcmF0b3JQcm9taXNlU2V0LFxuICBDb2RlR2VuZXJhdG9yQmFzZSxcbiAgZ2VuZXJhdG9yVG9Qcm9taXNlU2V0LFxufSBmcm9tIFwiLi9nZW5lcmF0b3JUb29scy9HZW5lcmF0b3JQcm9taXNlU2V0Lm1qc1wiO1xuXG5pbXBvcnQgeyBEZWZlcnJlZCB9IGZyb20gXCIuL3V0aWxpdGllcy9Qcm9taXNlVHlwZXMubWpzXCI7XG5pbXBvcnQgdHlwZSB7IFByb21pc2VSZXNvbHZlciB9IGZyb20gXCIuL3V0aWxpdGllcy9Qcm9taXNlVHlwZXMubWpzXCI7XG5cblxuaW1wb3J0IGZzIGZyb20gXCJmcy9wcm9taXNlc1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCBiZWF1dGlmeSBmcm9tIFwianMtYmVhdXRpZnlcIjtcblxudHlwZSBJbnRlcm5hbEZsYWdzID0gU2V0PHN0cmluZz47XG5cbi8qKiBAcGFja2FnZSAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29kZUdlbmVyYXRvciBleHRlbmRzIENvZGVHZW5lcmF0b3JCYXNlIHtcbiAgLy8gI3JlZ2lvbiBzdGF0aWMgcHJpdmF0ZSBmaWVsZHNcbiAgLyoqXG4gICAqIFN0cmluZ2lmeSBhIGxpc3Qgb2Yga2V5cyBpbnRvIGFuIGFyZ3VtZW50IG5hbWUgbGlzdCBzdWl0YWJsZSBmb3IgbWFjcm9zLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBrZXlzIFRoZSBrZXkgbmFtZXMuXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzZXJpYWxpemVkIGtleSBuYW1lcy5cbiAgICovXG4gIHN0YXRpYyBidWlsZEFyZ05hbWVMaXN0KGtleXM6IHN0cmluZ1tdKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuICdbJyArIGtleXMubWFwKGtleSA9PiBgXCIke2tleX1cImApLmpvaW4oXCIsIFwiKSArICddJ1xuICB9XG5cbiAgLyoqIEBjb25zdGFudCAqL1xuICBzdGF0aWMgI2dlbmVyYXRvclRvSW50ZXJuYWxGbGFnczogTWFwPENvZGVHZW5lcmF0b3IsIEludGVybmFsRmxhZ3M+ID0gbmV3IE1hcDtcblxuICAvKiogQHR5cGUge01hcDxzdHJpbmcsIHN0cmluZz59IEBjb25zdGFudCAqL1xuICBzdGF0aWMgI21hcE9mU3Ryb25nU2V0c1RlbXBsYXRlczogTWFwPHN0cmluZywgc3RyaW5nPiA9IG5ldyBNYXAoW1xuICAgIC8qXG4gICAga2V5OlxuICAgICAgUzogc3Ryb25nXG4gICAgICBXOiB3ZWFrXG4gICAgICAvOiBiZWZvcmUgYSBzbGFzaCBpcyBNYXAsIGFmdGVyIGlzIFNldFxuICAgICAgbjogbW9yZSB0aGFuIG9uZVxuICAgICAgMTogb25lXG5cbiAgICBTbzpcbiAgICAgIFwiMVcvblNcIiA9IG9uZSB3ZWFrIG1hcCBrZXksIG11bHRpcGxlIHN0cm9uZyBzZXQga2V5c1xuICAgICovXG4gICAgW1wiMVMvblNcIiwgXCJTdHJvbmcvT25lTWFwT2ZTdHJvbmdTZXRzXCJdLFxuICAgIFtcIm5TLzFTXCIsIFwiU3Ryb25nL01hcE9mT25lU3Ryb25nU2V0XCJdLFxuICAgIFtcIjFTLzFTXCIsIFwiU3Ryb25nL09uZU1hcE9mT25lU3Ryb25nU2V0XCJdLFxuXG4gICAgW1wiMVcvblNcIiwgXCJXZWFrL09uZU1hcE9mU3Ryb25nU2V0c1wiXSxcbiAgICBbXCJuVy8xU1wiLCBcIldlYWsvTWFwT2ZPbmVTdHJvbmdTZXRcIl0sXG4gICAgW1wiMVcvMVNcIiwgXCJXZWFrL09uZU1hcE9mT25lU3Ryb25nU2V0XCJdLFxuICBdKTtcblxuICAvLyAjZW5kcmVnaW9uIHN0YXRpYyBwcml2YXRlIGZpZWxkc1xuXG4gIC8vICNyZWdpb24gcHJpdmF0ZSBwcm9wZXJ0aWVzXG4gIC8qKiBAdHlwZSB7b2JqZWN0fSBAY29uc3RhbnQgKi9cbiAgI2NvbmZpZ3VyYXRpb25EYXRhOiBDb25maWd1cmF0aW9uRGF0YTtcblxuICAvKiogQHR5cGUge3N0cmluZ30gQGNvbnN0YW50ICovXG4gICN0YXJnZXRQYXRoOiBzdHJpbmc7XG5cbiAgLyoqIEB0eXBlIHtDb21waWxlVGltZU9wdGlvbnN9IEBjb25zdGFudCAqL1xuICAjY29tcGlsZU9wdGlvbnM6IENvbXBpbGVUaW1lT3B0aW9ucztcblxuICAjcGVuZGluZ1N0YXJ0OiBQcm9taXNlUmVzb2x2ZXI8bnVsbD47XG5cbiAgI3J1blByb21pc2U6IFJlYWRvbmx5PFByb21pc2U8c3RyaW5nPj47XG5cbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICNzdGF0dXMgPSBcIm5vdCBzdGFydGVkIHlldFwiO1xuXG4gIC8qKiBAdHlwZSB7TWFwPHN0cmluZywgKj59IEBjb25zdGFudCAqL1xuICAjZGVmaW5lczogUHJlcHJvY2Vzc29yRGVmaW5lcyA9IG5ldyBQcmVwcm9jZXNzb3JEZWZpbmVzKCk7XG5cbiAgLyoqIEB0eXBlIHtKU0RvY0dlbmVyYXRvcltdfSAqL1xuICAjZG9jR2VuZXJhdG9yczogSlNEb2NHZW5lcmF0b3JbXSA9IFtdO1xuXG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICAjZ2VuZXJhdGVkQ29kZSA9IFwiXCI7XG5cbiAgLyoqIEB0eXBlIHtTZXQ8c3RyaW5nPj99IEBjb25zdGFudCAqL1xuICAjaW50ZXJuYWxGbGFnU2V0OiBJbnRlcm5hbEZsYWdzID0gbmV3IFNldDtcblxuICAvKiogQHR5cGUge0NvZGVHZW5lcmF0b3IgfCBudWxsfSAqL1xuICAjb25lVG9PbmVTdWJHZW5lcmF0b3I6IENvZGVHZW5lcmF0b3IgfCBudWxsID0gbnVsbDtcblxuICAvLyAjZW5kcmVnaW9uIHByaXZhdGUgcHJvcGVydGllc1xuXG4gIC8vICNyZWdpb24gcHVibGljIG1lbWJlcnNcblxuICAvKipcbiAgICogQHBhcmFtIHtDb2xsZWN0aW9uQ29uZmlndXJhdGlvbn0gY29uZmlndXJhdGlvbiAgVGhlIGNvbmZpZ3VyYXRpb24gdG8gdXNlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICB0YXJnZXRQYXRoICAgICBUaGUgZGlyZWN0b3J5IHRvIHdyaXRlIHRoZSBjb2xsZWN0aW9uIHRvLlxuICAgKiBAcGFyYW0ge0NvbXBpbGVUaW1lT3B0aW9uc30gICAgICBjb21waWxlT3B0aW9ucyBGbGFncyBmcm9tIGFuIG93bmVyIHdoaWNoIG1heSBvdmVycmlkZSBjb25maWd1cmF0aW9ucy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIGNvbmZpZ3VyYXRpb246IENvbGxlY3Rpb25Db25maWd1cmF0aW9uLFxuICAgIHRhcmdldFBhdGg6IHN0cmluZyxcbiAgICBjb21waWxlT3B0aW9uczogQ29tcGlsZVRpbWVPcHRpb25zIHwgb2JqZWN0ID0ge31cbiAgKVxuICB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuI2NvbXBpbGVPcHRpb25zID0gKGNvbXBpbGVPcHRpb25zIGluc3RhbmNlb2YgQ29tcGlsZVRpbWVPcHRpb25zKSA/IGNvbXBpbGVPcHRpb25zIDogbmV3IENvbXBpbGVUaW1lT3B0aW9ucyh7fSk7XG5cbiAgICBpZiAoIShjb25maWd1cmF0aW9uIGluc3RhbmNlb2YgQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb24pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb25maWd1cmF0aW9uIGlzbid0IGEgQ29sbGVjdGlvbkNvbmZpZ3VyYXRpb25cIik7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB0YXJnZXRQYXRoICE9PSBcInN0cmluZ1wiKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGFyZ2V0IHBhdGggc2hvdWxkIGJlIGEgcGF0aCB0byBhIGZpbGUhXCIpO1xuXG4gICAgY29uZmlndXJhdGlvbi5sb2NrKCk7IC8vIHRoaXMgbWF5IHRocm93LCBidXQgaWYgc28sIGl0J3MgZ29vZCB0aGF0IGl0IGRvZXMgc28uXG4gICAgdGhpcy4jY29uZmlndXJhdGlvbkRhdGEgPSBDb25maWd1cmF0aW9uRGF0YS5jbG9uZURhdGEoY29uZmlndXJhdGlvbikgYXMgQ29uZmlndXJhdGlvbkRhdGE7XG4gICAgdGhpcy4jdGFyZ2V0UGF0aCA9IHRhcmdldFBhdGg7XG5cbiAgICBjb25zdCBncFNldCA9IG5ldyBHZW5lcmF0b3JQcm9taXNlU2V0KHRoaXMsIHBhdGguZGlybmFtZSh0YXJnZXRQYXRoKSk7XG4gICAgZ2VuZXJhdG9yVG9Qcm9taXNlU2V0LnNldCh0aGlzLCBncFNldCk7XG5cbiAgICBsZXQgZGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQ7XG4gICAgdGhpcy4jcGVuZGluZ1N0YXJ0ID0gZGVmZXJyZWQucmVzb2x2ZTtcbiAgICB0aGlzLiNydW5Qcm9taXNlID0gZGVmZXJyZWQucHJvbWlzZS50aGVuKCgpID0+IHRoaXMuI3J1bigpKTtcblxuICAgIE9iamVjdC5zZWFsKHRoaXMpO1xuICB9XG5cbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gIGdldCBzdGF0dXMoKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuI3N0YXR1cztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqXG4gICAqIFRoZSBnZW5lcmF0ZWQgY29kZSBhdCB0aGlzIHBvaW50LiAgVXNlZCBpbiAjYnVpbGRPbmVUb09uZUJhc2UoKSBieSBhIHBhcmVudCBDb2RlR2VuZXJhdG9yLlxuICAgKi9cbiAgZ2V0IGdlbmVyYXRlZENvZGUoKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuI2dlbmVyYXRlZENvZGU7XG4gIH1cblxuICBnZXQgcmVxdWlyZXNLZXlIYXNoZXIoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLiNnZW5lcmF0ZWRDb2RlPy5pbmNsdWRlcyhcIiBuZXcgS2V5SGFzaGVyKFwiKTtcbiAgfVxuXG4gIGdldCByZXF1aXJlc1dlYWtLZXlDb21wb3NlcigpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuI2dlbmVyYXRlZENvZGU/LmluY2x1ZGVzKFwiIG5ldyBXZWFrS2V5Q29tcG9zZXIoXCIpO1xuICB9XG5cbiAgYXN5bmMgcnVuKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgdGhpcy4jcGVuZGluZ1N0YXJ0KG51bGwpO1xuICAgIHJldHVybiBhd2FpdCB0aGlzLiNydW5Qcm9taXNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGlkZW50aWZpZXI+fSBUaGUgY2xhc3MgbmFtZS5cbiAgICovXG4gIGFzeW5jICNydW4oKSA6IFByb21pc2U8c3RyaW5nPiB7XG4gICAge1xuICAgICAgY29uc3QgZmxhZ3M6IEludGVybmFsRmxhZ3MgfCB1bmRlZmluZWQgPSBDb2RlR2VuZXJhdG9yLiNnZW5lcmF0b3JUb0ludGVybmFsRmxhZ3MuZ2V0KHRoaXMpO1xuICAgICAgaWYgKGZsYWdzKVxuICAgICAgICB0aGlzLiNpbnRlcm5hbEZsYWdTZXQgPSBmbGFncztcbiAgICB9XG5cbiAgICBjb25zdCBncFNldCA9IGdlbmVyYXRvclRvUHJvbWlzZVNldC5nZXQodGhpcykgYXMgR2VuZXJhdG9yUHJvbWlzZVNldDtcbiAgICBjb25zdCBoYXNJbml0aWFsVGFza3MgPSBncFNldC5oYXModGhpcy4jdGFyZ2V0UGF0aCk7XG4gICAgY29uc3QgYnAgPSBncFNldC5nZXQodGhpcy4jdGFyZ2V0UGF0aCk7XG5cbiAgICBpZiAoIWhhc0luaXRpYWxUYXNrcykge1xuICAgICAgYnAuYWRkVGFzayhhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuI2J1aWxkQ29sbGVjdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChleCkge1xuICAgICAgICAgIHRoaXMuI3N0YXR1cyA9IFwiYWJvcnRlZFwiO1xuICAgICAgICAgIHRocm93IGV4O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoZ3BTZXQub3duZXIgIT09IHRoaXMpXG4gICAgICByZXR1cm4gXCJcIjtcblxuICAgIGlmICghZ3BTZXQuZ2VuZXJhdG9yc1RhcmdldC5kZWVwVGFyZ2V0cy5pbmNsdWRlcyh0aGlzLiN0YXJnZXRQYXRoKSlcbiAgICAgIGdwU2V0LmdlbmVyYXRvcnNUYXJnZXQuYWRkU3VidGFyZ2V0KHRoaXMuI3RhcmdldFBhdGgpO1xuXG4gICAgYXdhaXQgZ3BTZXQucnVuTWFpbigpO1xuXG4gICAgcmV0dXJuIHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLmNsYXNzTmFtZTtcbiAgfVxuXG4gIC8vICNlbmRyZWdpb24gcHVibGljIG1lbWJlcnNcblxuICAvLyAjcmVnaW9uIHByaXZhdGUgbWV0aG9kc1xuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSB0aGUgY29kZSFcbiAgICpcbiAgICogQHJldHVybnMge2lkZW50aWZpZXJ9IFRoZSBjbGFzcyBuYW1lLlxuICAgKiBAc2VlIGh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9blVDb1ljeE5NQkUgcy9sb3ZlL2NvZGUvZ1xuICAgKi9cbiAgYXN5bmMgI2J1aWxkQ29sbGVjdGlvbigpIDogUHJvbWlzZTxzdHJpbmc+XG4gIHtcbiAgICB0aGlzLiNzdGF0dXMgPSBcImluIHByb2dyZXNzXCI7XG5cbiAgICBpZiAodGhpcy4jY29uZmlndXJhdGlvbkRhdGEuY29sbGVjdGlvblRlbXBsYXRlID09PSBcIk9uZVRvT25lL01hcFwiKSB7XG4gICAgICBjb25zdCBiYXNlID0gdGhpcy4jY29uZmlndXJhdGlvbkRhdGEub25lVG9PbmVCYXNlIGFzIENvbGxlY3Rpb25Db25maWd1cmF0aW9uO1xuICAgICAgY29uc3QgZGF0YSA9IENvbmZpZ3VyYXRpb25EYXRhLmNsb25lRGF0YShiYXNlKSBhcyBDb25maWd1cmF0aW9uRGF0YTtcbiAgICAgIGlmIChkYXRhLmNsYXNzTmFtZSAhPT0gXCJXZWFrTWFwXCIpIHtcbiAgICAgICAgYXdhaXQgdGhpcy4jYnVpbGRPbmVUb09uZUJhc2UoYmFzZSk7XG4gICAgICB9XG4gICAgICB0aGlzLiNidWlsZE9uZVRvT25lRGVmaW5lcyhiYXNlKTtcbiAgICAgIGF3YWl0IHRoaXMuI2J1aWxkT25lVG9PbmVEb2NHZW5lcmF0b3JzKGJhc2UpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuI2J1aWxkRGVmaW5lcygpO1xuICAgICAgdGhpcy4jYnVpbGREb2NHZW5lcmF0b3IoKTtcbiAgICB9XG5cbiAgICB0aGlzLiNnZW5lcmF0ZVNvdXJjZSgpO1xuICAgIGNvbnN0IGdwU2V0ID0gZ2VuZXJhdG9yVG9Qcm9taXNlU2V0LmdldCh0aGlzKSBhcyBHZW5lcmF0b3JQcm9taXNlU2V0O1xuICAgIGlmICh0aGlzLnJlcXVpcmVzS2V5SGFzaGVyKVxuICAgICAgZ3BTZXQucmVxdWlyZUtleUhhc2hlcigpO1xuICAgIGlmICh0aGlzLnJlcXVpcmVzV2Vha0tleUNvbXBvc2VyKVxuICAgICAgZ3BTZXQucmVxdWlyZVdlYWtLZXlDb21wb3NlcigpO1xuXG4gICAgaWYgKCF0aGlzLiNpbnRlcm5hbEZsYWdTZXQ/LmhhcyhcInByZXZlbnQgZXhwb3J0XCIpKVxuICAgICAgYXdhaXQgdGhpcy4jd3JpdGVTb3VyY2UoKTtcblxuICAgIHRoaXMuI3N0YXR1cyA9IFwiY29tcGxldGVkXCI7XG4gICAgcmV0dXJuIHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLmNsYXNzTmFtZTtcbiAgfVxuXG4gICNmaWxlUHJvbG9ndWUoKSA6IHN0cmluZyB7XG4gICAgbGV0IGZpbGVPdmVydmlldyA9IFwiXCI7XG4gICAgaWYgKCF0aGlzLiNpbnRlcm5hbEZsYWdTZXQ/LmhhcyhcIm5vIEBmaWxlXCIpICYmIHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLmZpbGVPdmVydmlldykge1xuICAgICAgZmlsZU92ZXJ2aWV3ID0gdGhpcy4jY29uZmlndXJhdGlvbkRhdGEuZmlsZU92ZXJ2aWV3O1xuICAgICAgZmlsZU92ZXJ2aWV3ID0gZmlsZU92ZXJ2aWV3LnNwbGl0KFwiXFxuXCIpLm1hcChsaW5lID0+IFwiICpcIiArIChsaW5lLnRyaW0oKSA/IFwiIFwiICsgbGluZSA6IFwiXCIpKS5qb2luKFwiXFxuXCIpO1xuICAgIH1cblxuICAgIGxldCBsaW5lcyA9IFtcbiAgICAgIHRoaXMuI2NvbXBpbGVPcHRpb25zLmxpY2Vuc2VUZXh0ID8gdGhpcy4jY29tcGlsZU9wdGlvbnMubGljZW5zZVRleHQgKyBcIlxcblxcblwiIDogXCJcIixcbiAgICAgIGAvKipcbiAqIEBmaWxlXG4gKiBUaGlzIGlzIGdlbmVyYXRlZCBjb2RlLiAgRG8gbm90IGVkaXQuXG4gKlxuICogR2VuZXJhdG9yOiBodHRwczovL2dpdGh1Yi5jb20vYWp2aW5jZW50L2NvbXBvc2l0ZS1jb2xsZWN0aW9uL1xuYC50cmltKCksXG4gICAgICB0aGlzLiNjb21waWxlT3B0aW9ucy5saWNlbnNlID8gYCAqIEBsaWNlbnNlICR7dGhpcy4jY29tcGlsZU9wdGlvbnMubGljZW5zZX1gIDogXCJcIixcbiAgICAgIHRoaXMuI2NvbXBpbGVPcHRpb25zLmF1dGhvciA/IGAgKiBAYXV0aG9yICR7dGhpcy4jY29tcGlsZU9wdGlvbnMuYXV0aG9yfWAgOiBcIlwiLFxuICAgICAgdGhpcy4jY29tcGlsZU9wdGlvbnMuY29weXJpZ2h0ID8gYCAqIEBjb3B5cmlnaHQgJHt0aGlzLiNjb21waWxlT3B0aW9ucy5jb3B5cmlnaHR9YCA6IFwiXCIsXG4gICAgICBmaWxlT3ZlcnZpZXcsXG4gICAgICBcIiAqL1wiXG4gICAgXTtcblxuICAgIGxpbmVzID0gbGluZXMuZmlsdGVyKEJvb2xlYW4pO1xuICAgIGxpbmVzID0gbGluZXMubWFwKGxpbmUgPT4gbGluZSA9PT0gXCIgKiBcIiA/IFwiICpcIiA6IGxpbmUpO1xuXG4gICAgbGV0IGdlbmVyYXRlZENvZGVOb3RpY2UgPSBsaW5lcy5qb2luKFwiXFxuXCIpO1xuICAgIGNvbnN0IHByb2xvZ3VlID0gW1xuICAgICAgZ2VuZXJhdGVkQ29kZU5vdGljZS50cmltKCksXG4gICAgXTtcblxuICAgIHJldHVybiBwcm9sb2d1ZS5maWx0ZXIoQm9vbGVhbikuam9pbihcIlxcblxcblwiKTtcbiAgfVxuXG4gICNidWlsZERlZmluZXMoKSA6IHZvaWQge1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLiNjb25maWd1cmF0aW9uRGF0YTtcbiAgICB0aGlzLiNkZWZpbmVzLmNsYXNzTmFtZSA9IGRhdGEuY2xhc3NOYW1lO1xuXG4gICAgY29uc3QgbWFwS2V5cyA9IGRhdGEud2Vha01hcEtleXMuY29uY2F0KGRhdGEuc3Ryb25nTWFwS2V5cyk7XG4gICAgY29uc3Qgc2V0S2V5cyA9IGRhdGEud2Vha1NldEVsZW1lbnRzLmNvbmNhdChkYXRhLnN0cm9uZ1NldEVsZW1lbnRzKTtcblxuICAgIHRoaXMuI2RlZmluZXMuaW1wb3J0TGluZXMgPSBkYXRhLmltcG9ydExpbmVzO1xuXG4gICAge1xuICAgICAgY29uc3Qga2V5cyA9IEFycmF5LmZyb20oZGF0YS5wYXJhbWV0ZXJUb1R5cGVNYXAua2V5cygpKTtcbiAgICAgIHRoaXMuI2RlZmluZXMuYXJnTGlzdCA9IGtleXMuam9pbihcIiwgXCIpO1xuICAgICAgdGhpcy4jZGVmaW5lcy5hcmdOYW1lTGlzdCA9IENvZGVHZW5lcmF0b3IuYnVpbGRBcmdOYW1lTGlzdChrZXlzKTtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJhbXNEYXRhID0gQXJyYXkuZnJvbShkYXRhLnBhcmFtZXRlclRvVHlwZU1hcC52YWx1ZXMoKSk7XG5cbiAgICBpZiAoL1NvbG98V2Vha1xcLz9NYXAvLnRlc3QoZGF0YS5jb2xsZWN0aW9uVGVtcGxhdGUpKSB7XG4gICAgICB0aGlzLiNkZWZpbmVzLndlYWtNYXBLZXlzID0gZGF0YS53ZWFrTWFwS2V5cy5zbGljZSgpO1xuICAgICAgdGhpcy4jZGVmaW5lcy5zdHJvbmdNYXBLZXlzID0gZGF0YS5zdHJvbmdNYXBLZXlzLnNsaWNlKCk7XG4gICAgfVxuXG4gICAgaWYgKC9Tb2xvfFdlYWtcXC8/U2V0Ly50ZXN0KGRhdGEuY29sbGVjdGlvblRlbXBsYXRlKSkge1xuICAgICAgdGhpcy4jZGVmaW5lcy53ZWFrU2V0RWxlbWVudHMgPSBkYXRhLndlYWtTZXRFbGVtZW50cy5zbGljZSgpO1xuICAgICAgdGhpcy4jZGVmaW5lcy5zdHJvbmdTZXRFbGVtZW50cyA9IGRhdGEuc3Ryb25nU2V0RWxlbWVudHMuc2xpY2UoKTtcbiAgICB9XG5cbiAgICBpZiAoZGF0YS5jb2xsZWN0aW9uVGVtcGxhdGUuaW5jbHVkZXMoXCJNYXBPZlwiKSkge1xuICAgICAgdGhpcy4jZGVmaW5lcy5tYXBLZXlzID0gbWFwS2V5cztcbiAgICAgIHRoaXMuI2RlZmluZXMuc2V0S2V5cyA9IHNldEtleXM7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuI2RlZmluZVZhbGlkYXRvckNvZGUocGFyYW1zRGF0YSwgXCJ2YWxpZGF0ZUFyZ3VtZW50c1wiLCAoKSA9PiB0cnVlKSlcbiAgICAgIHRoaXMuI2RlZmluZXMuaW52b2tlVmFsaWRhdGUgPSAgdHJ1ZTtcbiAgICB0aGlzLiNkZWZpbmVWYWxpZGF0b3JDb2RlKHBhcmFtc0RhdGEsIFwidmFsaWRhdGVNYXBBcmd1bWVudHNcIiwgcGQgPT4gbWFwS2V5cy5pbmNsdWRlcyhwZC5hcmd1bWVudE5hbWUpKTtcbiAgICB0aGlzLiNkZWZpbmVWYWxpZGF0b3JDb2RlKHBhcmFtc0RhdGEsIFwidmFsaWRhdGVTZXRBcmd1bWVudHNcIiwgcGQgPT4gc2V0S2V5cy5pbmNsdWRlcyhwZC5hcmd1bWVudE5hbWUpKTtcblxuICAgIGlmIChtYXBLZXlzLmxlbmd0aCkge1xuICAgICAgY29uc3QgY29sbGVjdGlvbiA9IGRhdGEucGFyYW1ldGVyVG9UeXBlTWFwLmdldChtYXBLZXlzWzBdKSBhcyBDb2xsZWN0aW9uVHlwZVxuICAgICAgdGhpcy4jZGVmaW5lcy5tYXBBcmd1bWVudDBUeXBlID0gY29sbGVjdGlvbi5hcmd1bWVudFR5cGU7XG4gICAgfVxuXG4gICAgaWYgKHNldEtleXMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBjb2xsZWN0aW9uID0gZGF0YS5wYXJhbWV0ZXJUb1R5cGVNYXAuZ2V0KHNldEtleXNbMF0pIGFzIENvbGxlY3Rpb25UeXBlO1xuICAgICAgdGhpcy4jZGVmaW5lcy5zZXRBcmd1bWVudDBUeXBlID0gY29sbGVjdGlvbi5hcmd1bWVudFR5cGU7XG4gICAgfVxuXG4gICAgaWYgKGRhdGEudmFsdWVUeXBlKSB7XG4gICAgICBsZXQgZmlsdGVyID0gKGRhdGEudmFsdWVUeXBlLmFyZ3VtZW50VmFsaWRhdG9yIHx8IFwiXCIpLnRyaW0oKTtcbiAgICAgIGlmIChmaWx0ZXIpXG4gICAgICAgIHRoaXMuI2RlZmluZXMudmFsaWRhdGVWYWx1ZSA9IGZpbHRlciArIFwiXFxuICAgIFwiO1xuXG4gICAgICB0aGlzLiNkZWZpbmVzLnZhbHVlVHlwZSA9IGRhdGEudmFsdWVUeXBlLmFyZ3VtZW50VHlwZTtcbiAgICB9XG4gIH1cblxuICAjZGVmaW5lVmFsaWRhdG9yQ29kZShcbiAgICBwYXJhbXNEYXRhOiBDb2xsZWN0aW9uVHlwZVtdLFxuICAgIGRlZmluZU5hbWU6IFwidmFsaWRhdGVBcmd1bWVudHNcIiB8IFwidmFsaWRhdGVNYXBBcmd1bWVudHNcIiB8IFwidmFsaWRhdGVTZXRBcmd1bWVudHNcIixcbiAgICBmaWx0ZXI6ICh2YWx1ZTogQ29sbGVjdGlvblR5cGUpID0+IGJvb2xlYW5cbiAgKSA6IGJvb2xlYW5cbiAge1xuICAgIGNvbnN0IHZhbGlkYXRvckNvZGUgPSBwYXJhbXNEYXRhLmZpbHRlcihmaWx0ZXIpLm1hcChwZCA9PiB7XG4gICAgICByZXR1cm4gcGQuYXJndW1lbnRWYWxpZGF0b3IgfHwgXCJcIjtcbiAgICB9KS5maWx0ZXIoQm9vbGVhbikuam9pbihcIlxcblxcblwiKS50cmltKCk7XG5cbiAgICBpZiAodmFsaWRhdG9yQ29kZSkge1xuICAgICAgdGhpcy4jZGVmaW5lc1tkZWZpbmVOYW1lXSA9IHZhbGlkYXRvckNvZGU7XG4gICAgfVxuICAgIHJldHVybiBCb29sZWFuKHZhbGlkYXRvckNvZGUpO1xuICB9XG5cbiAgI2J1aWxkT25lVG9PbmVEZWZpbmVzKGJhc2U6IENvbGxlY3Rpb25Db25maWd1cmF0aW9uIHwgc3ltYm9sKSA6IHZvaWQge1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLiNjb25maWd1cmF0aW9uRGF0YTtcbiAgICBjb25zdCBiYXNlRGF0YSA9IENvbmZpZ3VyYXRpb25EYXRhLmNsb25lRGF0YShiYXNlKSBhcyBDb25maWd1cmF0aW9uRGF0YTtcbiAgICB0aGlzLiNkZWZpbmVzLmNsYXNzTmFtZSA9IGRhdGEuY2xhc3NOYW1lO1xuICAgIHRoaXMuI2RlZmluZXMuYmFzZUNsYXNzTmFtZSA9IGJhc2VEYXRhLmNsYXNzTmFtZTtcbiAgICB0aGlzLiNkZWZpbmVzLmNvbmZpZ3VyZU9wdGlvbnMgPSBkYXRhLm9uZVRvT25lT3B0aW9ucztcblxuICAgIGNvbnN0IHdlYWtLZXlOYW1lID0gZGF0YS5vbmVUb09uZUtleU5hbWU7XG4gICAgdGhpcy4jZGVmaW5lcy53ZWFrS2V5TmFtZSA9IHdlYWtLZXlOYW1lO1xuXG4gICAgLy8gYmluZE9uZVRvT25lIGFyZ3VtZW50c1xuICAgIGxldCBrZXlzID0gQXJyYXkuZnJvbShiYXNlRGF0YS5wYXJhbWV0ZXJUb1R5cGVNYXAua2V5cygpKTtcbiAgICB0aGlzLiNkZWZpbmVzLmJhc2VBcmdMaXN0ID0ga2V5cy5zbGljZSgpO1xuXG4gICAga2V5cy5zcGxpY2Uoa2V5cy5pbmRleE9mKHdlYWtLZXlOYW1lKSwgMSk7XG4gICAgdGhpcy4jZGVmaW5lcy5iaW5kQXJnTGlzdCA9IGtleXM7XG5cbiAgICBjb25zdCB3cmFwQmFzZUNsYXNzID0gYmFzZURhdGEud2Vha01hcEtleXMubGVuZ3RoICsgYmFzZURhdGEuc3Ryb25nTWFwS2V5cy5sZW5ndGggPj0gMjtcbiAgICB0aGlzLiNkZWZpbmVzLndyYXBCYXNlQ2xhc3MgPSB3cmFwQmFzZUNsYXNzO1xuXG4gICAgY29uc3QgcGFyYW1ldGVycyA9IEFycmF5LmZyb20oYmFzZURhdGEucGFyYW1ldGVyVG9UeXBlTWFwLnZhbHVlcygpKTtcbiAgICB0aGlzLiNkZWZpbmVzLmJhc2VDbGFzc1ZhbGlkYXRlc0tleSA9IHBhcmFtZXRlcnMuc29tZShwYXJhbSA9PiBwYXJhbS5hcmd1bWVudFZhbGlkYXRvcik7XG4gICAgdGhpcy4jZGVmaW5lcy5iYXNlQ2xhc3NWYWxpZGF0ZXNWYWx1ZSA9IEJvb2xlYW4oYmFzZURhdGEudmFsdWVUeXBlPy5hcmd1bWVudFZhbGlkYXRvcik7XG4gIH1cblxuICAjYnVpbGREb2NHZW5lcmF0b3IoKSA6IHZvaWQge1xuICAgIGNvbnN0IGdlbmVyYXRvciA9IG5ldyBKU0RvY0dlbmVyYXRvcihcbiAgICAgIHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLmNsYXNzTmFtZSxcbiAgICAgICF0aGlzLiNjb25maWd1cmF0aW9uRGF0YS5jb2xsZWN0aW9uVGVtcGxhdGUuZW5kc1dpdGgoXCJNYXBcIilcbiAgICApO1xuXG4gICAgdGhpcy4jY29uZmlndXJhdGlvbkRhdGEucGFyYW1ldGVyVG9UeXBlTWFwLmZvckVhY2godHlwZURhdGEgPT4ge1xuICAgICAgZ2VuZXJhdG9yLmFkZFBhcmFtZXRlcih0eXBlRGF0YSk7XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy4jY29uZmlndXJhdGlvbkRhdGEudmFsdWVUeXBlICYmICF0aGlzLiNjb25maWd1cmF0aW9uRGF0YS5wYXJhbWV0ZXJUb1R5cGVNYXAuaGFzKFwidmFsdWVcIikpIHtcbiAgICAgIGdlbmVyYXRvci5hZGRQYXJhbWV0ZXIodGhpcy4jY29uZmlndXJhdGlvbkRhdGEudmFsdWVUeXBlKTtcbiAgICB9XG5cbiAgICB0aGlzLiNkb2NHZW5lcmF0b3JzLnB1c2goZ2VuZXJhdG9yKTtcbiAgfVxuXG4gIGFzeW5jICNidWlsZE9uZVRvT25lRG9jR2VuZXJhdG9ycyhiYXNlOiBDb2xsZWN0aW9uQ29uZmlndXJhdGlvbiB8IHN5bWJvbCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBiYXNlRGF0YSA9IENvbmZpZ3VyYXRpb25EYXRhLmNsb25lRGF0YShiYXNlKSBhcyBDb25maWd1cmF0aW9uRGF0YTtcblxuICAgIC8vIEZvciB0aGUgc29sbyBkb2MgZ2VuZXJhdG9yLCB0aGUgdmFsdWUgYXJndW1lbnQgY29tZXMgZmlyc3QuXG4gICAgbGV0IGdlbmVyYXRvciA9IGF3YWl0IHRoaXMuI2NyZWF0ZU9uZVRvT25lR2VuZXJhdG9yKFwib25lVG9PbmVTb2xvQXJnXCIpO1xuICAgIGdlbmVyYXRvci5hZGRQYXJhbWV0ZXIoYmFzZURhdGEudmFsdWVUeXBlIHx8IG5ldyBDb2xsZWN0aW9uVHlwZShcInZhbHVlXCIsIFwiTWFwXCIsIFwiKlwiLCBcIlRoZSB2YWx1ZS5cIiwgXCJcIikpO1xuICAgIHRoaXMuI2FwcGVuZFR5cGVzVG9Eb2NHZW5lcmF0b3IoYmFzZSwgZ2VuZXJhdG9yLCBcIlwiLCBmYWxzZSk7XG5cbiAgICAvLyBGb3IgdGhlIGR1byBkb2MgZ2VuZXJhdG9yLCB0aGVyZSBhcmUgdHdvIG9mIGVhY2ggYXJndW1lbnQsIGFuZCB0d28gdmFsdWVzLlxuICAgIGdlbmVyYXRvciA9IGF3YWl0IHRoaXMuI2NyZWF0ZU9uZVRvT25lR2VuZXJhdG9yKFwib25lVG9PbmVEdW9BcmdcIik7XG4gICAgdGhpcy4jYXBwZW5kVHlwZXNUb0RvY0dlbmVyYXRvcihiYXNlLCBnZW5lcmF0b3IsIFwiXzFcIiwgdHJ1ZSk7XG4gICAgdGhpcy4jYXBwZW5kVHlwZXNUb0RvY0dlbmVyYXRvcihiYXNlLCBnZW5lcmF0b3IsIFwiXzJcIiwgdHJ1ZSk7XG4gIH1cblxuICBhc3luYyAjY3JlYXRlT25lVG9PbmVHZW5lcmF0b3IobW9kdWxlTmFtZTogc3RyaW5nKSA6IFByb21pc2U8SlNEb2NHZW5lcmF0b3I+IHtcbiAgICBjb25zdCBnZW5lcmF0b3IgPSBuZXcgSlNEb2NHZW5lcmF0b3IoXG4gICAgICB0aGlzLiNjb25maWd1cmF0aW9uRGF0YS5jbGFzc05hbWUsXG4gICAgICBmYWxzZVxuICAgICk7XG5cbiAgICBhd2FpdCBnZW5lcmF0b3Iuc2V0TWV0aG9kUGFyYW1ldGVyc0J5TW9kdWxlKG1vZHVsZU5hbWUpO1xuICAgIHRoaXMuI2RvY0dlbmVyYXRvcnMucHVzaChnZW5lcmF0b3IpO1xuICAgIHJldHVybiBnZW5lcmF0b3I7XG4gIH1cblxuICAjYXBwZW5kVHlwZXNUb0RvY0dlbmVyYXRvcihcbiAgICBiYXNlOiBDb2xsZWN0aW9uQ29uZmlndXJhdGlvbiB8IHN5bWJvbCxcbiAgICBnZW5lcmF0b3I6IEpTRG9jR2VuZXJhdG9yLFxuICAgIHR5cGVTdWZmaXg6IHN0cmluZyxcbiAgICBhZGRWYWx1ZTogYm9vbGVhblxuICApIDogdm9pZFxuICB7XG4gICAgY29uc3QgYmFzZURhdGEgPSBDb25maWd1cmF0aW9uRGF0YS5jbG9uZURhdGEoYmFzZSkgYXMgQ29uZmlndXJhdGlvbkRhdGE7XG5cbiAgICBiYXNlRGF0YS5wYXJhbWV0ZXJUb1R5cGVNYXAuZGVsZXRlKHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLm9uZVRvT25lS2V5TmFtZSk7XG5cbiAgICBiYXNlRGF0YS5wYXJhbWV0ZXJUb1R5cGVNYXAuZm9yRWFjaCh0eXBlRGF0YSA9PiB7XG4gICAgICBnZW5lcmF0b3IuYWRkUGFyYW1ldGVyKG5ldyBDb2xsZWN0aW9uVHlwZShcbiAgICAgICAgdHlwZURhdGEuYXJndW1lbnROYW1lICsgdHlwZVN1ZmZpeCxcbiAgICAgICAgdHlwZURhdGEubWFwT3JTZXRUeXBlLFxuICAgICAgICB0eXBlRGF0YS5hcmd1bWVudFR5cGUsXG4gICAgICAgIHR5cGVEYXRhLmRlc2NyaXB0aW9uLFxuICAgICAgICB0eXBlRGF0YS5hcmd1bWVudFZhbGlkYXRvclxuICAgICAgKSk7XG4gICAgfSk7XG5cbiAgICBpZiAoYWRkVmFsdWUpIHtcbiAgICAgIGxldCB7XG4gICAgICAgIGFyZ3VtZW50TmFtZSA9IFwidmFsdWVcIixcbiAgICAgICAgbWFwT3JTZXRUeXBlID0gXCJNYXBcIixcbiAgICAgICAgYXJndW1lbnRUeXBlID0gXCIqXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uID0gXCJUaGUgdmFsdWUuXCIsXG4gICAgICAgIGFyZ3VtZW50VmFsaWRhdG9yID0gXCJcIlxuICAgICAgfSA9IGJhc2VEYXRhLnZhbHVlVHlwZSB8fCB7fTtcbiAgICAgIGFyZ3VtZW50TmFtZSArPSB0eXBlU3VmZml4O1xuICAgICAgZ2VuZXJhdG9yLmFkZFBhcmFtZXRlcihuZXcgQ29sbGVjdGlvblR5cGUoXG4gICAgICAgIGFyZ3VtZW50TmFtZSwgbWFwT3JTZXRUeXBlLCBhcmd1bWVudFR5cGUsIGRlc2NyaXB0aW9uLCBhcmd1bWVudFZhbGlkYXRvclxuICAgICAgKSk7XG4gICAgfVxuICB9XG5cbiAgI2dlbmVyYXRlU291cmNlKCkgOiB2b2lkIHtcbiAgICBjb25zdCBnZW5lcmF0b3IgPSBUZW1wbGF0ZUdlbmVyYXRvcnMuZ2V0KHRoaXMuI2Nob29zZUNvbGxlY3Rpb25UZW1wbGF0ZSgpKSBhcyBUZW1wbGF0ZUZ1bmN0aW9uO1xuXG4gICAgbGV0IGNvZGVTZWdtZW50cyA9IFtcbiAgICAgIHRoaXMuI2dlbmVyYXRlZENvZGUsXG4gICAgICBnZW5lcmF0b3IodGhpcy4jZGVmaW5lcywgLi4udGhpcy4jZG9jR2VuZXJhdG9ycyksXG4gICAgXTtcblxuICAgIGlmICghdGhpcy4jaW50ZXJuYWxGbGFnU2V0Py5oYXMoXCJwcmV2ZW50IGV4cG9ydFwiKSkge1xuICAgICAgY29kZVNlZ21lbnRzID0gW1xuICAgICAgICB0aGlzLiNmaWxlUHJvbG9ndWUoKSxcbiAgICAgICAgLi4uY29kZVNlZ21lbnRzLFxuICAgICAgICBgZXhwb3J0IGRlZmF1bHQgJHt0aGlzLiNjb25maWd1cmF0aW9uRGF0YS5jbGFzc05hbWV9O2BcbiAgICAgIF07XG4gICAgfVxuXG4gICAgdGhpcy4jZ2VuZXJhdGVkQ29kZSA9IGNvZGVTZWdtZW50cy5mbGF0KEluZmluaXR5KS5maWx0ZXIoQm9vbGVhbikuam9pbihcIlxcblxcblwiKTtcblxuICAgIHRoaXMuI2dlbmVyYXRlZENvZGUgPSBiZWF1dGlmeShcbiAgICAgIHRoaXMuI2dlbmVyYXRlZENvZGUsXG4gICAgICB7XG4gICAgICAgIFwiaW5kZW50X3NpemVcIjogMixcbiAgICAgICAgXCJpbmRlbnRfY2hhclwiOiBcIiBcIixcbiAgICAgICAgXCJlbmRfd2l0aF9uZXdsaW5lXCI6IHRydWUsXG4gICAgICB9XG4gICAgKTtcblxuICAgIHRoaXMuI2dlbmVyYXRlZENvZGUgPSB0aGlzLiNnZW5lcmF0ZWRDb2RlLnJlcGxhY2UoL1xcbnszLH0vZywgXCJcXG5cXG5cIik7XG4gIH1cblxuICAjY2hvb3NlQ29sbGVjdGlvblRlbXBsYXRlKCkgOiBzdHJpbmcge1xuICAgIGxldCBzdGFydFRlbXBsYXRlID0gdGhpcy4jY29uZmlndXJhdGlvbkRhdGEuY29sbGVjdGlvblRlbXBsYXRlO1xuXG4gICAgY29uc3Qgd2Vha01hcENvdW50ID0gdGhpcy4jY29uZmlndXJhdGlvbkRhdGEud2Vha01hcEtleXM/Lmxlbmd0aCB8fCAwLFxuICAgICAgICAgIHN0cm9uZ01hcENvdW50ID0gdGhpcy4jY29uZmlndXJhdGlvbkRhdGEuc3Ryb25nTWFwS2V5cz8ubGVuZ3RoIHx8IDAsXG4gICAgICAgICAgd2Vha1NldENvdW50ID0gdGhpcy4jY29uZmlndXJhdGlvbkRhdGEud2Vha1NldEVsZW1lbnRzPy5sZW5ndGggfHwgMCxcbiAgICAgICAgICBzdHJvbmdTZXRDb3VudCA9IHRoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLnN0cm9uZ1NldEVsZW1lbnRzPy5sZW5ndGggfHwgMDtcblxuICAgIGNvbnN0IG1hcENvdW50ID0gd2Vha01hcENvdW50ICsgc3Ryb25nTWFwQ291bnQsXG4gICAgICAgICAgc2V0Q291bnQgPSB3ZWFrU2V0Q291bnQgKyBzdHJvbmdTZXRDb3VudDtcblxuICAgIGlmIChtYXBDb3VudCAmJiBzZXRDb3VudCAmJiAhdGhpcy4jY29tcGlsZU9wdGlvbnMuZGlzYWJsZUtleU9wdGltaXphdGlvbikge1xuICAgICAgLy8gTWFwIG9mIFNldHMsIG1heWJlIG9wdGltaXplZFxuICAgICAgY29uc3Qgc2hvcnRLZXkgPSBbXG4gICAgICAgIG1hcENvdW50ID4gMSA/IFwiblwiIDogXCIxXCIsXG4gICAgICAgIHdlYWtNYXBDb3VudCA/IFwiV1wiIDogXCJTXCIsXG4gICAgICAgIFwiL1wiLFxuICAgICAgICBzZXRDb3VudCA+IDEgPyBcIm5cIiA6IFwiMVwiLFxuICAgICAgICB3ZWFrU2V0Q291bnQgPyBcIldcIiA6IFwiU1wiXG4gICAgICBdLmpvaW4oXCJcIik7XG4gICAgICAvLyBjb25zb2xlLmxvZyhgXFxuXFxuJHtzaG9ydEtleX0gJHtBcnJheS5mcm9tKHRoaXMuI2RlZmluZXMua2V5cygpKS5qb2luKFwiLCBcIil9XFxuXFxuYCk7XG4gICAgICByZXR1cm4gQ29kZUdlbmVyYXRvci4jbWFwT2ZTdHJvbmdTZXRzVGVtcGxhdGVzLmdldChzaG9ydEtleSkgfHwgc3RhcnRUZW1wbGF0ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RhcnRUZW1wbGF0ZTtcbiAgfVxuXG4gIGFzeW5jICN3cml0ZVNvdXJjZSgpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIGZzLndyaXRlRmlsZShcbiAgICAgIHRoaXMuI3RhcmdldFBhdGgsXG4gICAgICB0aGlzLiNnZW5lcmF0ZWRDb2RlLFxuICAgICAgeyBlbmNvZGluZzogXCJ1dGYtOFwiIH1cbiAgICApO1xuICB9XG5cbiAgYXN5bmMgI2J1aWxkT25lVG9PbmVCYXNlKGJhc2U6IENvbGxlY3Rpb25Db25maWd1cmF0aW9uIHwgc3ltYm9sKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGJhc2VEYXRhID0gQ29uZmlndXJhdGlvbkRhdGEuY2xvbmVEYXRhKGJhc2UpIGFzIENvbmZpZ3VyYXRpb25EYXRhO1xuICAgIGlmIChiYXNlRGF0YS5jbGFzc05hbWUgPT09IFwiV2Vha01hcFwiKVxuICAgICAgcmV0dXJuO1xuICAgIGlmICh0eXBlb2YgYmFzZSA9PT0gXCJzeW1ib2xcIilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImFzc2VydGlvbjogdW5yZWFjaGFibGVcIik7XG5cbiAgICBpZiAodGhpcy4jY29uZmlndXJhdGlvbkRhdGEub25lVG9PbmVPcHRpb25zPy5wYXRoVG9CYXNlTW9kdWxlKSB7XG4gICAgICB0aGlzLiNnZW5lcmF0ZWRDb2RlICs9IGBpbXBvcnQgJHtiYXNlRGF0YS5jbGFzc05hbWV9IGZyb20gXCIke3RoaXMuI2NvbmZpZ3VyYXRpb25EYXRhLm9uZVRvT25lT3B0aW9ucy5wYXRoVG9CYXNlTW9kdWxlfVwiO2A7XG4gICAgICB0aGlzLiNnZW5lcmF0ZWRDb2RlICs9IGJhc2VEYXRhLmltcG9ydExpbmVzO1xuICAgICAgdGhpcy4jZ2VuZXJhdGVkQ29kZSArPSBcIlxcblwiO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHN1YkNvbXBpbGVPcHRpb25zID0gT2JqZWN0LmNyZWF0ZSh0aGlzLiNjb21waWxlT3B0aW9ucyk7XG4gICAgY29uc3QgaW50ZXJuYWxGbGFnczogSW50ZXJuYWxGbGFncyA9IG5ldyBTZXQoW1xuICAgICAgXCJwcmV2ZW50IGV4cG9ydFwiLFxuICAgICAgXCJjb25maWd1cmF0aW9uIG9rXCIsXG4gICAgICBcIm5vIEBmaWxlXCIsXG4gICAgXSk7XG5cbiAgICB0aGlzLiNvbmVUb09uZVN1YkdlbmVyYXRvciA9IG5ldyBDb2RlR2VuZXJhdG9yKFxuICAgICAgYmFzZSxcbiAgICAgIHRoaXMuI3RhcmdldFBhdGgsXG4gICAgICBzdWJDb21waWxlT3B0aW9uc1xuICAgICk7XG4gICAgQ29kZUdlbmVyYXRvci4jZ2VuZXJhdG9yVG9JbnRlcm5hbEZsYWdzLnNldCh0aGlzLiNvbmVUb09uZVN1YkdlbmVyYXRvciwgaW50ZXJuYWxGbGFncyk7XG5cbiAgICBhd2FpdCB0aGlzLiNvbmVUb09uZVN1YkdlbmVyYXRvci5ydW4oKTtcblxuICAgIHRoaXMuI2dlbmVyYXRlZENvZGUgKz0gdGhpcy4jb25lVG9PbmVTdWJHZW5lcmF0b3IuZ2VuZXJhdGVkQ29kZSArIFwiXFxuXCI7XG4gIH1cblxuICAvLyAjZW5kcmVnaW9uIHByaXZhdGUgbWV0aG9kc1xufVxuT2JqZWN0LmZyZWV6ZShDb2RlR2VuZXJhdG9yKTtcbk9iamVjdC5mcmVlemUoQ29kZUdlbmVyYXRvci5wcm90b3R5cGUpO1xuIl19