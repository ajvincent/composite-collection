import CollectionConfiguration from "composite-collection/Configuration";

const WeakMapOfWeakSetsConfig = new CollectionConfiguration("WeakMapOfWeakSets", "WeakMap", "WeakSet");
WeakMapOfWeakSetsConfig.addMapKey("mapKey", "The map key.", true);
WeakMapOfWeakSetsConfig.addSetKey("setKey", "The set key.", true);
WeakMapOfWeakSetsConfig.lock();

export default WeakMapOfWeakSetsConfig;
