import CollectionConfiguration from "../../source/CollectionConfiguration.mjs";

const FunctionSetConfig = new CollectionConfiguration("FunctionSet");

FunctionSetConfig.addCollectionType(
  "FunctionSet",
  "Set",
  {
    argumentType: "void",
    description: "The set containing the function",
  }
);

FunctionSetConfig.setValueFilter(function(value) {
  if (typeof value !== "function")
    throw new Error("value must be a function!");
});

export default FunctionSetConfig;
