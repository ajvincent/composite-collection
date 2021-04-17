import CollectionConfiguration from "composite-collection/Configuration";

const WeakWeakMapConfig = new CollectionConfiguration("WeakWeakMap", "WeakMap");
WeakWeakMapConfig.addMapKey("key1", true);
WeakWeakMapConfig.addMapKey("key2", true);

export default WeakWeakMapConfig;
