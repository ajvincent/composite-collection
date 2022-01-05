import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "./MockImportable.mjs";

const WeakWeakMapImportable = new CollectionConfiguration("WeakWeakMapImportable", "WeakMap");
WeakWeakMapImportable.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
WeakWeakMapImportable.addMapKey("key1", true, {
  argumentValidator: function(key1) {
    if (!(key1 instanceof MockImportable))
      return false;
  },
});

WeakWeakMapImportable.addMapKey("key2", true, {
  argumentValidator: function(key2) {
    if (!(key2 instanceof MockImportable))
      return false;
  },
});

WeakWeakMapImportable.setValueType("MockImportable", "The value", function(value) {
  if (!(value instanceof MockImportable))
    return false;
});

WeakWeakMapImportable.lock();

export default WeakWeakMapImportable;
