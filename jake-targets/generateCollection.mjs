#!/usr/bin/env node

// Required modules.
import CodeGenerator from "composite-collection/CodeGenerator";
import CompileTimeOptions from "composite-collection/CompileTimeOptions";
import url from "url";
import path from "path";
import fs from "fs/promises";

import { ArgumentParser } from "argparse";

// Argument parsing
const parser = new ArgumentParser({
  description: 'Generate a composite collection.'
});
parser.add_argument("config", {
  help: "The source configuration.",
});
parser.add_argument("target", {
  help: "The target directory."
});
parser.add_argument("--publishing", {
  help: "Prepend the MPL license boilerplate to the file.",
  action: "store_true",
  default: "publishing.json",
});

const Arguments = parser.parse_args();

// Import the configuration module.
const sourceFileURL = url.pathToFileURL(path.join(process.cwd(), Arguments.config));
const configModule = (await import(sourceFileURL)).default;

// Look for compile-time options in an adjacent publishing.json file.
let compileOptions = {};
let publishingFile;
if (path.isAbsolute(Arguments.publishing))
  publishingFile = Arguments.publishing;
else
  publishingFile = path.normalize(path.join(process.cwd(), Arguments.config, "..", Arguments.publishing));
try {
  const rawContents = await fs.readFile(publishingFile, { encoding: "utf-8" });
  compileOptions = new CompileTimeOptions(JSON.parse(rawContents));
}
catch (ex) {
  // do nothing
}

// Generate the module.
let resolve;
let p = new Promise(res => resolve = res);

const targetFile = path.join(process.cwd(), Arguments.target);

const generator = new CodeGenerator(configModule, targetFile, p, compileOptions);
resolve();
await generator.completionPromise;
