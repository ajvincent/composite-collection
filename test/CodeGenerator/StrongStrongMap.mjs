import CodeGenerator from "../../source/CodeGenerator.mjs";
import url from "url";
import fs from "fs/promises";

const targetPath = "../generated/StrongStrongMap.mjs";
const targetFile = new URL(targetPath, import.meta.url).pathname;

describe("CodeGenerator(StrongStrongMap.mjs), ", () => {
  it("creates ./test/generated/StrongStrongMap.mjs", async () => {
    const sourcePath = "./test/fixtures/StrongStrongMap.mjs";
    const sourceFileURL = url.pathToFileURL(sourcePath);
    const StrongStringMapSpec = (await import(sourceFileURL)).default;

    let resolve;
    let p = new Promise(res => resolve = res);
    const generator = new CodeGenerator(StrongStringMapSpec, targetFile, p);

    resolve();
    await generator.completionPromise;
  }, 1000 * 60 * 60);

  /*
  afterAll(async () => {
    await fs.rm(targetFile);
  });
  */
});
