import CollectionConfiguration from "#source/CollectionConfiguration.mjs";

const WeakMatrixConfig = new CollectionConfiguration("WeakMatrixMap");
WeakMatrixConfig.addMapKey(
  "row",
  true,
  {
    argumentType: "Object",
    description: "The matrix row",
  }
);

WeakMatrixConfig.addMapKey(
  "column",
  true,
  {
    argumentType: "Object",
    description: "The matrix column"
  }
);

export default WeakMatrixConfig;
