/**
 * @module source/CodeGenerator.mjs
 *
 * @fileoverview
 */

import CollectionConfiguration from "./CollectionConfiguration.mjs";
import CompletionPromise from "./CompletionPromise.mjs";
import JSDocGenerator from "./JSDocGenerator.mjs";
import CompileTimeOptions from "./CompileTimeOptions.mjs";

import fs from "fs/promises";
import { pathToFileURL } from "url";
import getAllFiles from 'get-all-files';
import beautify from "js-beautify";

/**
 * @type {Map<string, string>}
 * @package
 */
const TemplateGenerators = new Map();
{
  const templateDirURL = new URL("../templates", import.meta.url);
  const templateDir = templateDirURL.pathname;
  const allFiles = await getAllFiles.default.async.array(templateDir);
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

  /** @type {Object}  @readonly  @private */
  #configurationData;

  /** @type {string} @readonly @private */
  #targetPath;

  /** @type {RuntimeOptions} @readonly @private */
  #compileOptions;

  /** @type {string} @private */
  #status = "not started yet";

  /** @type {Map<string, *>} @readonly @private */
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
      exn => this.#status = "aborted"
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
    {
      const keys = Array.from(data.parameterToTypeMap.keys());
      this.#defines.set("argList", keys.join(", "));
      this.#defines.set("argNameList", buildArgNameList(keys));
    }

    const paramsData = Array.from(data.parameterToTypeMap.values());

    if (/Weak\/?Map/.test(data.collectionTemplate)) {
      this.#defines.set("weakMapCount", data.weakMapKeys.length);
      this.#defines.set("weakMapArgList", data.weakMapKeys.join(", "));
      this.#defines.set("weakMapArgNameList", buildArgNameList(data.weakMapKeys));
      this.#defines.set("weakMapArgument0", data.weakMapKeys[0]);

      this.#defines.set("strongMapCount", data.strongMapKeys.length);
      this.#defines.set("strongMapArgList", data.strongMapKeys.join(", "));
      this.#defines.set("strongMapArgNameList", buildArgNameList(data.strongMapKeys));
    }

    {
      const validator = paramsData.map(
        pd => pd.argumentValidator || ""
      ).filter(Boolean).join("\n\n").trim();

      if (validator) {
        const vSource = `__validateArguments__(${this.#defines.get("argList")}) {
${validator}
}`;
        this.#defines.set("validateArguments", vSource);
        this.#defines.set("invokeValidate", true);
      }
    }

    {
      let filter = (data.valueFilter || "").trim();
      if (filter)
        filter += "\n    ";
      this.#defines.set("validateValue", filter);
    }
  }

  #buildDocGenerator() {
    this.#docGenerator = new JSDocGenerator(
      this.#configurationData.className,
      !this.#configurationData.collectionTemplate.endsWith("Map")
    );

    this.#configurationData.parameterToTypeMap.forEach(typeData => {
      this.#docGenerator.addParameter(typeData.argumentType, typeData.argumentName, typeData.description);
    });

    if (this.#configurationData.valueType && !this.#configurationData.parameterToTypeMap.has("value")) {
      const typeData = this.#configurationData.valueType;
      this.#docGenerator.addParameter(typeData.argumentType, typeData.argumentName, typeData.description);
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
