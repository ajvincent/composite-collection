import CollectionConfiguration from "#source/CollectionConfiguration.mjs";

const collection = new CollectionConfiguration("SM1_SS2", "Map", "Set");

collection.addMapKey("map1", "The first strong map key", false);

collection.addSetKey("set1", "The first strong set key", false);
collection.addSetKey("set2", "The second strong set key", false);

export default collection;
