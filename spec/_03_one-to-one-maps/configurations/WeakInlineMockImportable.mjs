// WeakWeakMap, MockImportable
import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "../../_01_collection-generator/fixtures/MockImportable.mjs";

const WeakWeakMapImportable = new CollectionConfiguration("WeakWeakMapImportable", "WeakMap");
WeakWeakMapImportable.importLines(
  `import MockImportable from "../../_01_collection-generator/fixtures/MockImportable.mjs";`
);

WeakWeakMapImportable.addMapKey("privateKey", "The private key.", true);

WeakWeakMapImportable.addMapKey("publicKey", "The public key.", true, {
  jsDocType: "MockImportable",
  argumentValidator: function(publicKey) {
    if (!(publicKey instanceof MockImportable))
      return false;
  },
});

WeakWeakMapImportable.setValueType("The value", {
  jsDocType: "MockImportable",
  argumentValidator: function(value) {
    if (!(value instanceof MockImportable))
      return false;
  }
});

WeakWeakMapImportable.lock();

const OneToOneConfig = new CollectionConfiguration("OneToOneWeakImportedMap", "OneToOne");
await OneToOneConfig.configureOneToOne(WeakWeakMapImportable, "privateKey");
OneToOneConfig.lock();

export default OneToOneConfig;
