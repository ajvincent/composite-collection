import path from "path";
import Jasmine from "jasmine";
import getBaseConfig from "./shared.mjs";
import util from "util";

// eslint-disable-next-line jsdoc/require-jsdoc
export function buildJasmine(reporter, specs) {
  const jasmine = new Jasmine({ projectBaseDir: path.resolve() });
  const config = getBaseConfig();
  config.spec_files = specs;
  jasmine.loadConfig(config);

  jasmine.clearReporters();
  jasmine.addReporter(reporter);
  jasmine.exitOnCompletion = false;

  return jasmine;
}

// eslint-disable-next-line jsdoc/require-jsdoc
export function buildConsoleReporter() {
  const ParentReporter = new Jasmine.ConsoleReporter;
  ParentReporter.setOptions({
    print(...args) {
      process.stdout.write(util.format.apply(this, args));
    },
    showColors: true,
  });
  return ParentReporter;
}

export class Deferred {
  resolve;
  reject;
  promise;
  constructor() {
    this.resolve = (value) => {
        void (value);
    };
    this.reject = (reason) => {
        throw reason;
    };
    this.promise = new Promise((res, rej) => {
        this.resolve = res;
        this.reject = rej;
    });
  }
}

export class SingletonPromise {
  #resolve;
  #promise;
  constructor(thenable) {
    this.#promise = (new Promise(res => this.#resolve = res)).then(thenable);
  }

  async run() {
    this.#resolve();
    return await this.#promise;
  }
}

class ReporterBase {
  async jasmineStarted(suiteInfo) {
    void(suiteInfo);
  }

  async jasmineDone(suiteInfo) {
    void(suiteInfo);
  }

  async suiteStarted(result) {
    void(result);
  }

  async suiteDone(result) {
    void(result);
  }

  async specStarted(result) {
    void(result);
  }

  async specDone(result) {
    void(result);
  }
}

export class ForwardingReporter extends ReporterBase {
  #target;
  constructor(target) {
    super();
    this.#target = target;
  }

  jasmineStarted(suiteInfo) {
    if (typeof this.#target.jasmineStarted === "function")
      this.#target.jasmineStarted(suiteInfo);
  }

  jasmineDone(suiteInfo) {
    if (typeof this.#target.jasmineDone === "function")
      this.#target.jasmineDone(suiteInfo);
  }

  suiteStarted(result) {
    if (typeof this.#target.suiteStarted === "function")
      this.#target.suiteStarted(result);
  }

  suiteDone(result) {
    if (typeof this.#target.suiteDone === "function")
      this.#target.suiteDone(result);
  }

  specStarted(result) {
    if (typeof this.#target.specStarted === "function")
      this.#target.specStarted(result);
  }

  specDone(result) {
    if (typeof this.#target.specDone === "function")
      this.#target.specDone(result);
  }
}

export class ReplayOnceReporter extends ReporterBase {
  #target;
  #eventLog = [];

  constructor(target) {
    super();
    this.#target = new ForwardingReporter(target);
  }

  jasmineStarted(suiteInfo) {
    this.#addEvent("jasmineStarted", suiteInfo);
  }

  jasmineDone(suiteInfo) {
    this.#addEvent("jasmineDone", suiteInfo);
  }

  suiteStarted(result) {
    this.#addEvent("suiteStarted", result);
  }

  suiteDone(result) {
    this.#addEvent("suiteDone", result);
  }

  specStarted(result) {
    this.#addEvent("specStarted", result);
  }

  specDone(result) {
    this.#addEvent("specDone", result);
  }

  #addEvent(methodName, data) {
    this.#eventLog.push({methodName, data});
  }

  replay() {
    const events = this.#eventLog;
    this.#eventLog = [];
    events.forEach(({methodName, data}) => {
      this.#target[methodName](data);
    });
  }

  getEventLog() {
    return this.#eventLog.slice();
  }
}

export class ReplayPromiseReporter extends ReplayOnceReporter {
  #startReplay = new SingletonPromise(async () => await this.#replay());
  #jasmineStarted = new Deferred;
  #jasmineDone = new Deferred;

  jasmineStarted(suiteInfo) {
    this.#jasmineStarted.resolve(suiteInfo);
  }

  jasmineDone(suiteInfo) {
    this.#jasmineDone.resolve(suiteInfo);
  }

  async replay() {
    return await this.#startReplay.run();
  }

  async #replay() {
    await this.#jasmineStarted.promise;
    await this.#jasmineDone.promise;
    super.replay();
  }

  get jasmineStartedPromise() {
    return this.#jasmineStarted.promise;
  }

  get jasmineDonePromise() {
    return this.#jasmineDone.promise;
  }
}
