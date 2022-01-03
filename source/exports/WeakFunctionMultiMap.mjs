import CollectionConfiguration from "composite-collection/Configuration";

const WeakFunctionMultiMap = new CollectionConfiguration("WeakFunctionMultiMap", "WeakMap", "Set");

WeakFunctionMultiMap.addMapKey("key", true);
WeakFunctionMultiMap.addSetKey("mapFunction", false, {
  argumentType: "Function",
  argumentValidator: function(mapFunction) {
    if (typeof mapFunction !== "function")
      return false;
  }
});
WeakFunctionMultiMap.lock();

export default WeakFunctionMultiMap;
