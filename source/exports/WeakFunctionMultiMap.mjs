import CollectionConfiguration from "composite-collection/Configuration";

const WeakFunctionMultiMap = new CollectionConfiguration("WeakFunctionMultiMap", "WeakMap", "Set");

WeakFunctionMultiMap.addMapKey("key", "The map key.", true);
WeakFunctionMultiMap.addSetKey("mapFunction", "The function.", false, {
  argumentType: "Function",
  argumentValidator: function(mapFunction) {
    if (typeof mapFunction !== "function")
      return false;
  }
});
WeakFunctionMultiMap.lock();

export default WeakFunctionMultiMap;
