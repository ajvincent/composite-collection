import CollectionConfiguration from "composite-collection/Configuration";

const StrongStrongSetConfig = new CollectionConfiguration("StrongStrongSet", "Set");
StrongStrongSetConfig.addSetKey("key1", "The first key.", false);
StrongStrongSetConfig.addSetKey("key2", "The second key.", false);
StrongStrongSetConfig.lock();

export default StrongStrongSetConfig;
