import url from "url";
import path from "path";
import fs from "fs/promises";

import readDirsDeep from "#source/utilities/readDirsDeep.mjs";
import { PromiseAllParallel } from "#source/utilities/PromiseTypes.mjs";

const specDir = url.fileURLToPath(new URL("..", import.meta.url));
const projectRoot = url.fileURLToPath(new URL("../../..", import.meta.url));

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

  {
    const generatedPath = path.join(specDir, "generated");
    let files = await fs.readdir(generatedPath);
    files = files.filter(f => f.endsWith(".mjs")).map(f => path.join(generatedPath, f));

    await PromiseAllParallel(files, async pathToFile => {
      const contents = await fs.readFile(pathToFile, { encoding: "utf-8" });
      const foundTemplate = /Template: ([^\n]+)\n/.exec(contents)[1];
      templates.delete(foundTemplate);
    });
  }

  if (templates.size)
    fail(Array.from(templates));
});
