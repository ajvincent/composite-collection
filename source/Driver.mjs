import CodeGenerator from "./CodeGenerator.mjs";
import CompileTimeOptions from "./CompileTimeOptions.mjs";

import { GeneratorPromiseSet, generatorToPromiseSet } from "./generatorTools/GeneratorPromiseSet.mjs";

import { Deferred, PromiseAllSequence } from "./utilities/PromiseTypes.mjs";

import url from "url";
import fs from "fs/promises";
import path from "path";
import readDirsDeep from "./utilities/readDirsDeep.mjs";

const projectRoot = url.fileURLToPath(new URL("..", import.meta.url));

export default class Driver {
  /** @type {string} @constant */
  #sourcesPath;

  /** @type {string} @constant */
  #targetsPath;

  /** @type {CompileTimeOptions} @constant */
  #compileTimeOptions = null;

  /** @type {GeneratorPromiseSet} @constant */
  #generatorPromiseSet = new GeneratorPromiseSet(this);

  #pendingStart;

  #runPromise;

  /**
   * @param {string} configDir The configurations directory.
   * @param {string} targetDir The destination directory.
   * @param {CompileTimeOptions}      compileOptions Flags from an owner which may override configurations.
   */
  constructor(configDir, targetDir, compileOptions = {}) {
    /*
    let resolve, reject;
    super(
      new Promise((res, rej) => [resolve, reject] = [res, rej]),
      () => this.#buildAll()
    );
    */

    if (typeof configDir !== "string")
      throw new Error("sourcesPath is not a string!");
    else if (typeof targetDir !== "string")
      throw new Error("targetsPath is not a string!");
    else {
      this.#sourcesPath = configDir;
      this.#targetsPath = targetDir;
      this.#compileTimeOptions = compileOptions;
    }

    let deferred = new Deferred;
    this.#pendingStart = deferred.resolve;
    this.#runPromise = deferred.promise.then(() => this.#buildAll());
  }

  /**
   * @returns {Promise<void>}
   */
  async run() {
    this.#pendingStart(null);
    await this.#runPromise;
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
          // eslint-disable-next-line no-console
          console.error("\n\nException happened for " + relativePath + "\n\n");
          throw ex;
        }
      },
      Promise.resolve([])
    );

    await fs.mkdir(this.#targetsPath, { recursive: true });

    const targetPaths = [];
    const generators = await PromiseAllSequence(configs, async config => {
      try {
        const targetPath = path.normalize(path.join(
          this.#targetsPath, configToRelativePath.get(config)
        ));
        const generator = new CodeGenerator(
          config, targetPath, this.#compileTimeOptions
        );

        generatorToPromiseSet.set(generator, this.#generatorPromiseSet);
        targetPaths.push(targetPath);

        await generator.run();
        return generator;
      }
      catch (ex) {
        // eslint-disable-next-line no-console
        console.error("Failed on " + configToRelativePath.get(config));
        throw ex;
      }
    });

    // It'd be better if each CodeGenerator did its own production of KeyHasher and WeakKeyComposer,
    // but this will preserve existing code for now.
    this.#generatorPromiseSet.main.addTask(async () => {
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
    });

    this.#generatorPromiseSet.markReady();
    targetPaths.forEach(t => this.#generatorPromiseSet.main.addSubtarget(t));

    await this.#generatorPromiseSet.main.run();
  }
}
