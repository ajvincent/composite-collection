import CollectionConfiguration from "composite-collection/Configuration";

const SoloStrongMapConfig = new CollectionConfiguration("SoloStrongMap", "Map");
SoloStrongMapConfig.addMapKey("key", false);

export default SoloStrongMapConfig;
