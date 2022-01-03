import CollectionConfiguration from "composite-collection/Configuration";

const OneToOneConfig = new CollectionConfiguration("OneToOneWeakImportedMap", "OneToOne");
await OneToOneConfig.configureOneToOne("composite-collection/WeakWeakMap", "key1", {
  // true means Object(value) === value
  valuesMustBeObjects: false,

  // true means hold all values as keys in #strongValueToInternalKeyMap
  holdValuesStrongly: false,

  pathToBaseModule: "./WeakWeakMap.mjs",
});
OneToOneConfig.lock();

export default OneToOneConfig;
