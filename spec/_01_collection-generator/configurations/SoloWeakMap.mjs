import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "../fixtures/MockImportable.mjs";

const SoloWeakMapConfig = new CollectionConfiguration("SoloWeakMap", "WeakMap");
SoloWeakMapConfig.importLines(
  `import MockImportable from "#spec/_01_collection-generator/fixtures/MockImportable.mjs";`
);
SoloWeakMapConfig.addMapKey("key", true, {
  argumentValidator: function(key) {
    if (!(key instanceof MockImportable))
      return false;
  },
});

SoloWeakMapConfig.setValueType("MockImportable", "The value", function(value) {
  if (!(value instanceof MockImportable))
    return false;
});

SoloWeakMapConfig.lock();

export default SoloWeakMapConfig;
