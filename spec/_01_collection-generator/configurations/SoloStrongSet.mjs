import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "../fixtures/MockImportable.mjs";

const SoloStrongSetConfig = new CollectionConfiguration("SoloStrongSet", "Set");
SoloStrongSetConfig.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs";`
);
SoloStrongSetConfig.addSetKey("key", "The key.", false, {
  argumentType: "MockImportable",
  argumentValidator: function(key) {
    // eslint-disable-next-line no-undef
    if (!(key instanceof MockImportable))
      return false;
  },
});

SoloStrongSetConfig.lock();

export default SoloStrongSetConfig;
