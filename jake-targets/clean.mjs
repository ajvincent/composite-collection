import fs from "fs/promises";
import { getAllFiles } from 'get-all-files';
import path from "path";

const fileRoots = [
  "spec/_01_collection-generator/generated",
  "spec/_04_exports/generated",
  "exports",
].map(root => path.join(process.cwd(), root));

let allFiles = await Promise.all(fileRoots.map(
  root => getAllFiles(root).toArray()
));

allFiles = allFiles.flat().filter(file => file.endsWith(".mjs"));
await Promise.all(allFiles.map(file => fs.rm(file)));
