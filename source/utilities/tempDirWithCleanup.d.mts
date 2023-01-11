import { type PromiseResolver } from "./PromiseTypes.mjs";
export declare type TemporaryDirWithPromise = {
    /** The directory's full path. */
    tempDir: string;
    /** The resolver for the cleanup promise. */
    resolve: PromiseResolver<unknown>;
    /** The cleanup promise. */
    promise: Promise<unknown>;
};
/** Create a temporary directory with a promise to clean it up later. */
export default function tempDirWithCleanup(): Promise<TemporaryDirWithPromise>;
