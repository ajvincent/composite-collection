import fs from 'fs/promises';
import path from "path";
import url from "url";

import runDriver from "./runDriver.mjs";
import {
  PromiseAllSequence,
  PromiseAllParallel,
  TimeoutPromise
} from "#source/utilities/PromiseTypes.mjs";

import readDirsDeep from "#source/utilities/readDirsDeep.mjs";
import verifyGeneratedModules from "./verifyGeneratedModules.mjs";

const specRoot = path.join(process.cwd(), "spec");

/**
 * Determine if a spec directory has a configurations subdirectory.
 *
 * @param {fs.DirEnt} dirEntry The directory entry.
 * @returns {string}  The full path to the directory, or "" if there is no configurations subdirectory.
 */
async function hasSupportBuild(dirEntry) {
  if (!dirEntry.isDirectory())
    return "";
  const target = path.join(specRoot, dirEntry.name);
  const fullPath = path.join(target, "support/build.mjs");
  try {
    const stats = await fs.stat(fullPath);
    return stats.isFile() ? target : "";
  }
  catch (ex) {
    return "";
  }
}

/**
 * Determine if a spec directory has a configurations subdirectory.
 *
 * @param {fs.DirEnt} dirEntry The directory entry.
 * @returns {string}  The full path to the directory, or "" if there is no configurations subdirectory.
 */
async function hasConfigurationSubdirectory(dirEntry) {
  if (!dirEntry.isDirectory())
    return "";
  const target = path.join(specRoot, dirEntry.name);
  const fullPath = path.join(target, "configurations");
  try {
    const stats = await fs.stat(fullPath);
    return stats.isDirectory() ? target : "";
  }
  catch (ex) {
    return "";
  }
}

/**
 * Invoke the support/build.mjs module for a spec/ directory.
 *
 * @param {string} targetFile The path to the module.
 */
async function invokeSpecBuildModule(targetFile) {
  const targetFileURL = url.pathToFileURL(targetFile);
  const targetModule = (await import(targetFileURL)).default;
  if (typeof targetModule !== "function")
    throw new Error("No exported default function for " + targetFile + "!");
  await targetModule();
}

/**
 * Build spec-generated code
 */
export default async function() {

const specDirs = await fs.readdir(
  path.join(process.cwd(), "spec"),
  {encoding: "utf-8", "withFileTypes": true}
);

/**
 * @param {Function} filter The filter function.
 * @param {Function} action The action to take.
 */
async function iterateOverSpecDirs(filter, action) {
  const directories = (await PromiseAllParallel(specDirs, filter)).filter(Boolean);

  // Ensure the generated directory exists.
  await PromiseAllSequence(directories, async specDir => {
    const generatedDir = path.join(specDir, "generated");
    let stats;
    try {
      stats = await fs.stat(generatedDir);
    }
    catch (ex) {
      // do nothing
    }
    if (!stats?.isDirectory())
      await fs.mkdir(generatedDir, { recursive: true });
  });

  await PromiseAllSequence(directories, action);
}

await iterateOverSpecDirs(
  hasSupportBuild,
  async specDir => {
    const buildModulePath = path.join(specDir, "support/build.mjs");
    let stats;
    try {
      stats = await fs.stat(buildModulePath);
    }
    catch (ex) {
      // do nothing
    }
    if (stats?.isFile()) {
      console.log(`Found ${specDir}/support/build.mjs file`);
      await Promise.race([
        invokeSpecBuildModule(buildModulePath),
        (new TimeoutPromise(15000)).promise
      ]);
    }
  }
);

await iterateOverSpecDirs(
  hasConfigurationSubdirectory,
  async specDir => {
    const generatedDir = path.join(specDir, "generated");
    console.log("Invoking Driver for " + specDir.replace(process.cwd(), ""));
    const configurationsDir = path.join(specDir, "configurations");
    await fs.mkdir(configurationsDir, { recursive: true });
    await runDriver(configurationsDir, generatedDir);
  }
);

console.log("Started verifying generated modules");
{
  let {files} = await readDirsDeep(specRoot);
  files = files.filter(pathToFile => {
    return /\/spec\/.*\/generated\/.*\.mjs$/.test(pathToFile);
  });

  await verifyGeneratedModules(files);
}
console.log("Finished verifying generated modules");
}
