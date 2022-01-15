import { PromiseAllSequence } from "#support/generateCollectionTools.mjs";
import MockImportable from "#spec/_01_collection-generator/fixtures/MockImportable.mjs";

import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from 'url';

const directories = [
  "multiple-reference",
  "solo-fullbuild",
  "solo-optbuild",
];

const moduleDirMap = new Map;
await PromiseAllSequence(directories, async dir => {
  const generatedDir = path.join(fileURLToPath(import.meta.url), "../..", dir, "generated");
  let entries = (await fs.readdir(generatedDir, { withFileTypes: true }));
  entries = entries.filter(entry => entry.isFile());
  const moduleLeafs = entries.map(entry => entry.name);

  let moduleMap = {};
  await PromiseAllSequence(moduleLeafs, async moduleName => {
    const module = await import(
      pathToFileURL(path.join(generatedDir, moduleName))
    );
    moduleMap[moduleName.replace(".mjs", "")] = module.default;
  });

  moduleDirMap.set(dir, moduleMap);
});

const extraMapKey = new MockImportable,
      extraSetKey = new MockImportable;

/**
 * Add a shared map argument.
 *
 * @param {object[]} args The argument list.
 * @returns {object[]} The modified argument list.
 */
function addMapArg(args) {
  args.push(extraMapKey);
  return args;
}

/**
 * Add a shared set argument.
 *
 * @param {object[]} args The argument list.
 * @returns {object[]} The modified argument list.
 */
function addSetArg(args) {
  args.push(extraSetKey);
  return args;
}

/**
 * Identity function.
 *
 * @param {object[]} args The argument list.
 * @returns {object[]} The original argument list.
 */
function identity(args) {
  return args
}

/**
 * Describe specifications to share among all three map/set directories.
 *
 * @param {string} describePrefix  The describe prefix to use.
 * @param {Function} suiteCallback The specification suite definer.
 */
export function describeForAllThree(describePrefix, suiteCallback) {
  describe(describePrefix, () => {
    moduleDirMap.forEach((moduleMap, dir) => {
      const mapKeyFunc = dir === "multiple-reference" ? addMapArg : identity;
      const setKeyFunc = dir === "multiple-reference" ? addSetArg : identity;
      describe("for " + dir + ":",
        () => suiteCallback(moduleMap, mapKeyFunc, setKeyFunc)
      );
    });
  });
}
