/**
 * @module source/CodeGenerator.mjs
 *
 * @fileoverview
 */

import CollectionConfiguration from "./CollectionConfiguration.mjs";
import CompletionPromise from "./CompletionPromise.mjs";
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

/**
 * @package
 */
export default class CodeGenerator extends CompletionPromise {
  static UTILITIES = [
    "KeyHasher.mjs",
  ];

  /**
   * @type {Object}
   * @readonly
   * @private
   */
  #configurationData;

  /**
   * @type {string}
   * @readonly
   * @private
   */
  #targetPath;

  /**
   * @type {string}
   * @private
   */
  #status = "not started yet";

  /** @type {Map<string, void>} */
  #defines = new Map();

  /** @type {string} */
  #generatedCode = "";

  /**
   * @param {CollectionConfiguration} configuration The configuration to use.
   * @param {string}                  targetPath
   * @param {Promise}                 startPromise
   */
  constructor(configuration, targetPath, startPromise) {
    super(startPromise, () => this.buildCollection());

    if (!(configuration instanceof CollectionConfiguration))
      throw new Error("Configuration isn't a CollectionConfiguration");

    if (typeof targetPath !== "string")
      throw new Error("Target path should be a path to a file that doesn't exist!");
    // we shan't assert the file doesn't exist until we're in asynchronous code, via buildCollection

    configuration.lock(); // this may throw, but if so, it's good that it does so.
    this.#configurationData = configuration.cloneData();
    this.#targetPath = targetPath;

    this.completionPromise.catch(
      exn => this.#status = "aborted"
    );
    Object.seal(this);
  }

  /**
   * @returns {string}
   */
  get status() {
    return this.#status;
  }

  async buildCollection() {
    this.#status = "in progress";
    try {
      debugger;
      this.#buildDefines();

      this.#generateSource();

      await this.#writeSource();
    }
    catch (ex) {
      console.error(ex);
      throw ex;
    }

    this.#status = "completed";
    return this.#configurationData.className;
  }

  #buildDefines() {
    this.#defines.clear();

    this.#defines.set("className", this.#configurationData.className);
    const keys = Array.from(this.#configurationData.parameterToTypeMap.keys());
    this.#defines.set("argList", keys.join(", "));
    this.#defines.set("argNameList", '[' + keys.map(key => `"${key}"`).join(", ") + ']');

    const paramsData = Array.from(this.#configurationData.parameterToTypeMap.values());

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
      else {
        this.#defines.set("validateArguments", "");
      }
    }

    {
      let filter = (this.#configurationData.valueFilter || "").trim();
      if (filter)
        filter += "\n    ";
      this.#defines.set("validateValue", filter);
    }

  }

  #generateSource() {
    let generatorModuleName = "";
    {
      const type = this.#configurationData.collectionType;
      if (type === "map") {
        if (this.#configurationData.weakMapKeys.length === 0)
          generatorModuleName = "CStrongMap";
        else
          throw new Error("weak maps not yet supported");
      }
      else {
        throw new Error("Unsupported collection type: " + collectionType);
      }
    }

    const generator = TemplateGenerators.get(generatorModuleName);

    this.#generatedCode = beautify(
      generator(this.#defines, function() {}),
      {
        "indent_size": 2,
        "indent_char": " ",
        "end_with_newline": true,
      }
    );
  }

  async #writeSource() {
    await fs.writeFile(
      this.#targetPath,
      this.#generatedCode,
      { encoding: "utf-8" }
    );
  }
}
Object.freeze(CodeGenerator);
Object.freeze(CodeGenerator.prototype);
Object.freeze(CodeGenerator.UTILITIES);
