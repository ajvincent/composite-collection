import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "../fixtures/MockImportable.mjs";

const WeakMapStrongSetImportable = new CollectionConfiguration("WeakMapStrongSetImportable", "WeakMap", "Set");
WeakMapStrongSetImportable.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
WeakMapStrongSetImportable.addMapKey("mapKey", "The map key.", true, {
  argumentType: "MockImportable",
  argumentValidator: function(mapKey) {
    if (!(mapKey instanceof MockImportable))
      return false;
  },
});

WeakMapStrongSetImportable.addSetKey("setKey", "The set key.", false, {
  argumentType: "MockImportable",
  argumentValidator: function(setKey) {
    if (!(setKey instanceof MockImportable))
      return false;
  },
});

export default WeakMapStrongSetImportable;
