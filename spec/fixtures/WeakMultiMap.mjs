import CollectionConfiguration from "../../CollectionConfiguration.mjs";

const WeakMultiMap = new CollectionConfiguration("WeakMultiMap");
WeakMultiMap.addCollectionType(
  "weakKey",
  "WeakMap",
  "Object",
  "The weak key"
);

WeakMultiMap.addCollectionType(
  "strongSet",
  "Set",
  "void",
  "The set containing the value"
);

export default WeakMultiMap;
