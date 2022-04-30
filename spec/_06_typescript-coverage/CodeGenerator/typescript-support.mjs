import url from "url";
import path from "path";
import fs from "fs/promises";

import readDirsDeep from "#source/utilities/readDirsDeep.mjs";
import { Deferred, PromiseAllParallel } from "#source/utilities/PromiseTypes.mjs";

const specDir = url.fileURLToPath(new URL("..", import.meta.url));
const projectRoot = url.fileURLToPath(new URL("../../..", import.meta.url));

import { openSync } from "fs";
import { fork } from "child_process";

const ENCODING = { encoding: "utf-8"};

import StrongMapOfStrongSets from "../generated/StrongMapOfStrongSets.mjs";
import TypeScriptDefines from "../../../source/typescript-migration/TypeScriptDefines.mjs";
import TemplateGenerators from "../../../source/generatorTools/TemplateGenerators.mjs";

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
  const generatedPath = path.join(specDir, "generated");

  let existingMTS;
  const tsSupported = path.join(generatedPath, "tsconfig.json");
  const tsUnsupported = path.join(generatedPath, "tsconfig-unsupported.json");

  let unsupportedCount = 0, supportedCount = 0;

  beforeAll(async () => {
    { // Get the list of all templates we know about.
      let { files } = await readDirsDeep(
        path.join(projectRoot, "templates")
      );
      files = files.filter(f => f.endsWith(".in.mts"));

      templatesWithoutModules = new Set(files.map(pathToFile => {
        return /(\w+\/\w+)\.in\.mts$/.exec(pathToFile)[1]
      }));
    }

    { // Scan the generated modules for template references.
      let files = await fs.readdir(generatedPath);
      files = files.filter(f => f.endsWith(".mjs")).map(f => path.join(generatedPath, f));

      await PromiseAllParallel(files, async pathToFile => {
        const contents = await fs.readFile(pathToFile, { encoding: "utf-8" });
        const foundTemplate = /Template: ([^\n]+)\n/.exec(contents)[1];
        templatesWithoutModules.delete(foundTemplate);

        TemplateSet.service.add(foundTemplate, pathToFile.replace(generatedPath + "/", ""));
      });
    }

    await fs.writeFile(
      path.join(specDir, "template-collections.md"),
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

    { // Write tsconfig.json and tsconfig-unsupported.json
      const rawJSON = await fs.readFile(
        path.join(specDir, "support/tsconfig.json.in"),
        ENCODING
      );

      const unsupportedConfig = JSON.parse(rawJSON);
      unsupportedConfig.files = [];

      const supportedConfig = JSON.parse(rawJSON);
      supportedConfig.files = [];
      delete supportedConfig.compilerOptions.noEmit;
      delete supportedConfig.compilerOptions.noImplicitAny;

      TemplateSet.service.forEach((template, relativePath) => {
        const generator = TemplateGenerators.get(template);
        const shouldSupport = TypeScriptDefines.moduleReadyForCoverage(generator);
        const fileList = shouldSupport ? supportedConfig.files : unsupportedConfig.files;
        fileList.push(relativePath.replace(".mjs", ".mts"));
        if (shouldSupport)
          supportedCount++;
        else
          unsupportedCount++;
      });

      await fs.writeFile(
        tsUnsupported,
        JSON.stringify(unsupportedConfig, null, 2) + "\n",
        ENCODING
      );

      await fs.writeFile(
        tsSupported,
        JSON.stringify(supportedConfig, null, 2) + "\n",
        ENCODING
      );
    }

    if (unsupportedCount) { // Invoke TypeScript on the unsupported files.
      const deferred = new Deferred;
      const outFD = openSync(path.join(specDir, "ts-unsupported-stdout.txt"), "w");

      const child = fork(
        path.join(projectRoot, "node_modules/typescript/bin/tsc"),
        [
          "--project", tsUnsupported,
        ],
        {
          stdio: ["ignore", outFD, "ignore", "ipc"]
        }
      );

      child.on("exit", deferred.resolve);
      await deferred.promise;
    }
  }, 1000 * 60);

  it("There is code coverage of every template.", () => {
    expect(Array.from(templatesWithoutModules)).toEqual([]);
  });

  it("TypeScript transpiles generated modules cleanly", async () => {
    if (supportedCount === 0)
      return;

    const deferred = new Deferred;
    const outFD = openSync(path.join(specDir, "ts-supported-stdout.txt"), "w");

    const child = fork(
      path.join(projectRoot, "node_modules/typescript/bin/tsc"),
      [
        "--project", tsSupported,
      ],
      {
        stdio: ["ignore", outFD, "ignore", "ipc"]
      }
    );

    child.on("exit", code => {
      code ? deferred.reject("Failed with code " + code) : deferred.resolve()
    });

    await expectAsync(deferred.promise).toBeResolved();
  }, 1000 * 60);
});
