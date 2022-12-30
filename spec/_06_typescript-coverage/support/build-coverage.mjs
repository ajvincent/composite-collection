import url from "url";
import path from "path";
import fs from "fs/promises";

import readDirsDeep from "#source/utilities/readDirsDeep.mjs";
import { PromiseAllParallel } from "#source/utilities/PromiseTypes.mjs";
import InvokeTSC from "#source/utilities/InvokeTSC.mjs"

const specDir = url.fileURLToPath(new URL("..", import.meta.url));
const projectRoot = url.fileURLToPath(new URL("../../..", import.meta.url));

let templatesWithoutModules = new Set;
const generatedPath = path.resolve(specDir, "generated");
const tsSupported = path.resolve(generatedPath, "tsconfig.json");
const supportedFiles = [];

let existingMTS;

/**
 * Get the list of templates without modules..
 *
 * @returns {string[]} The list of templates.
 */
export function getTemplatesWithoutModules() {
  return Array.from(templatesWithoutModules);
}

/**
 * Build TypeScript coverage files.
 */
export async function build_TSCoverage() {
  const StrongMapOfStrongSets = (await import(
    `#spec/_06_typescript-coverage/generated/StrongMapOfStrongSets.mjs`
  )).default;

  class TemplateSet extends StrongMapOfStrongSets {
    templateKeys = new Set;
  
    add(template, relativePath) {
      super.add(template, relativePath);
      this.templateKeys.add(template);
    }

    markDown() {
      const orderTemplateKeys = Array.from(this.templateKeys.values());
      orderTemplateKeys.sort();
  
      return orderTemplateKeys.map(key => this.#markDownSet(key)).join("\n");
    }
  
    #markDownSet(template) {
      const keys = Array.from(this.valuesSet(template));
      keys.sort();
  
      return `- ${template}\n` + keys.map(item => `  - ${item[1]}`).join("\n");
    }
  
    static service = new TemplateSet;
  }

  { // Get the list of all templates we know about.
    let { files } = await readDirsDeep(
      path.resolve(projectRoot, "templates")
    );
    files = files.filter(f => f.endsWith(".in.mts"));

    templatesWithoutModules = new Set(files.map(pathToFile => {
      return /(\w+\/\w+)\.in\.mts$/.exec(pathToFile)[1]
    }));
  }

  { // Scan the generated modules for template references.
    let files = await fs.readdir(generatedPath);
    files = files.filter(f => f.endsWith(".mjs")).map(f => path.resolve(generatedPath, f));

    await PromiseAllParallel(files, async pathToFile => {
      const contents = await fs.readFile(pathToFile, { encoding: "utf-8" });
      const foundTemplate = /Template: ([^\n]+)\n/.exec(contents)[1];
      templatesWithoutModules.delete(foundTemplate);

      TemplateSet.service.add(foundTemplate, pathToFile.replace(generatedPath + "/", ""));
    });
  }

  await fs.writeFile(
    path.resolve(specDir, "template-collections.md"),
    `# Templates\n\n` + TemplateSet.service.markDown() + "\n",
    { encoding: "utf-8" }
  );

  { // Copy .mjs to .mts where no such module exists
    let { files } = await readDirsDeep(generatedPath);

    existingMTS = new Set(files.filter(f => f.endsWith(".mts")));
    const filesToRename = files.filter(f => {
      return f.endsWith(".mjs") && !existingMTS.has(f.replace(".mjs", ".mts"));
    });

    await PromiseAllParallel(filesToRename, async mjsFile => {
      const mtsFile = mjsFile.replace(".mjs", ".mts");
      await fs.copyFile(mjsFile, mtsFile);
    });
  }

  { // We just added several modules, so get the files we want to test.
    let { files } = await readDirsDeep(generatedPath);

    existingMTS = files.filter(f => /(?<!\.d)\.mts$/.test(f));
  }

  { // Sort the modules into supported and unsupported arrays.
    TemplateSet.service.forEach((template, relativePath) => {
      supportedFiles.push(relativePath.replace(".mjs", ".mts"));
    });

    const compileTestSources = await fs.readdir(
      path.resolve(specDir, "generated/compileTests")
    );

    supportedFiles.push(...compileTestSources.map(
      leaf => "compileTests/" + leaf
    ));
  }

  await InvokeTSC.withCustomConfiguration(
    tsSupported,
    false,
    (config) => {
      config.files = supportedFiles;
    },
    "spec/_06_typescript-coverage/ts-supported-stdout.txt"
  );
}
