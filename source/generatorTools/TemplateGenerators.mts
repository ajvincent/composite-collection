import JSDocGenerator from "./JSDocGenerator.mjs";
import { PromiseAllParallel } from "../utilities/PromiseTypes.mjs";
import { RequiredMap } from "../utilities/RequiredMap.mjs";

import type { ReadonlyDefines } from "./PreprocessorDefines.mjs"

export type TemplateFunction = (defines: ReadonlyDefines, ...docGenerators: JSDocGenerator[]) => string;

/**
 * @type {Map<string, Function>}
 * @package
 */
const __TemplateGenerators__: RequiredMap<string, TemplateFunction> = new RequiredMap();

import readDirsDeep from "../utilities/readDirsDeep.mjs";
import { ReadonlyRequiredMap } from "../utilities/RequiredMap.mjs";

const templateDirURL = new URL("../../templates", import.meta.url);
const templateDir = templateDirURL.pathname;

const allFiles = (await readDirsDeep(templateDir)).files;

await PromiseAllParallel(allFiles, async (fullPath: string) => {
  const baseName = fullPath.substring(templateDir.length + 1);
  if (!baseName.endsWith(".in.mjs"))
    return;

  const generator = (await import(fullPath)).default;
  if (typeof generator !== "function")
    throw new Error("generator isn't a function?");

  __TemplateGenerators__.set(baseName.replace(/\.in\.mjs$/, ""), generator);
});

const TemplateGenerators: ReadonlyRequiredMap<string, TemplateFunction> = __TemplateGenerators__;
export default TemplateGenerators;
