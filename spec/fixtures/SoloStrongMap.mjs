import CollectionConfiguration from "composite-collection/Configuration";

const SoloStrongMapConfig = new CollectionConfiguration("SoloStrongMap", "Map");
SoloStrongMapConfig.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
SoloStrongMapConfig.addMapKey("key", false, {
  argumentValidator: function(key) {
    // eslint-disable-next-line no-undef
    if (!(key instanceof MockImportable))
      return false;
  },
});

export default SoloStrongMapConfig;
