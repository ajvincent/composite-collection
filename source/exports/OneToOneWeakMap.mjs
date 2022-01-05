import CollectionConfiguration from "composite-collection/Configuration";

const OneToOneWeakMapConfig = new CollectionConfiguration("OneToOneWeakMap", "OneToOne");
await OneToOneWeakMapConfig.configureOneToOne("composite-collection/WeakWeakMap", "key1", {
  // include if you want to import the module instead of having it inline.
  pathToBaseModule: "./WeakWeakMap.mjs",
});
OneToOneWeakMapConfig.lock();

export default OneToOneWeakMapConfig;
