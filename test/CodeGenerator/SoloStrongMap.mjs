import url from "url";
import path from "path";

describe("CodeGenerator(SoloStrongMap.mjs), ", () => {
  it("we can import the specification module", async () => {
    const relativePath = "./test/fixtures/SoloStrongMap.mjs";
    const fileURL = url.pathToFileURL(relativePath);
    const SoloStringMapSpec = (await import(fileURL)).default;
  }, 1000 * 60 * 60);
});
