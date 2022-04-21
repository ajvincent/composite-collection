import { BuildPromise, BuildPromiseSet } from "../utilities/BuildPromise.mjs";
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
        this.#exportKeysTarget.addTask(() => this.#exportKeyHasher());
        this.#exportKeysTarget.addTask(() => this.#exportWeakKeyComposer());
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
    async #exportKeyHasher() {
        if (!this.#requireKeyHasher)
            return;
        await fs.mkdir(path.join(this.#targetDir, "keys"), { recursive: true });
        await fs.copyFile(path.join(projectRoot, "source/exports/keys/DefaultMap.mjs"), path.join(this.#targetDir, "keys/DefaultMap.mjs"));
        await fs.copyFile(path.join(projectRoot, "source/exports/keys/Hasher.mjs"), path.join(this.#targetDir, "keys/Hasher.mjs"));
    }
    async #exportWeakKeyComposer() {
        if (!this.#requireWeakKeyComposer)
            return;
        await fs.copyFile(path.join(projectRoot, "source/exports/keys/Composite.mjs"), path.join(this.#targetDir, "keys/Composite.mjs"));
    }
}
export class CodeGeneratorBase {
}
export const generatorToPromiseSet = new WeakMap;
//# sourceMappingURL=GeneratorPromiseSet.mjs.map