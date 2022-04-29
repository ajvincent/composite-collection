import CollectionConfiguration from "#source/CollectionConfiguration.mjs";

const collection = new CollectionConfiguration("WM1_SS2", "WeakMap", "Set");

collection.addMapKey("map1", "The weak map key", true);

collection.addSetKey("set1", "The first strong set key", false);
collection.addSetKey("set2", "The second strong set key", false);

export default collection;
