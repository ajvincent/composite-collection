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
  argumentType: "MockImportable",
  argumentValidator: function(key) {
    if (!(key instanceof MockImportable))
      return false;
  },
});

SoloStrongMapConfig.setValueType("MockImportable", "The value", function(value) {
  if (!(value instanceof MockImportable))
    return false;
});
SoloStrongMapConfig.lock();

export default SoloStrongMapConfig;