import CollectionConfiguration from "#source/CollectionConfiguration.mjs";

const collection = new CollectionConfiguration("WM2_SS1", "WeakMap", "Set");

collection.addMapKey("map1", "The weak map key", true);
collection.addMapKey("map2", "The strong map key", false);

collection.addSetKey("set1", "The first strong set key", false);

export default collection;
