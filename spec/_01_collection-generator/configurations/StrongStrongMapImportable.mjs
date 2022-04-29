import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "../fixtures/MockImportable.mjs";

const StrongStrongMapImportable = new CollectionConfiguration("StrongStrongMapImportable", "Map");
StrongStrongMapImportable.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
StrongStrongMapImportable.addMapKey("key1", "The first key.", false, {
  jsDocType: "MockImportable",
  argumentValidator: function(key1) {
    if (!(key1 instanceof MockImportable))
      return false;
  },
});

StrongStrongMapImportable.addMapKey("key2", "The second key.", false, {
  jsDocType: "MockImportable",
  argumentValidator: function(key2) {
    if (!(key2 instanceof MockImportable))
      return false;
  },
});

StrongStrongMapImportable.setValueType("The value", {
  jsDocType: "MockImportable",
  argumentValidator: function(value) {
    if (!(value instanceof MockImportable))
      return false;
  }
});

StrongStrongMapImportable.lock();

export default StrongStrongMapImportable;
