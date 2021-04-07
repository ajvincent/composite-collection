import CollectionCompiler from "composite-collection";

import fs from "fs/promises";
import os from "os";
import path from "path";

describe("Integration tests: Driver", () => {
  it("works at a basic level", async () => {
    const destDir = await fs.mkdtemp(path.join(os.tmpdir(), 'foo-'))

    const compiler = new CollectionCompiler("./test/fixtures/", destDir);
    try {
      compiler.start();
      await compiler.completionPromise;
    }
    finally {
      await fs.rmdir(destDir, { recursive: true });
    }
  });
});
