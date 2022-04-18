import { Deferred } from "./PromiseTypes.mjs";
import { DefaultMap } from "./DefaultMap.mjs";
export class BuildPromise {
    #ownerSet;
    /** @type {string[]} @constant */
    #subtargets = [];
    /** @type {Function[]} @constant */
    #tasks = [];
    #pendingStart;
    #runPromise;
    target;
    #setStatus;
    /**
     * @callback setStatusCallback
     * @param {string} value
     * @returns {void}
     */
    /** @type {boolean} @constant */
    #writeToConsole;
    /**
     * @param {BuildPromiseSet}   ownerSet       The set owning this.
     * @param {setStatusCallback} setStatus      Friend-like access to the owner set's #status property.
     * @param {string}            target         The build target.
     * @param {boolean}           writeToConsole True if we should write to the console.
     */
    constructor(ownerSet, setStatus, target, writeToConsole) {
        this.#ownerSet = ownerSet;
        this.#setStatus = setStatus;
        if (target === "")
            throw new Error("Target must be a non-empty string!");
        if (this.#ownerSet.status !== "not started")
            throw new Error("Build step has started");
        this.target = target;
        this.description = "";
        let deferred = new Deferred;
        this.#pendingStart = deferred.resolve;
        this.#runPromise = deferred.promise.then(() => this.#run());
        this.#writeToConsole = writeToConsole;
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
        if (this.#ownerSet.status !== "not started")
            throw new Error("Build step has started");
        this.#description = value;
    }
    /**
     * @param {Function} callback The task.
     */
    addTask(callback) {
        if (this.#ownerSet.status !== "not started")
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
        if (this === this.#ownerSet.main) {
            if (this.#ownerSet.status !== "ready") {
                throw new Error("Cannot attach targets to main target until we are ready (call BuildPromiseSet.markReady())");
            }
        }
        else if (this.#ownerSet.status !== "not started") {
            throw new Error("Build step has started");
        }
        else if (this.#ownerSet.get(target).deepTargets.includes(this.target))
            throw new Error(`${target} already has a dependency on ${this.target}`);
        this.#subtargets.push(target);
    }
    /** @type {string[]} */
    get deepTargets() {
        let targets = this.#subtargets.slice();
        for (let i = 0; i < targets.length; i++) {
            targets.push(...this.#ownerSet.get(targets[i]).deepTargets);
        }
        return targets;
    }
    async #run() {
        if (this.#writeToConsole) {
            // eslint-disable-next-line no-console
            console.log("Starting " + this.target + "...");
        }
        if ((this.#ownerSet.status === "ready") && (this === this.#ownerSet.main))
            this.#setStatus("running");
        if (this.#ownerSet.status !== "running")
            throw new Error("Build promises are not running!");
        const subtargets = this.#subtargets.map(st => this.#ownerSet.get(st));
        for (let i = 0; i < subtargets.length; i++) {
            try {
                await subtargets[i].run();
            }
            catch (ex) {
                this.#setStatus("errored");
                throw ex;
            }
        }
        const tasks = this.#tasks.slice();
        while (tasks.length) {
            const task = tasks.shift();
            try {
                if (!task)
                    throw new Error("foo");
                await task();
            }
            catch (ex) {
                this.#setStatus("errored");
                throw ex;
            }
        }
        if (this.#writeToConsole) {
            // eslint-disable-next-line no-console
            console.log("Completed " + this.target + "!");
        }
    }
    async run() {
        this.#pendingStart(null);
        await this.#runPromise;
    }
}
Object.freeze(BuildPromise.prototype);
Object.freeze(BuildPromise);
export class BuildPromiseSet {
    #status = "not started";
    markReady() {
        this.#status = "ready";
    }
    markClosed() {
        this.#status = "closed";
    }
    get status() {
        return this.#status;
    }
    /** @type {Map<string, BuildPromise>} @constant */
    #map = new DefaultMap;
    /** @type {BuildPromise} @constant */
    main;
    #setStatusCallback;
    /** @type {boolean} @constant */
    #writeToConsole;
    constructor(writeToConsole = false) {
        this.#setStatusCallback = (value) => {
            this.#status = value;
        };
        this.#writeToConsole = writeToConsole;
        this.main = new BuildPromise(this, this.#setStatusCallback, "main", this.#writeToConsole);
    }
    /**
     * @param {string} targetName The target name.
     * @returns {BuildPromise} The build promise.
     */
    get(targetName) {
        return this.#map.getDefault(targetName, () => new BuildPromise(this, this.#setStatusCallback, targetName, this.#writeToConsole));
    }
}
Object.freeze(BuildPromiseSet.prototype);
Object.freeze(BuildPromiseSet);
//# sourceMappingURL=BuildPromise.mjs.map