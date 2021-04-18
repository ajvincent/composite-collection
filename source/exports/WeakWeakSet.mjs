import CollectionConfiguration from "composite-collection/Configuration";

const WeakWeakSetConfig = new CollectionConfiguration("WeakWeakSet", "WeakSet");
WeakWeakSetConfig.addSetKey("key1", true);
WeakWeakSetConfig.addSetKey("key2", true);

export default WeakWeakSetConfig;
