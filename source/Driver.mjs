import CompletionPromise from "./CompletionPromise.mjs";
import CodeGenerator from "./CodeGenerator.mjs";

import url from "url";
import fs from "fs/promises";
import path from "path";
import getAllFiles from 'get-all-files';

const projectRoot = url.fileURLToPath(new URL("..", import.meta.url));

export default class Driver extends CompletionPromise {
  /**
   * @type {string}
   * @private
   * @const
   */
  #sourcesPath;

  /**
   * @type {string}
   * @private
   * @const
   */
  #targetsPath;

  /**
   * @param {string} configDir The configurations directory.
   * @param {string} targetDir The destination directory.
   */
  constructor(configDir, targetDir) {
    let resolve, reject;
    super(
      new Promise((res, rej) => [resolve, reject] = [res, rej]),
      () => this.#buildAll()
    );

    try {
      if (typeof configDir !== "string")
        throw new Error("sourcesPath is not a string!");
      else if (typeof targetDir !== "string")
        throw new Error("targetsPath is not a string!");
      else {
        this.#sourcesPath = configDir;
        this.#targetsPath = targetDir;
        this.start = resolve;
      }
    }
    catch (ex) {
      reject(ex);
      throw ex;
    }
  }

  /**
   * Start the project.
   */
  start() {
    void("Instances of this class will replace this method");
  }

  async #buildAll() {
    let startResolve;
    const startPromise = new Promise(resolve => startResolve = resolve);

    let fileList = await this.#getFileList();
    const configToRelativePath = new WeakMap();

    const configs = await Promise.all(fileList.map(
      async relativePath => {
        const m = await import(url.pathToFileURL(path.join(this.#sourcesPath, relativePath)));
        configToRelativePath.set(m.default, relativePath);
        return m.default;
      }
    ));

    const requiresKeyHasher = configs.some(c => c.cloneData().requiresKeyHasher);
    const requiresWeakKey   = configs.some(c => c.cloneData().requiresWeakKey);

    let promises = configs.map(config => {
      const generator = new CodeGenerator(
        config,
        path.normalize(path.join(this.#targetsPath, configToRelativePath.get(config))),
        startPromise
      );

      return generator.completionPromise;
    });

    await fs.mkdir(this.#targetsPath, { recursive: true });

    if (requiresKeyHasher) {
      promises.push(fs.copyFile(
        path.join(projectRoot, "exports/KeyHasher.mjs"),
        path.join(this.#targetsPath, "KeyHasher.mjs")
      ));
    }

    if (requiresWeakKey) {
      promises.push(fs.copyFile(
        path.join(projectRoot, "exports/WeakKey-WeakMap.mjs"),
        path.join(this.#targetsPath, "WeakKey-WeakMap.mjs")
      ));
    }

    startResolve();
    return Promise.all(promises);
  }

  /**
   * @returns {string[]}
   *
   * @note This is a placeholder for
   */
  async #getFileList() {
    const fullPaths = await getAllFiles.default.async.array(this.#sourcesPath);
    return fullPaths.map(path => path.replace(this.#sourcesPath + "/", ""));
  }

}
