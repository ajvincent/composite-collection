import CollectionConfiguration from "composite-collection/Configuration";

const WeakMapOfWeakSetsConfig = new CollectionConfiguration("WeakMapOfWeakSets", "WeakMap", "WeakSet");
WeakMapOfWeakSetsConfig.addMapKey("mapKey", true);
WeakMapOfWeakSetsConfig.addSetKey("setKey", true);

export default WeakMapOfWeakSetsConfig;
