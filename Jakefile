const { fork } = require('child_process');

function runModule(pathToModule, extraArgs = []) {
  let resolve, reject;
  let p = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const child = fork(pathToModule, [], {
    execArgv: process.execArgv.concat("--expose-gc", ...extraArgs)
  });
  child.on('exit', code => code ? reject(code) : resolve());

  return p;
}

let { task, desc } = require('jake');

desc("Testing");
task("test", async () => {
  return runModule("./node_modules/jasmine/bin/jasmine.js");
});

desc("Debugging tests");
task("debug", async () => {
  return runModule("./node_modules/jasmine/bin/jasmine.js", ["--inspect-brk"]);
});
