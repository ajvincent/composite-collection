import JSDocGenerator from "./JSDocGenerator.mjs";
import TypeScriptDefines from "../typescript-migration/TypeScriptDefines.mjs";
import { PromiseAllParallel } from "../utilities/PromiseTypes.mjs";

import type { ReadonlyDefines } from "../typescript-migration/TypeScriptDefines.mjs"

export type TemplateFunction = (defines: ReadonlyDefines, ...docGenerators: JSDocGenerator[]) => string;

/**
 * @type {Map<string, Function>}
 * @package
 */
const TemplateGenerators: Map<string, TemplateFunction> = new Map();

import readDirsDeep from "../utilities/readDirsDeep.mjs";

const templateDirURL = new URL("../../templates", import.meta.url);
const templateDir = templateDirURL.pathname;

const allFiles = (await readDirsDeep(templateDir)).files;

await PromiseAllParallel(allFiles, async (fullPath: string) => {
  let baseName = fullPath.substring(templateDir.length + 1);
  if (!baseName.endsWith(".in.mjs"))
    return;

  const generator = (await import(fullPath)).default;
  if (typeof generator !== "function")
    throw new Error("generator isn't a function?");

  TemplateGenerators.set(baseName.replace(/\.in\.mjs$/, ""), generator);
  TypeScriptDefines.registerGenerator(generator, false);
});

export default TemplateGenerators;
