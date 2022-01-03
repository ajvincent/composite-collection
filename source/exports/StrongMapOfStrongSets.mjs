import CollectionConfiguration from "composite-collection/Configuration";

const StrongMapOfStrongSetsConfig = new CollectionConfiguration("StrongMapOfStrongSets", "Map", "Set");
StrongMapOfStrongSetsConfig.addMapKey("mapKey", false);
StrongMapOfStrongSetsConfig.addSetKey("setKey", false);
StrongMapOfStrongSetsConfig.lock();

export default StrongMapOfStrongSetsConfig;
