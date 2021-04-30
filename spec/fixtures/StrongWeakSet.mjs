import CollectionConfiguration from "composite-collection/Configuration";

const StrongWeakSetConfig = new CollectionConfiguration("StrongWeakSet", "WeakSet");
StrongWeakSetConfig.addSetKey("strongKey", false);
StrongWeakSetConfig.addSetKey("weakKey", true);

export default StrongWeakSetConfig;
