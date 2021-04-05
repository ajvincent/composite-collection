import CollectionConfiguration from "../../source/CollectionConfiguration.mjs";

const FunctionSetSpec = new CollectionConfiguration("FunctionSet");

FunctionSetSpec.addCollectionType(
  "functionSet",
  "Set",
  {
    argumentType: "void",
    description: "The set containing the function",
  }
);

FunctionSetSpec.setValueFilter(function(value) {
  if (typeof value !== "function")
    throw new Error("value must be a function!");
});

export default FunctionSetSpec;
