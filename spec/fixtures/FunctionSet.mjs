import CollectionConfiguration from "../../source/CollectionConfiguration.mjs";

const FunctionSet = new CollectionConfiguration("FunctionSet");

FunctionSet.addCollectionType(
  "functionSet",
  "Set",
  "void",
  "The set containing the function"
);

FunctionSet.setValueFilter(function(value) {
  if (typeof value !== "function")
    throw new Error("value must be a function!");
});

export default FunctionSet;
