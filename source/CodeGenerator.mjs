/**
 * @module source/CodeGenerator.mjs
 *
 * @fileoverview
 */

import CollectionConfiguration from "composite-collection/Configuration";
import CompletionPromise from "./CompletionPromise.mjs";
import JSDocGenerator from "./JSDocGenerator.mjs";
import CompileTimeOptions from "./CompileTimeOptions.mjs";

import fs from "fs/promises";
import { pathToFileURL } from "url";
import { getAllFiles } from 'get-all-files';
import beautify from "js-beautify";

/**
 * @type {Map<string, string>}
 * @package
 */
const TemplateGenerators = new Map();
{
  const templateDirURL = new URL("../templates", import.meta.url);
  const templateDir = templateDirURL.pathname;
  const allFiles = await getAllFiles(templateDir).toArray();
  await Promise.all(allFiles.map(async fullPath => {
    let baseName = fullPath.substr(templateDir.length + 1);
    if (!baseName.endsWith(".in.mjs"))
      return;

    const targetFileURL = pathToFileURL(fullPath);
    const generator = (await import(targetFileURL)).default;
    if (typeof generator === "function")
      TemplateGenerators.set(baseName.replace(/\.in\.mjs$/, ""), generator);
    else
      throw new Error("generator isn't a function?");
  }));
}

function buildArgNameList(keys) {
  return '[' + keys.map(key => `"${key}"`).join(", ") + ']'
}

/**
 * @package
 */
export default class CodeGenerator extends CompletionPromise {
  static UTILITIES = [
    "KeyHasher.mjs",
  ];

  /** @type {Object}  @const  @private */
  #configurationData;

  /** @type {string} @const @private */
  #targetPath;

  /** @type {RuntimeOptions} @const @private */
  #compileOptions;

  /** @type {string} @private */
  #status = "not started yet";

  /** @type {Map<string, *>} @const @private */
  #defines = new Map();

  /** @type {JSDocGenerator} @private */
  #docGenerator;

  /** @type {string} */
  #generatedCode = "";

  /**
   * @param {CollectionConfiguration} configuration  The configuration to use.
   * @param {string}                  targetPath     The directory to write the collection to.
   * @param {Promise}                 startPromise   Where we should attach our asynchronous operations to.
   * @param {CompileTimeOptions}      compileOptions Flags from an owner which may override configurations.
   */
  constructor(configuration, targetPath, startPromise, compileOptions) {
    super(startPromise, () => this.buildCollection());

    if (!(configuration instanceof CollectionConfiguration))
      throw new Error("Configuration isn't a CollectionConfiguration");

    if (typeof targetPath !== "string")
      throw new Error("Target path should be a path to a file that doesn't exist!");
    // we shan't assert the file doesn't exist until we're in asynchronous code, via buildCollection

    configuration.lock(); // this may throw, but if so, it's good that it does so.
    this.#configurationData = configuration.cloneData();
    this.#targetPath = targetPath;
    this.#compileOptions = (compileOptions instanceof CompileTimeOptions) ? compileOptions : {};

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

    this.#buildDefines();
    this.#buildDocGenerator();
    this.#generateSource();
    await this.#writeSource();

    this.#status = "completed";
    return this.#configurationData.className;
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
        lines = `import WeakKeyComposer from "./WeakKey-WeakMap.mjs";\n` + lines;
      if (data.requiresKeyHasher)
        lines = `import KeyHasher from "./KeyHasher.mjs";\n` + lines;
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

  #buildDocGenerator() {
    this.#docGenerator = new JSDocGenerator(
      this.#configurationData.className,
      !this.#configurationData.collectionTemplate.endsWith("Map")
    );

    this.#configurationData.parameterToTypeMap.forEach(typeData => {
      this.#docGenerator.addParameter(typeData);
    });

    if (this.#configurationData.valueType && !this.#configurationData.parameterToTypeMap.has("value")) {
      this.#docGenerator.addParameter(this.#configurationData.valueType);
    }
  }

  #generateSource() {
    const generator = TemplateGenerators.get(this.#configurationData.collectionTemplate);

    this.#generatedCode = [
      this.#filePrologue(),
      generator(this.#defines, this.#docGenerator),
    ].flat(Infinity).filter(Boolean).join("\n\n");

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
}
Object.freeze(CodeGenerator);
Object.freeze(CodeGenerator.prototype);
Object.freeze(CodeGenerator.UTILITIES);
