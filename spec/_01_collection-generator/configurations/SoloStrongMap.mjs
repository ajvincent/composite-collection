import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "../fixtures/MockImportable.mjs";

const SoloStrongMapConfig = new CollectionConfiguration("SoloStrongMap", "Map");

SoloStrongMapConfig.setFileOverview(`
I generated this file for testing purposes.

This is only a test.
`.trim());

SoloStrongMapConfig.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
SoloStrongMapConfig.addMapKey("key", "The key", false, {
  jsDocType: "MockImportable",
  argumentValidator: function(key) {
    if (!(key instanceof MockImportable))
      return false;
  },
});

SoloStrongMapConfig.setValueType("The value", {
  jsDocType: "MockImportable",
  argumentValidator: function(value) {
    if (!(value instanceof MockImportable))
      return false;
  }
});

SoloStrongMapConfig.lock();

export default SoloStrongMapConfig;
