import { SingletonPromise, PromiseAllParallel } from "./utilities/PromiseTypes.mjs";

import path from "path";
import readDirsDeep from "./utilities/readDirsDeep.mjs";
import CollectionConfiguration from "./CollectionConfiguration.mjs";
import CompileTimeOptions from "./CompileTimeOptions.mjs";
import InMemoryDriver from "./InMemoryDriver.mjs";

void(CompileTimeOptions); // TypeScript drops "unused" modules... needed for JSDoc

export default class Driver extends InMemoryDriver {
  /** @type {string} @constant */
  #sourcesPath: string;

  #runPromise: SingletonPromise<void>;

  /**
   * @param {string}             configDir The configurations directory.
   * @param {string}             targetDir The destination directory.
   * @param {CompileTimeOptions} compileOptions Flags from an owner which may override configurations.
   */
  constructor(
    configDir: string,
    targetDir: string,
    compileOptions: object = {}
  )
  {
    super(targetDir, compileOptions);

    if (typeof configDir !== "string")
      throw new Error("sourcesPath is not a string!");
    else if (typeof targetDir !== "string")
      throw new Error("targetsPath is not a string!");
    else {
      this.#sourcesPath = configDir;
    }

    this.#runPromise = new SingletonPromise(async () => await this.#run());
  }

  /**
   * @returns {Promise<void>}
   */
  async run() : Promise<void>
  {
    return await this.#runPromise.run();
  }

  /**
   * Build and write the collections for the target directory, based on a source directory of configurations.
   *
   * @returns {void}
   */
  async #run(): Promise<void>
  {
    const fullPaths: string[] = (await readDirsDeep(this.#sourcesPath)).files.filter(
      filePath => path.extname(filePath) === ".mjs"
    );
    const fileList = fullPaths.map(path => path.replace(this.#sourcesPath + "/", ""));

    await PromiseAllParallel(fileList, async relativePath => {
      try {
        const fullPath: string = path.join(this.#sourcesPath, relativePath);
        const m: CollectionConfiguration = (
          await import(fullPath) as {default: CollectionConfiguration}
        ).default;
        super.addConfiguration(m, relativePath);
      }
      catch (ex) {
        // eslint-disable-next-line no-console
        console.error("\n\nException happened for " + relativePath + "\n\n");
        throw ex;
      }
    });

    return await super.run();
  }
}
