import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "../fixtures/MockImportable.mjs";

const WeakMapWeakSetImportable = new CollectionConfiguration("WeakMapWeakSetImportable", "WeakMap", "WeakSet");
WeakMapWeakSetImportable.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
WeakMapWeakSetImportable.addMapKey("mapKey", "The map key.", true, {
  jsDocType: "MockImportable",
  argumentValidator: function(mapKey) {
    if (!(mapKey instanceof MockImportable))
      return false;
  },
});

WeakMapWeakSetImportable.addSetKey("setKey", "The set key.", true, {
  jsDocType: "MockImportable",
  argumentValidator: function(setKey) {
    if (!(setKey instanceof MockImportable))
      return false;
  },
});

export default WeakMapWeakSetImportable;
