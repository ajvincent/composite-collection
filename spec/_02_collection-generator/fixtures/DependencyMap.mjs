import CollectionConfiguration from "#source/CollectionConfiguration.mjs";

const DependencyMapConfig = new CollectionConfiguration("DependencyMap");
DependencyMapConfig.addCollectionType(
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

DependencyMapConfig.addCollectionType(
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

export default DependencyMapConfig;
