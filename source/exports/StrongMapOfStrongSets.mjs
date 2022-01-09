import CollectionConfiguration from "composite-collection/Configuration";

const StrongMapOfStrongSetsConfig = new CollectionConfiguration("StrongMapOfStrongSets", "Map", "Set");
StrongMapOfStrongSetsConfig.addMapKey("mapKey", "The map key.", false);
StrongMapOfStrongSetsConfig.addSetKey("setKey", "The set key.", false);
StrongMapOfStrongSetsConfig.lock();

export default StrongMapOfStrongSetsConfig;
