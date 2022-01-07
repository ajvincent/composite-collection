import fs from 'fs/promises';
import path from "path";
import url from "url";

import runDriver from "./runDriver.mjs";
import {
  PromiseAllSequence,
} from "#support/generateCollectionTools.mjs";

import readDirsDeep from "#source/utilities/readDirsDeep.mjs";

const specRoot = path.join(process.cwd(), "spec");

async function hasConfigurationSubdirectory(dirEntry) {
  if (!dirEntry.isDirectory())
    return false;
  const fullPath = path.join(specRoot, dirEntry.name, "configurations");
  try {
    const stats = await fs.stat(fullPath);
    return stats.isDirectory() ? path.dirname(fullPath) : false;
  }
  catch (ex) {
    return false;
  }
}

async function invokeSpecBuildModule(targetFile) {
  const targetFileURL = url.pathToFileURL(targetFile);
  const targetModule = (await import(targetFileURL)).default;
  if (typeof targetModule !== "function")
    throw new Error("No exported default function for " + targetFile + "!");
  await targetModule();
}

const specDirs = [];
{
  const children = await fs.readdir(
    path.join(process.cwd(), "spec"),
    {encoding: "utf-8", "withFileTypes": true}
  );

  const matches = await Promise.all(children.map(hasConfigurationSubdirectory));
  specDirs.push(...matches.filter(Boolean));
}

await PromiseAllSequence(specDirs, async specDir => {
  const generatedDir = path.join(specDir, "generated");
  console.log("Starting " + specDir.replace(process.cwd(), ""));
  let stats;

  try {
    stats = await fs.stat(generatedDir);
  }
  catch (ex) {
    // do nothing
  }
  if (!stats?.isDirectory())
    await fs.mkdir(generatedDir);

  const buildModulePath = path.join(specDir, "support/build.mjs");
  try {
    stats = await fs.stat(buildModulePath);
  }
  catch (ex) {
    // do nothing
  }
  if (stats?.isFile()) {
    console.log("Found support/build.mjs file");
    await invokeSpecBuildModule(buildModulePath);
  }

  console.log("Starting Driver.mjs to generate collection files");
  const configurationsDir = path.join(specDir, "configurations");
  await runDriver(configurationsDir, generatedDir);

  console.log("Completed building " + specDir.replace(process.cwd(), ""));
});

// source/exports -> spec/_04_exports/generated
{
  const specDir = path.join(process.cwd(), "spec/_04_exports");
  console.log("Starting /spec/_04_exports");

  const buildModulePath = path.join(specDir, "support/build.mjs");
  let stats;
  try {
    stats = await fs.stat(buildModulePath);
  }
  catch (ex) {
    // do nothing
  }
  if (stats?.isFile()) {
    console.log("Found support/build.mjs file");
    await invokeSpecBuildModule(buildModulePath);
  }

  console.log("Completed building /spec/_04_exports");
}

console.log("Started verifying generated modules");
{
  let {files} = await readDirsDeep(specRoot);
  files = files.filter(pathToFile => {
    return /\/spec\/.*\/generated\/.*\.mjs$/.test(pathToFile);
  });

  await PromiseAllSequence(files, async targetFile => {
    const relPath = targetFile.replace(process.cwd(), "")
    console.log("Verifying: " + relPath);
    // Verify the module exports a function.  (This is a preamble to testing the module.)
    const targetFileURL = url.pathToFileURL(targetFile);
    const targetModule = (await import(targetFileURL)).default;
    if (typeof targetModule !== "function")
      throw new Error("Compilation failed for " + relPath);
  });
}
console.log("Finished verifying generated modules");
