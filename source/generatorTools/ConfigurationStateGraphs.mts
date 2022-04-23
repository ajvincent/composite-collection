//import StringStateMachine from "../collections/StringStateMachine.mjs";
import LocalStringStateMachine from "./LocalStringStateMachine.mjs";
let machinesLocked = false;

class ConfigurationStateMachine extends LocalStringStateMachine {
  add(currentState: string, nextState: string) : this {
    if (machinesLocked)
      throw new Error("This state machine is not modifiable!");
    return super.add(currentState, nextState);
  }

  delete(currentState: string, nextState: string) : boolean {
    void(currentState);
    void(nextState);
    throw new Error("This state machine is not modifiable!");
  }

  clear() : void {
    throw new Error("This state machine is not modifiable!");
  }
}

/**
 * @type {Map<string, LocalStringStateMachine>}
 */
const ConfigurationStateGraphs: Map<string, LocalStringStateMachine> = new Map;

ConfigurationStateGraphs.set(
  "Map",
  new ConfigurationStateMachine([
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
);

ConfigurationStateGraphs.set(
  "Set",
  new ConfigurationStateMachine([
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
);

ConfigurationStateGraphs.set(
  "MapOfSets",
  new ConfigurationStateMachine([
    ["start", "startMap"],

    ["startMap", "fileOverview"],
    ["startMap", "importLines"],
    ["startMap", "mapKeys"],

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
);

ConfigurationStateGraphs.set(
  "OneToOne",
  new ConfigurationStateMachine([
    ["start", "startOneToOne"],

    ["startOneToOne", "fileOverview"],
    ["startOneToOne", "configureOneToOne"],

    ["fileOverview", "configureOneToOne"],

    ["configureOneToOne", "locked"],

    ["locked", "locked"],
  ])
);

machinesLocked = true;

export default ConfigurationStateGraphs;
