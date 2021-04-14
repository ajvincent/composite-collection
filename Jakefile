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
    "test:unit",
    "test:fixtures",
    "test:all",
  ]
);

namespace("test", () => {
  desc("Unit testing");
  task(
    "unit",
    () => runModule("./node_modules/jasmine/bin/jasmine.js", ["spec/_unit/*"])
  );

  task(
    "fixtures",
    [
      "test:unit",
      "spec/generated/KeyHasher.mjs",
      "spec/generated/SoloStrongMap.mjs",
      "spec/generated/SoloStrongSet.mjs",
      "spec/generated/StrongStrongMap.mjs",
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
]);

generateCollectionTasks("source/exports", "spec/generated", [
  "StrongStrongMap.mjs",
]);

desc("Debugging tests");
task("debug", async () => {
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
  ]
);

copyFileTasks("source/exports", "exports", [
  "KeyHasher.mjs",
  "WeakKey-WeakMap.mjs",
  "WeakKey-WeakRef.mjs",
]);

generateCollectionTasks("source/exports", "exports", [
  "StrongStrongMap.mjs",
]);
