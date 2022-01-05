import CollectionConfiguration from "composite-collection/Configuration";

const OneToOneSimpleMapConfig = new CollectionConfiguration("OneToOneSimpleMap", "OneToOne");
await OneToOneSimpleMapConfig.configureOneToOne("WeakMap", "key");
OneToOneSimpleMapConfig.lock();

export default OneToOneSimpleMapConfig;
