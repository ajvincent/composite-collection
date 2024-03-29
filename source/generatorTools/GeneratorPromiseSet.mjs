import { BuildPromise, BuildPromiseSet } from "../utilities/BuildPromise.mjs";
import { PromiseAllParallel } from "../utilities/PromiseTypes.mjs";
import { RequiredWeakMap } from "../utilities/RequiredMap.mjs";
import url from "url";
import fs from "fs/promises";
import path from "path";
import InvokeTSC from "../utilities/InvokeTSC.mjs";
const projectRoot = url.fileURLToPath(new URL("../..", import.meta.url));
void (BuildPromise); // necessary for type checking in eslint on the generated module
export class GeneratorPromiseSet extends BuildPromiseSet {
    #knownTargets = new Set;
    owner;
    #targetDir;
    #TypeScriptModules = [];
    #requireDefaultMap = false;
    #requireKeyHasher = false;
    #requireWeakKeyComposer = false;
    /** @type {BuildPromise} @constant */
    generatorsTarget;
    constructor(owner, targetDir) {
        super();
        this.owner = owner;
        Reflect.defineProperty(this, "owner", {
            writable: false,
            enumerable: true,
            configurable: false
        });
        this.#knownTargets.add(this.main.target);
        this.#targetDir = targetDir;
        this.generatorsTarget = this.get("(generators)");
        Reflect.defineProperty(this, "generatorsTarget", {
            writable: false,
            enumerable: true,
            configurable: false
        });
        const exportKeysTarget = this.get("(export keys)");
        exportKeysTarget.addTask(() => this.#exportKeyFiles());
        const invokeTSCTarget = this.get("(invoke TypeScript compiler)");
        invokeTSCTarget.addTask(() => this.#invokeTSC());
    }
    /**
     * @param {string} targetName The target name.
     * @returns {BuildPromise} The build promise.
     */
    get(targetName) {
        const rv = super.get(targetName);
        this.#knownTargets.add(targetName);
        return rv;
    }
    /**
     * @param {string} targetName The target name.
     * @returns {boolean} True if this is a known target.
     */
    has(targetName) {
        return this.#knownTargets.has(targetName);
    }
    async runMain() {
        this.markReady();
        this.main.addSubtarget("(generators)");
        this.main.addSubtarget("(export keys)");
        this.main.addSubtarget("(invoke TypeScript compiler)");
        await this.main.run();
    }
    scheduleTSC(targetModule) {
        targetModule = targetModule.replace(this.#targetDir + "/", "");
        this.#TypeScriptModules.push(targetModule);
    }
    async #invokeTSC() {
        if (!this.#TypeScriptModules.length)
            return 0; // success: there's nothing to do.
        this.#TypeScriptModules.sort();
        return await InvokeTSC.withCustomConfiguration(path.resolve(this.#targetDir, "tsconfig.json"), false, (config) => {
            config.files = this.#TypeScriptModules;
        });
    }
    requireDefaultMap() {
        this.#requireDefaultMap = true;
    }
    requireKeyHasher() {
        this.#requireKeyHasher = true;
        this.#requireDefaultMap = true;
    }
    requireWeakKeyComposer() {
        this.#requireWeakKeyComposer = true;
        this.#requireKeyHasher = true;
        this.#requireDefaultMap = true;
    }
    async #exportKeyFiles() {
        const filenames = new Set();
        if (this.#requireDefaultMap || this.#requireKeyHasher)
            filenames.add("DefaultMap");
        if (this.#requireKeyHasher)
            filenames.add("Hasher");
        if (this.#requireWeakKeyComposer)
            filenames.add("Composite");
        let fileList = await fs.readdir(path.resolve(projectRoot, "source/exports/keys"));
        fileList = fileList.filter(f => filenames.has(f.replace(/\..+/g, "")));
        await fs.mkdir(path.resolve(this.#targetDir, "keys"), { recursive: true });
        await PromiseAllParallel(fileList, async (leaf) => fs.copyFile(path.resolve(projectRoot, "source/exports/keys", leaf), path.resolve(this.#targetDir, "keys", leaf)));
    }
}
// This is here so the TypeScript generator can derive from it.
export class CodeGeneratorBase {
}
export const generatorToPromiseSet = new RequiredWeakMap;
//# sourceMappingURL=GeneratorPromiseSet.mjs.map