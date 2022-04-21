/**
 * @type {Map<string, string>}
 * @package
 */
const TemplateGenerators = new Map();
import { pathToFileURL } from "url";
import { getAllFiles } from 'get-all-files';
import fs from "fs/promises";


const templateDirURL = new URL("../../templates", import.meta.url);
const templateDir = templateDirURL.pathname;
const allFiles = await getAllFiles(templateDir).toArray();
await Promise.all(allFiles.map(async fullPath => {
  let baseName = fullPath.substr(templateDir.length + 1);
  if (!baseName.endsWith(".in.mjs"))
    return;

  if ((await fs.lstat(fullPath)).isSymbolicLink())
    return;

  const targetFileURL = pathToFileURL(fullPath);
  const generator = (await import(targetFileURL)).default;
  if (typeof generator === "function")
    TemplateGenerators.set(baseName.replace(/\.in\.mjs$/, ""), generator);
  else
    throw new Error("generator isn't a function?");
}));

export default TemplateGenerators;
