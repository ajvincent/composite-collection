import CompletionPromise from "./CompletionPromise.mjs";
import CodeGenerator from "./CodeGenerator.mjs";
import CompileTimeOptions from "./CompileTimeOptions.mjs";

import url from "url";
import fs from "fs/promises";
import path from "path";
import readDirsDeep from "./utilities/readDirsDeep.mjs";

const projectRoot = url.fileURLToPath(new URL("..", import.meta.url));

export default class Driver extends CompletionPromise {
  /** @type {string} @constant */
  #sourcesPath;

  /** @type {string} @constant */
  #targetsPath;

  /** @type {CompileTimeOptions} @constant */
  #compileTimeOptions = null;

  /**
   * @param {string} configDir The configurations directory.
   * @param {string} targetDir The destination directory.
   * @param {CompileTimeOptions}      compileOptions Flags from an owner which may override configurations.
   */
  constructor(configDir, targetDir, compileOptions = {}) {
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
        this.#compileTimeOptions = compileOptions;
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

  /**
   * Build and write the collections for the target directory, based on a source directory of configurations.
   */
  async #buildAll() {
    const fullPaths = (await readDirsDeep(this.#sourcesPath)).files.filter(
      filePath => path.extname(filePath) === ".mjs"
    );
    let fileList = fullPaths.map(path => path.replace(this.#sourcesPath + "/", ""));
    const configToRelativePath = new WeakMap();

    const configs = await fileList.reduce(
      async (previous, relativePath) => {
        const list = await previous;
        try {
          const m = await import(url.pathToFileURL(path.join(this.#sourcesPath, relativePath)));
          configToRelativePath.set(m.default, relativePath);
          list.push(m.default);
          return list;
        }
        catch (ex) {
          console.error("\n\nException happened for " + relativePath + "\n\n");
          throw ex;
        }
      },
      Promise.resolve([])
    );

    await fs.mkdir(this.#targetsPath, { recursive: true });

    const startNow = Promise.resolve();

    const generators = await Promise.all(configs.map(async config => {
      try {
        const generator = new CodeGenerator(
          config,
          path.normalize(path.join(this.#targetsPath, configToRelativePath.get(config))),
          startNow,
          this.#compileTimeOptions
        );

        await generator.completionPromise;
        return generator;
      }
      catch (ex) {
        console.error("Failed on " + configToRelativePath.get(config));
        throw ex;
      }
    }));

    const requiresWeakKeyComposer = generators.some(g => g.requiresWeakKeyComposer);
    const requiresKeyHasher = requiresWeakKeyComposer || generators.some(g => g.requiresKeyHasher);

    if (requiresKeyHasher) {
      await fs.mkdir(path.join(this.#targetsPath, "keys"), { recursive: true });

      await fs.copyFile(
        path.join(projectRoot, "source/exports/keys/Hasher.mjs"),
        path.join(this.#targetsPath, "keys/Hasher.mjs")
      );
    }

    if (requiresWeakKeyComposer) {
      await fs.copyFile(
        path.join(projectRoot, "source/exports/keys/Composite.mjs"),
        path.join(this.#targetsPath, "keys/Composite.mjs")
      );
    }
  }
}
