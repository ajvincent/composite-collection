import CollectionConfiguration from "composite-collection/Configuration";

const StrongMapSetImportable = new CollectionConfiguration("StrongMapSetImportable", "Map", "Set");
StrongMapSetImportable.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
StrongMapSetImportable.addMapKey("mapKey", false, {
  argumentValidator: function(mapKey) {
    // eslint-disable-next-line no-undef
    if (!(mapKey instanceof MockImportable))
      return false;
  },
});
StrongMapSetImportable.addSetKey("setKey", false);

export default StrongMapSetImportable;
