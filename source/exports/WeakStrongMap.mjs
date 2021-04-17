import CollectionConfiguration from "composite-collection/Configuration";

const WeakStrongMapConfig = new CollectionConfiguration("WeakStrongMap", "WeakMap");
WeakStrongMapConfig.addMapKey("weakKey", true);
WeakStrongMapConfig.addMapKey("strongKey", false);

export default WeakStrongMapConfig;
