import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "../fixtures/MockImportable.mjs";

const WeakStrongMapImportable = new CollectionConfiguration("WeakStrongMapImportable", "WeakMap");
WeakStrongMapImportable.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
WeakStrongMapImportable.addMapKey("key1", "The first key.", true, {
  jsDocType: "MockImportable",
  argumentValidator: function(key1) {
    if (!(key1 instanceof MockImportable))
      return false;
  },
});

WeakStrongMapImportable.addMapKey("key2", "The second key.", false, {
  jsDocType: "MockImportable",
  argumentValidator: function(key2) {
    if (!(key2 instanceof MockImportable))
      return false;
  },
});

WeakStrongMapImportable.setValueType("The value", {
  jsDocType: "MockImportable",
  argumentValidator: function(value) {
    if (!(value instanceof MockImportable))
      return false;
  }
});

WeakStrongMapImportable.lock();

export default WeakStrongMapImportable;
