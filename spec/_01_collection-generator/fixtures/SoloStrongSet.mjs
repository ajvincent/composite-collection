import CollectionConfiguration from "composite-collection/Configuration";

const SoloStrongSetConfig = new CollectionConfiguration("SoloStrongSet", "Set");
SoloStrongSetConfig.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
SoloStrongSetConfig.addSetKey("key", false, {
  argumentValidator: function(key) {
    // eslint-disable-next-line no-undef
    if (!(key instanceof MockImportable))
      return false;
  },
});

SoloStrongSetConfig.lock();

export default SoloStrongSetConfig;
