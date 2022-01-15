// WeakWeakMap, MockImportable
import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "#spec/_01_collection-generator/fixtures/MockImportable.mjs";

const WeakWeakMapImportable = new CollectionConfiguration("WeakWeakMapImportable", "WeakMap");
WeakWeakMapImportable.importLines(
  `import MockImportable from "#spec/_01_collection-generator/fixtures/MockImportable.mjs";`
);

WeakWeakMapImportable.addMapKey("privateKey", "The private key.", true);

WeakWeakMapImportable.addMapKey("publicKey", "The public key.", true, {
  argumentType: "MockImportable",
  argumentValidator: function(publicKey) {
    if (!(publicKey instanceof MockImportable))
      return false;
  },
});

WeakWeakMapImportable.setValueType("MockImportable", "The value", function(value) {
  if (!(value instanceof MockImportable))
    return false;
});

WeakWeakMapImportable.lock();

const OneToOneConfig = new CollectionConfiguration("OneToOneWeakImportedMap", "OneToOne");
await OneToOneConfig.configureOneToOne(WeakWeakMapImportable, "privateKey");
OneToOneConfig.lock();

export default OneToOneConfig;
