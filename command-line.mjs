#!/usr/bin/env node

import fs from'fs/promises';
const version = JSON.parse(await fs.readFile("./package.json")).version;

import {
  ArgumentParser
} from "argparse";
const parser = new ArgumentParser({
  description: 'Argparse example'
});

parser.add_argument('-v', '--version', { action: 'version', version });

console.dir(parser.parse_args());
