import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "../fixtures/MockImportable.mjs";

const WeakMapStrongSetImportable = new CollectionConfiguration("WeakMapStrongSetImportable", "WeakMap", "Set");
WeakMapStrongSetImportable.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
WeakMapStrongSetImportable.addMapKey("mapKey", true, {
  argumentValidator: function(mapKey) {
    if (!(mapKey instanceof MockImportable))
      return false;
  },
});

WeakMapStrongSetImportable.addSetKey("setKey", false, {
  argumentValidator: function(setKey) {
    if (!(setKey instanceof MockImportable))
      return false;
  },
});

export default WeakMapStrongSetImportable;
