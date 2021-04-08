import CodeGenerator from "../../source/CodeGenerator.mjs";
import url from "url";
import fs from "fs/promises";

const targetPath = "../generated/SoloStrongMap.mjs";
const targetFile = new URL(targetPath, import.meta.url).pathname;

describe("CodeGenerator(SoloStrongMap.mjs), ", () => {
  it("creates ./test/generated/SoloStrongMap.mjs", async () => {
    const sourcePath = "./test/fixtures/SoloStrongMap.mjs";
    const sourceFileURL = url.pathToFileURL(sourcePath);
    const SoloStringMapSpec = (await import(sourceFileURL)).default;

    let resolve;
    let p = new Promise(res => resolve = res);
    const generator = new CodeGenerator(SoloStringMapSpec, targetFile, p);

    resolve();
    await generator.completionPromise;
  }, 1000 * 60 * 60);

  /*
  afterAll(async () => {
    await fs.rm(targetFile);
  });
  */
});
