/**
 * @module source/CodeGenerator.mjs
 *
 * @fileoverview
 */

import CollectionConfiguration from "./CollectionConfiguration.mjs";
import CompletionPromise from "./CompletionPromise.mjs";
import fs from "fs/promises";
import getAllFiles from 'get-all-files';
import path from "path";

/**
 * @type {Map<string, string>}
 * @package
 */
const TemplateFiles = new Map();
{
  const templateDir = new URL("../templates", import.meta.url).pathname;
  const allFiles = await getAllFiles.default.async.array(templateDir);
  await Promise.all(allFiles.map(async fullPath => {
    let baseName = fullPath.substr(templateDir.length + 1);
    if (!baseName.endsWith(".mjs"))
      return;
    baseName = baseName.replace(/\.mjs$/, "");
    TemplateFiles.set(baseName, await fs.readFile(fullPath, { encoding: "utf-8"}));
  }));
}

/**
 * @package
 */
export default class CodeGenerator extends CompletionPromise {
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

  /** @type {Map<string, string>} */
  #replaceStringKeys = new Map();

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

    this.#buildReplaceStrings();

    this.#generateSource();

    await this.#writeSource();

    this.#status = "completed";
    return this.#configurationData.className;
  }

  #buildReplaceStrings() {
    this.#replaceStringKeys.set("__className__", this.#configurationData.className);
    this.#replaceStringKeys.set("__argList__",
      Array.from(this.#configurationData.parameterToTypeMap.keys()).join(", ")
    );

    const paramsData = Array.from(this.#configurationData.parameterToTypeMap.values());
    this.#replaceStringKeys.set(
      `void("__doValidateArguments__");`,
      paramsData.map(pd => pd.argumentValidator || "").filter(Boolean).join("\n\n") + "\n"
    );

    this.#replaceStringKeys.set(
      `void("__doValidateValue__");`, this.#configurationData.valueFilter || ""
    );
  }

  #generateSource() {
    {
      const type = this.#configurationData.collectionType;
      if (type === "map") {
        if (this.#configurationData.weakMapKeys.length === 0)
          this.#generatedCode = TemplateFiles.get("CStrongMap");
        else
          throw new Error("weak maps not yet supported");
      }
      else {
        throw new Error("Unsupported collection type: " + collectionType);
      }
    }

    this.#replaceStringKeys.forEach((contents, keyName) => {
      // replaceAll() requires Node 15+.
      let source;
      do {
        source = this.#generatedCode;
        this.#generatedCode = source.replace(keyName, contents);
      } while (source !== this.#generatedCode);
    });
  }

  async #writeSource() {
    await fs.writeFile(
      this.#targetPath,
      this.#generatedCode,
      { encoding: "utf-8" }
    );
  }
}
