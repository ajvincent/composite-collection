import CollectionConfiguration from "composite-collection/Configuration";

const SoloStrongMapSpec = new CollectionConfiguration("SoloStrongMap");
SoloStrongMapSpec.addMapKey("key", false);

export default SoloStrongMapSpec;
