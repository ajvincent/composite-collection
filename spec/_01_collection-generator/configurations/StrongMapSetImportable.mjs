import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "../fixtures/MockImportable.mjs";

const StrongMapSetImportable = new CollectionConfiguration("StrongMapSetImportable", "Map", "Set");
StrongMapSetImportable.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
StrongMapSetImportable.addMapKey("mapKey", "The map key.", false, {
  jsDocType: "MockImportable",
  argumentValidator: function(mapKey) {
    if (!(mapKey instanceof MockImportable))
      return false;
  },
});

StrongMapSetImportable.addSetKey("setKey", "The set key.", false, {
  jsDocType: "MockImportable",
  argumentValidator: function(setKey) {
    if (!(setKey instanceof MockImportable))
      return false;
  },
});

export default StrongMapSetImportable;
