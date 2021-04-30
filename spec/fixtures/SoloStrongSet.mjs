import CollectionConfiguration from "composite-collection/Configuration";

const SoloStrongSetConfig = new CollectionConfiguration("SoloStrongSet", "Set");
SoloStrongSetConfig.addSetKey("key", false);
export default SoloStrongSetConfig;
