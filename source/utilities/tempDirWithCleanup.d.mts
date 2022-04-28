import type { PromiseResolver } from "./PromiseTypes.mjs";
/**
 * @typedef {object} TemporaryDirWithPromise
 * @property {string}   tempDir The directory's full path.
 * @property {Function} resolve The resolver for the cleanup promise.
 * @property {Promise}  promise The cleanup promise.
 */
export declare abstract class TemporaryDirWithPromise {
    tempDir: string;
    resolve: PromiseResolver<unknown>;
    promise: Promise<unknown>;
    constructor();
}
/**
 * Create a temporary directory with a promise to clean it up later.
 *
 * @returns {TemporaryDirWithPromise} The directory and promise.
 */
export default function tempDirWithCleanup(): Promise<TemporaryDirWithPromise>;
