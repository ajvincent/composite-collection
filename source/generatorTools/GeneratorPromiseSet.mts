import { BuildPromise, BuildPromiseSet } from "../utilities/BuildPromise.mjs";
import { PromiseAllParallel } from "../utilities/PromiseTypes.mjs";

import url from "url";
import fs from "fs/promises";
import path from "path";

const projectRoot = url.fileURLToPath(new URL("../..", import.meta.url));

void(BuildPromise); // necessary for type checking in eslint on the generated module

export class GeneratorPromiseSet extends BuildPromiseSet {
  #knownTargets: Set<string> = new Set;

  #owner: object;
  #targetDir: string;

  #requireKeyHasher = false;
  #requireWeakKeyComposer = false;

  #generatorsTarget: BuildPromise;
  #exportKeysTarget: BuildPromise;
  #copyToTargetDir: BuildPromise;

  constructor(owner: object, targetDir: string) {
    super();
    this.#owner = owner;
    this.#knownTargets.add(this.main.target);

    this.#targetDir = targetDir;

    this.#generatorsTarget = this.get("(generators)");
    this.#exportKeysTarget = this.get("(export keys)");
    this.#copyToTargetDir  = this.get("(move to target directory)");
    void(this.#copyToTargetDir);

    this.#exportKeysTarget.addTask(() => this.#exportKeyFiles());
  }

  get owner() : object {
    return this.#owner;
  }

  /**
   * @param {string} targetName The target name.
   * @returns {BuildPromise} The build promise.
   */
  get(targetName: string) : BuildPromise {
    const rv = super.get(targetName);
    this.#knownTargets.add(targetName);
    return rv;
  }

  /**
   * @param {string} targetName The target name.
   * @returns {boolean} True if this is a known target.
   */
  has(targetName: string) : boolean {
    return this.#knownTargets.has(targetName);
  }

  /** @type {BuildPromise} @constant */
  get generatorsTarget(): BuildPromise {
    return this.#generatorsTarget;
  }

  getTemporaryPath(targetPath: string) : string {
    return targetPath;
  }

  requireKeyHasher() : void {
    if (this.#requireKeyHasher)
      return;
    this.#requireKeyHasher = true;
  }

  requireWeakKeyComposer() : void {
    if (this.#requireWeakKeyComposer)
      return;
    this.#requireWeakKeyComposer = true;
    this.#requireKeyHasher = true;
  }

  async runMain() : Promise<void> {
    this.markReady();
    this.main.addSubtarget("(generators)");
    this.main.addSubtarget("(export keys)");
    this.main.addSubtarget("(move to target directory)");

    await this.main.run();
  }

  async #exportKeyFiles() : Promise<void> {
    if (!this.#requireKeyHasher)
      return;

    let fileList = await fs.readdir(path.join(projectRoot, "source/exports/keys"));
    if (!this.#requireWeakKeyComposer) {
      fileList = fileList.filter(f => !f.startsWith("Composite."));
    }

    const targetDir = this.getTemporaryPath(this.#targetDir);
    await fs.mkdir(path.join(targetDir, "keys"), { recursive: true });

    await PromiseAllParallel(fileList, async (leaf: string) => fs.copyFile(
      path.join(projectRoot, "source/exports/keys", leaf),
      path.join(targetDir, "keys", leaf)
    ));
  }
}

// This is here so the TypeScript generator can derive from it.
export class CodeGeneratorBase {}

export const generatorToPromiseSet: WeakMap<CodeGeneratorBase, GeneratorPromiseSet> = new WeakMap;
