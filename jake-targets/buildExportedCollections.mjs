import fs from 'fs/promises';
import path from "path";
import url from "url";

import {
  PromiseAllSequence,
  copyFileTasks,
  generateCollections
} from "#support/generateCollectionTools.mjs";

import readDirsDeep from "#source/utilities/readDirsDeep.mjs";

console.log("Starting to build exported collections");

const targetDir = path.join(process.cwd(), "exports");

await copyFileTasks(
  "source/exports",
  "exports",
  [
    "keys/Hasher.mjs",
    "keys/Composite.mjs",
  ]
);

const exportDir = path.join(process.cwd(), "source/exports");
const entries = (await fs.readdir(exportDir, { encoding: "utf-8", withFileTypes: true}));
const files = entries.reduce((fileList, entry) => {
  if (entry.isFile() && (path.extname(entry.name) === ".mjs"))
    fileList.push(entry.name);
  return fileList;
}, []);

await generateCollections(
  "source/exports",
  "exports",
  files
);

console.log("Finished building exported collections");

console.log("Started verifying generated modules");
{
  let {files} = await readDirsDeep(targetDir);
  files = files.filter(pathToFile => {
    return /\/.*\.mjs$/.test(pathToFile);
  });

  await PromiseAllSequence(files, async targetFile => {
    const relPath = targetFile.replace(process.cwd(), "")
    console.log("Verifying: " + relPath);
    // Verify the module exports a function.  (This is a preamble to testing the module.)
    const targetFileURL = url.pathToFileURL(targetFile);
    const targetModule = (await import(targetFileURL)).default;
    if (typeof targetModule !== "function")
      throw new Error("Compilation failed for " + relPath);
  });
}
console.log("Finished verifying generated modules");
