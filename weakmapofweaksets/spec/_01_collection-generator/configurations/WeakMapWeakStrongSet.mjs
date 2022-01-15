import CollectionConfiguration from "composite-collection/Configuration";

const WeakMapOfWeakStrongSetsConfig = new CollectionConfiguration("WeakMapOfWeakStrongSets", "WeakMap", "WeakSet");
WeakMapOfWeakStrongSetsConfig.addMapKey("weakMapKey", "The map key.", true);
WeakMapOfWeakStrongSetsConfig.addSetKey("weakSetKey", "The weak set key.", true);
WeakMapOfWeakStrongSetsConfig.addSetKey("strongSetKey", "The strong set key.", false);

export default WeakMapOfWeakStrongSetsConfig;
