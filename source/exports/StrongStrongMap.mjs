import CollectionConfiguration from "composite-collection/Configuration";

const StrongStrongMapConfig = new CollectionConfiguration("StrongStrongMap", "Map");
StrongStrongMapConfig.addMapKey("key1", "The first key.", false);
StrongStrongMapConfig.addMapKey("key2", "The second key.", false);
StrongStrongMapConfig.lock();

export default StrongStrongMapConfig;
