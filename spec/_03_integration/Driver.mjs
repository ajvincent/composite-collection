import tempDirWithCleanup from "../support/tempDirWithCleanup.mjs";

import url from "url";
import fs from "fs/promises";
import path from "path";
import { getAllFiles } from "get-all-files";
import which from "which";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

it("Driver generates a valid set of classes", async () => {
  const projectRoot = url.fileURLToPath(new URL("../..", import.meta.url));

  const sourceDir = path.join(projectRoot, "spec/_03_integration/fixtures/Driver");
  const cleanup = await tempDirWithCleanup();
  const targetDir = cleanup.tempDir;
  try {
    // copy package files
    {
      const fileList = await getAllFiles(sourceDir).toArray();
      await Promise.all(fileList.map(sourceFile => {
        const targetFile = sourceFile.replace(sourceDir, targetDir);
        return fs.copyFile(
          sourceFile, targetFile
        )
      }));

      // fix package.json
      {
        const packagePath = path.join(targetDir, "package.json");
        let packageJSON = await fs.readFile(packagePath, "utf-8");
        let pathToComposites = "file:" + projectRoot
        pathToComposites = pathToComposites.replace(/\/$/, "");
        packageJSON = packageJSON.replace("__pathToComposites__", pathToComposites);
        await fs.writeFile(packagePath, packageJSON, "utf-8");
      }
    }

    // copy configuration files
    {
      const configSourceDir = path.join(projectRoot, "source/exports");
      const configTargetDir = path.join(targetDir, "configurations");

      await fs.mkdir(configTargetDir);
      await fs.copyFile(
        path.join(configSourceDir, "WeakFunctionMultiMap.mjs"),
        path.join(configTargetDir, "WeakFunctionMultiMap.mjs")
      );
    }

    const npm = await which("npm");
    // npm install composite-collection
    await execPromise(npm + " install " + projectRoot, {
      cwd: targetDir
    });

    // npm run test
    await execPromise(npm + " run test", {
      cwd: targetDir
    });
  }
  finally {
    cleanup.resolve();
    await cleanup.promise;
  }
});
