import readDirsDeep from "#source/utilities/readDirsDeep.mjs";
import tempDirWithCleanup from "#source/utilities/tempDirWithCleanup.mjs";

import url from "url";
import fs from "fs/promises";
import path from "path";
import which from "which";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

it("Driver generates a valid set of classes", async () => {
  const projectRoot = url.fileURLToPath(new URL("../..", import.meta.url));

  const sourceDir = path.join(projectRoot, "spec/_04_integration/fixtures/Driver");
  const cleanup = await tempDirWithCleanup();
  const targetDir = cleanup.tempDir;

  try {
    // copy package files
    {
      const fileList = (await readDirsDeep(sourceDir)).files;

      await Promise.all(fileList.map(async sourceFile => {
        const targetFile = sourceFile.replace(sourceDir, targetDir);
        await fs.mkdir(path.dirname(targetFile), { recursive: true });
        await fs.copyFile(
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

      await fs.mkdir(configTargetDir, { recursive: true });
      await fs.copyFile(
        path.join(configSourceDir, "WeakMapOfStrongSets.mjs"),
        path.join(configTargetDir, "WeakMapOfStrongSets.mjs")
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
}, 1000 * 30);
