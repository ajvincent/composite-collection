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

import fs from "fs/promises";
import path from "path";
import os from "os";

import { hashAllFiles } from "./hash-all-files.mjs";
import tempDirWithCleanup from "../spec/support/tempDirWithCleanup.mjs"

const masterDirectory = process.cwd();

const stageDirs = [];
const cleanupAll = { resolve, promise };
{
  let resolveSequence = [];
  let promiseSequence = [];
  for (let i = 0; i < 3; i++) {
    let cleanup = await tempDirWithCleanup();
    resolveSequence.push(cleanup.resolve);
    promiseSequence.push(cleanup.promise);
    stageDirs.push(cleanup.tempDir);

    cleanupAll.resolve = () => resolveSequence.forEach(res => res());
    cleanupAll.promise = Promise.all(promiseSequence);
  }
}

console.log(stageDirs);

try {
  // stage 1
  await copyToStage(masterDirectory, stageDirs[0]);
  await buildCollections(masterDirectory, stageDirs[0]);
  await buildStage(stageDirs[0]);

  // stage 2
  await copyToStage(stageDirs[0], stageDirs[1]);
  await buildCollections(stageDirs[0], stageDirs[1]);
  await buildStage(stageDirs[1]);

  const stage2Hash = hashAllFiles(stageDirs[1]);

  // stage 3
  await copyToStage(stageDirs[1], stageDirs[2]);
  await buildCollections(stageDirs[1], stageDirs[2]);
  await buildStage(stageDirs[2]);

  const stage3Hash = hashAllFiles(stageDirs[2]);

  if (stage3Hash !== stage2Hash) {
    throw new Error("Bootstrap: staged directories are different!");
  }

  await copyToStage(stageDirs[2], masterDirectory);
}
catch (ex) {
  //eslint-disable-next-line no-debugger
  debugger;
  throw ex;
}
finally {
  cleanupAll.resolve();
  await cleanup.promise;
}

/**
 * Copy files from one stage to the next.
 * @param {string} sourceDir
 * @param {string} targetDir
 */
async function copyToStage(sourceDir, targetDir) {
  throw new Error("Not yet implemented!");
}

/**
 * Compose required collection files from one stage to another.
 * @param {string} sourceDir
 * @param {string} targetDir
 */
async function buildCollections(sourceDir, targetDir) {
  throw new Error("Not yet implemented!");
}

/**
 * Build a bootstrap stage.
 *
 * @param {string} stageDir
 */
async function buildStage(stageDir) {
  throw new Error("Not yet implemented!");
}