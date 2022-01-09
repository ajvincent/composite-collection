import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "../fixtures/MockImportable.mjs";

const WeakWeakSetImportable = new CollectionConfiguration("WeakWeakSetImportable", "WeakSet");
WeakWeakSetImportable.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
WeakWeakSetImportable.addSetKey("key1", "The first key.", true, {
  argumentType: "MockImportable",
  argumentValidator: function(key1) {
    if (!(key1 instanceof MockImportable))
      return false;
  },
});

WeakWeakSetImportable.addSetKey("key2", "The second key.", true, {
  argumentType: "MockImportable",
  argumentValidator: function(key2) {
    if (!(key2 instanceof MockImportable))
      return false;
  },
});

export default WeakWeakSetImportable;
