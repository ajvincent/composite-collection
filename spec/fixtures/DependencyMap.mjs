import CollectionConfiguration from "../../source/CollectionConfiguration.mjs";

const DependencyMapSpec = new CollectionConfiguration("DependencyMap");
DependencyMapSpec.addCollectionType(
  "exported",
  "Map",
  "CollectionConfiguration",
  "The exported configuration",
  exported => {
    if (!(exported instanceof CollectionConfiguration))
      throw new Error("exported should be a CollectionConfiguration!");
  }
);

DependencyMapSpec.addCollectionType(
  "importing",
  "Set",
  "CollectionConfiguration",
  "The importing configuration",
  importing => {
    if (!(importing instanceof CollectionConfiguration))
      throw new Error("importing should be a CollectionConfiguration!");
  }
);

export default DependencyMapSpec;
