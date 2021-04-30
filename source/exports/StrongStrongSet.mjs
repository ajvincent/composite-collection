import CollectionConfiguration from "composite-collection/Configuration";

const StrongStrongSetConfig = new CollectionConfiguration("StrongStrongSet", "Set");
StrongStrongSetConfig.addSetKey("key1", false);
StrongStrongSetConfig.addSetKey("key2", false);

export default StrongStrongSetConfig;
