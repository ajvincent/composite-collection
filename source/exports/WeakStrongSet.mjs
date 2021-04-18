import CollectionConfiguration from "composite-collection/Configuration";

const WeakStrongSetConfig = new CollectionConfiguration("WeakStrongSet", "WeakSet");
WeakStrongSetConfig.addSetKey("weakKey", true);
WeakStrongSetConfig.addSetKey("strongKey", false);

export default WeakStrongSetConfig;
