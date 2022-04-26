export declare type PromiseResolver<T> = (value: T | PromiseLike<T>) => void;
export declare type PromiseRejecter = (reason?: any) => void;
export declare class Deferred<T> {
    resolve: PromiseResolver<T>;
    reject: PromiseRejecter;
    promise: Promise<T>;
    constructor();
}
/**
 * Evaluate a callback asynchronously for every element of an array, sequentially.
 *
 * @param {*[]} elementArray The array of objects to pass into the callback.
 * @param {Function} callback The callback function.
 * @returns {Promise<*[]>} Resolved if the sequence passes.
 * @see {Promise.all}
 * @see {Array.prototype.reduce}
 */
export declare function PromiseAllSequence(elementArray: any[], callback: (value: any) => any): Promise<any[]>;
/**
 * Evaluate a callback asynchronously for every element of an array, in parallel.
 *
 * @param {*[]} elementArray The array of objects to pass into the callback.
 * @param {Function} callback The callback function.
 * @returns {Promise<*[]>} Resolved if the sequence passes.
 * @see {Promise.all}
 * @see {Array.prototype.map}
 */
export declare function PromiseAllParallel(elementArray: any[], callback: (value: any) => any): Promise<any[]>;
