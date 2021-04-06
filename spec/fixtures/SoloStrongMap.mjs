import CollectionConfiguration from "composite-collection/CollectionConfiguration";

const SoloStrongMapSpec = new CollectionConfiguration("SoloStrongMap");
SoloStrongMapSpec.addCollectionType(
  "key",
  "Map"
);

export default SoloStrongMapSpec;
