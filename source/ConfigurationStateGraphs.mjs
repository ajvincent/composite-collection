import StringStateMachine from "./collections/StringStateMachine.mjs";
let machinesLocked = false;

class ConfigurationStateMachine extends StringStateMachine {
  add(...args) {
    if (machinesLocked)
      throw new Error("This state machine is not modifiable!");
    return super.add(...args);
  }

  delete() {
    throw new Error("This state machine is not modifiable!");
  }

  clear() {
    throw new Error("This state machine is not modifiable!");
  }
}

/**
 * @type {Map<string, Map<string, Set<string>>>}
 */
const ConfigurationStateGraphs = new Map;

ConfigurationStateGraphs.set(
  "Map",
  new ConfigurationStateMachine([
    ["start", "startMap"],

    ["startMap", "fileOverview"],
    ["startMap", "mapKeys"],
    ["startMap", "importLines"],

    ["fileOverview", "mapKeys"],
    ["fileOverview", "importLines"],

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
    ["startSet", "setElements"],
    ["startSet", "importLines"],

    ["fileOverview", "setElements"],
    ["fileOverview", "importLines"],

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
    ["startMap", "mapKeys"],
    ["startMap", "importLines"],

    ["fileOverview", "mapKeys"],
    ["fileOverview", "importLines"],

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
