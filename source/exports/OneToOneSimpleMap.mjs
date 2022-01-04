import CollectionConfiguration from "composite-collection/Configuration";

const OneToOneSimpleMapConfig = new CollectionConfiguration("OneToOneSimpleMap", "OneToOne");
await OneToOneSimpleMapConfig.configureOneToOne("WeakMap", "key", {
  // true means Object(value) === value
  valuesMustBeObjects: true,

  // true means hold all values as keys in #strongValueToInternalKeyMap
  holdValuesStrongly: false,

  /* This doesn't apply in the WeakMap case.
  // include if you want to import the module instead of having it inline.
  pathToBaseModule: "./WeakStrongMap.mjs",
  */
});
OneToOneSimpleMapConfig.lock();

export default OneToOneSimpleMapConfig;
