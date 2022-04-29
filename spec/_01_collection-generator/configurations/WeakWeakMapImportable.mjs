import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "../fixtures/MockImportable.mjs";

const WeakWeakMapImportable = new CollectionConfiguration("WeakWeakMapImportable", "WeakMap");
WeakWeakMapImportable.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
WeakWeakMapImportable.addMapKey("key1", "The first key.", true, {
  argumentType: "MockImportable",
  argumentValidator: function(key1) {
    if (!(key1 instanceof MockImportable))
      return false;
  },
});

WeakWeakMapImportable.addMapKey("key2", "The second key.", true, {
  argumentType: "MockImportable",
  argumentValidator: function(key2) {
    if (!(key2 instanceof MockImportable))
      return false;
  },
});

WeakWeakMapImportable.setValueType("The value", {
  jsDocType: "MockImportable",
  argumentValidator: function(value) {
    if (!(value instanceof MockImportable))
      return false;
  }
});

WeakWeakMapImportable.lock();

export default WeakWeakMapImportable;
