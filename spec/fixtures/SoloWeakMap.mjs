import CollectionConfiguration from "composite-collection/Configuration";

const SoloWeakMapConfig = new CollectionConfiguration("SoloWeakMap", "WeakMap");
SoloWeakMapConfig.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
SoloWeakMapConfig.addMapKey("key", true, {
  argumentValidator: function(key) {
    // eslint-disable-next-line no-undef
    if (!(key instanceof MockImportable))
      return false;
  },
});

export default SoloWeakMapConfig;
