#!/usr/bin/env node

// Required modules.
import CodeGenerator from "../source/CodeGenerator.mjs";
import url from "url";
import path from "path";

import { ArgumentParser } from "argparse";

// Argument parsing
const parser = new ArgumentParser({
  description: 'Compile a composite collection'
});
parser.add_argument("config", {
  help: "The source configuration.",
});
parser.add_argument("target", {
  help: "The target directory."
});

const Arguments = parser.parse_args();

// Import the configuration module.
const sourceFileURL = url.pathToFileURL(path.join(process.cwd(), Arguments.config));
const configModule = (await import(sourceFileURL)).default;

// Generate the module.
let resolve;
let p = new Promise(res => resolve = res);

const targetFile = path.join(process.cwd(), Arguments.target);

const generator = new CodeGenerator(configModule, targetFile, p);
resolve();
await generator.completionPromise;

// Verify the module exports a function.  (This is a preamble to testing the module.)
const targetFileURL = url.pathToFileURL(targetFile);
const targetModule = (await import(targetFileURL)).default;
if (typeof targetModule !== "function")
  throw new Error("Compilation failed for " + Arguments.target);
