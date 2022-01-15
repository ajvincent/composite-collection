import CollectionConfiguration from "composite-collection/Configuration";

const OneToOneConfig = new CollectionConfiguration("OneToOneBasicInlineMap", "OneToOne");
await OneToOneConfig.configureOneToOne("WeakMap", "key");
OneToOneConfig.lock();

export default OneToOneConfig;
