import CollectionConfiguration from "composite-collection/Configuration";

const OneToOneConfig = new CollectionConfiguration("OneToOneStrongImportedMap", "OneToOne");
await OneToOneConfig.configureOneToOne("composite-collection/WeakStrongMap", "weakKey", {
  pathToBaseModule: "./WeakStrongMap.mjs",
});
OneToOneConfig.lock();

export default OneToOneConfig;
