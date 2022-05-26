import CollectionConfiguration from "#source/CollectionConfiguration.mjs";
//import ConfigurationData from "../../source/generatorTools/ConfigurationData.mjs";
import CodeGenerator from "#source/CodeGenerator.mjs";

import tempDirWithCleanup from "#source/utilities/tempDirWithCleanup.mjs";

import fs from "fs/promises";
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
    for (let i = 0; i < 8; i++) {
      let leafName = "combo_" + i.toString(2);
      const config = new CollectionConfiguration(leafName, i === 0 ? "Set" : "WeakSet");
      config.addSetKey("key4", "A key.", Boolean(i & 4));
      config.addSetKey("key2", "A key.", Boolean(i & 2));
      config.addSetKey("key1", "A key.", Boolean(i & 1));

      leafName += ".mjs";
      const outFilePath = path.join(cleanup.tempDir, leafName);

      const generator = new CodeGenerator(config, outFilePath);
      await generator.run();

      const outFileURL = url.pathToFileURL(outFilePath);

      const outModule = (await import(outFileURL)).default;
      expect(typeof outModule).toBe("function");

      const generatedSet = new outModule([
        [key4, key2, key1]
      ]);
      expect(generatedSet.has(key4, key2, key1)).toBe(true);

      await fs.rm(outFilePath);
    }
  }, 30000);
});
