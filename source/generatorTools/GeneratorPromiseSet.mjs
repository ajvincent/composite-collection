import { BuildPromise, BuildPromiseSet } from "../utilities/BuildPromise.mjs";
import { PromiseAllParallel } from "../utilities/PromiseTypes.mjs";
import url from "url";
import fs from "fs/promises";
import path from "path";
const projectRoot = url.fileURLToPath(new URL("../..", import.meta.url));
void (BuildPromise); // necessary for type checking in eslint on the generated module
export class GeneratorPromiseSet extends BuildPromiseSet {
    #knownTargets = new Set;
    #owner;
    #targetDir;
    #requireKeyHasher = false;
    #requireWeakKeyComposer = false;
    #generatorsTarget;
    #exportKeysTarget;
    constructor(owner, targetDir) {
        super();
        this.#owner = owner;
        this.#knownTargets.add(this.main.target);
        this.#targetDir = targetDir;
        this.#generatorsTarget = this.get("(generators)");
        this.#exportKeysTarget = this.get("(export keys)");
        this.#exportKeysTarget.addTask(() => this.#exportKeyFiles());
    }
    get owner() {
        return this.#owner;
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
    /** @type {BuildPromise} @constant */
    get generatorsTarget() {
        return this.#generatorsTarget;
    }
    requireKeyHasher() {
        if (this.#requireKeyHasher)
            return;
        this.#requireKeyHasher = true;
    }
    requireWeakKeyComposer() {
        if (this.#requireWeakKeyComposer)
            return;
        this.#requireWeakKeyComposer = true;
        this.#requireKeyHasher = true;
    }
    async runMain() {
        this.markReady();
        this.main.addSubtarget("(generators)");
        this.main.addSubtarget("(export keys)");
        await this.main.run();
    }
    async #exportKeyFiles() {
        if (!this.#requireKeyHasher)
            return;
        let fileList = await fs.readdir(path.join(projectRoot, "source/exports/keys"));
        if (!this.#requireWeakKeyComposer) {
            fileList = fileList.filter(f => !f.startsWith("Composite."));
        }
        await fs.mkdir(path.join(this.#targetDir, "keys"), { recursive: true });
        await PromiseAllParallel(fileList, async (leaf) => fs.copyFile(path.join(projectRoot, "source/exports/keys", leaf), path.join(this.#targetDir, "keys", leaf)));
    }
}
// This is here so the TypeScript generator can derive from it.
export class CodeGeneratorBase {
}
export const generatorToPromiseSet = new WeakMap;
//# sourceMappingURL=GeneratorPromiseSet.mjs.map