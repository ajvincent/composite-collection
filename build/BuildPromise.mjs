export default class BuildPromise {
  static #status = "not started";

  static markReady() {
    this.#status = "ready";
  }

  static markClosed() {
    this.#status = "closed";
  }

  /** @type {Map<string, BuildPromise>} @constant */
  static #map = new Map;

  /**
   * @param {string} targetName The target name.
   * @returns {BuildPromise} The build promise.
   */
  static get(targetName) {
    if (!this.#map.has(targetName))
      this.#map.set(targetName, new BuildPromise(targetName));
    return this.#map.get(targetName);
  }

  /** @type {string[]} @constant */
  #subtargets = [];

  /** @type {Function[]} @constant */
  #tasks = [];

  /** @type {Function} @constant */
  #pendingStart;

  /** @type {Promise<void>} @constant */
  #runPromise;

  /**
   * @param {string} target The build target.
   */
  constructor(target) {
    if ((typeof target !== "string") || (target === ""))
      throw new Error("Target must be a non-empty string!");
    if (BuildPromise.#status !== "not started")
      throw new Error("Build step has started");
    this.target = target;
    this.description = "";

    let p = new Promise(resolve => this.#pendingStart = resolve);
    this.#runPromise = p.then(() => this.#run());
  }

  /** @type {string} */
  #description = "";

  /** @type {string} */
  get description() {
    return this.#description;
  }
  set description(value) {
    if (this.#description)
      throw new Error("Description already set for target " + this.target);
    if (BuildPromise.#status !== "not started")
      throw new Error("Build step has started");
    this.#description = value;
  }

  /**
   * @param {Function} callback The task.
   */
  addTask(callback) {
    if (BuildPromise.#status !== "not started")
      throw new Error("Build step has started");
    if (typeof callback !== "function")
      throw new Error("callback must be a function!");
    this.#tasks.push(callback);
  }

  /**
   * @param {string} target The subtarget.
   */
  addSubtarget(target) {
    if (target === "main")
      throw new Error("Cannot include main target");

    if (target === this.target)
      throw new Error("Cannot include this as its own subtarget");

    if (this === BuildPromise.main)
    {
      if (BuildPromise.#status !== "ready") {
        throw new Error("Cannot attach targets to main target until we are ready (call BuildPromise.markReady())");
      }
    }
    else if (BuildPromise.#status !== "not started") {
      throw new Error("Build step has started");
    }
    else if (BuildPromise.get(target).deepTargets.includes(this.target))
      throw new Error(`${target} already has a dependency on ${this.target}`);

    this.#subtargets.push(target);
  }

  /** @type {string[]} */
  get deepTargets() {
    let targets = this.#subtargets.slice();
    for (let i = 0; i < targets.length; i++) {
      targets.push(...BuildPromise.get(targets[i]).deepTargets);
    }
    return targets;
  }

  async #run() {
    console.log("Starting " + this.target + "...");

    if ((BuildPromise.#status === "ready") && (this === BuildPromise.main))
      BuildPromise.#status = "running";
    if (BuildPromise.#status !== "running")
      throw new Error("Build promises are not running!");

    const subtargets = this.#subtargets.map(st => BuildPromise.get(st));
    for (let i = 0; i < subtargets.length; i++) {
      try {
        await subtargets[i].run();
      }
      catch (ex) {
        BuildPromise.#status = "errored";
        throw ex;
      }
    }

    const tasks = this.#tasks.slice();
    while (tasks.length) {
      const task = tasks.shift();
      try {
        await task();
      }
      catch (ex) {
        BuildPromise.#status = "errored";
        throw ex;
      }
    }

    console.log("Completed " + this.target + "!");
  }

  async run() {
    this.#pendingStart();
    await this.#runPromise;
  }

  /** @type {BuildPromise} @constant */
  static main = new BuildPromise("main");
}

Object.freeze(BuildPromise.prototype);
Object.freeze(BuildPromise);
