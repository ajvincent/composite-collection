import CollectionConfiguration from "composite-collection/Configuration";
import ConfigurationData from "#source/generatorTools/ConfigurationData.mjs";

describe("CodeGenerator(OneToOneMap) rejects base configurations for ", () => {
  /**
   * Test that a particular CollectionConfiguration is an invalid base for one-to-one map collections.
   *
   * @param {string} className  The class to load.
   * @param {boolean} useModule True if we should load the module.
   * @param {Function} getKey   A callback to get the private key name for the one-to-one map.
   */
  function moduleSpec(className, useModule, getKey) {
    it(className, async () => {
      const baseConfig = useModule ? (await import(`#spec/_01_collection-generator/configurations/${className}.mjs`)).default : className;

      const config = new CollectionConfiguration("IllegalOneToOneMap", "OneToOne");
      const key = getKey(ConfigurationData.cloneData(baseConfig) || "");

      try {
        await expectAsync(
          config.configureOneToOne(baseConfig || className, key)
        ).toBeRejectedWithError(
          "The base configuration must be a WeakMap CollectionConfiguration, 'WeakMap', 'composite-collection/WeakStrongMap', or 'composite-collection/WeakWeakMap'!",
        );
      }
      catch (ex) {
        console.log("Failed on " + className)
        throw ex;
      }
    });
  }

  moduleSpec("SoloStrongMap", true, data => data.strongMapKeys[0]);

  moduleSpec("SoloStrongSet", true, data => data.strongSetElements[0]);

  moduleSpec("SoloWeakSet", true, data => data.weakSetElements[0]);

  moduleSpec("Map", false, () => "key");

  moduleSpec("StrongStrongMapImportable", true, data => data.strongMapKeys[0]);

  moduleSpec("StrongStrongSetImportable", true, data => data.strongSetElements[0]);

  moduleSpec("composite-collection/StrongStrongMap", false, () => "key1");

  moduleSpec("composite-collection/StrongStrongSet", false, () => "key1");

  moduleSpec("composite-collection/WeakStrongSet", false, () => "weakKey");
});
