import CollectionConfiguration from "composite-collection/Configuration";

describe("CodeGenerator(OneToOneMap) rejects base configurations for ", () => {
  function moduleSpec(className, useModule, getKey) {
    it(className, async () => {
      const baseConfig = useModule ? (await import(`#spec/_01_collection-generator/configurations/${className}.mjs`)).default : className;

      const config = new CollectionConfiguration("IllegalOneToOneMap", "OneToOne");
      const key = getKey(baseConfig.cloneData ? baseConfig.cloneData() : "");

      await expectAsync(
        config.configureOneToOne(baseConfig || className, key)
      ).toBeRejectedWithError(
        "The base configuration must be a WeakMap CollectionConfiguration, 'WeakMap', 'composite-collection/WeakStrongMap', or 'composite-collection/WeakWeakMap'!"
      );
    });
  }

  moduleSpec("SoloStrongMap", true, config => config.strongMapKeys[0]);

  moduleSpec("SoloStrongSet", true, config => config.strongSetElements[0]);

  moduleSpec("SoloWeakSet", true, config => config.weakSetElements[0]);

  moduleSpec("Map", false, () => "key");

  moduleSpec("StrongStrongMapImportable", true, config => config.strongMapKeys[0]);

  moduleSpec("StrongStrongSetImportable", true, config => config.strongSetElements[0]);

  moduleSpec("composite-collection/StrongStrongMap", false, () => "key1");

  moduleSpec("composite-collection/StrongStrongSet", false, () => "key1");

  moduleSpec("composite-collection/WeakStrongSet", false, () => "weakKey");
});
