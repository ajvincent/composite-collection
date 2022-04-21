/**
 * @type {Map<string, string>}
 * @package
 */
const TemplateGenerators: Map<string, string> = new Map();

import readDirsDeep from "../utilities/readDirsDeep.mjs";

const templateDirURL = new URL("../../templates", import.meta.url);
const templateDir = templateDirURL.pathname;

const allFiles = (await readDirsDeep(templateDir)).files;

await Promise.all(allFiles.map(async (fullPath: string) => {
  let baseName = fullPath.substring(templateDir.length + 1);
  if (!baseName.endsWith(".in.mjs"))
    return;

  const generator = (await import(fullPath)).default;
  if (typeof generator === "function")
    TemplateGenerators.set(baseName.replace(/\.in\.mjs$/, ""), generator);
  else
    throw new Error("generator isn't a function?");
}));

export default TemplateGenerators;
