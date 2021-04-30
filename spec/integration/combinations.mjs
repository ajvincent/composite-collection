import CollectionConfiguration from "../../source/CollectionConfiguration.mjs";
import CodeGenerator from "../../source/CodeGenerator.mjs";

import tempDirWithCleanup from "../support/tempDirWithCleanup.mjs";

import fs from "fs/promises";
import path from "path";
import url from "url";

describe("Combinations of auto-generated configurations:", () => {
  let cleanup, filesCopied = null;
  beforeAll(async () => {
    cleanup = await tempDirWithCleanup();

    filesCopied = Promise.all([
      "KeyHasher.mjs",
      "WeakKey-WeakMap.mjs",
      "WeakKey-WeakRef.mjs",
    ].map(leafName => fs.copyFile(
      path.join(process.cwd(), "source", "exports", leafName),
      path.join(cleanup.tempDir, leafName)
    )));
  });

  afterAll(async () => {
    cleanup.resolve();
    return cleanup.promise;
  });

  it("3 part keys of maps", async () => {
    await filesCopied;

    for (let i = 0; i < 8; i++) {
      let leafName = "combo_" + i.toString(2);
      const config = new CollectionConfiguration(leafName, i === 0 ? "Map" : "WeakMap");
      config.addMapKey("key4", Boolean(i & 4));
      config.addMapKey("key2", Boolean(i & 2));
      config.addMapKey("key1", Boolean(i & 1));

      leafName += ".mjs";
      const outFilePath = path.join(cleanup.tempDir, leafName);

      let start;
      let p = new Promise(res => start = res)
      const generator = new CodeGenerator(config, outFilePath, p);
      start();
      await generator.completionPromise;

      const outFileURL = url.pathToFileURL(outFilePath);

      const outModule = (await import(outFileURL)).default;
      expect(typeof outModule).toBe("function");

      await fs.rm(outFilePath);
    }
  });

  it("3 part keys of sets", async () => {
    await filesCopied;

    for (let i = 0; i < 8; i++) {
      let leafName = "combo_" + i.toString(2);
      const config = new CollectionConfiguration(leafName, i === 0 ? "Set" : "WeakSet");
      config.addSetKey("key4", Boolean(i & 4));
      config.addSetKey("key2", Boolean(i & 2));
      config.addSetKey("key1", Boolean(i & 1));

      leafName += ".mjs";
      const outFilePath = path.join(cleanup.tempDir, leafName);

      let start;
      const p = new Promise(res => start = res);
      const generator = new CodeGenerator(config, outFilePath, p);
      start();
      await generator.completionPromise;

      const outFileURL = url.pathToFileURL(outFilePath);

      const outModule = (await import(outFileURL)).default;
      expect(typeof outModule).toBe("function");

      await fs.rm(outFilePath);
    }
  });
});
