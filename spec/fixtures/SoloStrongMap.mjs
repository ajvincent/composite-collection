import CollectionConfiguration from "composite-collection/Configuration";

const SoloStrongMapConfig = new CollectionConfiguration("SoloStrongMap", "Map");
SoloStrongMapConfig.importLines(
  `import MockImportable from "../fixtures/MockImportable.mjs"; void(MockImportable);`
)
SoloStrongMapConfig.addMapKey("key", false);

export default SoloStrongMapConfig;
