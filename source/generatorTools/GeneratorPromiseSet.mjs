import { BuildPromise, BuildPromiseSet } from "../utilities/BuildPromise.mjs";
import { PromiseAllParallel } from "../utilities/PromiseTypes.mjs";
import tempDirWithCleanup from "../utilities/tempDirWithCleanup.mjs";
import { TemporaryDirWithPromise } from "../utilities/tempDirWithCleanup.mjs";
import url from "url";
import fs from "fs/promises";
import path from "path";
import recursiveCopy from "recursive-copy";
const projectRoot = url.fileURLToPath(new URL("../..", import.meta.url));
void (BuildPromise); // necessary for type checking in eslint on the generated module
void (TemporaryDirWithPromise);
export class GeneratorPromiseSet extends BuildPromiseSet {
    #knownTargets = new Set;
    #owner;
    #targetDir;
    #requireKeyHasher = false;
    #requireWeakKeyComposer = false;
    /** @type {BuildPromise} @constant */
    generatorsTarget;
    /** @type {Promise<TemporaryDirWithPromise>} */
    #tempDirPromise;
    constructor(owner, targetDir) {
        super();
        this.#owner = owner;
        this.#knownTargets.add(this.main.target);
        this.#targetDir = targetDir;
        this.#tempDirPromise = tempDirWithCleanup();
        this.generatorsTarget = this.get("(generators)");
        Reflect.defineProperty(this, "generatorsTarget", {
            writable: false,
            enumerable: true,
            configurable: false
        });
        const exportKeysTarget = this.get("(export keys)");
        exportKeysTarget.addTask(() => this.#exportKeyFiles());
        const copyToTargetDir = this.get("(move to target directory)");
        copyToTargetDir.addTask(() => this.#copyToTargetDirectory());
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
    async runMain() {
        this.markReady();
        this.main.addSubtarget("(generators)");
        this.main.addSubtarget("(export keys)");
        this.main.addSubtarget("(move to target directory)");
        try {
            await this.main.run();
        }
        finally {
            const { promise, resolve } = await this.#tempDirPromise;
            resolve(undefined);
            await promise;
        }
    }
    async getTemporaryPath(targetPath) {
        const { tempDir } = await this.#tempDirPromise;
        return targetPath.replace(this.#targetDir, tempDir);
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
    async #exportKeyFiles() {
        if (!this.#requireKeyHasher)
            return;
        let fileList = await fs.readdir(path.join(projectRoot, "source/exports/keys"));
        if (!this.#requireWeakKeyComposer) {
            fileList = fileList.filter(f => !f.startsWith("Composite."));
        }
        const targetDir = await this.getTemporaryPath(this.#targetDir);
        await fs.mkdir(path.join(targetDir, "keys"), { recursive: true });
        await PromiseAllParallel(fileList, async (leaf) => fs.copyFile(path.join(projectRoot, "source/exports/keys", leaf), path.join(targetDir, "keys", leaf)));
    }
    async #copyToTargetDirectory() {
        const { tempDir } = await this.#tempDirPromise;
        await recursiveCopy(tempDir, this.#targetDir, {
            overwrite: true,
        });
    }
}
// This is here so the TypeScript generator can derive from it.
export class CodeGeneratorBase {
}
export const generatorToPromiseSet = new WeakMap;
//# sourceMappingURL=GeneratorPromiseSet.mjs.map