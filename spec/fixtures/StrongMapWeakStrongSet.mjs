import CollectionConfiguration from "composite-collection/Configuration";

const StrongMapOfStrongSetsConfig = new CollectionConfiguration("StrongMapOfWeakSets", "Map", "WeakSet");
StrongMapOfStrongSetsConfig.addMapKey("mapKey", false);
StrongMapOfStrongSetsConfig.addSetKey("weakSetKey", true);
StrongMapOfStrongSetsConfig.addSetKey("strongSetKey", false);

export default StrongMapOfStrongSetsConfig;
