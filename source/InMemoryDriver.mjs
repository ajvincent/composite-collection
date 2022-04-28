import CodeGenerator from "./CodeGenerator.mjs";
import CollectionConfiguration from "./CollectionConfiguration.mjs";
import CompileTimeOptions from "./CompileTimeOptions.mjs";
import { GeneratorPromiseSet, generatorToPromiseSet } from "./generatorTools/GeneratorPromiseSet.mjs";
import { Deferred, PromiseAllParallel } from "./utilities/PromiseTypes.mjs";
import fs from "fs/promises";
import path from "path";
void (CollectionConfiguration); // TypeScript drops "unused" modules... needed for JSDoc
export default class InMemoryDriver {
    /** @type {string} @constant */
    #targetsPath;
    /** @type {CompileTimeOptions} @constant */
    #compileTimeOptions;
    /** @type {GeneratorPromiseSet} @constant */
    #generatorPromiseSet;
    // The string is the relativePath.
    #configs = new Map;
    #pendingStart;
    #runPromise;
    /**
     * @param {string}             targetDir      The destination directory.
     * @param {CompileTimeOptions} compileOptions Flags from an owner which may override configurations.
     */
    constructor(targetDir, compileOptions) {
        this.#targetsPath = targetDir;
        this.#compileTimeOptions = compileOptions instanceof CompileTimeOptions ? compileOptions : new CompileTimeOptions(compileOptions);
        this.#generatorPromiseSet = new GeneratorPromiseSet(this, targetDir);
        let deferred = new Deferred;
        this.#pendingStart = deferred.resolve;
        this.#runPromise = deferred.promise.then(() => this.#run());
    }
    /**
     * @param {CollectionConfiguration} configuration The configuration to add.
     * @param {string}                  relativePath  The path from the target directory to the destination module.
     */
    addConfiguration(configuration, relativePath) {
        this.#configs.set(configuration, relativePath);
    }
    /**
     * @returns {Promise<void>}
     */
    async run() {
        this.#pendingStart(null);
        return await this.#runPromise;
    }
    /**
     * Build and write the collections for the target directory, based on a source directory of configurations.
     */
    async #run() {
        await fs.mkdir(this.#targetsPath, { recursive: true });
        const targetPaths = [];
        await PromiseAllParallel(Array.from(this.#configs.keys()), async (config) => {
            const relativePath = this.#configs.get(config);
            try {
                const targetPath = path.normalize(path.join(this.#targetsPath, relativePath));
                const generator = new CodeGenerator(config, targetPath, this.#compileTimeOptions);
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
//# sourceMappingURL=InMemoryDriver.mjs.map