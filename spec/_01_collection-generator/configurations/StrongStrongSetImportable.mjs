import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "../fixtures/MockImportable.mjs";

const StrongStrongSetImportable = new CollectionConfiguration("StrongStrongSetImportable", "Set");
StrongStrongSetImportable.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
StrongStrongSetImportable.addSetKey("key1", "The first key.", false, {
  argumentType: "MockImportable",
  argumentValidator: function(key1) {
    if (!(key1 instanceof MockImportable))
      return false;
  },
});

StrongStrongSetImportable.addSetKey("key2", "The second key.", false, {
  argumentType: "MockImportable",
  argumentValidator: function(key2) {
    if (!(key2 instanceof MockImportable))
      return false;
  },
});

StrongStrongSetImportable.lock();

export default StrongStrongSetImportable;
