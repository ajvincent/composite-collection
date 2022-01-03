import CollectionConfiguration from "composite-collection/Configuration";

const OneToOneConfig = new CollectionConfiguration("OneToOneStrongInlineMap", "OneToOne");
await OneToOneConfig.configureOneToOne("composite-collection/WeakStrongMap", "weakKey", {
  // true means Object(value) === value
  valuesMustBeObjects: false,

  // true means hold all values as keys in #strongValueToInternalKeyMap
  holdValuesStrongly: false,
});
OneToOneConfig.lock();

export default OneToOneConfig;
