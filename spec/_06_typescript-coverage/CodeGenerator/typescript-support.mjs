import url from "url";
import path from "path";
import fs from "fs/promises";

import readDirsDeep from "#source/utilities/readDirsDeep.mjs";
import { PromiseAllParallel } from "#source/utilities/PromiseTypes.mjs";

const specDir = url.fileURLToPath(new URL("..", import.meta.url));
const projectRoot = url.fileURLToPath(new URL("../../..", import.meta.url));

const ENCODING = { encoding: "utf-8"};

import StrongMapOfStrongSets from "../generated/StrongMapOfStrongSets.mjs";
import InvokeTSC from "../../../source/utilities/InvokeTSC.mjs"

describe("TypeScript support: ", () => {
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

  let templatesWithoutModules = [];
  const generatedPath = path.resolve(specDir, "generated");

  let existingMTS;
  const tsSupported = path.resolve(generatedPath, "tsconfig.json");
  const supportedFiles = [];

  beforeAll(async () => {
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
      let files = await fs.readdir(generatedPath, ENCODING);

      existingMTS = files.filter(f => /(?<!\.d)\.mts$/.test(f));
    }

    { // Sort the modules into supported and unsupported arrays.
      TemplateSet.service.forEach((template, relativePath) => {
        supportedFiles.push(relativePath.replace(".mjs", ".mts"));
      });
    }
  }, 1000 * 60);

  it("There is code coverage of every template.", () => {
    expect(Array.from(templatesWithoutModules)).toEqual([]);
  });

  it("TypeScript transpiles generated modules cleanly", async () => {
    await expectAsync(InvokeTSC.withCustomConfiguration(
      tsSupported,
      false,
      (config) => {
        config.files = supportedFiles;
      },
      "spec/_06_typescript-coverage/ts-supported-stdout.txt"
    )).toBeResolved();
  }, 1000 * 60);
});
