import CollectionConfiguration from "composite-collection/Configuration";
import SoloWeakMapConfig from "#spec/_01_collection-generator/fixtures/WeakStrongMapImportable.mjs";

const OneToOneConfig = new CollectionConfiguration("OneToOneWeakImportedMap", "OneToOne");
await OneToOneConfig.configureOneToOne(SoloWeakMapConfig, "key1", {
  pathToBaseModule: "#spec/_01_collection-generator/generated/WeakStrongMapImportable.mjs",
});
OneToOneConfig.lock();

export default OneToOneConfig;
