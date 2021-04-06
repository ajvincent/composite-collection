
import CompletionPromise from "./source/CompletionPromise.mjs";
import CodeGenerator from "./source/CodeGenerator.mjs";

import url from "url";
import getAllFiles from 'get-all-files';
import path from "path";

export default class CollectionCompiler extends CompletionPromise {
  /**
   * @type {string}
   * @private
   * @readonly
   */
  #sourcesPath;

  /**
   * @type {string}
   * @private
   * @readonly
   */
  #targetsPath;

  constructor(sourcesPath, targetsPath) {
    let resolve, reject;
    super(
      new Promise((res, rej) => [resolve, reject] = [res, rej]),
      () => this.buildAll()
    );

    try {
      if (typeof sourcesPath !== "string")
        throw new Error("sourcesPath is not a string!");
      else if (typeof targetsPath !== "string")
        throw new Error("targetsPath is not a string!");
      else {
        this.#sourcesPath = sourcesPath;
        this.#targetsPath = targetsPath;
        this.start = resolve;
      }
    }
    catch (ex) {
      reject(ex);
      throw ex;
    }
  }

  async buildAll() {
    let fileList = await getAllFiles.default.async.array(this.#sourcesPath);
    /*
    fileList = fileList.map(f => url.pathToFileURL(f));
    */

    fileList.length = 1;

    await Promise.all(fileList.map(async relativePath => {
      const config = (await import(url.pathToFileURL(relativePath))).default;

      const generator = new CodeGenerator(
        config,
        path.normalize(path.join(this.#targetsPath, relativePath)),
        Promise.resolve()
      );

      await generator.completionPromise;
    }));
  }
}
