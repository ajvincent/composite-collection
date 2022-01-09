import CollectionConfiguration from "composite-collection/Configuration";

const WeakStrongSetConfig = new CollectionConfiguration("WeakStrongSet", "WeakSet");
WeakStrongSetConfig.addSetKey("weakKey", "The weakly held key.", true);
WeakStrongSetConfig.addSetKey("strongKey", "The strongly held key.", false);
WeakStrongSetConfig.lock();

export default WeakStrongSetConfig;
