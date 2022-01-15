// WeakWeakMap, MockImportable
import CollectionConfiguration from "composite-collection/Configuration";
import MockImportable from "#spec/_01_collection-generator/fixtures/MockImportable.mjs";

const WeakStrongMapImportable = new CollectionConfiguration("WeakStrongMapImportable", "WeakMap");
WeakStrongMapImportable.importLines(
  `import MockImportable from "#spec/_01_collection-generator/fixtures/MockImportable.mjs";`
);

WeakStrongMapImportable.addMapKey("privateKey", "The private key.", true);

WeakStrongMapImportable.addMapKey("publicKey", "The public key.", false, {
  argumentType: "MockImportable",
  argumentValidator: function(publicKey) {
    if (!(publicKey instanceof MockImportable))
      return false;
  },
});

WeakStrongMapImportable.setValueType("MockImportable", "The value", function(value) {
  if (!(value instanceof MockImportable))
    return false;
});

WeakStrongMapImportable.lock();

const OneToOneConfig = new CollectionConfiguration("OneToOneWeakImportedMap", "OneToOne");
await OneToOneConfig.configureOneToOne(WeakStrongMapImportable, "privateKey");
OneToOneConfig.lock();

export default OneToOneConfig;