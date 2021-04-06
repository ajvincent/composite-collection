import CollectionConfiguration from "../../source/CollectionConfiguration.mjs";

const WeakMatrixSpec = new CollectionConfiguration("WeakMatrixMap");
WeakMatrixSpec.addCollectionType(
  "row",
  "WeakMap",
  {
    argumentType: "Object",
    description: "The matrix row",
  }
);

WeakMatrixSpec.addCollectionType(
  "column",
  "WeakMap",
  {
    argumentType: "Object",
    description: "The matrix column"
  }
);

export default WeakMatrixSpec;
