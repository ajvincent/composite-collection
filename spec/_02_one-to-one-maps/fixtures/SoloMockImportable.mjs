import CollectionConfiguration from "composite-collection/Configuration";
import SoloWeakMapConfig from "#spec/_01_collection-generator/fixtures/SoloWeakMap.mjs";

const OneToOneConfig = new CollectionConfiguration("OneToOneWeakImportedMap", "OneToOne");
await OneToOneConfig.configureOneToOne(SoloWeakMapConfig, "key", {
  pathToBaseModule: "#spec/_01_collection-generator/generated/SoloWeakMap.mjs",
});
OneToOneConfig.lock();

export default OneToOneConfig;
