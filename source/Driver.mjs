import CodeGenerator from "./CodeGenerator.mjs";
import CompileTimeOptions from "./CompileTimeOptions.mjs";
import { GeneratorPromiseSet, generatorToPromiseSet } from "./generatorTools/GeneratorPromiseSet.mjs";
import { Deferred, PromiseAllParallel } from "./utilities/PromiseTypes.mjs";
import fs from "fs/promises";
import path from "path";
import readDirsDeep from "./utilities/readDirsDeep.mjs";
export default class Driver {
    /** @type {string} @constant */
    #sourcesPath;
    /** @type {string} @constant */
    #targetsPath;
    /** @type {CompileTimeOptions} @constant */
    #compileTimeOptions;
    /** @type {GeneratorPromiseSet} @constant */
    #generatorPromiseSet;
    #pendingStart;
    #runPromise;
    /**
     * @param {string} configDir The configurations directory.
     * @param {string} targetDir The destination directory.
     * @param {CompileTimeOptions}      compileOptions Flags from an owner which may override configurations.
     */
    constructor(configDir, targetDir, compileOptions = {}) {
        if (typeof configDir !== "string")
            throw new Error("sourcesPath is not a string!");
        else if (typeof targetDir !== "string")
            throw new Error("targetsPath is not a string!");
        else {
            this.#sourcesPath = configDir;
            this.#targetsPath = targetDir;
            this.#compileTimeOptions = compileOptions instanceof CompileTimeOptions ? compileOptions : new CompileTimeOptions(compileOptions);
        }
        let deferred = new Deferred;
        this.#pendingStart = deferred.resolve;
        this.#runPromise = deferred.promise.then(() => this.#buildAll());
        this.#generatorPromiseSet = new GeneratorPromiseSet(this, targetDir);
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
    async #buildAll() {
        const fullPaths = (await readDirsDeep(this.#sourcesPath)).files.filter(filePath => path.extname(filePath) === ".mjs");
        let fileList = fullPaths.map(path => path.replace(this.#sourcesPath + "/", ""));
        const configToRelativePath = new WeakMap();
        const configs = await PromiseAllParallel(fileList, async (relativePath) => {
            try {
                const fullPath = path.join(this.#sourcesPath, relativePath);
                const m = (await import(fullPath)).default;
                configToRelativePath.set(m, relativePath);
                return m;
            }
            catch (ex) {
                // eslint-disable-next-line no-console
                console.error("\n\nException happened for " + relativePath + "\n\n");
                throw ex;
            }
        });
        await fs.mkdir(this.#targetsPath, { recursive: true });
        const targetPaths = [];
        await PromiseAllParallel(configs, async (config) => {
            const relativePath = configToRelativePath.get(config);
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
//# sourceMappingURL=Driver.mjs.map