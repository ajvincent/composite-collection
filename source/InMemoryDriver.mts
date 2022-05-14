import CodeGenerator from "./CodeGenerator.mjs";
import CollectionConfiguration from "./CollectionConfiguration.mjs";
import CompileTimeOptions from "./CompileTimeOptions.mjs";

import { GeneratorPromiseSet, generatorToPromiseSet } from "./generatorTools/GeneratorPromiseSet.mjs";
import { Deferred, PromiseAllParallel } from "./utilities/PromiseTypes.mjs";

import fs from "fs/promises";
import path from "path";

import type { PromiseResolver } from "./utilities/PromiseTypes.mjs";

void(CollectionConfiguration); // TypeScript drops "unused" modules... needed for JSDoc

export default class InMemoryDriver {
  /** @type {string} @constant */
  #targetsPath: string;

  /** @type {CompileTimeOptions} @constant */
  #compileTimeOptions: CompileTimeOptions;

  /** @type {GeneratorPromiseSet} @constant */
  #generatorPromiseSet: GeneratorPromiseSet;

  // The string is the relativePath.
  #configs: Map<CollectionConfiguration, string> = new Map;

  #pendingStart: PromiseResolver<null>;

  #runPromise: Readonly<Promise<void>>;

  /**
   * @param {string}             targetDir      The destination directory.
   * @param {CompileTimeOptions} compileOptions Flags from an owner which may override configurations.
   */
  constructor(
    targetDir: string,
    compileOptions: object
  )
  {
    this.#targetsPath = targetDir;
    this.#compileTimeOptions = compileOptions instanceof CompileTimeOptions ? compileOptions : new CompileTimeOptions(compileOptions);

    this.#generatorPromiseSet = new GeneratorPromiseSet(this, targetDir);

    let deferred = new Deferred;
    this.#pendingStart = deferred.resolve;
    this.#runPromise = deferred.promise.then(async () => await this.#run());
  }

  /**
   * @param {CollectionConfiguration} configuration The configuration to add.
   * @param {string}                  relativePath  The path from the target directory to the destination module.
   */
  addConfiguration(
    configuration: CollectionConfiguration,
    relativePath: string
  ) : void
  {
    this.#configs.set(configuration, relativePath);
  }

  /**
   * @returns {Promise<void>}
   */
  async run() : Promise<void> {
    this.#pendingStart(null);
    return await this.#runPromise;
  }

  /**
   * Build and write the collections for the target directory, based on a source directory of configurations.
   */
  async #run() : Promise<void> {
    await fs.mkdir(this.#targetsPath, { recursive: true });
    const targetPaths: string[] = [];

    await PromiseAllParallel(Array.from(this.#configs.keys()), async (config: CollectionConfiguration) => {
      const relativePath = this.#configs.get(config) as string;
      try {
        // XXX ajvincent This path.join call could be problematic.  Why?
        const targetPath = path.normalize(path.join(
          this.#targetsPath, relativePath
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
        console.error("Failed on " + relativePath);
        throw ex;
      }
    });

    targetPaths.forEach(t => this.#generatorPromiseSet.generatorsTarget.addSubtarget(t));
    await this.#generatorPromiseSet.runMain();
  }
}
