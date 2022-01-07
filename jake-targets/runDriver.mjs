#!/usr/bin/env node

// Required modules.
import CompositeDriver from "composite-collection/Driver";
import url from "url";
import path from "path";
import readDirsDeep from "#source/utilities/readDirsDeep.mjs";

export default async function runDriver(sourceDir, targetDir) {
  const driver = new CompositeDriver(sourceDir, targetDir);

  driver.start();
  await driver.completionPromise;

  // Verify the Driver provided a valid module in each file exporting a function.
  // This is a preamble to testing the module.

  let allFiles = (await readDirsDeep(targetDir)).files;
  allFiles = allFiles.filter(Boolean).filter(filePath => path.extname(filePath) === ".mjs");
  allFiles.sort();

  const allFilesPromise = await Promise.allSettled(allFiles.map(async targetFile => {
    const targetFileURL = url.pathToFileURL(targetFile);
    const targetModule = (await import(targetFileURL)).default;
    if (typeof targetModule !== "function")
      throw targetFile;
  }));
  
  const failedModules = allFilesPromise.filter(p => p.status === "rejected");
  if (failedModules.length) {
    throw new Error("Compilation failed for these modules:\n  " + failedModules.map(p => p.reason).join("\n  "));
  }
}
