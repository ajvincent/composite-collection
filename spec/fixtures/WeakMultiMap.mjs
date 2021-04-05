import CollectionConfiguration from "../../CollectionConfiguration.mjs";

const WeakMultiMapSpec = new CollectionConfiguration("WeakMultiMap");
WeakMultiMapSpec.addCollectionType(
  "weakKey",
  "WeakMap",
  {
    argumentType: "Object",
    description: "The weak key",
  }
);

WeakMultiMapSpec.addCollectionType(
  "strongSet",
  "Set",
  {
    argumentType: "void",
    description: "The set containing the value",
  }
);

export default WeakMultiMapSpec;
