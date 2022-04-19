import { BuildPromise, BuildPromiseSet } from "../utilities/BuildPromise.mjs";

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

  constructor(owner: object, targetDir: string) {
    super();
    this.#owner = owner;
    this.#knownTargets.add(this.main.target);

    this.#targetDir = targetDir;

    this.#generatorsTarget = this.get("(generators)");
    this.#exportKeysTarget = this.get("(export keys)");

    this.#exportKeysTarget.addTask(() => this.#exportKeyHasher());
    this.#exportKeysTarget.addTask(() => this.#exportWeakKeyComposer());
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

    await this.main.run();
  }

  async #exportKeyHasher() : Promise<void> {
    if (!this.#requireKeyHasher)
      return;
    await fs.mkdir(path.join(this.#targetDir, "keys"), { recursive: true });

    await fs.copyFile(
      path.join(projectRoot, "source/exports/keys/Hasher.mjs"),
      path.join(this.#targetDir, "keys/Hasher.mjs")
    );
  }

  async #exportWeakKeyComposer() : Promise<void> {
    if (!this.#requireWeakKeyComposer)
      return;
    await fs.copyFile(
      path.join(projectRoot, "source/exports/keys/Composite.mjs"),
      path.join(this.#targetDir, "keys/Composite.mjs")
    );
  }
}

export class CodeGeneratorBase {}

export const generatorToPromiseSet: WeakMap<CodeGeneratorBase, GeneratorPromiseSet> = new WeakMap;
