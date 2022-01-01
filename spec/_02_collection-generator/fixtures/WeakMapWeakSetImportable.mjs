import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "./MockImportable.mjs";

const WeakMapWeakSetImportable = new CollectionConfiguration("WeakMapWeakSetImportable", "WeakMap", "WeakSet");
WeakMapWeakSetImportable.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
WeakMapWeakSetImportable.addMapKey("mapKey", true, {
  argumentValidator: function(mapKey) {
    if (!(mapKey instanceof MockImportable))
      return false;
  },
});

WeakMapWeakSetImportable.addSetKey("setKey", true, {
  argumentValidator: function(setKey) {
    if (!(setKey instanceof MockImportable))
      return false;
  },
});

export default WeakMapWeakSetImportable;
