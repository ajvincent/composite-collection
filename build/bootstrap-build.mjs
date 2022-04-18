#!/usr/bin/env node
// Required modules.
import CompositeDriver from "composite-collection/Driver";
import CompileTimeOptions from "composite-collection/CompileTimeOptions";

import path from "path";
import fs from "fs/promises";
import { ArgumentParser } from "argparse";

// Argument parsing
const parser = new ArgumentParser({
  description: 'Generate bootstrap build files.'
});
parser.add_argument("stageDir", {
  help: "The staging directory."
});

const Arguments = parser.parse_args();

const collectionsDir = path.join(Arguments.stageDir, "source/collections");
const configDir = path.join(Arguments.stageDir, "source/configurations");

// Look for compile-time options in an adjacent publishing.json file.
const publishingFile = path.join(path.join(configDir, "publishing.json"));
const rawContents = await fs.readFile(publishingFile, { encoding: "utf-8" });
const compileOptions = new CompileTimeOptions(JSON.parse(rawContents));

const driver = new CompositeDriver(configDir, collectionsDir, compileOptions);
await driver.run();
