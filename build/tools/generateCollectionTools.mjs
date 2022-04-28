import CompileTimeOptions from "composite-collection/CompileTimeOptions";
import InMemoryDriver from "#source/InMemoryDriver.mjs";

import { PromiseAllSequence } from "#source/utilities/PromiseTypes.mjs";

import path from "path";
import fs from 'fs/promises';
import url from "url";

/**
 * Generate composite collections.
 *
 * @param {string}   sourceDir The directory holding the configurations.
 * @param {string}   targetDir The target directory.
 * @param {string[]} leafNames The paths to the configuration modules.
 */
export async function generateCollections(sourceDir, targetDir, leafNames) {
  // Look for compile-time options in an adjacent publishing.json file.
  const publishing = "publishing.json";
  let compileOptions = {};
  let publishingFile;
  if (path.isAbsolute(publishing))
    publishingFile = publishing;
  else
    publishingFile = path.normalize(path.join(process.cwd(), sourceDir, publishing));
  try {
    const rawContents = await fs.readFile(publishingFile, { encoding: "utf-8" });
    compileOptions = new CompileTimeOptions(JSON.parse(rawContents));
  }
  catch (ex) {
    // do nothing
  }

  const driver = new InMemoryDriver(targetDir, compileOptions);
  await PromiseAllSequence(leafNames, async leaf => {
    const configFile = sourceDir + "/" + leaf;
    const sourceFileURL = url.pathToFileURL(path.join(process.cwd(), configFile));
    const configuration = (await import(sourceFileURL)).default;
    driver.addConfiguration(configuration, leaf);
  });

  await driver.run();
}
