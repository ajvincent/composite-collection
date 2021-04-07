import CollectionConfiguration from "../../source/CollectionConfiguration.mjs";

const WeakMatrixSpec = new CollectionConfiguration("WeakMatrixMap");
WeakMatrixSpec.addMapKey(
  "row",
  true,
  {
    argumentType: "Object",
    description: "The matrix row",
  }
);

WeakMatrixSpec.addMapKey(
  "column",
  true,
  {
    argumentType: "Object",
    description: "The matrix column"
  }
);

export default WeakMatrixSpec;
