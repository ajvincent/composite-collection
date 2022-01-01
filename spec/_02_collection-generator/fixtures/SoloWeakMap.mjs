import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "./MockImportable.mjs";

const SoloWeakMapConfig = new CollectionConfiguration("SoloWeakMap", "WeakMap");
SoloWeakMapConfig.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
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


export default SoloWeakMapConfig;
