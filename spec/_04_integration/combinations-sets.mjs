import CollectionConfiguration from "#source/CollectionConfiguration.mjs";
import InMemoryDriver from "#source/InMemoryDriver.mjs";

import tempDirWithCleanup from "#source/utilities/tempDirWithCleanup.mjs";

import path from "path";
import url from "url";

const  key4 = {}, key2 = {}, key1 = {};

describe("Combinations of auto-generated configurations for sets:", () => {
  let cleanup;
  beforeAll(async () => {
    cleanup = await tempDirWithCleanup();
  });

  afterAll(async () => {
    cleanup.resolve();
    return cleanup.promise;
  });

  it("3 part keys", async () => {
    const driver = new InMemoryDriver(cleanup.tempDir, {});
    const leafNames = [];

    for (let i = 0; i < 8; i++) {
      let leafName = "combo_" + i.toString(2);
      const config = new CollectionConfiguration(leafName, i === 0 ? "Set" : "WeakSet");
      config.addSetKey("key4", "A key.", Boolean(i & 4));
      config.addSetKey("key2", "A key.", Boolean(i & 2));
      config.addSetKey("key1", "A key.", Boolean(i & 1));

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
        [key4, key2, key1]
      ]);
      expect(generatedSet.has(key4, key2, key1)).toBe(true);
    }));
  }, 30000);
});
