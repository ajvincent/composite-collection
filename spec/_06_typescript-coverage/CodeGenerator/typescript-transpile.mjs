import url from "url";
import path from "path";
import fs from "fs/promises";
import { openSync } from "fs";
import { fork } from "child_process";

import readDirsDeep from "#source/utilities/readDirsDeep.mjs";
import { Deferred, PromiseAllParallel } from "#source/utilities/PromiseTypes.mjs";

const specDir = url.fileURLToPath(new URL("..", import.meta.url));
const projectRoot = url.fileURLToPath(new URL("../../..", import.meta.url));

const ENCODING = { encoding: "utf-8"};

xit("TypeScript transpiles generated modules cleanly (except for noImplicitAny)", async () => {
  const generatedPath = path.join(specDir, "generated");

  { // Copy .mjs to .mts where no such module exists
    let { files } = await readDirsDeep(generatedPath);

    const existingMTS = new Set(files.filter(f => f.endsWith(".mts")));
    const filesToRename = files.filter(f => {
      return f.endsWith(".mjs") && !existingMTS.has(f.replace(".mjs", ".mts"));
    });

    await PromiseAllParallel(filesToRename, async mjsFile => {
      const mtsFile = mjsFile.replace(".mjs", ".mts");
      await fs.copyFile(mjsFile, mtsFile);
    });
  }

  let existingMTS, tsConfigFile;
  { // Get the files we want to test.
    let files = await fs.readdir(generatedPath, ENCODING);

    existingMTS = files.filter(f => /(?<!\.d)\.mts$/.test(f));
    tsConfigFile = path.join(generatedPath, "tsconfig.json");
  }

  { // Write tsconfig.json
    const configObject = await fs.readFile(
      path.join(specDir, "support/tsconfig.json.in"),
      ENCODING
    ).then(JSON.parse);

    configObject.files = existingMTS;

    await fs.writeFile(
      tsConfigFile,
      JSON.stringify(configObject, null, 2) + "\n",
      ENCODING
    );
  }

  { // Remove .d.mts, .mjs.map files.
    let files = await fs.readdir(generatedPath, ENCODING);
    files = files.filter(
      f => f.endsWith(".d.mts") || f.endsWith(".mjs.map")
    );
    await PromiseAllParallel(files, f => fs.rm(path.join(generatedPath, f)));
  }

  { // Invoke TypeScript on the target files.
    const deferred = new Deferred;

    const outFD = openSync(path.join(generatedPath, "ts-stdout.txt"), "w");
    const errFD = openSync(path.join(generatedPath, "ts-stderr.txt"), "w");

    const child = fork(
      path.join(projectRoot, "node_modules/typescript/bin/tsc"),
      [
        "--project", tsConfigFile,
      ],
      {
        stdio: ["ignore", outFD, errFD, "ipc"]
      }
    );
    child.on("exit", code => {
      code ? deferred.reject("tsc rejected our code") : deferred.resolve()
    });
    await expectAsync(deferred.promise).toBeResolved();
  }
});
