const { task, desc } = require('jake');
const { fork } = require('child_process');
const fs = require("fs/promises");
const path = require("path");

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

desc("Export all modules.");
task(
  "export",
  [
    "test",
  ],
  () => runModule("./jake-targets/buildExportedCollections.mjs")
);

desc("Clean all build artifacts");
task(
  "clean",
  () => runModule("./jake-targets/clean.mjs")
);

desc("Run all tests.");
desc("Testing");
task(
  "test",
  [
    "test:run",
  ]
);

// eslint-disable-next-line no-undef
namespace("test", () => {
  task(
    "build",
    [
      "clean",
    ],
    () => runModule("./jake-targets/buildSpecGeneratedCode.mjs")
  );

  task(
    "run",
    [
      "test:build",
    ],
    () => runModule("./node_modules/jasmine/bin/jasmine.js", [], [])
  )
});

desc("Run all tests, ready to debug.");
task(
  "debug",
  [
    "test:build",
  ],
  () => runModule("./node_modules/jasmine/bin/jasmine.js", [], ["--inspect-brk"])
);

desc("eslint support");
task("eslint", async () => {
  const targets = [
    "jake-targets",
    "Jakefile",
    "source",
    "spec",
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

  return runModule("./node_modules/eslint/bin/eslint.js", [
    ...targets,
    "--max-warnings=0"
  ]);
});

desc("Bootstrap")
task("bootstrap", async () => {
  return runModule(
    "./jake-targets/bootstrap.mjs",
    [],
    [
      //"--inspect-brk"
    ]
  );
});
