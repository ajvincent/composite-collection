import { Deferred } from "./PromiseTypes.mjs";
import { DefaultMap } from "../exports/keys/DefaultMap.mjs";
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
        while (subtargets.length) {
            const subtarget = subtargets.shift();
            try {
                if (!subtarget)
                    throw new Error("assertion: unreachable");
                await subtarget.run();
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
                    throw new Error("assertion: unreachable");
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
        return await this.#runPromise;
    }
}
Object.freeze(BuildPromise.prototype);
Object.freeze(BuildPromise);
export class BuildPromiseSet {
    #status = "not started";
    markReady() {
        if (this.#status === "not started")
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGRQcm9taXNlLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkJ1aWxkUHJvbWlzZS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQU01RCxNQUFNLE9BQU8sWUFBWTtJQUN2QixTQUFTLENBQTRCO0lBRXJDLGlDQUFpQztJQUNqQyxXQUFXLEdBQWEsRUFBRSxDQUFDO0lBRTNCLG1DQUFtQztJQUNuQyxNQUFNLEdBQW1CLEVBQUUsQ0FBQztJQUU1QixhQUFhLENBQXdCO0lBRXJDLFdBQVcsQ0FBMEI7SUFFckMsTUFBTSxDQUFtQjtJQUV6QixVQUFVLENBQW9CO0lBRTlCOzs7O09BSUc7SUFFSCxnQ0FBZ0M7SUFDaEMsZUFBZSxDQUFvQjtJQUVuQzs7Ozs7T0FLRztJQUNILFlBQ0UsUUFBeUIsRUFDekIsU0FBNEIsRUFDNUIsTUFBYyxFQUNkLGNBQXVCO1FBR3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBRTVCLElBQUksTUFBTSxLQUFLLEVBQUU7WUFDZixNQUFNLElBQUksS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7UUFDeEQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxhQUFhO1lBQ3pDLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUV0QixJQUFJLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQztRQUM1QixJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUM7UUFDdEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxRQUFR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LEdBQUcsY0FBYyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzVGLENBQUM7SUFFRDs7O09BR0c7SUFDSCxHQUFHLENBQUMsVUFBa0I7UUFDcEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FDekIsVUFBVSxFQUNWLEdBQUcsRUFBRSxDQUFDLElBQUksWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FDeEYsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQUVELE1BQU0sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3pDLE1BQU0sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEZWZlcnJlZCB9IGZyb20gXCIuL1Byb21pc2VUeXBlcy5tanNcIjtcbmltcG9ydCB7IERlZmF1bHRNYXAgfSBmcm9tIFwiLi4vZXhwb3J0cy9rZXlzL0RlZmF1bHRNYXAubWpzXCI7XG5cbmltcG9ydCB0eXBlIHsgUHJvbWlzZVJlc29sdmVyIH0gZnJvbSBcIi4vUHJvbWlzZVR5cGVzLm1qc1wiO1xuXG50eXBlIHNldFN0YXR1c0NhbGxiYWNrID0gKHZhbHVlOiBzdHJpbmcpID0+IHZvaWRcblxuZXhwb3J0IGNsYXNzIEJ1aWxkUHJvbWlzZSB7XG4gICNvd25lclNldDogUmVhZG9ubHk8QnVpbGRQcm9taXNlU2V0PjtcblxuICAvKiogQHR5cGUge3N0cmluZ1tdfSBAY29uc3RhbnQgKi9cbiAgI3N1YnRhcmdldHM6IHN0cmluZ1tdID0gW107XG5cbiAgLyoqIEB0eXBlIHtGdW5jdGlvbltdfSBAY29uc3RhbnQgKi9cbiAgI3Rhc2tzOiAoKCkgPT4gdm9pZClbXSA9IFtdO1xuXG4gICNwZW5kaW5nU3RhcnQ6IFByb21pc2VSZXNvbHZlcjxudWxsPjtcblxuICAjcnVuUHJvbWlzZTogUmVhZG9ubHk8UHJvbWlzZTx2b2lkPj47XG5cbiAgdGFyZ2V0OiBSZWFkb25seTxzdHJpbmc+O1xuXG4gICNzZXRTdGF0dXM6IHNldFN0YXR1c0NhbGxiYWNrO1xuXG4gIC8qKlxuICAgKiBAY2FsbGJhY2sgc2V0U3RhdHVzQ2FsbGJhY2tcbiAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXG4gICAqIEByZXR1cm5zIHt2b2lkfVxuICAgKi9cblxuICAvKiogQHR5cGUge2Jvb2xlYW59IEBjb25zdGFudCAqL1xuICAjd3JpdGVUb0NvbnNvbGU6IFJlYWRvbmx5PGJvb2xlYW4+O1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0J1aWxkUHJvbWlzZVNldH0gICBvd25lclNldCAgICAgICBUaGUgc2V0IG93bmluZyB0aGlzLlxuICAgKiBAcGFyYW0ge3NldFN0YXR1c0NhbGxiYWNrfSBzZXRTdGF0dXMgICAgICBGcmllbmQtbGlrZSBhY2Nlc3MgdG8gdGhlIG93bmVyIHNldCdzICNzdGF0dXMgcHJvcGVydHkuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgIHRhcmdldCAgICAgICAgIFRoZSBidWlsZCB0YXJnZXQuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgIHdyaXRlVG9Db25zb2xlIFRydWUgaWYgd2Ugc2hvdWxkIHdyaXRlIHRvIHRoZSBjb25zb2xlLlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgb3duZXJTZXQ6IEJ1aWxkUHJvbWlzZVNldCxcbiAgICBzZXRTdGF0dXM6IHNldFN0YXR1c0NhbGxiYWNrLFxuICAgIHRhcmdldDogc3RyaW5nLFxuICAgIHdyaXRlVG9Db25zb2xlOiBib29sZWFuLFxuICApXG4gIHtcbiAgICB0aGlzLiNvd25lclNldCA9IG93bmVyU2V0O1xuICAgIHRoaXMuI3NldFN0YXR1cyA9IHNldFN0YXR1cztcblxuICAgIGlmICh0YXJnZXQgPT09IFwiXCIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUYXJnZXQgbXVzdCBiZSBhIG5vbi1lbXB0eSBzdHJpbmchXCIpO1xuICAgIGlmICh0aGlzLiNvd25lclNldC5zdGF0dXMgIT09IFwibm90IHN0YXJ0ZWRcIilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkJ1aWxkIHN0ZXAgaGFzIHN0YXJ0ZWRcIik7XG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgdGhpcy5kZXNjcmlwdGlvbiA9IFwiXCI7XG5cbiAgICBsZXQgZGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQ7XG4gICAgdGhpcy4jcGVuZGluZ1N0YXJ0ID0gZGVmZXJyZWQucmVzb2x2ZTtcbiAgICB0aGlzLiNydW5Qcm9taXNlID0gZGVmZXJyZWQucHJvbWlzZS50aGVuKCgpID0+IHRoaXMuI3J1bigpKTtcblxuICAgIHRoaXMuI3dyaXRlVG9Db25zb2xlID0gd3JpdGVUb0NvbnNvbGU7XG4gIH1cblxuICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgI2Rlc2NyaXB0aW9uID0gXCJcIjtcblxuICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgZ2V0IGRlc2NyaXB0aW9uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuI2Rlc2NyaXB0aW9uO1xuICB9XG4gIHNldCBkZXNjcmlwdGlvbih2YWx1ZSkge1xuICAgIGlmICh0aGlzLiNkZXNjcmlwdGlvbilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkRlc2NyaXB0aW9uIGFscmVhZHkgc2V0IGZvciB0YXJnZXQgXCIgKyB0aGlzLnRhcmdldCk7XG4gICAgaWYgKHRoaXMuI293bmVyU2V0LnN0YXR1cyAhPT0gXCJub3Qgc3RhcnRlZFwiKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQnVpbGQgc3RlcCBoYXMgc3RhcnRlZFwiKTtcbiAgICB0aGlzLiNkZXNjcmlwdGlvbiA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSB0YXNrLlxuICAgKi9cbiAgYWRkVGFzayhjYWxsYmFjazogKCgpID0+IHZvaWQpKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuI293bmVyU2V0LnN0YXR1cyAhPT0gXCJub3Qgc3RhcnRlZFwiKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQnVpbGQgc3RlcCBoYXMgc3RhcnRlZFwiKTtcbiAgICB0aGlzLiN0YXNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0IFRoZSBzdWJ0YXJnZXQuXG4gICAqL1xuICBhZGRTdWJ0YXJnZXQodGFyZ2V0OiBSZWFkb25seTxzdHJpbmc+KTogdm9pZCB7XG4gICAgaWYgKHRhcmdldCA9PT0gXCJtYWluXCIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgaW5jbHVkZSBtYWluIHRhcmdldFwiKTtcblxuICAgIGlmICh0YXJnZXQgPT09IHRoaXMudGFyZ2V0KVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGluY2x1ZGUgdGhpcyBhcyBpdHMgb3duIHN1YnRhcmdldFwiKTtcblxuICAgIGlmICh0aGlzID09PSB0aGlzLiNvd25lclNldC5tYWluKVxuICAgIHtcbiAgICAgIGlmICh0aGlzLiNvd25lclNldC5zdGF0dXMgIT09IFwicmVhZHlcIikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgYXR0YWNoIHRhcmdldHMgdG8gbWFpbiB0YXJnZXQgdW50aWwgd2UgYXJlIHJlYWR5IChjYWxsIEJ1aWxkUHJvbWlzZVNldC5tYXJrUmVhZHkoKSlcIik7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuI293bmVyU2V0LnN0YXR1cyAhPT0gXCJub3Qgc3RhcnRlZFwiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCdWlsZCBzdGVwIGhhcyBzdGFydGVkXCIpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLiNvd25lclNldC5nZXQodGFyZ2V0KS5kZWVwVGFyZ2V0cy5pbmNsdWRlcyh0aGlzLnRhcmdldCkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7dGFyZ2V0fSBhbHJlYWR5IGhhcyBhIGRlcGVuZGVuY3kgb24gJHt0aGlzLnRhcmdldH1gKTtcblxuICAgIHRoaXMuI3N1YnRhcmdldHMucHVzaCh0YXJnZXQpO1xuICB9XG5cbiAgLyoqIEB0eXBlIHtzdHJpbmdbXX0gKi9cbiAgZ2V0IGRlZXBUYXJnZXRzKCk6IHN0cmluZ1tdIHtcbiAgICBsZXQgdGFyZ2V0cyA9IHRoaXMuI3N1YnRhcmdldHMuc2xpY2UoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRhcmdldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRhcmdldHMucHVzaCguLi50aGlzLiNvd25lclNldC5nZXQodGFyZ2V0c1tpXSkuZGVlcFRhcmdldHMpO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0cztcbiAgfVxuXG4gIGFzeW5jICNydW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuI3dyaXRlVG9Db25zb2xlKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgY29uc29sZS5sb2coXCJTdGFydGluZyBcIiArIHRoaXMudGFyZ2V0ICsgXCIuLi5cIik7XG4gICAgfVxuXG4gICAgaWYgKCh0aGlzLiNvd25lclNldC5zdGF0dXMgPT09IFwicmVhZHlcIikgJiYgKHRoaXMgPT09IHRoaXMuI293bmVyU2V0Lm1haW4pKVxuICAgICAgdGhpcy4jc2V0U3RhdHVzKFwicnVubmluZ1wiKTtcbiAgICBpZiAodGhpcy4jb3duZXJTZXQuc3RhdHVzICE9PSBcInJ1bm5pbmdcIilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkJ1aWxkIHByb21pc2VzIGFyZSBub3QgcnVubmluZyFcIik7XG5cbiAgICBjb25zdCBzdWJ0YXJnZXRzID0gdGhpcy4jc3VidGFyZ2V0cy5tYXAoc3QgPT4gdGhpcy4jb3duZXJTZXQuZ2V0KHN0KSk7XG4gICAgd2hpbGUgKHN1YnRhcmdldHMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBzdWJ0YXJnZXQgPSBzdWJ0YXJnZXRzLnNoaWZ0KCk7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIXN1YnRhcmdldClcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJhc3NlcnRpb246IHVucmVhY2hhYmxlXCIpO1xuICAgICAgICBhd2FpdCBzdWJ0YXJnZXQucnVuKCk7XG4gICAgICB9XG4gICAgICBjYXRjaCAoZXgpIHtcbiAgICAgICAgdGhpcy4jc2V0U3RhdHVzKFwiZXJyb3JlZFwiKTtcbiAgICAgICAgdGhyb3cgZXg7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdGFza3MgPSB0aGlzLiN0YXNrcy5zbGljZSgpO1xuICAgIHdoaWxlICh0YXNrcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHRhc2sgPSB0YXNrcy5zaGlmdCgpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCF0YXNrKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImFzc2VydGlvbjogdW5yZWFjaGFibGVcIik7XG4gICAgICAgIGF3YWl0IHRhc2soKTtcbiAgICAgIH1cbiAgICAgIGNhdGNoIChleCkge1xuICAgICAgICB0aGlzLiNzZXRTdGF0dXMoXCJlcnJvcmVkXCIpO1xuICAgICAgICB0aHJvdyBleDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy4jd3JpdGVUb0NvbnNvbGUpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLmxvZyhcIkNvbXBsZXRlZCBcIiArIHRoaXMudGFyZ2V0ICsgXCIhXCIpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHJ1bigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLiNwZW5kaW5nU3RhcnQobnVsbCk7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuI3J1blByb21pc2U7XG4gIH1cbn1cblxuT2JqZWN0LmZyZWV6ZShCdWlsZFByb21pc2UucHJvdG90eXBlKTtcbk9iamVjdC5mcmVlemUoQnVpbGRQcm9taXNlKTtcblxuZXhwb3J0IGNsYXNzIEJ1aWxkUHJvbWlzZVNldCB7XG4gICNzdGF0dXMgPSBcIm5vdCBzdGFydGVkXCI7XG5cbiAgbWFya1JlYWR5KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLiNzdGF0dXMgPT09IFwibm90IHN0YXJ0ZWRcIilcbiAgICAgIHRoaXMuI3N0YXR1cyA9IFwicmVhZHlcIjtcbiAgfVxuXG4gIG1hcmtDbG9zZWQoKTogdm9pZCB7XG4gICAgdGhpcy4jc3RhdHVzID0gXCJjbG9zZWRcIjtcbiAgfVxuXG4gIGdldCBzdGF0dXMoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy4jc3RhdHVzO1xuICB9XG5cbiAgLyoqIEB0eXBlIHtNYXA8c3RyaW5nLCBCdWlsZFByb21pc2U+fSBAY29uc3RhbnQgKi9cbiAgI21hcDogRGVmYXVsdE1hcDxzdHJpbmcsIEJ1aWxkUHJvbWlzZT4gPSBuZXcgRGVmYXVsdE1hcDtcblxuICAvKiogQHR5cGUge0J1aWxkUHJvbWlzZX0gQGNvbnN0YW50ICovXG4gIG1haW46IFJlYWRvbmx5PEJ1aWxkUHJvbWlzZT47XG5cbiAgI3NldFN0YXR1c0NhbGxiYWNrOiBzZXRTdGF0dXNDYWxsYmFjaztcblxuICAvKiogQHR5cGUge2Jvb2xlYW59IEBjb25zdGFudCAqL1xuICAjd3JpdGVUb0NvbnNvbGU7XG5cbiAgY29uc3RydWN0b3Iod3JpdGVUb0NvbnNvbGUgPSBmYWxzZSkge1xuICAgIHRoaXMuI3NldFN0YXR1c0NhbGxiYWNrID0gKHZhbHVlOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICAgIHRoaXMuI3N0YXR1cyA9IHZhbHVlO1xuICAgIH07XG4gICAgdGhpcy4jd3JpdGVUb0NvbnNvbGUgPSB3cml0ZVRvQ29uc29sZTtcbiAgICB0aGlzLm1haW4gPSBuZXcgQnVpbGRQcm9taXNlKHRoaXMsIHRoaXMuI3NldFN0YXR1c0NhbGxiYWNrLCBcIm1haW5cIiwgdGhpcy4jd3JpdGVUb0NvbnNvbGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YXJnZXROYW1lIFRoZSB0YXJnZXQgbmFtZS5cbiAgICogQHJldHVybnMge0J1aWxkUHJvbWlzZX0gVGhlIGJ1aWxkIHByb21pc2UuXG4gICAqL1xuICBnZXQodGFyZ2V0TmFtZTogc3RyaW5nKSA6IEJ1aWxkUHJvbWlzZSB7XG4gICAgcmV0dXJuIHRoaXMuI21hcC5nZXREZWZhdWx0KFxuICAgICAgdGFyZ2V0TmFtZSxcbiAgICAgICgpID0+IG5ldyBCdWlsZFByb21pc2UodGhpcywgdGhpcy4jc2V0U3RhdHVzQ2FsbGJhY2ssIHRhcmdldE5hbWUsIHRoaXMuI3dyaXRlVG9Db25zb2xlKVxuICAgICk7XG4gIH1cbn1cblxuT2JqZWN0LmZyZWV6ZShCdWlsZFByb21pc2VTZXQucHJvdG90eXBlKTtcbk9iamVjdC5mcmVlemUoQnVpbGRQcm9taXNlU2V0KTtcbiJdfQ==