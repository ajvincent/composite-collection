import CollectionConfiguration from "#source/CollectionConfiguration.mjs";
import CompileTimeOptions from "#source/CompileTimeOptions.mjs";
import InMemoryDriver from "#source/InMemoryDriver.mjs";

import MockImportable from "#spec/_01_collection-generator/fixtures/MockImportable.mjs";

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';

const specTopDir = path.normalize(path.join(fileURLToPath(import.meta.url), "../.."));

/** @typedef {string} identifier */

const mapValidators = [
  function(mapKey0) {
    if (!(mapKey0 instanceof MockImportable))
      return false;
  },

  function(mapKey1) {
    if (!(mapKey1 instanceof MockImportable))
      return false;
  }
];

const setValidators = [
  function(setKey0) {
    if (!(setKey0 instanceof MockImportable))
      return false;
  },

  function(setKey1) {
    if (!(setKey1 instanceof MockImportable))
      return false;
  }
];

/**
 * Define a configuration with a given key sequence.
 *
 * @param {identifier} className The class name.
 * @param {number} mapKeyCount The number of map keys.
 * @param {boolean} useWeakMapKeys True if the map keys should be weakly held.
 * @param {number} setKeyCount The number of set keys.
 * @param {boolean} useWeakSetKeys True if the set keys should be weakly held.
 * @returns {CollectionConfiguration} The configuration.
 */
function defineCollection(className, mapKeyCount, useWeakMapKeys, setKeyCount, useWeakSetKeys) {
  const config = new CollectionConfiguration(
    className,
    useWeakMapKeys ? "WeakMap" : "Map",
    useWeakSetKeys ? "WeakSet" : "Set",
  );

  config.importLines(
    `import MockImportable from "../../../_01_collection-generator/fixtures/MockImportable.mjs";`
  );

  for (let i = 0; i < mapKeyCount; i++) {
    const key = "mapKey" + i;
    config.addMapKey(
      key,
      key + " description",
      useWeakMapKeys,
      { jsDocType: "MockImportable", argumentValidator: mapValidators[i] }
    );
  }

  for (let i = 0; i < setKeyCount; i++) {
    const key = "setKey" + i;
    config.addSetKey(
      key,
      key + " description",
      useWeakSetKeys,
      { jsDocType: "MockImportable", argumentValidator: setValidators[i] }
    );
  }

  config.lock();
  return config;
}

/**
 * Create the collections to test against.
 *
 * @param {string}  dirName                The directory to add generated collections to.
 * @param {1 | 0}   extraKeyCount          The number of extra keys to include for "optimized" key sets.
 * @param {boolean} disableKeyOptimization True if we need to disable the optimization.
 */
async function createCollectionFiles(dirName, extraKeyCount, disableKeyOptimization) {
  const generatedDir = path.join(specTopDir, dirName, "generated");
  await fs.mkdir(generatedDir, { recursive: true });

  const weakTypeMapSet = [
    [ false, false ],
    [ true,  false ],
  ];

  const argCountMapSet = [
    [1, 2],
    [2, 1],
    [1, 1],
  ];

  const configSequence = [];

  weakTypeMapSet.forEach(mapAndSetType => {
    argCountMapSet.forEach(argMapSet => {
      const className = `${
        argMapSet[0] === 1 ? "Optimized" : ""
      }${
        mapAndSetType[0] ? "Weak" : "Strong"
      }MapOf${
        argMapSet[1] === 1 ? "Optimized" : ""
      }${
        mapAndSetType[1] ? "Weak" : "Strong"
      }Sets`;

      const config = defineCollection(
        className,
        argMapSet[0] === 1 ? argMapSet[0] + extraKeyCount : 2,
        mapAndSetType[0],
        argMapSet[1] === 1 ? argMapSet[1] + extraKeyCount : 2,
        mapAndSetType[1]
      );

      configSequence.push([className, config]);
    });
  });

  const driver = new InMemoryDriver(
    generatedDir,
    new CompileTimeOptions({ disableKeyOptimization })
  );

  configSequence.forEach((arg) => {
    const [className, config] = arg;
    const leafName = className + ".mjs";
    driver.addConfiguration(config, leafName);
  });

  await driver.run();
}

/**
 * Build the composite collections we need.
 */
export default async function() {
  await Promise.all([
    createCollectionFiles("multiple-reference", 1, true),
    createCollectionFiles("solo-fullbuild", 0, true),
    createCollectionFiles("solo-optbuild", 0, false),
  ])
}
