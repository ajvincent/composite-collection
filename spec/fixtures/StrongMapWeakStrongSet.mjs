import CollectionConfiguration from "composite-collection/Configuration";

const StrongMapOfWeakStrongSetsConfig = new CollectionConfiguration("StrongMapOfWeakStrongSets", "Map", "WeakSet");
StrongMapOfWeakStrongSetsConfig.addMapKey("mapKey", false);
StrongMapOfWeakStrongSetsConfig.addSetKey("weakSetKey", true);
StrongMapOfWeakStrongSetsConfig.addSetKey("strongSetKey", false);

export default StrongMapOfWeakStrongSetsConfig;
