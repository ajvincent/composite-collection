import CollectionConfiguration from "composite-collection/Configuration";

const OneToOneConfig = new CollectionConfiguration("OneToOneBasicInlineMap", "OneToOne");
await OneToOneConfig.configureOneToOne("WeakMap", "key", {
  // true means Object(value) === value
  valuesMustBeObjects: false,

  // true means hold all values as keys in #strongValueToInternalKeyMap
  holdValuesStrongly: false,
});
OneToOneConfig.lock();

export default OneToOneConfig;
