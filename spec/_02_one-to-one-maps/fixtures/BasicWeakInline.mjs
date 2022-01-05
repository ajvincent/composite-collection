import CollectionConfiguration from "composite-collection/Configuration";

const OneToOneConfig = new CollectionConfiguration("OneToOneWeakInlineMap", "OneToOne");
await OneToOneConfig.configureOneToOne("composite-collection/WeakWeakMap", "key1");
OneToOneConfig.lock();

export default OneToOneConfig;
