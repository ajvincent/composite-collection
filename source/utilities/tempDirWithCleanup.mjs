import fs from "fs/promises";
import path from "path";
import os from "os";
import { Deferred, } from "./PromiseTypes.mjs";
/** Create a temporary directory with a promise to clean it up later. */
export default async function tempDirWithCleanup() {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "composite-collection-"));
    const { resolve, promise } = new Deferred;
    return {
        tempDir,
        resolve,
        promise: promise.then(() => fs.rm(tempDir, { recursive: true })),
    };
}
//# sourceMappingURL=tempDirWithCleanup.mjs.map