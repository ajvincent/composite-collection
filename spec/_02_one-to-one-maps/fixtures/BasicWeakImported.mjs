import CollectionConfiguration from "composite-collection/Configuration";

const OneToOneConfig = new CollectionConfiguration("OneToOneWeakImportedMap", "OneToOne");
await OneToOneConfig.configureOneToOne("composite-collection/WeakWeakMap", "key1", {
  pathToBaseModule: "./WeakWeakMap.mjs",
});
OneToOneConfig.lock();

export default OneToOneConfig;
