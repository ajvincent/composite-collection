import CollectionConfiguration from "composite-collection/Configuration";

const StrongStrongMapConfig = new CollectionConfiguration("StrongStrongMap", "Map");
StrongStrongMapConfig.addMapKey("key1", false);
StrongStrongMapConfig.addMapKey("key2", false);

export default StrongStrongMapConfig;
