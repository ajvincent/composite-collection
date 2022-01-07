import { fork } from 'child_process';
import path from "path";
import fs from 'fs/promises';

export async function PromiseAllSequence(elementArray, callback) {
  return elementArray.reduce(async (previousPromise, element) => {
    await previousPromise;
    return callback(element);
  }, Promise.resolve());
}

export async function PromiseAllParallel(elementArray, callback) {
  return Promise.all(elementArray.map(element => callback(element)));
}

/**
 * Run a specific submodule.
 *
 * @param {string}   pathToModule  The module to run.
 * @param {string[]} moduleArgs    Arguments we pass into the module.
 * @param {string[]} extraNodeArgs Arguments we pass to node.
 *
 * @returns {Promise<void>}
 */
export function runModule(pathToModule, moduleArgs = [], extraNodeArgs = []) {
  let resolve, reject;
  let p = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const child = fork(pathToModule, moduleArgs, {
    execArgv: process.execArgv.concat("--expose-gc", ...extraNodeArgs),
    silent: false
  });
  child.on('exit', code => code ? reject(code) : resolve());

  return p;
}

/**
 * Define simple file-copying tasks.
 *
 * @param {string}   sourceDir
 * @param {string}   targetDir
 * @param {string[]} leafNames
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

export async function generateCollections(sourceDir, targetDir, leafNames) {
  await PromiseAllSequence(leafNames, async leaf => {
    const configFile = sourceDir + "/" + leaf,
          targetFile = targetDir + "/" + leaf;

    console.log("Generating collection: " + targetFile);
    return runModule(
      "./jake-targets/generateCollection.mjs",
      [configFile, targetFile],
      []
    );
  });
}
