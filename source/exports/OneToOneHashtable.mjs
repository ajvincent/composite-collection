import CollectionConfiguration from "composite-collection/Configuration";

const OneToOneConfig = new CollectionConfiguration("OneToOneMap", "OneToOne");
await OneToOneConfig.configureOneToOne("composite-collection/WeakStrongMap", "weakKey", {
  // true means Object(value) === value
  valuesMustBeObjects: true,

  // true means hold all values as keys in #strongValueToInternalKeyMap
  holdValuesStrongly: false,

  // include if you want to import the module instead of having it inline.
  pathToBaseModule: "./WeakStrongMap.mjs",
});
OneToOneConfig.lock();

export default OneToOneConfig;
