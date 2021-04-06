import CollectionConfiguration from "composite-collection/Configuration";

const SoloStrongMapSpec = new CollectionConfiguration("SoloStrongMap");
SoloStrongMapSpec.addCollectionType(
  "key",
  "Map"
);

export default SoloStrongMapSpec;
