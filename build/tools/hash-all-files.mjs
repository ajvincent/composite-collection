import crypto from "crypto";
import fs from "fs/promises";
import readDirsDeep from "#source/utilities/readDirsDeep.mjs";

/* Why does this file exist?
   https://en.wikipedia.org/wiki/Bootstrapping_(compilers)

   There are certain points within composite-collection that can benefit
   from code it generates.  The state machines in ConfigurationStateMachine.mjs
   are one example.  Another would be static analysis to trace our weak keys
   and collections to make sure we're not accidentally holding a weak reference
   strongly.

   So, we will bootstrap it in three stages as the Wikipedia page describes.

   If the bootstrap produces identical hashes in stages 2 and 3, then the
   test passes, and we can copy all the files subject to the hash back to
   the original repository checkout for review.

   This is like mathematical induction, proving f(k) = f(1) for k >= 1.
   f(1) builds stage 2, and f(2) builds stage 3.  If f(2) === f(1), we have
   our proof.

   Overkill?  Maybe.  The hashing is fast, though, and so is the build/test
   process for one stage.  So with temporary directories and our Jakefile,
   it really shouldn't be too expensive to build out.
*/

/**
 * Get the list of files to hash for bootstrapping comparisons.
 *
 * @param {string}     root The directory to hash.
 * @returns {string[]} The file list
 */
export async function getHashFileList(root) {
  const ignoredDirs = [
    "node_modules",
    "spec/_01_collection-generator/generated",
    "spec/_02_one-to-one-maps/generated",
    "spec/_04_exports/generated",

    // We have to exclude the whole directory because it drops some generated text and Markdown files directly below.
    "spec/_06_typescript-coverage",
    "."
  ];

  return (await readDirsDeep(root, dir => {
    dir = dir.replace(root, "");
    return ignoredDirs.some(ignorable => dir.includes(ignorable));
  })).files;
}

/**
 * Generate a checksum for all files in a build directory.
 *
 * @param {string} root Absolute path to the directory.
 * @returns {string} The hash of all non-ignored contents.
 */
export async function hashAllFiles(root) {
  const allFiles = await getHashFileList(root);

  const fileHashes = await Promise.all(allFiles.map(async file => {
    const contents = await fs.readFile(file, "utf-8");
    const hash = crypto.createHash('sha512');
    hash.update(contents);

    return hash.digest('hex') + " " + file.replace(root, "");
  }));

  {
    const contents = fileHashes.join("\n");
    /*
    const hash = crypto.createHash('sha512');
    hash.update(contents);
    return hash.digest('hex');
    */
   return contents;
  }
}
