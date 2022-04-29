import url from "url";
import path from "path";
import fs from "fs/promises";

import readDirsDeep from "#source/utilities/readDirsDeep.mjs";
import { PromiseAllParallel } from "#source/utilities/PromiseTypes.mjs";

const specDir = url.fileURLToPath(new URL("..", import.meta.url));
const projectRoot = url.fileURLToPath(new URL("../../..", import.meta.url));

import StrongMapOfStrongSets from "../generated/StrongMapOfStrongSets.mjs";

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
}

it("Code coverage of all templates", async () => {
  let templates;
  {
    let { files } = await readDirsDeep(
      path.join(projectRoot, "templates")
    );
    files = files.filter(f => f.endsWith(".in.mts"));

    templates = new Set(files.map(pathToFile => {
      return /(\w+\/\w+)\.in\.mts$/.exec(pathToFile)[1]
    }));
  }

  const tMap = new TemplateSet;

  {
    const generatedPath = path.join(specDir, "generated");
    let files = await fs.readdir(generatedPath);
    files = files.filter(f => f.endsWith(".mjs")).map(f => path.join(generatedPath, f));

    await PromiseAllParallel(files, async pathToFile => {
      const contents = await fs.readFile(pathToFile, { encoding: "utf-8" });
      const foundTemplate = /Template: ([^\n]+)\n/.exec(contents)[1];
      templates.delete(foundTemplate);

      tMap.add(foundTemplate, pathToFile.replace(generatedPath + "/", ""));
    });
  }

  if (templates.size)
    fail(Array.from(templates));

  await fs.writeFile(
    path.join(specDir, "template-collections.md"),
    `# Templates\n\n` + tMap.markDown() + "\n",
    { encoding: "utf-8" }
  );
});
