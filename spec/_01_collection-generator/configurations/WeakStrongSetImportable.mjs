import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "../fixtures/MockImportable.mjs";

const WeakStrongSetImportable = new CollectionConfiguration("WeakStrongSetImportable", "WeakSet");
WeakStrongSetImportable.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
WeakStrongSetImportable.addSetKey("key1", "The first key.", true, {
  jsDocType: "MockImportable",
  argumentValidator: function(key1) {
    if (!(key1 instanceof MockImportable))
      return false;
  },
});

WeakStrongSetImportable.addSetKey("key2", "The second key.", false, {
  jsDocType: "MockImportable",
  argumentValidator: function(key2) {
    if (!(key2 instanceof MockImportable))
      return false;
  },
});

export default WeakStrongSetImportable;
