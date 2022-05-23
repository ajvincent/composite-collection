import { fork } from "child_process";
import url from "url";

import {
  buildConsoleReporter,
  Deferred,
  SingletonPromise,
  ForwardingReporter,
  ReplayPromiseReporter,
} from "./reporters.mjs";

import getBaseConfig from "./shared.mjs";
import globFiles from "./globFiles.mjs";

const childModulePath = url.fileURLToPath(new URL("child.mjs", import.meta.url));

const ParentReporter = buildConsoleReporter();

class ChildJasmine {
  #process = null;
  specs;
  reporter;
  #eventsDeferred = new Deferred;
  #processPromise = new SingletonPromise(async () => await this.#run());
  #processExit = new Deferred;

  constructor(specs, targetReporter) {
    Reflect.defineProperty(this, "specs", {
      value: Object.freeze(specs.slice()),
      writable: false,
      configurable: false
    });

    Reflect.defineProperty(this, "reporter", {
      value: new ReplayPromiseReporter(targetReporter),
      writable: false,
      configurable: false
    });
  }

  async run() {
    return await this.#processPromise.run();
  }

  async #run() {
    this.#process = await fork(
      childModulePath,
      {
        execArgv: process.execArgv.concat("--expose-gc"),
        stdio: "inherit",
      }
    );
    this.#process.on("message", m => this.#handleMessage(m));
    this.#process.on("exit", code => {
      code ? this.#processExit.reject(code) : this.#processExit.resolve()
    });
    await this.#process.send({
      type: "startJob",
      specs: this.specs
    });

    this.#handleEvents(await this.#eventsDeferred.promise);
    await this.#process.send({
      type: "close"
    });
    await this.#processExit.promise;
  }

  #handleMessage(m) {
    if (m.type !== "ChildReporter:events")
      return;
    this.#eventsDeferred.resolve(m.events);
  }

  #handleEvents(events) {
    events.forEach(
      event => this.reporter[event.methodName](event.data)
    );
  }
}

class AggregateReporter {
  #childJasmines = [];
  #startRun = new SingletonPromise(async () => await this.#run());
  #startReplay = new SingletonPromise(async () => await this.#replay());
  #forwarding;
  #totalTime;

  constructor(target) {
    this.#forwarding = new ForwardingReporter(target);
    this.overallStatus = "incomplete";
  }

  addChildJasmine(...specs) {
    this.#childJasmines.push(new ChildJasmine(specs, this.#forwarding))
  }

  async run() {
    return await this.#startRun.run();
  }

  static statusChars = new Map([
    ["failed", "X"],
    ["incomplete", "!"],
    ["passed", "*"],
  ]);

  static incompletedSpecs = [];
  static longSpecs = [];

  async #run() {
    const startTime = (new Date).getTime();
    console.log("Parallel specs progress:")
    console.log("?".repeat(this.#childJasmines.length))
    await Promise.all(this.#childJasmines.map(async child => {
      await child.run();

      const jasmineDone = await child.reporter.jasmineDonePromise;
      process.stdout.write(AggregateReporter.statusChars.get(jasmineDone.overallStatus));
      if (jasmineDone.overallStatus === "incomplete")
        AggregateReporter.incompletedSpecs.push(...child.specs);

      if (jasmineDone.totalTime > 10000) {
        AggregateReporter.longSpecs.push(...child.specs);
      }
    }));
    console.log("\n\n");

    if (AggregateReporter.incompletedSpecs.length) {
      const specs = AggregateReporter.incompletedSpecs.slice();
      specs.sort();
      console.log("Incompleted specs:", specs);
    }

    if (AggregateReporter.longSpecs.length) {
      const specs = AggregateReporter.longSpecs.slice();
      specs.sort();
      console.log("Long-running specs:", specs);
    }

    const endTime = (new Date).getTime();
    this.#totalTime = endTime - startTime;
  }

  async replay() {
    return await this.#startReplay.run();
  }

  async #replay() {
    await this.#jasmineStarted();
    await this.#childJasmines.reduce(
      async (previousPromise, child) => {
        await previousPromise;
        await child.reporter.replay();
      },
      Promise.resolve()
    );
    await this.#jasmineDone();
  }

  async #jasmineStarted() {
    const infos = await Promise.all(this.#childJasmines.map(
      child => child.reporter.jasmineStartedPromise
    ));
    this.#forwarding.jasmineStarted({
      order: {},
      totalSpecsDefined: infos.reduce(
        (previous, info) => previous + info.totalSpecsDefined,
        0
      )
    });
  }

  async #jasmineDone() {
    const infos = await Promise.all(this.#childJasmines.map(
      child => child.reporter.jasmineDonePromise
    ));

    const finalData = {
      overallStatus: "passed",
      totalTime: this.#totalTime,
      incompleteReason: undefined,
      order: {},
      failedExpectations: [],
      deprecationWarnings: [],
    };

    infos.forEach(info => {
      if (info.overallStatus === "failed")
        finalData.overallStatus = "failed";
      else if ((info.overallStatus === "incomplete") && (finalData.overallStatus === "passed"))
        finalData.overallStatus = "incomplete";

      finalData.incompleteReason ||= info.incompleteReason;
      finalData.failedExpectations.push(...info.failedExpectations);
      finalData.deprecationWarnings.push(...info.deprecationWarnings);
    });

    this.#forwarding.jasmineDone(finalData);
    this.overallStatus = finalData.overallStatus;
  }
}

/**
 * Run all the specifications!
 */
export default async function runSpecsParallel() {
  const specFiles = globFiles(getBaseConfig().spec_files);

  const aggregate = new AggregateReporter(ParentReporter);
  specFiles.forEach(spec => aggregate.addChildJasmine(spec));
  await aggregate.run();
  await aggregate.replay();

  if (aggregate.overallStatus !== "passed")
    throw new Error(aggregate.overallStatus);
}
