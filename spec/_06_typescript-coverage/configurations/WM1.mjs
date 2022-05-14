import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "../fixtures/MockImportable.mjs";

const SoloWeakMapConfig = new CollectionConfiguration("SoloWeakMap", "WeakMap");

SoloWeakMapConfig.setFileOverview(`
I generated this file for testing purposes.

This is only a test.
`.trim());

SoloWeakMapConfig.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
SoloWeakMapConfig.addMapKey("key", "The key", true, {
  jsDocType: "MockImportable",
  tsType: "MockImportable",
  argumentValidator: function(key) {
    if (!(key instanceof MockImportable))
      return false;
  },
});

SoloWeakMapConfig.setValueType("The value", {
  jsDocType: "MockImportable",
  tsType: "MockImportable",
  argumentValidator: function(value) {
    if (!(value instanceof MockImportable))
      return false;
  }
});
SoloWeakMapConfig.lock();

export default SoloWeakMapConfig;