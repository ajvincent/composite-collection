#!/usr/bin/env node

// Required modules.
import CodeGenerator from "composite-collection/CodeGenerator";
import url from "url";
import path from "path";

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
parser.add_argument("--author", {
  help: "Insert an @author tag into the prologue JSDoc."
});
parser.add_argument("--copyright", {
  help: "Insert an @copyright tag into the prologue JSDoc."
});
parser.add_argument("--mpl-license", {
  help: "Prepend the MPL license boilerplate to the file.",
  action: "store_true",
});

const Arguments = parser.parse_args();

// eslint-disable-next-line no-unused-vars
const MPL_BOILERPLATE = `
/**
 * @license
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
`.trim();

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
