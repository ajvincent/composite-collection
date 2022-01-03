/* XXX ajvincent This export cannot work.  StrongMapOfWeakSets is illegal.  See CollectionConfiguration. */

import CollectionConfiguration from "composite-collection/Configuration";

const StrongMapOfWeakSetsConfig = new CollectionConfiguration("StrongMapOfWeakSets", "Map", "WeakSet");
StrongMapOfWeakSetsConfig.addMapKey("mapKey", false);
StrongMapOfWeakSetsConfig.addSetKey("setKey", true);
StrongMapOfWeakSetsConfig.lock();

export default StrongMapOfWeakSetsConfig;
