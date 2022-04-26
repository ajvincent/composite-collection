/**
 * @module source/CodeGenerator.mjs
 */

/** @typedef {string} identifier */

import CollectionConfiguration from "./CollectionConfiguration.mjs";
import ConfigurationData, { oneToOneOptions } from "./generatorTools/ConfigurationData.mjs";
import CompileTimeOptions from "./CompileTimeOptions.mjs";

import CollectionType from "./generatorTools/CollectionType.mjs";
import {
  GeneratorPromiseSet,
  CodeGeneratorBase,
  generatorToPromiseSet,
} from "./generatorTools/GeneratorPromiseSet.mjs";

import { Deferred } from "./utilities/PromiseTypes.mjs";
import type { PromiseResolver } from "./utilities/PromiseTypes.mjs";

import JSDocGenerator from "./generatorTools/JSDocGenerator.mjs";
import TemplateGenerators from "./generatorTools/TemplateGenerators.mjs";

import fs from "fs/promises";
import path from "path";
import beautify from "js-beautify";

type InternalFlags = Set<string>;
export type PreprocessorDefines = Map<string, string | string[] | boolean | number | oneToOneOptions | null>

/** @package */
export default class CodeGenerator extends CodeGeneratorBase {
  // #region static private fields
  /**
   * Stringify a list of keys into an argument name list suitable for macros.
   *
   * @param {string[]} keys The key names.
   * @returns {string} The serialized key names.
   */
  static buildArgNameList(keys: string[]) : string {
    return '[' + keys.map(key => `"${key}"`).join(", ") + ']'
  }

  /** @constant */
  static #generatorToInternalFlags: Map<CodeGenerator, InternalFlags> = new Map;

  /** @type {Map<string, string>} @constant */
  static #mapOfStrongSetsTemplates: Map<string, string> = new Map([
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
  #configurationData: ConfigurationData;

  /** @type {string} @constant */
  #targetPath: string;

  /** @type {CompileTimeOptions} @constant */
  #compileOptions: CompileTimeOptions;


  #pendingStart: PromiseResolver<null>;

  #runPromise: Readonly<Promise<string>>;

  /** @type {string} */
  #status = "not started yet";

  /** @type {Map<string, *>} @constant */
  #defines: PreprocessorDefines = new Map();

  /** @type {JSDocGenerator[]} */
  #docGenerators: JSDocGenerator[] = [];

  /** @type {string} */
  #generatedCode = "";

  /** @type {Set<string>?} @constant */
  #internalFlagSet: InternalFlags = new Set;

  /** @type {CodeGenerator | null} */
  #oneToOneSubGenerator: CodeGenerator | null = null;

  // #endregion private properties

  // #region public members

  /**
   * @param {CollectionConfiguration} configuration  The configuration to use.
   * @param {string}                  targetPath     The directory to write the collection to.
   * @param {CompileTimeOptions}      compileOptions Flags from an owner which may override configurations.
   */
  constructor(
    configuration: CollectionConfiguration,
    targetPath: string,
    compileOptions: CompileTimeOptions | object = {}
  )
  {
    super();

    this.#compileOptions = (compileOptions instanceof CompileTimeOptions) ? compileOptions : new CompileTimeOptions({});

    if (!(configuration instanceof CollectionConfiguration)) {
      throw new Error("Configuration isn't a CollectionConfiguration");
    }

    if (typeof targetPath !== "string")
      throw new Error("Target path should be a path to a file!");

    configuration.lock(); // this may throw, but if so, it's good that it does so.
    this.#configurationData = ConfigurationData.cloneData(configuration)!;
    this.#targetPath = targetPath;

    const gpSet = new GeneratorPromiseSet(this, path.dirname(targetPath));
    generatorToPromiseSet.set(this, gpSet);

    let deferred = new Deferred;
    this.#pendingStart = deferred.resolve;
    this.#runPromise = deferred.promise.then(() => this.#run());

    Object.seal(this);
  }

  /** @type {string} */
  get status() : string {
    return this.#status;
  }

  /**
   * @public
   * @type {string}
   *
   * The generated code at this point.  Used in #buildOneToOneBase() by a parent CodeGenerator.
   */
  get generatedCode() : string {
    return this.#generatedCode;
  }

  get requiresKeyHasher() : boolean {
    return this.#generatedCode?.includes(" new KeyHasher(");
  }

  get requiresWeakKeyComposer() : boolean {
    return this.#generatedCode?.includes(" new WeakKeyComposer(");
  }

  async run(): Promise<string> {
    this.#pendingStart(null);
    return await this.#runPromise;
  }

  /**
   * @returns {Promise<identifier>} The class name.
   */
  async #run() : Promise<string> {
    {
      const flags: InternalFlags | undefined = CodeGenerator.#generatorToInternalFlags.get(this);
      if (flags)
        this.#internalFlagSet = flags;
    }

    const gpSet = generatorToPromiseSet.get(this)!;
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
  async #buildCollection() : Promise<string>
  {
    this.#status = "in progress";

    if (this.#configurationData.collectionTemplate === "OneToOne/Map") {
      const base = this.#configurationData.oneToOneBase;
      if (!base)
        throw new Error("assertion: unreachable");
      if (ConfigurationData.cloneData(base)!.className !== "WeakMap") {
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
    const gpSet = generatorToPromiseSet.get(this)!;
    if (this.requiresKeyHasher)
      gpSet.requireKeyHasher();
    if (this.requiresWeakKeyComposer)
      gpSet.requireWeakKeyComposer();

    if (!this.#internalFlagSet?.has("prevent export"))
      await this.#writeSource();

    this.#status = "completed";
    return this.#configurationData.className;
  }

  #filePrologue() : string {
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

  #buildDefines() : void {
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
      this.#defines.set(
        "mapArgument0Type",
        data.parameterToTypeMap.get(mapKeys[0])!.argumentType
      );
    }

    if (setKeys.length) {
      this.#defines.set(
        "setArgument0Type",
        data.parameterToTypeMap.get(setKeys[0])!.argumentType
      );
    }

    if (data.valueType) {
      let filter = (data.valueType.argumentValidator || "").trim();
      if (filter)
        this.#defines.set("validateValue", filter + "\n    ");

      this.#defines.set(
        "valueType",
        data.valueType.argumentType
      );
    }
  }

  #defineArgCountAndLists(
    prefix: string,
    keyArray: string[]
  ) : void
  {
    this.#defines.set(prefix + "Count", keyArray.length);
    this.#defines.set(prefix + "ArgList", keyArray.join(", "));
    this.#defines.set(prefix + "ArgNameList", JSON.stringify(keyArray));
    if (keyArray.length)
      this.#defines.set(prefix + "Argument0", keyArray[0]);
  }

  #defineValidatorCode(
    paramsData: CollectionType[],
    defineName: string,
    filter: (value: CollectionType) => boolean
  ) : boolean
  {
    const validatorCode = paramsData.filter(filter).map(pd => {
      return pd.argumentValidator || "";
    }).filter(Boolean).join("\n\n").trim();

    if (validatorCode) {
      this.#defines.set(defineName, validatorCode);
    }
    return Boolean(validatorCode);
  }

  #buildOneToOneDefines(base: CollectionConfiguration | symbol) : void {
    this.#defines.clear();

    const data = this.#configurationData;
    const baseData = ConfigurationData.cloneData(base)!;
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

  #buildDocGenerator() : void {
    const generator = new JSDocGenerator(
      this.#configurationData.className,
      !this.#configurationData.collectionTemplate.endsWith("Map")
    );

    this.#configurationData.parameterToTypeMap.forEach(typeData => {
      generator.addParameter(typeData);
    });

    if (this.#configurationData.valueType && !this.#configurationData.parameterToTypeMap.has("value")) {
      generator.addParameter(this.#configurationData.valueType);
    }

    this.#docGenerators.push(generator);
  }

  async #buildOneToOneDocGenerators(base: CollectionConfiguration | symbol) : Promise<void> {
    const baseData = ConfigurationData.cloneData(base)!;

    // For the solo doc generator, the value argument comes first.
    let generator = await this.#createOneToOneGenerator("oneToOneSoloArg");
    generator.addParameter(baseData.valueType || new CollectionType("value", "Map", "*", "The value.", ""));
    this.#appendTypesToDocGenerator(base, generator, "", false);

    // For the duo doc generator, there are two of each argument, and two values.
    generator = await this.#createOneToOneGenerator("oneToOneDuoArg");
    this.#appendTypesToDocGenerator(base, generator, "_1", true);
    this.#appendTypesToDocGenerator(base, generator, "_2", true);
  }

  async #createOneToOneGenerator(moduleName: string) : Promise<JSDocGenerator> {
    const generator = new JSDocGenerator(
      this.#configurationData.className,
      false
    );

    await generator.setMethodParametersByModule(moduleName);
    this.#docGenerators.push(generator);
    return generator;
  }

  #appendTypesToDocGenerator(
    base: CollectionConfiguration | symbol,
    generator: JSDocGenerator,
    typeSuffix: string,
    addValue: boolean
  ) : void
  {
    const baseData = ConfigurationData.cloneData(base)!;

    baseData.parameterToTypeMap.delete(this.#configurationData.oneToOneKeyName);

    baseData.parameterToTypeMap.forEach(typeData => {
      generator.addParameter(new CollectionType(
        typeData.argumentName + typeSuffix,
        typeData.mapOrSetType,
        typeData.argumentType,
        typeData.description,
        typeData.argumentValidator
      ));
    });

    if (addValue) {
      let {
        argumentName = "value",
        mapOrSetType = "Map",
        argumentType = "*",
        description = "The value.",
        argumentValidator = ""
      } = baseData.valueType || {};
      argumentName += typeSuffix;
      generator.addParameter(new CollectionType(
        argumentName, mapOrSetType, argumentType, description, argumentValidator
      ));
    }
  }

  #generateSource() : void {
    const generator = TemplateGenerators.get(this.#chooseCollectionTemplate())!;

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

    this.#generatedCode = beautify(
      this.#generatedCode,
      {
        "indent_size": 2,
        "indent_char": " ",
        "end_with_newline": true,
      }
    );

    this.#generatedCode = this.#generatedCode.replace(/\n{3,}/g, "\n\n");
  }

  #chooseCollectionTemplate() : string {
    let startTemplate = this.#configurationData.collectionTemplate;

    const weakMapCount = this.#configurationData.weakMapKeys?.length || 0,
          strongMapCount = this.#configurationData.strongMapKeys?.length || 0,
          weakSetCount = this.#configurationData.weakSetElements?.length || 0,
          strongSetCount = this.#configurationData.strongSetElements?.length || 0;

    const mapCount = weakMapCount + strongMapCount,
          setCount = weakSetCount + strongSetCount;

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

  async #writeSource() : Promise<void> {
    return fs.writeFile(
      this.#targetPath,
      this.#generatedCode,
      { encoding: "utf-8" }
    );
  }

  async #buildOneToOneBase(base: CollectionConfiguration | symbol) : Promise<void> {
    const baseData = ConfigurationData.cloneData(base)!;
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
    const internalFlags: InternalFlags = new Set([
      "prevent export",
      "configuration ok",
      "no @file",
    ]);

    this.#oneToOneSubGenerator = new CodeGenerator(
      base,
      this.#targetPath,
      subCompileOptions
    );
    CodeGenerator.#generatorToInternalFlags.set(this.#oneToOneSubGenerator, internalFlags);

    await this.#oneToOneSubGenerator.run();

    this.#generatedCode += this.#oneToOneSubGenerator.generatedCode + "\n";
  }

  // #endregion private methods
}
Object.freeze(CodeGenerator);
Object.freeze(CodeGenerator.prototype);
