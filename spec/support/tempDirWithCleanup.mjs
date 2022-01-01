import fs from "fs/promises";
import path from "path";
import os from "os";

export default async function tempDirWithCleanup() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "composite-collection-"));
  let resolve;
  let promise = new Promise(res => resolve = res);
  promise = promise.then(() => fs.rm(tempDir, { recursive: true }));

  return {
    tempDir,
    resolve,
    promise,
  };
}
