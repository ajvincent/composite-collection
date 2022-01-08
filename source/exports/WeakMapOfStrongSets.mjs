import CollectionConfiguration from "composite-collection/Configuration";

const WeakMapOfStrongSetsConfig = new CollectionConfiguration("WeakMapOfStrongSets", "WeakMap", "Set");
WeakMapOfStrongSetsConfig.addMapKey("mapKey", "The map key.", true);
WeakMapOfStrongSetsConfig.addSetKey("setKey", "The set key.", false);
WeakMapOfStrongSetsConfig.lock();

export default WeakMapOfStrongSetsConfig;
