import CollectionConfiguration from "composite-collection/Configuration";

const SoloWeakMapConfig = new CollectionConfiguration("SoloWeakMap", "WeakMap");
SoloWeakMapConfig.addMapKey("key", true);

export default SoloWeakMapConfig;
