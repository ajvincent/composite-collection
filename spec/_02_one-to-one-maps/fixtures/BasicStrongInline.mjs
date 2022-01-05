import CollectionConfiguration from "composite-collection/Configuration";

const OneToOneConfig = new CollectionConfiguration("OneToOneStrongInlineMap", "OneToOne");
await OneToOneConfig.configureOneToOne("composite-collection/WeakStrongMap", "weakKey");
OneToOneConfig.lock();

export default OneToOneConfig;
