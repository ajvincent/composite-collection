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

function prefixFileList(prefix, items) {
  return items.map(item => prefix + item);
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
    prefixFileList("spec/_01_collection-generator/generated/", [
      "keys/Hasher.mjs",
      "keys/Composite.mjs",

      "SoloStrongMap.mjs",
      "SoloStrongSet.mjs",
      "SoloWeakMap.mjs",
      "SoloWeakSet.mjs",

      "StrongStrongMap.mjs",
      "StrongStrongSet.mjs",

      "WeakWeakMap.mjs",
      "WeakStrongMap.mjs",
      "StrongWeakMap.mjs",

      "WeakWeakSet.mjs",
      "WeakStrongSet.mjs",
      "StrongWeakSet.mjs",

      "StrongMapOfStrongSets.mjs",

      "WeakMapOfStrongSets.mjs",
      "WeakMapOfWeakSets.mjs",
      "WeakMapWeakStrongSet.mjs",

      "StrongStrongMapImportable.mjs",
      "WeakStrongMapImportable.mjs",
      "WeakWeakMapImportable.mjs",

      "StrongStrongSetImportable.mjs",
      "WeakStrongSetImportable.mjs",
      "WeakWeakSetImportable.mjs",

      "StrongMapSetImportable.mjs",
      "WeakMapStrongSetImportable.mjs",
      "WeakMapWeakSetImportable.mjs",

      "WeakFunctionMultiMap.mjs",
    ])
  );

  task(
    "generated",
    prefixFileList("spec/_02_one-to-one-maps/generated/", [
      "BasicInline.mjs",
      "BasicStrongInline.mjs",
      "BasicWeakInline.mjs",

      "WeakStrongMap.mjs",
      "WeakWeakMap.mjs",

      "BasicStrongImported.mjs",
      "BasicWeakImported.mjs",

      "SoloMockImportable.mjs",
      "StrongInlineMockImportable.mjs",
      "WeakInlineMockImportable.mjs",
    ])
  );

  task(
    "generated",
    prefixFileList("spec/_04_exports/generated/", [
      "keys/Hasher.mjs",
      "keys/Composite.mjs",

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

      "OneToOneSimpleMap.mjs",
      "OneToOneStrongMap.mjs",
      "OneToOneWeakMap.mjs",
    ])
  );

  task(
    "all",
    () => runModule("./node_modules/jasmine/bin/jasmine.js")
  );
});

copyFileTasks("source/exports", "spec/_01_collection-generator/generated", [
  "keys/Hasher.mjs",
  "keys/Composite.mjs",
]);

generateCollectionTasks(
  "spec/_01_collection-generator/fixtures",
  "spec/_01_collection-generator/generated",
  [
    "SoloStrongMap.mjs",
    "SoloStrongSet.mjs",
    "SoloWeakMap.mjs",
    "SoloWeakSet.mjs",
    "StrongWeakMap.mjs",
    "StrongWeakSet.mjs",
    "WeakMapWeakStrongSet.mjs",
    "StrongMapSetImportable.mjs",
    "WeakMapStrongSetImportable.mjs",
    "WeakMapWeakSetImportable.mjs",
    "StrongStrongMapImportable.mjs",
    "WeakStrongMapImportable.mjs",
    "WeakWeakMapImportable.mjs",
    "StrongStrongSetImportable.mjs",
    "WeakStrongSetImportable.mjs",
    "WeakWeakSetImportable.mjs",
  ]
);

generateCollectionTasks(
  "source/exports",
  "spec/_01_collection-generator/generated",
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

copyFileTasks("source/exports", "spec/_02_one-to-one-maps/generated", [
  "keys/Hasher.mjs",
  "keys/Composite.mjs",
]);

generateCollectionTasks(
  "spec/_02_one-to-one-maps/fixtures",
  "spec/_02_one-to-one-maps/generated",
  [
    "BasicInline.mjs",
    "BasicStrongInline.mjs",
    "BasicWeakInline.mjs",

    "BasicStrongImported.mjs",
    "BasicWeakImported.mjs",

    "SoloMockImportable.mjs",
    "StrongInlineMockImportable.mjs",
    "WeakInlineMockImportable.mjs",
  ]
);

generateCollectionTasks(
  "source/exports",
  "spec/_02_one-to-one-maps/generated",
  [
    "WeakWeakMap.mjs",
    "WeakStrongMap.mjs",
  ]
);

copyFileTasks("source/exports", "spec/_04_exports/generated", [
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

    "OneToOneSimpleMap.mjs",
    "OneToOneStrongMap.mjs",
    "OneToOneWeakMap.mjs",
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

    "exports/OneToOneSimpleMap.mjs",
    "exports/OneToOneStrongMap.mjs",
    "exports/OneToOneWeakMap.mjs",
  ]
);

copyFileTasks("source/exports", "exports", [
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

  "OneToOneSimpleMap.mjs",
  "OneToOneStrongMap.mjs",
  "OneToOneWeakMap.mjs",
]);

desc("Bootstrap")
task("bootstrap", async () => {
  return runModule("./jake-targets/bootstrap.mjs", [], [/*"--inspect-brk"*/]);
});
