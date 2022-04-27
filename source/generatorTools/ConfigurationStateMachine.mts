//import StringStateMachine from "../collections/StringStateMachine.mjs";
import LocalStringStateMachine from "./LocalStringStateMachine.mjs";
import type { valueTuple } from "./LocalStringStateMachine.mjs";

class ConfigurationStateMachine {
  /** @type {LocalStringStateMachine} @constant @readonly */
  #stringStates: LocalStringStateMachine;

  /** @type {string} */
  #currentState = "start";

  constructor(__iterable__: valueTuple[]) {
    this.#stringStates = new LocalStringStateMachine(__iterable__);
    Object.freeze(this);
  }

  /** @type {string} */
  get currentState() : string {
    return this.#currentState;
  }

  /**
   * Do a state transition, if we allow it.
   *
   * @param {string} nextState The next state.
   * @returns {boolean} True if the transition succeeded.
   */
  doStateTransition(nextState: string) : boolean {
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
  catchErrorState<R>(callback: () => R) : R {
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
  async catchErrorAsync<R>(callback: () => Promise<R>) : Promise<R> {
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

  static Map() : ConfigurationStateMachine {
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
    ])
  }

  static Set() : ConfigurationStateMachine {
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
    ])
  }

  static MapOfSets() : ConfigurationStateMachine {
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
    ])
  }

  static OneToOne() : ConfigurationStateMachine {
    return new ConfigurationStateMachine([
      ["start", "startOneToOne"],

      ["startOneToOne", "fileOverview"],
      ["startOneToOne", "configureOneToOne"],

      ["fileOverview", "configureOneToOne"],

      ["configureOneToOne", "locked"],

      ["locked", "locked"],
    ])
  }
}

Object.freeze(ConfigurationStateMachine.prototype);
Object.freeze(ConfigurationStateMachine)

export default ConfigurationStateMachine;
