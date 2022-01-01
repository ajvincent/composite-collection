import CollectionConfiguration from "composite-collection/Configuration";

const WeakMapOfWeakStrongSetsConfig = new CollectionConfiguration("WeakMapOfWeakStrongSets", "WeakMap", "WeakSet");
WeakMapOfWeakStrongSetsConfig.addMapKey("mapKey", true);
WeakMapOfWeakStrongSetsConfig.addSetKey("weakSetKey", true);
WeakMapOfWeakStrongSetsConfig.addSetKey("strongSetKey", false);

export default WeakMapOfWeakStrongSetsConfig;
