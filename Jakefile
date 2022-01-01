const { fork } = require('child_process');
const fs  = require('fs/promises');
const path = require("path");
const { task, desc } = require('jake');

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
    execArgv: process.execArgv.concat("--expose-gc", ...extraNodeArgs),
    silent: false
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
        await fs.mkdir(path.dirname(targetFile), { recursive: true });
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
    "keys/Hasher.mjs",
    "keys/Composite.mjs",
  ].map(required => targetDir + "/" + required);

  leafNames.forEach(leafName => {
    const configFile = configDir + "/" + leafName,
          targetFile = targetDir + "/" + leafName;

    // Yes, we could use file() here, but this project is still pretty small.
    task(
      targetFile,
      submodules.concat(configFile),
      async () => {
        await runModule(
          "./jake-targets/generateCollection.mjs",
          [configFile, targetFile],
          /* leafName === "SoloStrongMap.mjs" ? ["--inspect-brk"] : */ []
        );
      }
    );
  });
}

desc("Testing");
task(
  "test",
  [
    "test:generated",
    "test:all",
  ]
);

task("clean", async () => {
  return runModule("./jake-targets/clean.mjs");
});

// eslint-disable-next-line no-undef
namespace("test", () => {
  task(
    "generated",
    [
      "spec/_02_collection-generator/generated/KeyHasher.mjs",
      "spec/_02_collection-generator/generated/keys/Hasher.mjs",
      "spec/_02_collection-generator/generated/keys/Composite.mjs",

      "spec/_02_collection-generator/generated/SoloStrongMap.mjs",
      "spec/_02_collection-generator/generated/SoloStrongSet.mjs",
      "spec/_02_collection-generator/generated/SoloWeakMap.mjs",
      "spec/_02_collection-generator/generated/SoloWeakSet.mjs",

      "spec/_02_collection-generator/generated/StrongStrongMap.mjs",
      "spec/_02_collection-generator/generated/StrongStrongSet.mjs",

      "spec/_02_collection-generator/generated/WeakWeakMap.mjs",
      "spec/_02_collection-generator/generated/WeakStrongMap.mjs",
      "spec/_02_collection-generator/generated/StrongWeakMap.mjs",

      "spec/_02_collection-generator/generated/WeakWeakSet.mjs",
      "spec/_02_collection-generator/generated/WeakStrongSet.mjs",
      "spec/_02_collection-generator/generated/StrongWeakSet.mjs",

      "spec/_02_collection-generator/generated/StrongMapOfStrongSets.mjs",

      "spec/_02_collection-generator/generated/WeakMapOfStrongSets.mjs",
      "spec/_02_collection-generator/generated/WeakMapOfWeakSets.mjs",
      "spec/_02_collection-generator/generated/WeakMapWeakStrongSet.mjs",

      "spec/_02_collection-generator/generated/StrongMapSetImportable.mjs",
      "spec/_02_collection-generator/generated/WeakFunctionMultiMap.mjs",
      "spec/_02_collection-generator/generated/WeakMapWeakSetImportable.mjs",


      "spec/_04_exports/generated/KeyHasher.mjs",
      "spec/_04_exports/generated/keys/Hasher.mjs",
      "spec/_04_exports/generated/keys/Composite.mjs",

      "spec/_04_exports/generated/StrongStrongMap.mjs",
      "spec/_04_exports/generated/StrongStrongSet.mjs",

      "spec/_04_exports/generated/WeakWeakMap.mjs",
      "spec/_04_exports/generated/WeakStrongMap.mjs",

      "spec/_04_exports/generated/WeakWeakSet.mjs",
      "spec/_04_exports/generated/WeakStrongSet.mjs",

      "spec/_04_exports/generated/StrongMapOfStrongSets.mjs",

      "spec/_04_exports/generated/WeakMapOfStrongSets.mjs",
      "spec/_04_exports/generated/WeakMapOfWeakSets.mjs",

      "spec/_04_exports/generated/WeakFunctionMultiMap.mjs",
    ]
  );

  task(
    "all",
    () => runModule("./node_modules/jasmine/bin/jasmine.js")
  );
});

copyFileTasks("source/exports", "spec/_02_collection-generator/generated", [
  "KeyHasher.mjs",
  "WeakKey-WeakMap.mjs",
  "WeakKey-WeakRef.mjs",
  "keys/Hasher.mjs",
  "keys/Composite.mjs",
]);

generateCollectionTasks(
  "spec/_02_collection-generator/fixtures",
  "spec/_02_collection-generator/generated",
  [
    "SoloStrongMap.mjs",
    "SoloStrongSet.mjs",
    "SoloWeakMap.mjs",
    "SoloWeakSet.mjs",
    "StrongWeakMap.mjs",
    "StrongWeakSet.mjs",
    "WeakMapWeakStrongSet.mjs",
    "StrongMapSetImportable.mjs",
    "WeakMapWeakSetImportable.mjs",
  ]
);

generateCollectionTasks(
  "source/exports",
  "spec/_02_collection-generator/generated",
  [
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

    "WeakFunctionMultiMap.mjs",
  ]
);

copyFileTasks("source/exports", "spec/_04_exports/generated", [
  "KeyHasher.mjs",
  "WeakKey-WeakMap.mjs",
  "WeakKey-WeakRef.mjs",
  "keys/Hasher.mjs",
  "keys/Composite.mjs",
]);

generateCollectionTasks(
  "source/exports",
  "spec/_04_exports/generated",
  [
    "StrongStrongMap.mjs",
    "StrongStrongSet.mjs",

    "WeakWeakMap.mjs",
    "WeakStrongMap.mjs",

    "WeakWeakSet.mjs",
    "WeakStrongSet.mjs",

    "StrongMapOfStrongSets.mjs",

    "WeakMapOfStrongSets.mjs",
    "WeakMapOfWeakSets.mjs",

    "WeakFunctionMultiMap.mjs",
  ]
);

desc("Debugging tests");
task("debug", ["test:generated"], async () => {
  return runModule("./node_modules/jasmine/bin/jasmine.js", [], ["--inspect-brk"]);
});

desc("eslint support");
task("eslint", async () => {
  return runModule("./node_modules/eslint/bin/eslint.js", [
    "exports",
    "jake-targets",
    "Jakefile",
    "source",
    "spec",
    "templates",
  ]);
});

desc("Exporting files for final distribution");
task(
  "export",
  [
    "test",
    "exports/KeyHasher.mjs",
    "exports/WeakKey-WeakMap.mjs",
    "exports/WeakKey-WeakRef.mjs",
    "exports/keys/Hasher.mjs",
    "exports/keys/Composite.mjs",

    "exports/StrongStrongMap.mjs",
    "exports/StrongStrongSet.mjs",

    "exports/WeakWeakMap.mjs",
    "exports/WeakStrongMap.mjs",

    "exports/WeakWeakSet.mjs",
    "exports/WeakStrongSet.mjs",

    "exports/StrongMapOfStrongSets.mjs",
    "exports/WeakMapOfStrongSets.mjs",
    "exports/WeakMapOfWeakSets.mjs",

    "exports/WeakFunctionMultiMap.mjs",
  ]
);

copyFileTasks("source/exports", "exports", [
  "KeyHasher.mjs",
  "WeakKey-WeakMap.mjs",
  "WeakKey-WeakRef.mjs",
  "keys/Hasher.mjs",
  "keys/Composite.mjs",
]);

generateCollectionTasks("source/exports", "exports", [
  "StrongStrongMap.mjs",
  "StrongStrongSet.mjs",

  "WeakWeakMap.mjs",
  "WeakStrongMap.mjs",

  "WeakWeakSet.mjs",
  "WeakStrongSet.mjs",

  "StrongMapOfStrongSets.mjs",
  "WeakMapOfStrongSets.mjs",
  "WeakMapOfWeakSets.mjs",

  "WeakFunctionMultiMap.mjs",
]);

desc("Bootstrap")
task("bootstrap", async () => {
  return runModule("./jake-targets/bootstrap.mjs", [], [/*"--inspect-brk"*/]);
});
