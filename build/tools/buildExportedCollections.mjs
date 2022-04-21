import fs from 'fs/promises';
import path from "path";

import {
  generateCollections
} from "./generateCollectionTools.mjs";
import verifyGeneratedModules from "./verifyGeneratedModules.mjs";

import readDirsDeep from "#source/utilities/readDirsDeep.mjs";

/**
 * Export all modules.
 */
export default async function() {

console.log("Starting to build exported collections");

const targetDir = path.join(process.cwd(), "exports");

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
  files = files.filter(pathToFile => /\/.*\.mjs$/.test(pathToFile));
  await verifyGeneratedModules(files);
}
console.log("Finished verifying generated modules");
}
