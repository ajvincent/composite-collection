import CollectionConfiguration from "composite-collection/Configuration";

const OneToOneStrongMapConfig = new CollectionConfiguration("OneToOneStrongMap", "OneToOne");
await OneToOneStrongMapConfig.configureOneToOne("composite-collection/WeakStrongMap", "weakKey", {
  // true means Object(value) === value
  valuesMustBeObjects: false,

  // true means hold all values as keys in #strongValueToInternalKeyMap
  holdValuesStrongly: false,

  // include if you want to import the module instead of having it inline.
  pathToBaseModule: "./WeakStrongMap.mjs",
});
OneToOneStrongMapConfig.lock();

export default OneToOneStrongMapConfig;
