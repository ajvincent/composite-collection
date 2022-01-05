/**
 * @module source/CodeGenerator.mjs
 *
 * @fileoverview
 */

import CollectionConfiguration from "composite-collection/Configuration";
import CompletionPromise from "./CompletionPromise.mjs";
import JSDocGenerator from "./JSDocGenerator.mjs";
import CompileTimeOptions from "./CompileTimeOptions.mjs";
import TemplateGenerators from "./TemplateGenerators.mjs";

import fs from "fs/promises";
import beautify from "js-beautify";
import CollectionType from "./CollectionType.mjs";

function buildArgNameList(keys) {
  return '[' + keys.map(key => `"${key}"`).join(", ") + ']'
}

/** @package */
export default class CodeGenerator extends CompletionPromise {
  /** @type {Object}  @constant */
  #configurationData;

  /** @type {string} @constant */
  #targetPath;

  /** @type {RuntimeOptions} @constant */
  #compileOptions;

  /** @type {string} */
  #status = "not started yet";

  /** @type {Map<string, *>} @constant */
  #defines = new Map();

  /** @type {JSDocGenerator[]} */
  #docGenerators = [];

  /** @type {string} */
  #generatedCode = "";

  /** @type {Set?} @constant */
  #internalFlagSet;

  static #internalFlagsSymbol = Symbol("package flags");

  #oneToOneSubGenerator = null;

  /**
   * @param {CollectionConfiguration} configuration  The configuration to use.
   * @param {string}                  targetPath     The directory to write the collection to.
   * @param {Promise}                 startPromise   Where we should attach our asynchronous operations to.
   * @param {CompileTimeOptions}      compileOptions Flags from an owner which may override configurations.
   */
  constructor(configuration, targetPath, startPromise, compileOptions = {}) {
    super(startPromise, () => this.buildCollection());

    this.#compileOptions = (compileOptions instanceof CompileTimeOptions) ? compileOptions : {};

    this.#internalFlagSet = (CodeGenerator.#internalFlagsSymbol in compileOptions) ?
                            compileOptions[CodeGenerator.#internalFlagsSymbol] :
                            null;
    delete this.#compileOptions[CodeGenerator.#internalFlagsSymbol];

    if (!(configuration instanceof CollectionConfiguration) && !this.#internalFlagSet?.has("configuration ok")) {
      throw new Error("Configuration isn't a CollectionConfiguration");
    }

    if (typeof targetPath !== "string")
      throw new Error("Target path should be a path to a file!");

    configuration.lock(); // this may throw, but if so, it's good that it does so.
    this.#configurationData = configuration.cloneData();
    this.#targetPath = targetPath;

    this.completionPromise.catch(
      () => this.#status = "aborted"
    );
    Object.seal(this);
  }

  /** @returns {string} */
  get status() {
    return this.#status;
  }

  async buildCollection() {
    this.#status = "in progress";

    if (this.#configurationData.collectionTemplate === "OneToOne/Map") {
      if (this.#configurationData.oneToOneBase.cloneData().className !== "WeakMap") {
        await this.#buildOneToOneBase();
      }
      this.#buildOneToOneDefines();
      await this.#buildOneToOneDocGenerators();
    }
    else {
      this.#buildDefines();
      this.#buildDocGenerator();
    }
    this.#generateSource();

    if (!this.#internalFlagSet?.has("prevent export"))
      await this.#writeSource();

    this.#status = "completed";
    return this.#configurationData.className;
  }

  get generatedCode() {
    return this.#generatedCode;
  }

  #filePrologue() {
    let generatedCodeNotice =
      `
/**
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 ${
  this.#compileOptions.sourceFile ? ` * Source: ${this.#compileOptions.sourceFile}\n` : ""
}${
  this.#compileOptions.author ? ` * @author ${this.#compileOptions.author}\n` : ""
}${
  this.#compileOptions.copyright ? ` * @copyright ${this.#compileOptions.copyright}\n` : ""
} */
`;
    const prologue = [
      this.#compileOptions.licenseText,
      generatedCodeNotice.trim(),
    ];

    return prologue.filter(Boolean).join("\n\n");
  }

  #buildDefines() {
    this.#defines.clear();

    const data = this.#configurationData;
    this.#defines.set("className", data.className);

    // importLines
    {
      let lines = data.importLines;
      if (data.requiresWeakKey)
        lines = `import WeakKeyComposer from "./keys/Composite.mjs";\n` + lines;
      if (data.requiresKeyHasher)
        lines = `import KeyHasher from "./keys/Hasher.mjs";\n` + lines;
      this.#defines.set("importLines", lines);
    }

    {
      const keys = Array.from(data.parameterToTypeMap.keys());
      this.#defines.set("argList", keys.join(", "));
      this.#defines.set("argNameList", buildArgNameList(keys));
    }

    const paramsData = Array.from(data.parameterToTypeMap.values());

    if (/Solo|Weak\/?Map/.test(data.collectionTemplate)) {
      this.#defines.set("weakMapCount", data.weakMapKeys.length);
      this.#defines.set("weakMapArgList", data.weakMapKeys.join(", "));
      this.#defines.set("weakMapArgNameList", buildArgNameList(data.weakMapKeys));
      this.#defines.set("weakMapArgument0", data.weakMapKeys[0]);

      this.#defines.set("strongMapCount", data.strongMapKeys.length);
      this.#defines.set("strongMapArgList", data.strongMapKeys.join(", "));
      this.#defines.set("strongMapArgNameList", buildArgNameList(data.strongMapKeys));
    }

    if (/Solo|Weak\/?Set/.test(data.collectionTemplate)) {
      this.#defines.set("weakSetCount", data.weakSetElements.length);
      this.#defines.set("weakSetArgList", data.weakSetElements.join(", "));
      this.#defines.set("weakSetArgNameList", buildArgNameList(data.weakSetElements));

      this.#defines.set("strongSetCount", data.strongSetElements.length);
      this.#defines.set("strongSetArgList", data.strongSetElements.join(", "));
      this.#defines.set("strongSetArgNameList", buildArgNameList(data.strongSetElements));
    }

    const mapKeys = data.weakMapKeys.concat(data.strongMapKeys);
    const setKeys = data.weakSetElements.concat(data.strongSetElements);
    if (data.collectionTemplate.includes("MapOf")) {
      this.#defines.set("mapArgCount", mapKeys.length);
      this.#defines.set("mapArgList", mapKeys.join(", "));
      this.#defines.set("mapArgNameList", buildArgNameList(mapKeys));

      this.#defines.set("setArgCount", setKeys.length);
      this.#defines.set("setArgList", setKeys.join(", "));
      this.#defines.set("setArgNameList", buildArgNameList(setKeys));
    }

    // validateArguments
    {
      const validatorCode = paramsData.map(
        pd => pd.argumentValidator || ""
      ).filter(Boolean).join("\n\n").trim();

      if (validatorCode) {
        this.#defines.set("validateArguments", validatorCode);
        this.#defines.set("invokeValidate", true);
      }
    }

    // validateMapArguments
    {
      const validatorCode = paramsData.map(pd => {
        if (!mapKeys.includes(pd.argumentName))
          return "";
        return pd.argumentValidator || "";
      }).filter(Boolean).join("\n\n").trim();

      if (validatorCode)
        this.#defines.set("validateMapArguments", validatorCode);
    }

    // validateSetArguments
    {
      const validatorCode = paramsData.map(pd => {
        if (!setKeys.includes(pd.argumentName))
          return "";
        return pd.argumentValidator || "";
      }).filter(Boolean).join("\n\n").trim();

      if (validatorCode)
        this.#defines.set("validateSetArguments", validatorCode);
    }

    // validateValue
    {
      let filter = (data?.valueType?.argumentValidator || "").trim();
      if (filter)
        this.#defines.set("validateValue", filter + "\n    ");
    }
  }

  #buildOneToOneDefines() {
    this.#defines.clear();

    const data = this.#configurationData;
    const baseData = data.oneToOneBase.cloneData();
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

    const extendBaseClass = baseData.weakMapKeys.length + baseData.strongMapKeys.length >= 2;
    this.#defines.set("extendBaseClass", extendBaseClass);

    const parameters = Array.from(baseData.parameterToTypeMap.values());
    this.#defines.set("baseClassValidatesKey", parameters.some(param => param.argumentValidator));
    this.#defines.set("baseClassValidatesValue", Boolean(baseData.valueType?.argumentValidator));
  }

  #buildDocGenerator() {
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

  async #buildOneToOneDocGenerators() {
    const base = this.#configurationData.oneToOneBase;
    const baseData = base.cloneData();

    // For the solo doc generator, the value argument comes first.
    let generator = await this.#createOneToOneGenerator("oneToOneSoloArg");
    generator.addParameter(baseData.valueType || new CollectionType("value", "map", "*", "The value.", ""));
    this.#appendTypesToDocGenerator(generator, "", false);

    // For the duo doc generator, there are two of each argument, and two values.
    generator = await this.#createOneToOneGenerator("oneToOneDuoArg");
    this.#appendTypesToDocGenerator(generator, "_1", true);
    this.#appendTypesToDocGenerator(generator, "_2", true);
  }

  async #createOneToOneGenerator(moduleName) {
    let generator = new JSDocGenerator(
      this.#configurationData.className,
      true
    );

    await generator.setMethodParameters(moduleName);
    this.#docGenerators.push(generator);
    return generator;
  }

  #appendTypesToDocGenerator(generator, typeSuffix, addValue) {
    const baseData = this.#configurationData.oneToOneBase.cloneData();

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

    if (addValue)
    {
      generator.addParameter(baseData.valueType || new CollectionType("value" + typeSuffix, "map", "*", "The value.", ""));
    }
  }

  #generateSource() {
    const generator = TemplateGenerators.get(this.#configurationData.collectionTemplate);

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

  async #writeSource() {
    return fs.writeFile(
      this.#targetPath,
      this.#generatedCode,
      { encoding: "utf-8" }
    );
  }

  async #buildOneToOneBase() {
    const base = this.#configurationData.oneToOneBase;
    const baseData = base.cloneData();
    if (baseData.className === "WeakMap")
      return;

    if (this.#configurationData.oneToOneOptions?.pathToBaseModule) {
      this.#generatedCode += `import ${baseData.className} from "${this.#configurationData.oneToOneOptions.pathToBaseModule}";\n`;
      return;
    }

    let resolve, subStartPromise = new Promise(res => resolve = res);

    const subCompileOptions = Object.create(this.#compileOptions);
    subCompileOptions[CodeGenerator.#internalFlagsSymbol] = new Set([
      "prevent export",
      "configuration ok",
    ]);

    this.#oneToOneSubGenerator = new CodeGenerator(
      base,
      this.#targetPath,
      subStartPromise,
      subCompileOptions
    );

    resolve();
    await this.#oneToOneSubGenerator.completionPromise;

    this.#generatedCode += this.#oneToOneSubGenerator.generatedCode + "\n";
  }
}
Object.freeze(CodeGenerator);
Object.freeze(CodeGenerator.prototype);
