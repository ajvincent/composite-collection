import CollectionConfiguration from "composite-collection/Configuration";

const WeakStrongMapConfig = new CollectionConfiguration("WeakStrongMap", "WeakMap");
WeakStrongMapConfig.addMapKey("weakKey", "The weakly held key.", true);
WeakStrongMapConfig.addMapKey("strongKey", "The strongly held key.", false);
WeakStrongMapConfig.lock();

export default WeakStrongMapConfig;
