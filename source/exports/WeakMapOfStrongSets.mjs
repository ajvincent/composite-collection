import CollectionConfiguration from "composite-collection/Configuration";

const WeakMapOfStrongSetsConfig = new CollectionConfiguration("WeakMapOfStrongSets", "WeakMap", "Set");
WeakMapOfStrongSetsConfig.addMapKey("mapKey", true);
WeakMapOfStrongSetsConfig.addSetKey("setKey", false);

export default WeakMapOfStrongSetsConfig;