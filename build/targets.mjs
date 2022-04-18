import BuildPromise from '#source/utilities/BuildPromise.mjs';

import { fork } from 'child_process';
import fs from "fs/promises";
import path from "path";

import cleanTree from "./tools/clean.mjs";
import bootstrapRun from "./tools/bootstrap.mjs";
import buildExportedCollections from "./tools/buildExportedCollections.mjs";
import buildSpecGeneratedCode from './tools/buildSpecGeneratedCode.mjs';

/**
 * Run a specific submodule.
 *
 * @param {string}   pathToModule  The module to run.
 * @param {string[]} moduleArgs    Arguments we pass into the module.
 * @param {string[]} extraNodeArgs Arguments we pass to node.
 * @returns {Promise<void>}
 * @see spec/support/generateCollectionTools.mjs
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

// #region javascript targets

{ // export
  const target = BuildPromise.get("export");
  target.description = "Export all modules.";
  target.addSubtarget("test");
  target.addTask(() => buildExportedCollections());
}

{ // clean
  const target = BuildPromise.get("clean");
  target.description = "Clean all build artifacts";
  target.addTask(() => cleanTree());
}

{ // test
  const target = BuildPromise.get("test");
  target.description = "Run all tests.";
  target.addSubtarget("test:run");
}

{ // test:build
  const target = BuildPromise.get("test:build");
  target.description = "Build spec-generated code";
  target.addSubtarget("clean");
  target.addTask(() => buildSpecGeneratedCode());
}

{ // test:run
  const target = BuildPromise.get("test:run");
  target.description = "Execute Jasmine tests";
  target.addSubtarget("test:build");
  target.addTask(() => runModule("./node_modules/jasmine/bin/jasmine.js", [], []));
}

{ // debug
  const target = BuildPromise.get("debug");
  target.description = "Run all tests, ready to debug.";
  target.addSubtarget("test:build");
  target.addTask(() => runModule("./node_modules/jasmine/bin/jasmine.js", [], ["--inspect-brk"]));
}

{ // eslint
  const target = BuildPromise.get("eslint");
  target.description = "eslint support";
  target.addTask(
    async () => {
      const targets = [
        "build",
        "jake-targets",
        "source",
        "spec",
        "templates"
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

      return runModule("./node_modules/eslint/bin/eslint.js", [
        ...targets,
        "--max-warnings=0"
      ]);
    }
  );
}

{ // bootstrap
  const target = BuildPromise.get("bootstrap");
  target.description = "Run bootstrap build to regenerate collection modules"
  target.addTask(() => bootstrapRun());
}

// #endregion javascript targets

// #region typescript targets

// #endregion typescript targets

BuildPromise.markReady();

export default BuildPromise.main;
