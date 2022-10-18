import { SingletonPromise, PromiseAllParallel } from "./utilities/PromiseTypes.mjs";
import path from "path";
import readDirsDeep from "./utilities/readDirsDeep.mjs";
import CompileTimeOptions from "./CompileTimeOptions.mjs";
import InMemoryDriver from "./InMemoryDriver.mjs";
void (CompileTimeOptions); // TypeScript drops "unused" modules... needed for JSDoc
export default class Driver extends InMemoryDriver {
    /** @type {string} @constant */
    #sourcesPath;
    #runPromise;
    /**
     * @param {string}             configDir The configurations directory.
     * @param {string}             targetDir The destination directory.
     * @param {CompileTimeOptions} compileOptions Flags from an owner which may override configurations.
     */
    constructor(configDir, targetDir, compileOptions = {}) {
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
    async run() {
        return await this.#runPromise.run();
    }
    /**
     * Build and write the collections for the target directory, based on a source directory of configurations.
     *
     * @returns {void}
     */
    async #run() {
        const fullPaths = (await readDirsDeep(this.#sourcesPath)).files.filter(filePath => path.extname(filePath) === ".mjs");
        const fileList = fullPaths.map(path => path.replace(this.#sourcesPath + "/", ""));
        await PromiseAllParallel(fileList, async (relativePath) => {
            try {
                const fullPath = path.join(this.#sourcesPath, relativePath);
                const m = (await import(fullPath)).default;
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
//# sourceMappingURL=Driver.mjs.map