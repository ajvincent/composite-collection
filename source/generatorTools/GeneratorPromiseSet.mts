import { BuildPromise, BuildPromiseSet } from "../utilities/BuildPromise.mjs";
import { PromiseAllParallel } from "../utilities/PromiseTypes.mjs";
import { TemporaryDirWithPromise } from "../utilities/tempDirWithCleanup.mjs";

import url from "url";
import fs from "fs/promises";
import path from "path";
import InvokeTSC from "../utilities/InvokeTSC.mjs";

const projectRoot = url.fileURLToPath(new URL("../..", import.meta.url));

void(BuildPromise); // necessary for type checking in eslint on the generated module
void(TemporaryDirWithPromise);

export class GeneratorPromiseSet extends BuildPromiseSet {
  #knownTargets: Set<string> = new Set;

  #owner: object;
  #targetDir: string;

  #TypeScriptModules: string[] = [];

  #requireKeyHasher = false;
  #requireWeakKeyComposer = false;

  /** @type {BuildPromise} @constant */
  generatorsTarget: BuildPromise;

  constructor(owner: object, targetDir: string) {
    super();
    this.#owner = owner;
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

  async runMain() : Promise<void> {
    this.markReady();

    this.main.addSubtarget("(generators)");
    this.main.addSubtarget("(export keys)");
    this.main.addSubtarget("(invoke TypeScript compiler)");

    await this.main.run();
  }

  scheduleTSC(targetModule: string) : void {
    targetModule = targetModule.replace(this.#targetDir + "/", "");
    this.#TypeScriptModules.push(targetModule);
  }

  async #invokeTSC() : Promise<number> {
    if (!this.#TypeScriptModules.length)
      return 0; // success: there's nothing to do.

    return await InvokeTSC.withCustomConfiguration(
      path.resolve(this.#targetDir, "tsconfig.json"),
      false,
      (config) => {
        config.files = this.#TypeScriptModules;
      }
    );
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

  async #exportKeyFiles() : Promise<void> {
    if (!this.#requireKeyHasher)
      return;

    let fileList = await fs.readdir(path.resolve(projectRoot, "source/exports/keys"));
    if (!this.#requireWeakKeyComposer) {
      fileList = fileList.filter(f => !f.startsWith("Composite."));
    }

    await fs.mkdir(path.resolve(this.#targetDir, "keys"), { recursive: true });

    await PromiseAllParallel(fileList, async (leaf: string) => fs.copyFile(
      path.resolve(projectRoot, "source/exports/keys", leaf),
      path.resolve(this.#targetDir, "keys", leaf)
    ));
  }
}

// This is here so the TypeScript generator can derive from it.
export class CodeGeneratorBase {}

export const generatorToPromiseSet: WeakMap<CodeGeneratorBase, GeneratorPromiseSet> = new WeakMap;
