const { fork } = require('child_process');
const fs  = require('fs/promises');
const path = require("path");
const { task, desc, file } = require('jake');

/**
 * Run a specific submodule.
 *
 * @param {string}   pathToModule  The module to run.
 * @param {string[]} moduleArgs    Arguments we pass into the module.
 * @param {string[]} extraNodeArgs Arguments we pass to node.
 *
 * @returns {Promise<void>}
 */
function runModule(pathToModule, moduleArgs = [], extraNodeArgs = []) {
  let resolve, reject;
  let p = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const child = fork(pathToModule, moduleArgs, {
    execArgv: process.execArgv.concat("--expose-gc", ...extraNodeArgs)
  });
  child.on('exit', code => code ? reject(code) : resolve());

  return p;
}

/**
 * Define simple file-copying tasks.
 *
 * @param {string}   sourceDir
 * @param {string}   targetDir
 * @param {string[]} leafNames
 */
function copyFileTasks(sourceDir, targetDir, leafNames) {
  leafNames.forEach(leafName => {
    const sourceFile = path.join(process.cwd(), sourceDir, leafName),
          targetFile = path.join(process.cwd(), targetDir, leafName);

    // Yes, we could use file() here, but this project is still pretty small.
    task(
      targetDir + "/" + leafName,
      [ sourceDir + "/" + leafName ],
      async () => {
        console.log(targetDir + "/" + leafName);
        await fs.copyFile(sourceFile, targetFile);
      }
    );
  });
}

/**
 * Define tasks which generate composite collection modules.
 *
 * @param {string}   configDir The directory containing configuration modules.
 * @param {string}   targetDir The directory to write collection modules into.
 * @param {string[]} leafNames The leaf name of each module.
 */
function generateCollectionTasks(configDir, targetDir, leafNames) {
  const submodules = [
    "KeyHasher.mjs",
    "WeakKey-WeakMap.mjs",
    "WeakKey-WeakRef.mjs",
  ].map(required => targetDir + "/" + required);

  leafNames.forEach(leafName => {
    const configFile = configDir + "/" + leafName,
          targetFile = targetDir + "/" + leafName;

    // Yes, we could use file() here, but this project is still pretty small.
    task(
      targetFile,
      submodules.concat(configFile),
      async () => {
        console.log(targetFile);
        await runModule("./jake-targets/compile-collection.mjs", [configFile, targetFile]);
      }
    );
  });
}

desc("Testing");
task(
  "test",
  [
    "test:fixtures",
    "test:all",
  ]
);

task("clean", async () => {
  return runModule("./jake-targets/clean.mjs");
});

namespace("test", () => {
  task(
    "fixtures",
    [
      "spec/generated/KeyHasher.mjs",
      "spec/generated/SoloStrongMap.mjs",
      "spec/generated/SoloStrongSet.mjs",
      "spec/generated/SoloWeakMap.mjs",
      "spec/generated/SoloWeakSet.mjs",

      "spec/generated/StrongStrongMap.mjs",
      "spec/generated/StrongStrongSet.mjs",

      "spec/generated/WeakWeakMap.mjs",
      "spec/generated/WeakStrongMap.mjs",
      "spec/generated/StrongWeakMap.mjs",

      "spec/generated/WeakWeakSet.mjs",
      "spec/generated/WeakStrongSet.mjs",
      "spec/generated/StrongWeakSet.mjs",

      "spec/generated/StrongMapOfStrongSets.mjs",
      "spec/generated/StrongMapOfWeakSets.mjs",
      "spec/generated/StrongMapWeakStrongSet.mjs",

      "spec/generated/WeakMapOfStrongSets.mjs",
      "spec/generated/WeakMapOfWeakSets.mjs",
      "spec/generated/WeakMapWeakStrongSet.mjs",
    ]
  );

  task(
    "all",
    () => runModule("./node_modules/jasmine/bin/jasmine.js")
  );
});

copyFileTasks("source/exports", "spec/generated", [
  "KeyHasher.mjs",
  "WeakKey-WeakMap.mjs",
  "WeakKey-WeakRef.mjs",
]);

generateCollectionTasks("spec/fixtures", "spec/generated", [
  "SoloStrongMap.mjs",
  "SoloStrongSet.mjs",
  "SoloWeakMap.mjs",
  "SoloWeakSet.mjs",
  "StrongWeakMap.mjs",
  "StrongWeakSet.mjs",
  "StrongMapWeakStrongSet.mjs",
  "WeakMapWeakStrongSet.mjs",
]);

generateCollectionTasks("source/exports", "spec/generated", [
  "StrongStrongMap.mjs",
  "StrongStrongSet.mjs",

  "WeakWeakMap.mjs",
  "WeakStrongMap.mjs",

  "WeakWeakSet.mjs",
  "WeakStrongSet.mjs",

  "StrongMapOfStrongSets.mjs",
  "StrongMapOfWeakSets.mjs",

  "WeakMapOfStrongSets.mjs",
  "WeakMapOfWeakSets.mjs",
]);

desc("Debugging tests");
task("debug", ["test:fixtures"], async () => {
  return runModule("./node_modules/jasmine/bin/jasmine.js", [], ["--inspect-brk"]);
});

desc("Exporting files for final distribution");
task(
  "export",
  [
    "test",
    "exports/KeyHasher.mjs",
    "exports/WeakKey-WeakMap.mjs",
    "exports/WeakKey-WeakRef.mjs",

    "exports/StrongStrongMap.mjs",
    "exports/StrongStrongSet.mjs",

    "exports/WeakWeakMap.mjs",
    "exports/WeakStrongMap.mjs",

    "exports/WeakWeakSet.mjs",
    "exports/WeakStrongSet.mjs",

    "exports/StrongMapOfStrongSets.mjs",
    /* see https://github.com/ajvincent/composite-collection/issues/41 - this can't ship yet
    "exports/StrongMapOfWeakSets.mjs",
    */
    "exports/WeakMapOfStrongSets.mjs",
    "exports/WeakMapOfWeakSets.mjs",
  ]
);

copyFileTasks("source/exports", "exports", [
  "KeyHasher.mjs",
  "WeakKey-WeakMap.mjs",
  "WeakKey-WeakRef.mjs",
]);

generateCollectionTasks("source/exports", "exports", [
  "StrongStrongMap.mjs",
  "StrongStrongSet.mjs",

  "WeakWeakMap.mjs",
  "WeakStrongMap.mjs",

  "WeakWeakSet.mjs",
  "WeakStrongSet.mjs",

  "StrongMapOfStrongSets.mjs",
  /* see https://github.com/ajvincent/composite-collection/issues/41 - this can't ship yet
  "StrongMapOfWeakSets.mjs",
  */
  "WeakMapOfStrongSets.mjs",
  "WeakMapOfWeakSets.mjs",
]);
