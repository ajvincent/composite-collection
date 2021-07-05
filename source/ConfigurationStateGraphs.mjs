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

    ["startMap", "mapKeys"],
    ["startMap", "importLines"],

    ["importLines", "mapKeys"],
    ["importLines", "hasValueFilter"],

    ["mapKeys", "mapKeys"],
    ["mapKeys", "hasValueFilter"],
    ["mapKeys", "locked"],

    ["hasValueFilter", "locked"],

    ["locked", "locked"],
  ])
);

ConfigurationStateGraphs.set(
  "Set",
  new ConfigurationStateMachine([
    ["start", "startSet"],

    ["startSet", "setElements"],
    ["startSet", "importLines"],

    ["importLines", "setElements"],

    ["setElements", "setElements"],
    ["setElements", "locked"],

    ["locked", "locked"],
  ])
);

ConfigurationStateGraphs.set(
  "MapOfSets",
  new ConfigurationStateMachine([
    ["start", "startMap"],

    ["startMap", "mapKeys"],
    ["startMap", "importLines"],

    ["importLines", "mapKeys"],

    ["mapKeys", "mapKeys"],
    ["mapKeys", "setElements"],

    ["setElements", "setElements"],
    ["setElements", "locked"],

    ["locked", "locked"],
  ])
);

/*
ConfigurationStateGraphs.set(
  "Sequence",
  new ConfigurationStateMachine([
    ["start", "startSequence"],

    ["startSequence", "importLines"],
    ["startSequence", "sequence"],

    ["importLines", "sequence"],

    ["sequence", "sequence"],
    ["sequence", "locked"],

    ["locked", "locked"],
  ])
);
*/

machinesLocked = true;

export default ConfigurationStateGraphs;
