/* Why does this file exist?
   https://en.wikipedia.org/wiki/Bootstrapping_(compilers)

   There are certain points within composite-collection that can benefit
   from code it generates.  The state machines in ConfigurationStateGraphs.mjs
   are one example.  Another would be static analysis to trace our weak keys
   and collections to make sure we're not accidentally holding a weak reference
   strongly.

   So, we will bootstrap it in three stages as the Wikipedia page describes.

   If the bootstrap produces identical hashes in stages 2 and 3, then the
   test passes, and we can copy all the files subject to the hash back to
   the original repository checkout for review.

   This is like mathematical induction, proving f(k) === f(1) for k >= 1.
   f(0), the master code, builds stage 1, but that's not included in the test.
   f(1) builds stage 2, and f(2) builds stage 3.  If f(2) === f(1), we have
   our proof.

   Overkill?  Maybe.  The hashing is fast, though, and so is the build/test
   process for one stage.  So with temporary directories and our Jakefile,
   it really shouldn't be too expensive to build out.
*/

import recursiveCopy from "recursive-copy";

import which from "which";
import { spawn } from "child_process";

import { hashAllFiles } from "./hash-all-files.mjs";
import tempDirWithCleanup from "../spec/support/tempDirWithCleanup.mjs"

import path from "path";
import fs from "fs/promises";
import { getAllFiles } from 'get-all-files';
import { pathToFileURL } from "url";

const masterDirectory = process.cwd();

const stageDirs = [];
const cleanupAll = {};
{
  let resolveSequence = [];
  let promiseSequence = [];
  for (let i = 0; i < 3; i++) {
    let cleanup = await tempDirWithCleanup();
    resolveSequence.push(cleanup.resolve);
    promiseSequence.push(cleanup.promise);
    stageDirs.push(cleanup.tempDir);
  }

  cleanupAll.resolve = () => resolveSequence.forEach(res => res());
  cleanupAll.promise = Promise.all(promiseSequence);
}

console.time("stage");

try {
  // stage 1
  try {
    console.timeLog("stage", "stage 1 @ " + stageDirs[0]);
    await copyToStage(masterDirectory, stageDirs[0]);
    await buildCollections(masterDirectory, stageDirs[0]);
    await runAllStage(stageDirs[0]);
  }
  catch (ex) {
    console.error("failed at stage 1");
    throw ex;
  }

  // stage 2
  try {
    console.timeLog("stage", "stage 2 @ " + stageDirs[1]);
    await copyToStage(stageDirs[0], stageDirs[1]);
    await buildCollections(stageDirs[0], stageDirs[1]);
    await runAllStage(stageDirs[1]);
  }
  catch (ex) {
    console.error("failed at stage 2");
    throw ex;
  }

  const stage2Hash = await hashAllFiles(stageDirs[1]);

  // stage 3
  try {
    console.timeLog("stage", "stage 3 @ " + stageDirs[2]);
    await copyToStage(stageDirs[1], stageDirs[2]);
    await buildCollections(stageDirs[1], stageDirs[2]);
    await runAllStage(stageDirs[2]);
  }
  catch (ex) {
    console.error("failed at stage 3");
    throw ex;
  }

  const stage3Hash = await hashAllFiles(stageDirs[2]);

  if (stage3Hash !== stage2Hash) {
    console.error("stage 2: " + stageDirs[1]);
    console.error("stage 3: " + stageDirs[2]);
    throw new Error("Bootstrap: staged directories are different!");
  }

  console.timeLog("stage", "copying back to master directory");
  await cleanAndRecreate(path.join(masterDirectory, "source/collections"));
  await recursiveCopy(stageDirs[2], masterDirectory, {
    dot: true,
    overwrite: true,
  });
  console.timeLog("stage", "master should now be updated");

  cleanupAll.resolve();
  await cleanupAll.promise;
}
catch (ex) {
  //eslint-disable-next-line no-debugger
  debugger;
  throw ex;
}
finally {
  console.timeEnd("stage");
}

/**
 * Copy files from one stage to the next.
 * @param {string} sourceDir
 * @param {string} targetDir
 */
async function copyToStage(sourceDir, targetDir) {
  console.timeLog("stage", "starting copyToStage");
  await recursiveCopy(sourceDir, targetDir, {
    dot: true,
  });
  console.timeLog("stage", "copyToStage completed");
}

/**
 * Compose required collection files from one stage to another.
 * @param {string} sourceDir
 * @param {string} targetDir
 */
async function buildCollections(sourceDir, targetDir) {
  console.timeLog("stage", "starting buildCollections");

  const configDir = path.join(targetDir, "source/configurations");
  const collectionsDir = path.join(targetDir, "source/collections");

  await cleanAndRecreate(collectionsDir);

  const urlToClass = pathToFileURL(path.join(sourceDir, "source/CollectionConfiguration.mjs"));
  const configFileList = await getAllFiles(configDir).toArray();
  /** @type {Map<pathToFile, contents>} */
  const configMap = new Map(/* */)

  const sourceString = `import CollectionConfiguration from "composite-collection/Configuration";`
  const targetString = `import CollectionConfiguration from "${urlToClass}"`;

  /* The import module resolvers in each target stage directory refer to their own CollectionConfiguration
     module by default, not the source stage's module.  This is due to some quirk of NodeJS I
     haven't tracked down fully.  The result is that the CollectionConfiguration module we expect in
     CodeGenerator is different than the one NodeJS actually loads, which causes the CodeGenerator to throw.

     So I temporarily convert each import to an explicit URL to the source stage, and rewrite the file appropriately.
  */
  await Promise.all(configFileList.map(async fullPath => {
    let contents = await fs.readFile(fullPath, { encoding: "utf-8" });
    configMap.set(fullPath, contents);

    contents = contents.replace(sourceString, targetString);

    await fs.writeFile(fullPath, contents, { encoding: "utf-8" });
  }));

  // This starts the actual code generation in the target directory, driven by the source directory.
  await npm(sourceDir, "bootstrap-build", "--", targetDir);

  // For a clean repository, it's important to undo the changes to the import lines.
  await Promise.all(configFileList.map(async fullPath => {
    const contents = configMap.get(fullPath);
    await fs.writeFile(fullPath, contents, { encoding: "utf-8" });
  }));

  // We should remove references to KeyHasher and WeakKey
  {
    const commons = [
      "KeyHasher.mjs",
      "WeakKey-WeakMap.mjs",
      "WeakKey-WeakRef.mjs",
    ];
    await Promise.all(commons.map(
      leaf => fs.rm(path.join(collectionsDir, leaf), {force: true})
    ));

    const collections = await getAllFiles(collectionsDir).toArray();
    await Promise.all(collections.map(async fullPath => {
      let contents = await fs.readFile(fullPath, { encoding: "utf-8" });
      contents = contents.replace(
        `import KeyHasher from "./KeyHasher.mjs";`,
        `import KeyHasher from "../exports/KeyHasher.mjs";`
      );
      contents = contents.replace(
        `import WeakKeyComposer from "./WeakKey-WeakMap.mjs";`,
        `import WeakKeyComposer from "../exports/WeakKey-WeakMap.mjs";`
      );
      contents = contents.replace(
        `import WeakKeyComposer from "./WeakKey-WeakRef.mjs";`,
        `import WeakKeyComposer from "../exports/WeakKey-WeakRef.mjs";`
      );
      await fs.writeFile(fullPath, contents, { encoding: "utf-8" });
    }));
  }

  console.timeLog("stage", "buildCollections completed");
}

/**
 * Build a bootstrap stage.
 *
 * @param {string} stageDir
 */
async function runAllStage(stageDir) {
  console.timeLog("stage", "starting runAllStage");
  await npm(stageDir, "all");
  console.timeLog("stage", "runAllStage completed");
}

async function npm(stageDir, ...targets) {
  const npm = await which("npm");
  // npm run all
  let resolve, reject;
  let promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const runAll = spawn(npm, ["run", ...targets], {
    stdio: "inherit",
    cwd: stageDir,
  });
  runAll.on('close', code => {
    code ? reject(code) : resolve(code)
  });

  return promise;
}

async function cleanAndRecreate(dir) {
  await fs.rm(dir, {recursive: true});
  await fs.mkdir(dir);
}
