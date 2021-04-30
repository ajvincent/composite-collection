import CollectionConfiguration from "composite-collection/Configuration";

const StrongMapOfWeakSetsConfig = new CollectionConfiguration("StrongMapOfWeakSets", "Map", "WeakSet");
StrongMapOfWeakSetsConfig.addMapKey("mapKey", false);
StrongMapOfWeakSetsConfig.addSetKey("setKey", true);

export default StrongMapOfWeakSetsConfig;
