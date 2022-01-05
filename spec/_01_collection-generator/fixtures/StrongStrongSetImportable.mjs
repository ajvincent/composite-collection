import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "./MockImportable.mjs";

const StrongStrongSetImportable = new CollectionConfiguration("StrongStrongSetImportable", "Set");
StrongStrongSetImportable.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
StrongStrongSetImportable.addSetKey("key1", false, {
  argumentValidator: function(key1) {
    if (!(key1 instanceof MockImportable))
      return false;
  },
});

StrongStrongSetImportable.addSetKey("key2", false, {
  argumentValidator: function(key2) {
    if (!(key2 instanceof MockImportable))
      return false;
  },
});

StrongStrongSetImportable.lock();

export default StrongStrongSetImportable;
