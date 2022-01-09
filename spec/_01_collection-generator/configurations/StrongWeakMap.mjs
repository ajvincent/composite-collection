import CollectionConfiguration from "composite-collection/Configuration";

const StrongWeakMapConfig = new CollectionConfiguration("WeakStrongMap", "WeakMap");
StrongWeakMapConfig.addMapKey("strongKey", "The strong key.", false);
StrongWeakMapConfig.addMapKey("weakKey", "The weak key.", true);

export default StrongWeakMapConfig;
