import CollectionConfiguration from "composite-collection/Configuration";

const StrongStrongMapSpec = new CollectionConfiguration("StrongStrongMap");
StrongStrongMapSpec.addMapKey("key1", false);
StrongStrongMapSpec.addMapKey("key2", false);

export default StrongStrongMapSpec;
