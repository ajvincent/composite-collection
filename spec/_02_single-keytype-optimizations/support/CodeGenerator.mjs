import { PromiseAllSequence } from "#support/generateCollectionTools.mjs";

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

/**
 * Describe specifications to share among all three map/set directories.
 *
 * @param {string} describePrefix  The describe prefix to use.
 * @param {Function} suiteCallback The specification suite definer.
 */
export default function describeForAllThree(describePrefix, suiteCallback) {
  describe(describePrefix, () => {
    moduleDirMap.forEach((moduleMap, dir) => {
      describe("for " + dir + ":", () => suiteCallback(moduleMap));
    });
  });
}
