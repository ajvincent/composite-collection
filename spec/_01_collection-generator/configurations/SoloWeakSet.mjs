import CollectionConfiguration from "composite-collection/Configuration";

const SoloWeakSetConfig = new CollectionConfiguration("SoloWeakSet", "WeakSet");
SoloWeakSetConfig.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
SoloWeakSetConfig.addSetKey("key", "The key", true, {
  jsDocType: "MockImportable",
  argumentValidator: function(key) {
    // eslint-disable-next-line no-undef
    if (!(key instanceof MockImportable))
      return false;
  },
});

SoloWeakSetConfig.lock();

export default SoloWeakSetConfig;
