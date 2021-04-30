import CollectionConfiguration from "composite-collection/Configuration";

const SoloWeakSetConfig = new CollectionConfiguration("SoloWeakSet", "WeakSet");
SoloWeakSetConfig.addSetKey("key", true);
export default SoloWeakSetConfig;
