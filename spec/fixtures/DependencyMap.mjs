import CollectionConfiguration from "../../source/CollectionConfiguration.mjs";

const DependencyMapSpec = new CollectionConfiguration("DependencyMap");
DependencyMapSpec.addCollectionType(
  "exported",
  "Map",
  {
    argumentType: "CollectionConfiguration",
    description: "The exported configuration",
    argumentValidator: exported => {
      if (!(exported instanceof CollectionConfiguration))
        throw new Error("exported should be a CollectionConfiguration!");
    }
  }
);

DependencyMapSpec.addCollectionType(
  "importing",
  "Set",
  {
    argumentType: "CollectionConfiguration",
    description: "The importing configuration",
    argumentValidator: importing => {
      if (!(importing instanceof CollectionConfiguration))
        throw new Error("importing should be a CollectionConfiguration!");
    }
  }
);

export default DependencyMapSpec;
