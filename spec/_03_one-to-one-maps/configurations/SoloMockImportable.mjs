import CollectionConfiguration from "composite-collection/Configuration";
import SoloWeakMapConfig from "../../_01_collection-generator/configurations/SoloWeakMap.mjs";

const OneToOneConfig = new CollectionConfiguration("OneToOneWeakImportedMap", "OneToOne");

OneToOneConfig.importLines(`
void(MockImportable);
`);

await OneToOneConfig.configureOneToOne(SoloWeakMapConfig, "key", {
  pathToBaseModule: "../../_01_collection-generator/generated/SoloWeakMap.mjs",
});
OneToOneConfig.lock();

export default OneToOneConfig;
