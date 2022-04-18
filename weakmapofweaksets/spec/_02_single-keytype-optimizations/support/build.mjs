import CollectionConfiguration from "#source/CollectionConfiguration.mjs";
import CodeGenerator from "#source/CodeGenerator.mjs";
import MockImportable from "#spec/_01_collection-generator/fixtures/MockImportable.mjs";

import { PromiseAllSequence } from "#source/utilities/PromiseTypes.mjs";
import { copyFileTasks } from "#build/tools/generateCollectionTools.mjs";

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

void mapValidators;
void setValidators;

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
    `import MockImportable from "#spec/_01_collection-generator/fixtures/MockImportable.mjs";`
  );

  for (let i = 0; i < mapKeyCount; i++) {
    const key = "mapKey" + i;
    config.addMapKey(
      key,
      key + " description",
      useWeakMapKeys,
      { argumentType: "MockImportable", argumentValidator: mapValidators[i] }
    );
  }

  for (let i = 0; i < setKeyCount; i++) {
    const key = "setKey" + i;
    config.addSetKey(
      key,
      key + " description",
      useWeakSetKeys,
      { argumentType: "MockImportable", argumentValidator: setValidators[i] }
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
  void extraKeyCount;

  const generatedDir = path.join(specTopDir, dirName, "generated");
  await fs.mkdir(generatedDir, { recursive: true });

  const weakTypeMapSet = [
    [ false, false ],
    [ true,  false ],
    [ true,  true  ],
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

  await copyFileTasks(
    "source/exports",
    "spec/_02_single-keytype-optimizations/" + dirName + "/generated",
    [
      "keys/Hasher.mjs",
      "keys/Composite.mjs",
    ]
  );

  await PromiseAllSequence(configSequence, async arg => {
    const [className, config] = arg;
    const leafName = className + ".mjs";
    console.log("Generating collection: spec/_02_single-keytype-optimizations/" + dirName + "/generated/" + leafName);
    const generator = new CodeGenerator(
      config,
      path.join(generatedDir, leafName),
      Promise.resolve(),
      { disableKeyOptimization }
    );
    await generator.run();
  });
}

/**
 * Build the composite collections we need.
 */
export default async function() {
  await createCollectionFiles("multiple-reference", 1, true);
  await createCollectionFiles("solo-fullbuild", 0, true);
  await createCollectionFiles("solo-optbuild", 0, false);  
}
