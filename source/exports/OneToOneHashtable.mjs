import CollectionConfiguration from "composite-collection/Configuration";

const OneToOneConfig = new CollectionConfiguration("OneToOneMap", "OneToOne");
OneToOneConfig.configureOneToOne("composite-collection/WeakStrongMap", "weakKey", {
  // true means Object(value) === value
  valuesMustBeObjects: true,

  // true means hold all values as keys in #strongValueToInternalKeyMap
  holdValuesStrongly: false,
});
OneToOneConfig.lock();

export default OneToOneConfig;
