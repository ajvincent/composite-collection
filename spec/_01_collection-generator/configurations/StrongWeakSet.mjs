import CollectionConfiguration from "composite-collection/Configuration";

const StrongWeakSetConfig = new CollectionConfiguration("StrongWeakSet", "WeakSet");
StrongWeakSetConfig.addSetKey("strongKey", "The strong key.", false);
StrongWeakSetConfig.addSetKey("weakKey", "The weak key.", true);

export default StrongWeakSetConfig;
