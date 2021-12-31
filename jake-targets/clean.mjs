import fs from "fs/promises";
import { getAllFiles } from 'get-all-files';
import path from "path";

const fileRoots = [
  "spec/_02_collection-generator/generated",
  "spec/_04_exports/generated",
  "exports",
].map(root => path.join(process.cwd(), root));

let allFiles = await Promise.all(fileRoots.map(
  root => getAllFiles(root).toArray()
));

allFiles = allFiles.flat().filter(file => file.endsWith(".mjs"));

[
  "exports/KeyHasher.mjs",
  "exports/WeakKey-WeakMap.mjs",
  "exports/WeakKey-WeakRef.mjs",
].forEach(excluded => {
  let index = allFiles.findIndex(element => element.endsWith(excluded));
  allFiles.splice(index, 1);
});

await Promise.all(allFiles.map(file => fs.rm(file)));
