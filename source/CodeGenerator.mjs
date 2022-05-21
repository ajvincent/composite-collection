/**
 * @module source/CodeGenerator.mjs
 */
/** @typedef {string} identifier */
import CollectionConfiguration from "./CollectionConfiguration.mjs";
import CompileTimeOptions from "./CompileTimeOptions.mjs";
import CollectionType from "./generatorTools/CollectionType.mjs";
import ConfigurationData from "./generatorTools/ConfigurationData.mjs";
import JSDocGenerator from "./generatorTools/JSDocGenerator.mjs";
import TemplateGenerators from "./generatorTools/TemplateGenerators.mjs";
import { GeneratorPromiseSet, CodeGeneratorBase, generatorToPromiseSet, } from "./generatorTools/GeneratorPromiseSet.mjs";
import { Deferred } from "./utilities/PromiseTypes.mjs";
import fs from "fs/promises";
import path from "path";
import PreprocessorDefines from "./generatorTools/PreprocessorDefines.mjs";
class TypeScriptDefs {
    typeConstraint;
    extendsConstraint;
    constructor(typeConstraint, extendsConstraint) {
        this.typeConstraint = typeConstraint;
        this.extendsConstraint = extendsConstraint;
    }
}
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
    #internalFlagSet;
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
        this.#runPromise = deferred.promise.then(async () => await this.#run());
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
        const gpSet = generatorToPromiseSet.getRequired(this);
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
        this.#buildTypeScriptDefines();
        this.#generateSource();
        const gpSet = generatorToPromiseSet.getRequired(this);
        if (this.requiresKeyHasher)
            gpSet.requireKeyHasher();
        if (this.requiresWeakKeyComposer)
            gpSet.requireWeakKeyComposer();
        if (!this.#internalFlagSet?.has("prevent export"))
            await this.#writeSource(gpSet);
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
 * Template: ${this.#configurationData.collectionTemplate}
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
        const defines = this.#defines;
        defines.className = data.className;
        const mapKeys = data.weakMapKeys.concat(data.strongMapKeys);
        const setKeys = data.weakSetElements.concat(data.strongSetElements);
        defines.importLines = data.importLines;
        {
            const keys = Array.from(data.parameterToTypeMap.keys());
            defines.argList = keys.join(", ");
            defines.argNameList = CodeGenerator.buildArgNameList(keys);
        }
        {
            const mapArgs = [], setArgs = [];
            for (let [key, typeMap] of data.parameterToTypeMap) {
                (typeMap.mapOrSetType.endsWith("Map") ? mapArgs : setArgs).push(key);
            }
            defines.mapArgList = mapArgs.join(", ");
            defines.setArgList = setArgs.join(", ");
        }
        const paramsData = Array.from(data.parameterToTypeMap.values());
        if (/Solo|Weak\/?Map/.test(data.collectionTemplate)) {
            defines.weakMapKeys = data.weakMapKeys.slice();
            defines.strongMapKeys = data.strongMapKeys.slice();
        }
        if (/Solo|Weak\/?Set/.test(data.collectionTemplate)) {
            defines.weakSetElements = data.weakSetElements.slice();
            defines.strongSetElements = data.strongSetElements.slice();
        }
        defines.mapKeys = mapKeys;
        defines.setKeys = setKeys;
        if (this.#defineValidatorCode(paramsData, "validateArguments", () => true))
            defines.invokeValidate = true;
        this.#defineValidatorCode(paramsData, "validateMapArguments", pd => mapKeys.includes(pd.argumentName));
        this.#defineValidatorCode(paramsData, "validateSetArguments", pd => setKeys.includes(pd.argumentName));
        if (mapKeys.length) {
            const collection = data.parameterToTypeMap.getRequired(mapKeys[0]);
            defines.mapArgument0Type = collection.jsDocType;
        }
        if (setKeys.length) {
            const collection = data.parameterToTypeMap.getRequired(setKeys[0]);
            defines.setArgument0Type = collection.jsDocType;
        }
        if (data.valueType) {
            let filter = (data.valueType.argumentValidator || "").trim();
            if (filter)
                defines.validateValue = filter + "\n    ";
            defines.valueType = data.valueType.jsDocType;
        }
    }
    #buildTypeScriptDefines() {
        const defines = this.#defines;
        let data = this.#configurationData;
        let baseData = data;
        if (data.collectionTemplate === "OneToOne/Map") {
            const base = data.oneToOneBase;
            if (base)
                baseData = ConfigurationData.cloneData(base) || data;
            if (baseData === data)
                throw new Error("How'd we get here?");
        }
        const typeDefs = new Map;
        let mapCount = 0, setCount = 0;
        baseData.parameterToTypeMap.forEach((typeMap, arg) => {
            let def, typeArray, keyArray;
            if (typeMap.mapOrSetType.endsWith("Map")) {
                def = `__MK${mapCount++}__`;
                typeArray = defines.tsMapTypes;
                keyArray = defines.tsMapKeys;
            }
            else {
                def = `__SK${setCount++}__`;
                typeArray = defines.tsSetTypes;
                keyArray = defines.tsSetKeys;
            }
            typeArray.push(def);
            keyArray.push(`${arg}: ${def}`);
            typeDefs.set(arg, new TypeScriptDefs(def, typeMap.tsType));
        });
        if (data.collectionTemplate === "OneToOne/Map") {
            const oneToOneKeyDefs = typeDefs.get(data.oneToOneKeyName);
            if (oneToOneKeyDefs) {
                defines.tsOneToOneKeyType = oneToOneKeyDefs.typeConstraint;
                typeDefs.delete(data.oneToOneKeyName);
            }
            typeDefs.set("value", new TypeScriptDefs("__V__", data.valueType?.tsType || "object"));
            defines.tsValueKey = "value: __V__";
        }
        else if (data.collectionTemplate.endsWith("Map")) {
            typeDefs.set("value", new TypeScriptDefs("__V__", data.valueType?.tsType || "unknown"));
            defines.tsValueKey = "value: __V__";
        }
        defines.tsGenericFull = `<\n  ${Array.from(typeDefs.values()).map(def => `${def.typeConstraint}${def.extendsConstraint === "unknown" || def.typeConstraint === "any" ?
            "" :
            " extends " + def.extendsConstraint}`).join(",\n  ")}\n>`.trim();
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
        const defines = this.#defines;
        defines.className = data.className;
        defines.baseClassName = baseData.className;
        defines.configureOptions = data.oneToOneOptions;
        defines.importLines = data.importLines;
        const weakKeyName = data.oneToOneKeyName;
        defines.weakKeyName = weakKeyName;
        // bindOneToOne arguments
        let keys = Array.from(baseData.parameterToTypeMap.keys());
        defines.baseArgList = keys.slice();
        keys.splice(keys.indexOf(weakKeyName), 1);
        defines.bindArgList = keys;
        const wrapBaseClass = baseData.weakMapKeys.length + baseData.strongMapKeys.length >= 2;
        defines.wrapBaseClass = wrapBaseClass;
        const parameters = Array.from(baseData.parameterToTypeMap.values());
        defines.baseClassValidatesKey = parameters.some(param => param.argumentValidator);
        defines.baseClassValidatesValue = Boolean(baseData.valueType?.argumentValidator);
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
        generator.addParameter(baseData.valueType ||
            new CollectionType("value", "Map", "*", "unknown", "The value.", ""));
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
            generator.addParameter(new CollectionType(typeData.argumentName + typeSuffix, typeData.mapOrSetType, typeData.jsDocType, typeData.tsType, typeData.description, typeData.argumentValidator));
        });
        if (addValue) {
            let { argumentName = "value", mapOrSetType = "Map", jsDocType = "*", tsType = "unknown", description = "The value.", argumentValidator = "" } = baseData.valueType || {};
            argumentName += typeSuffix;
            generator.addParameter(new CollectionType(argumentName, mapOrSetType, jsDocType, tsType, description, argumentValidator));
        }
    }
    #generateSource() {
        this.#configurationData.collectionTemplate = this.#chooseCollectionTemplate();
        const generator = TemplateGenerators.getRequired(this.#configurationData.collectionTemplate);
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
        this.#generatedCode = codeSegments.flat(Infinity).filter(Boolean).join("\n\n") + "\n";
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
    /**
     * @param {GeneratorPromiseSet} gpSet The current promise set.
     * @returns {Promise<void>}
     */
    async #writeSource(gpSet) {
        const targetPath = this.#targetPath.replace(/\.mjs$/, ".mts");
        gpSet.scheduleTSC(targetPath);
        await fs.writeFile(targetPath, this.#generatedCode, { encoding: "utf-8" });
    }
    async #buildOneToOneBase(base) {
        const baseData = ConfigurationData.cloneData(base);
        if (baseData.className === "WeakMap")
            return;
        if (typeof base === "symbol")
            throw new Error("assertion: unreachable");
        if (this.#configurationData.oneToOneOptions?.pathToBaseModule) {
            this.#generatedCode += `import ${baseData.className} from "${this.#configurationData.oneToOneOptions.pathToBaseModule}"\n\n`;
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
//# sourceMappingURL=CodeGenerator.mjs.map