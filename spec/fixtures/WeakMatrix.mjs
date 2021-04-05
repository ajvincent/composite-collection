import CollectionConfiguration from "../../source/CollectionConfiguration.mjs";

const WeakMatrix = new CollectionConfiguration("WeakMultiMap");
WeakMatrix.addCollectionType(
  "row",
  "WeakMap",
  "Object",
  "The matrix row"
);

WeakMatrix.addCollectionType(
  "column",
  "WeakMap",
  "Object",
  "The matrix column"
);

export default WeakMatrix;
