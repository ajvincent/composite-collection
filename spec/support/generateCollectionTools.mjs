import CodeGenerator from "composite-collection/CodeGenerator";
import CompileTimeOptions from "composite-collection/CompileTimeOptions";

import path from "path";
import fs from 'fs/promises';
import url from "url";

/**
 * Evaluate a callback asynchronously for every element of an array, sequentially.
 *
 * @param {*[]} elementArray The array of objects to pass into the callback.
 * @param {Function} callback The callback function.
 * @returns {Promise} Resolved if the sequence passes.
 * @see {Promise.all}
 * @see {Array.prototype.reduce}
 */
export async function PromiseAllSequence(elementArray, callback) {
  return elementArray.reduce(async (previousPromise, element) => {
    await previousPromise;
    return callback(element);
  }, Promise.resolve());
}

/**
 * Evaluate a callback asynchronously for every element of an array, in parallel.
 *
 * @param {*[]} elementArray The array of objects to pass into the callback.
 * @param {Function} callback The callback function.
 * @returns {Promise} Resolved if the sequence passes.
 * @see {Promise.all}
 * @see {Array.prototype.map}
 */
export async function PromiseAllParallel(elementArray, callback) {
  return Promise.all(elementArray.map(element => callback(element)));
}

/**
 * Define simple file-copying tasks.
 *
 * @param {string}   sourceDir The source directory.
 * @param {string}   targetDir The target directory.
 * @param {string[]} leafNames The paths to the files to copy.
 */
export async function copyFileTasks(sourceDir, targetDir, leafNames) {
  await PromiseAllSequence(leafNames, async leaf => {
    const sourceFile = path.join(process.cwd(), sourceDir, leaf),
          targetFile = path.join(process.cwd(), targetDir, leaf);

    // Yes, we could use file() here, but this project is still pretty small.
    console.log(`Copying from ${sourceDir} to ${targetDir}, ${leaf}`);
    await fs.mkdir(path.dirname(targetFile), { recursive: true });
    await fs.copyFile(sourceFile, targetFile);
  });
}

/**
 * Generate one collection.
 *
 * @param {string} config The source configuration.
 * @param {string} target The target directory.
 */
async function generateOneCollection(config, target,) {
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
  let resolve;
  let p = new Promise(res => resolve = res);

  const targetFile = path.join(process.cwd(), target);

  const generator = new CodeGenerator(configModule, targetFile, p, compileOptions);
  resolve();
  await generator.completionPromise;
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
