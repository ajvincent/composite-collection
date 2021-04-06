/**
 * @module source/CodeGenerator.mjs
 *
 * @fileoverview
 */

import CollectionConfiguration from "./CollectionConfiguration.mjs";
import CompletionPromise from "./CompletionPromise.mjs";
import fs from "fs/promises";

/**
 * @package
 */
export default class CodeGenerator extends CompletionPromise {
  /**
   * @type {CollectionConfiguration}
   * @readonly
   * @private
   */
  #configuration;

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

    this.#configuration = configuration;
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
    // checking the build directory

    this.#status = "completed";
    return this.#configuration.className;
  }
}
