import CollectionConfiguration from "#source/CollectionConfiguration.mjs";
import InMemoryDriver from "#source/InMemoryDriver.mjs";

import tempDirWithCleanup from "#source/utilities/tempDirWithCleanup.mjs";

import path from "path";
import url from "url";

const key8 = {}, key4 = {}, key2 = {}, key1 = {};

describe("Combinations of auto-generated configurations for maps of sets:", () => {
  let cleanup;
  beforeAll(async () => {
    cleanup = await tempDirWithCleanup();
  });

  afterAll(async () => {
    cleanup.resolve();
    return cleanup.promise;
  });

  it("2 part map keys followed by 2 part set keys", async () => {
    const driver = new InMemoryDriver(cleanup.tempDir, {});
    const leafNames = [];

    let generatedCount = 0;
    for (let i = 0; i < 16; i++) {
      let config = null;
      let leafName = "combo_" + i.toString(2).padStart(4, "0");

      const key8Weak = Boolean(i & 8),
            key4Weak = Boolean(i & 4),
            key2Weak = Boolean(i & 2),
            key1Weak = Boolean(i & 1);

      const useStrongMap = !(key8Weak || key4Weak);
      const useStrongSet = !(key2Weak || key1Weak);

      let shouldBuild = expect(() => {
        config = new CollectionConfiguration(
          leafName,
          useStrongMap ? "Map" : "WeakMap",
          useStrongSet ? "Set" : "WeakSet"
        );
      });

      /* You can't have a map of weak sets.
         See https://github.com/ajvincent/composite-collection/issues/41
         See https://github.com/ajvincent/composite-collection/issues/71
      */
      if (useStrongSet)
        shouldBuild = shouldBuild.not;
      shouldBuild.toThrow();

      if (!config) {
        /*
        let diagnostic = "no config";
        diagnostic += ": ";
        diagnostic += key8Weak ? "W" : "S";
        diagnostic += key4Weak ? "W" : "S";
        diagnostic += key2Weak ? "W" : "S";
        diagnostic += key1Weak ? "W" : "S";
        console.log(diagnostic);
        */
        continue;
      }

      try {
        let shouldAddKey, passCount = 0;
        shouldAddKey = expect(() => {
          config.addMapKey("key8", "A key.", key8Weak);
          passCount++;
        });
        // A strong map can't have a weak key.
        if (!useStrongMap || !key8Weak)
          shouldAddKey = shouldAddKey.not;
        shouldAddKey.toThrow();

        shouldAddKey = expect(() => {
          config.addMapKey("key4", "A key.", key4Weak);
          passCount++;
        });
        // A strong map can't have a weak key.
        if (!useStrongMap || !key4Weak)
          shouldAddKey = shouldAddKey.not;
        shouldAddKey.toThrow();

        shouldAddKey = expect(() => {
          config.addSetKey("key2", "A key.", key2Weak);
          passCount++;
        });
        // A strong set can't have a weak key.
        if (!useStrongSet || !key2Weak)
          shouldAddKey = shouldAddKey.not;
        shouldAddKey.toThrow();

        shouldAddKey = expect(() => {
          config.addSetKey("key1", "A key.", key1Weak);
          passCount++;
        });
        // A strong set can't have a weak key.
        if (!useStrongSet || !key1Weak)
          shouldAddKey = shouldAddKey.not;
        shouldAddKey.toThrow();

        if (passCount !== 4)
          continue;
      }
      catch (ex) {
        void(ex);
        /*
        let diagnostic = ConfigurationData.cloneData(config).collectionTemplate;
        diagnostic += ": ";
        diagnostic += key8Weak ? "W" : "S";
        diagnostic += key4Weak ? "W" : "S";
        diagnostic += key2Weak ? "W" : "S";
        diagnostic += key1Weak ? "W" : "S";
        console.log(diagnostic);
        */
        throw ex;
      }

      leafName += ".mjs";

      leafNames.push(leafName);

      driver.addConfiguration(config, leafName);
    }

    await driver.run();

    await Promise.all(leafNames.map(async leafName => {
      const outFilePath = path.join(cleanup.tempDir, leafName);
      const outFileURL = url.pathToFileURL(outFilePath);

      const outModule = (await import(outFileURL)).default;
      expect(typeof outModule).toBe("function");

      const generatedSet = new outModule([
        [key8, key4, key2, key1]
      ]);
      expect(generatedSet.has(key8, key4, key2, key1)).toBe(true);
      generatedCount++;
    }));

    /* Strong map of strong sets: 1
       Strong map of weak sets:   0
       Weak map of strong sets:   3
       Weak map of weak sets:     0
     */
    expect(generatedCount).toBe(4);
  }, 30000);
});
