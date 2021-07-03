#!/usr/bin/env node
// Required modules.
import CompositeDriver from "composite-collection/Driver";
import path from "path";

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
const driver = new CompositeDriver(configDir, collectionsDir);
driver.start();
await driver.completionPromise;
