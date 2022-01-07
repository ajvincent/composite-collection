import CollectionConfiguration from "composite-collection/Configuration";

const StrongWeakMapConfig = new CollectionConfiguration("WeakStrongMap", "WeakMap");
StrongWeakMapConfig.addMapKey("strongKey", false);
StrongWeakMapConfig.addMapKey("weakKey", true);

export default StrongWeakMapConfig;
