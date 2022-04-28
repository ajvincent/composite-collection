import fs from "fs/promises";
import path from "path";
import os from "os";
import { Deferred } from "./PromiseTypes.mjs";
/**
 * @typedef {object} TemporaryDirWithPromise
 * @property {string}   tempDir The directory's full path.
 * @property {Function} resolve The resolver for the cleanup promise.
 * @property {Promise}  promise The cleanup promise.
 */
export class TemporaryDirWithPromise {
    tempDir = "";
    resolve;
    promise;
    constructor() {
        let { resolve, promise } = new Deferred;
        this.resolve = resolve;
        this.promise = promise;
    }
}
void (TemporaryDirWithPromise);
/**
 * Create a temporary directory with a promise to clean it up later.
 *
 * @returns {TemporaryDirWithPromise} The directory and promise.
 */
export default async function tempDirWithCleanup() {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "composite-collection-"));
    let { resolve, promise } = new Deferred;
    promise = promise.then(() => fs.rm(tempDir, { recursive: true }));
    return {
        tempDir,
        resolve,
        promise,
    };
}
//# sourceMappingURL=tempDirWithCleanup.mjs.map