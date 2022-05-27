import { BuildPromiseSet } from '#source/utilities/BuildPromise.mjs';

import { fork } from 'child_process';
import fs from "fs/promises";
import path from "path";

import runSpecsParallel from "./jasmine-parallel/parent.mjs";

import cleanTree from "./tools/clean.mjs";
import bootstrapRun from "./tools/bootstrap.mjs";
import buildExportedCollections from "./tools/buildExportedCollections.mjs";
import buildSpecGeneratedCode from './tools/buildSpecGeneratedCode.mjs';

import { build_TSCoverage } from "#spec/_06_typescript-coverage/support/build-coverage.mjs";

/**
 * Run a specific submodule.
 *
 * @param {string}   pathToModule  The module to run.
 * @param {string[]} moduleArgs    Arguments we pass into the module.
 * @param {string[]} extraNodeArgs Arguments we pass to node.
 * @returns {Promise<void>}
 * @see /build/tools/generateCollectionTools.mjs
 */
function runModule(pathToModule, moduleArgs = [], extraNodeArgs = []) {
  let resolve, reject;
  let p = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const child = fork(pathToModule, moduleArgs, {
    execArgv: process.execArgv.concat("--expose-gc", ...extraNodeArgs),
    silent: false
  });
  child.on('exit', code => code ? reject(code) : resolve());

  return p;
}

const BPSet = new BuildPromiseSet(true);

// #region javascript targets

{ // export
  const target = BPSet.get("export");
  target.description = "Export all modules.";
  target.addSubtarget("test");
  target.addTask(() => buildExportedCollections());
}

{ // clean
  const target = BPSet.get("clean");
  target.description = "Clean all build artifacts";
  target.addTask(() => cleanTree());
}

{ // test
  const target = BPSet.get("test");
  target.description = "Run all tests.";
  target.addSubtarget("test:run");
}

{ // test:build
  const target = BPSet.get("test:build");
  target.description = "Build spec-generated code";
  target.addSubtarget("clean");
  target.addTask(() => buildSpecGeneratedCode());
}

{ // test:run
  const target = BPSet.get("test:run");
  target.description = "Execute Jasmine tests";
  target.addSubtarget("test:build");
  target.addSubtarget("test:build:spec_06_typescript-coverage")
  target.addTask(() => runSpecsParallel());
}

{ // test:build:spec_06_typescript-coverage
  const target = BPSet.get("test:build:spec_06_typescript-coverage");
  target.description = "TypeScript coverage build tests";
  target.addSubtarget("test:build");
  target.addTask(() => build_TSCoverage());
}

{ // debug
  const target = BPSet.get("debug");
  target.description = "Run all tests, ready to debug.";
  target.addSubtarget("test:build");
  target.addTask(() => runModule("./node_modules/jasmine/bin/jasmine.js", [], ["--inspect-brk"]));
}

{ // eslint
  const target = BPSet.get("eslint");
  target.description = "eslint support";
  target.addTask(
    async () => {
      const targets = [
        "build",
        "exports",
        "source",
        "spec",
        "templates"
      ];

      return runModule("./node_modules/eslint/bin/eslint.js", [
        ...targets,
        "--max-warnings=0"
      ]);
    }
  );
}

{ // bootstrap
  const target = BPSet.get("bootstrap");
  target.description = "Run bootstrap build to regenerate collection modules"
  target.addTask(() => bootstrapRun());
}

// #endregion javascript targets

// #region typescript targets
{ // typescript:eslint-prebuild
  const jsTarget = BPSet.get("test:build");
  jsTarget.addSubtarget("typescript:eslint-prebuild");

  BPSet.get("eslint").addSubtarget("typescript:eslint-prebuild");

  const target = BPSet.get("typescript:eslint-prebuild");
  // general linting
  target.addTask(
    async () => {
      console.log("typescript linting pre-build");
      const targets = [
        "source",
        "templates",
      ];

      const buildModulePath = path.join(process.cwd(), "exports/keys/Hasher.mjs");
      let stats;
      try {
        stats = await fs.stat(buildModulePath);
      }
      catch (ex) {
        // do nothing
      }
      if (stats?.isFile()) {
        targets.push("exports");
      }

      await runModule("./node_modules/eslint/bin/eslint.js", [
        "-c", "./.eslintrc-typescript.json",
        "--max-warnings=0",
        ...targets,
      ]);
    }
  );
}

{ // typescript:eslint
  const jsTarget = BPSet.get("eslint");
  jsTarget.addSubtarget("typescript:eslint-postbuild");

  const target = BPSet.get("typescript:eslint-postbuild");
  // general linting
  target.addTask(
    async () => {
      const targets = [
        "exports",
        "source",
        "spec",
        "templates",
      ];

      await runModule("./node_modules/eslint/bin/eslint.js", [
        "-c", "./.eslintrc-typescript.json",
        "--max-warnings=0",
        ...targets,
      ]);
    }
  );
}
// #endregion typescript targets

BPSet.markReady();

export default BPSet;
