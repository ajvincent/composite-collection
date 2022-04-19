import CodeGenerator from "composite-collection/CodeGenerator";
import CompileTimeOptions from "composite-collection/CompileTimeOptions";

import { PromiseAllSequence } from "#source/utilities/PromiseTypes.mjs";

import path from "path";
import fs from 'fs/promises';
import url from "url";

/**
 * Generate one collection.
 *
 * @param {string} config The source configuration.
 * @param {string} target The target directory.
 */
async function generateOneCollection(config, target) {
  // Import the configuration module.
  const sourceFileURL = url.pathToFileURL(path.join(process.cwd(), config));
  const configModule = (await import(sourceFileURL)).default;

  // Look for compile-time options in an adjacent publishing.json file.
  const publishing = "publishing.json";
  let compileOptions = {};
  let publishingFile;
  if (path.isAbsolute(publishing))
    publishingFile = publishing;
  else
    publishingFile = path.normalize(path.join(process.cwd(), config, "..", publishing));
  try {
    const rawContents = await fs.readFile(publishingFile, { encoding: "utf-8" });
    compileOptions = new CompileTimeOptions(JSON.parse(rawContents));
  }
  catch (ex) {
    // do nothing
  }

  // Generate the module.
  const targetFile = path.join(process.cwd(), target);

  const generator = new CodeGenerator(configModule, targetFile, compileOptions);
  await generator.run();
}

/**
 * Generate composite collections.
 *
 * @param {string}   sourceDir The directory holding the configurations.
 * @param {string}   targetDir The target directory.
 * @param {string[]} leafNames The paths to the configuration modules.
 */
export async function generateCollections(sourceDir, targetDir, leafNames) {
  await PromiseAllSequence(leafNames, async leaf => {
    const configFile = sourceDir + "/" + leaf,
          targetFile = targetDir + "/" + leaf;

    console.log("Generating collection: " + targetFile);
    return generateOneCollection(configFile, targetFile);
  });
}
