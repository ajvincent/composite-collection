/**
 * @type {Map<string, Map<string, Set<string>>>}
 */
const ConfigurationStateGraphs = new Map;

ConfigurationStateGraphs.set(
  "Map",
  new Map([
    ["start", new Set([
      "startMap",
    ])],

    ["startMap", new Set([
      "mapKeys",
      "importLines",
    ])],

    ["importLines", new Set([
      "mapKeys",
      "hasValueFilter",
      "locked",
    ])],

    ["mapKeys", new Set([
      "mapKeys",
      "hasValueFilter",
      "locked",
    ])],

    ["hasValueFilter", new Set([
      "locked",
    ])],

    ["locked", new Set([
      "locked",
    ])],

    ["errored", new Set()],
  ])
);

ConfigurationStateGraphs.set(
  "Set",
  new Map([
    ["start", new Set([
      "startSet",
    ])],

    ["startSet", new Set([
      "setElements",
      "importLines",
    ])],

    ["importLines", new Set([
      "setElements",
      "hasValueFilter",
      "locked",
    ])],

    ["setElements", new Set([
      "setElements",
      "locked",
    ])],

    ["locked", new Set([
      "locked",
    ])],

    ["errored", new Set()],
  ])
);

ConfigurationStateGraphs.set(
  "MapOfSets",
  new Map([
    ["start", new Set([
      "startMap",
    ])],

    ["startMap", new Set([
      "mapKeys",
      "importLines",
    ])],

    ["importLines", new Set([
      "mapKeys",
      "hasValueFilter",
      "locked",
    ])],

    ["mapKeys", new Set([
      "mapKeys",
      "setElements",
    ])],

    ["setElements", new Set([
      "setElements",
      "locked",
    ])],

    ["locked", new Set([
      "locked",
    ])],

    ["errored", new Set()],
  ])
);

export default ConfigurationStateGraphs;
