import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "./MockImportable.mjs";

const WeakStrongMapImportable = new CollectionConfiguration("WeakStrongMapImportable", "WeakMap");
WeakStrongMapImportable.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
WeakStrongMapImportable.addMapKey("key1", true, {
  argumentValidator: function(key1) {
    if (!(key1 instanceof MockImportable))
      return false;
  },
});

WeakStrongMapImportable.addMapKey("key2", false, {
  argumentValidator: function(key2) {
    if (!(key2 instanceof MockImportable))
      return false;
  },
});

WeakStrongMapImportable.setValueType("MockImportable", "The value", function(value) {
  if (!(value instanceof MockImportable))
    return false;
});

export default WeakStrongMapImportable;
