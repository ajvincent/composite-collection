import CollectionConfiguration from "#source/CollectionConfiguration.mjs";
import CodeGenerator from "#source/CodeGenerator.mjs";

import tempDirWithCleanup from "#support/tempDirWithCleanup.mjs";

import fs from "fs/promises";
import path from "path";
import url from "url";

const key8 = {}, key4 = {}, key2 = {}, key1 = {}, value = {};

describe("Combinations of auto-generated configurations:", () => {
  let cleanup, filesCopied = null;
  beforeAll(async () => {
    cleanup = await tempDirWithCleanup();

    filesCopied = Promise.all([
      "keys/Hasher.mjs",
      "keys/Composite.mjs",
    ].map(async leafName => {
      const sourceFile = path.join(process.cwd(), "source", "exports", leafName);
      const targetFile = path.join(cleanup.tempDir, leafName);
      await fs.mkdir(path.dirname(targetFile), { recursive: true });
      await fs.copyFile(sourceFile, targetFile);
    }));
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

      const generatedMap = new outModule([
        [key4, key2, key1, value],
      ]);
      expect(generatedMap.has(key4, key2, key1)).toBe(true);
      expect(generatedMap.get(key4, key2, key1)).toBe(value);

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

      const generatedSet = new outModule([
        [key4, key2, key1]
      ]);
      expect(generatedSet.has(key4, key2, key1)).toBe(true);

      await fs.rm(outFilePath);
    }
  });

  it("2 part map keys followed by 2 part set keys", async () => {
    await filesCopied;

    let generatedCount = 0;
    for (let i = 0; i < 16; i++) {
      let config = null;
      let leafName = "combo_" + i.toString(2);

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

      // You can't have a strong map of weak sets.  See https://github.com/ajvincent/composite-collection/issues/41
      if (!useStrongMap || useStrongSet)
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
          config.addMapKey("key8", key8Weak);
          passCount++;
        });
        // A strong map can't have a weak key.
        if (!useStrongMap || !key8Weak)
          shouldAddKey = shouldAddKey.not;
        shouldAddKey.toThrow();

        shouldAddKey = expect(() => {
          config.addMapKey("key4", key4Weak);
          passCount++;
        });
        // A strong map can't have a weak key.
        if (!useStrongMap || !key4Weak)
          shouldAddKey = shouldAddKey.not;
        shouldAddKey.toThrow();

        shouldAddKey = expect(() => {
          config.addSetKey("key2", key2Weak);
          passCount++;
        });
        // A strong set can't have a weak key.
        if (!useStrongSet || !key2Weak)
          shouldAddKey = shouldAddKey.not;
        shouldAddKey.toThrow();

        shouldAddKey = expect(() => {
          config.addSetKey("key1", key1Weak);
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
        let diagnostic = config.cloneData().collectionTemplate;
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
      const outFilePath = path.join(cleanup.tempDir, leafName);

      let start;
      const p = new Promise(res => start = res);
      const generator = new CodeGenerator(config, outFilePath, p);
      start();
      await generator.completionPromise;

      const outFileURL = url.pathToFileURL(outFilePath);

      const outModule = (await import(outFileURL)).default;
      expect(typeof outModule).toBe("function");

      const generatedSet = new outModule([
        [key8, key4, key2, key1]
      ]);
      expect(generatedSet.has(key8, key4, key2, key1)).toBe(true);

      await fs.rm(outFilePath);
      generatedCount++;
    }

    /* Strong map of strong sets: 1
       Strong map of weak sets:   0
       Weak map of strong sets:   3
       Weak map of weak sets:     9
     */
    expect(generatedCount).toBe(13);
  });
});