import CollectionConfiguration from "composite-collection/Configuration";

const WeakWeakMapConfig = new CollectionConfiguration("WeakWeakMap", "WeakMap");
WeakWeakMapConfig.addMapKey("key1", "The first key.", true);
WeakWeakMapConfig.addMapKey("key2", "The second key.", true);
WeakWeakMapConfig.lock();

export default WeakWeakMapConfig;
