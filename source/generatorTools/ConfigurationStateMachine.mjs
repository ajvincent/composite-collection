//import StringStateMachine from "../collections/StringStateMachine.mjs";
import LocalStringStateMachine from "./LocalStringStateMachine.mjs";
class ConfigurationStateMachine {
    /** @type {LocalStringStateMachine} @constant @readonly */
    #stringStates;
    /** @type {string} */
    #currentState = "start";
    constructor(__iterable__) {
        this.#stringStates = new LocalStringStateMachine(__iterable__);
        Object.freeze(this);
    }
    /** @type {string} */
    get currentState() {
        return this.#currentState;
    }
    /**
     * Do a state transition, if we allow it.
     *
     * @param {string} nextState The next state.
     * @returns {boolean} True if the transition succeeded.
     */
    doStateTransition(nextState) {
        const mayTransition = this.#stringStates.has(this.#currentState, nextState);
        if (mayTransition)
            this.#currentState = nextState;
        return mayTransition;
    }
    /**
     * Intercept errors from a method, and mark this as errored out if we see one.
     *
     * @param {Function} callback The function
     * @returns {any} The return value from the callback.
     */
    catchErrorState(callback) {
        if (this.#currentState === "errored")
            throw new Error("This configuration is dead due to a previous error!");
        try {
            return callback();
        }
        catch (ex) {
            this.#currentState = "errored";
            throw ex;
        }
    }
    /**
     * Intercept errors from a method, and mark this as errored out if we see one.
     *
     * @param {Function} callback The function
     * @returns {any} The return value from the callback.
     * @async
     */
    async catchErrorAsync(callback) {
        if (this.#currentState === "errored")
            throw new Error("This configuration is dead due to a previous error!");
        try {
            return await callback();
        }
        catch (ex) {
            this.#currentState = "errored";
            throw ex;
        }
    }
    static Map() {
        return new ConfigurationStateMachine([
            ["start", "startMap"],
            ["startMap", "fileOverview"],
            ["startMap", "importLines"],
            ["startMap", "mapKeys"],
            ["fileOverview", "importLines"],
            ["fileOverview", "mapKeys"],
            ["importLines", "mapKeys"],
            ["importLines", "hasValueFilter"],
            ["mapKeys", "mapKeys"],
            ["mapKeys", "keyLink"],
            ["mapKeys", "hasValueFilter"],
            ["mapKeys", "locked"],
            ["keyLink", "keyLink"],
            ["keyLink", "hasValueFilter"],
            ["keyLink", "locked"],
            ["hasValueFilter", "locked"],
            ["locked", "locked"],
        ]);
    }
    static Set() {
        return new ConfigurationStateMachine([
            ["start", "startSet"],
            ["startSet", "fileOverview"],
            ["startSet", "importLines"],
            ["startSet", "setElements"],
            ["fileOverview", "importLines"],
            ["fileOverview", "setElements"],
            ["importLines", "setElements"],
            ["setElements", "setElements"],
            ["setElements", "keyLink"],
            ["setElements", "locked"],
            ["keyLink", "keyLink"],
            ["keyLink", "locked"],
            ["locked", "locked"],
        ]);
    }
    static MapOfSets() {
        return new ConfigurationStateMachine([
            ["start", "startMapOfSets"],
            ["startMapOfSets", "fileOverview"],
            ["startMapOfSets", "importLines"],
            ["startMapOfSets", "mapKeys"],
            ["fileOverview", "importLines"],
            ["fileOverview", "mapKeys"],
            ["importLines", "mapKeys"],
            ["mapKeys", "mapKeys"],
            ["mapKeys", "setElements"],
            ["setElements", "setElements"],
            ["setElements", "keyLink"],
            ["setElements", "locked"],
            ["keyLink", "keyLink"],
            ["keyLink", "locked"],
            ["locked", "locked"],
        ]);
    }
    static OneToOne() {
        return new ConfigurationStateMachine([
            ["start", "startOneToOne"],
            ["startOneToOne", "fileOverview"],
            ["startOneToOne", "configureOneToOne"],
            ["fileOverview", "configureOneToOne"],
            ["configureOneToOne", "locked"],
            ["locked", "locked"],
        ]);
    }
}
Object.freeze(ConfigurationStateMachine.prototype);
Object.freeze(ConfigurationStateMachine);
export default ConfigurationStateMachine;
//# sourceMappingURL=ConfigurationStateMachine.mjs.map