import CollectionConfiguration from "composite-collection/Configuration";

const WeakWeakSetConfig = new CollectionConfiguration("WeakWeakSet", "WeakSet");
WeakWeakSetConfig.addSetKey("key1", "The first key.", true);
WeakWeakSetConfig.addSetKey("key2", "The second key.", true);
WeakWeakSetConfig.lock();

export default WeakWeakSetConfig;
