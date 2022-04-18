/*
TypeScript apparently doesn't recognize arrow functions in constructors.
  this.promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
  });
*/
export class Deferred {
    resolve;
    reject;
    promise;
    constructor() {
        this.resolve = (value) => {
            void (value);
        };
        this.reject = (reason) => {
            throw reason;
        };
        this.promise = new Promise((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
    }
}
/**
 * Evaluate a callback asynchronously for every element of an array, sequentially.
 *
 * @param {*[]} elementArray The array of objects to pass into the callback.
 * @param {Function} callback The callback function.
 * @returns {Promise} Resolved if the sequence passes.
 * @see {Promise.all}
 * @see {Array.prototype.reduce}
 */
export async function PromiseAllSequence(elementArray, callback) {
    return elementArray.reduce(async (previousPromise, element) => {
        await previousPromise;
        return callback(element);
    }, Promise.resolve());
}
/**
 * Evaluate a callback asynchronously for every element of an array, in parallel.
 *
 * @param {*[]} elementArray The array of objects to pass into the callback.
 * @param {Function} callback The callback function.
 * @returns {Promise} Resolved if the sequence passes.
 * @see {Promise.all}
 * @see {Array.prototype.map}
 */
export async function PromiseAllParallel(elementArray, callback) {
    return Promise.all(elementArray.map(element => callback(element)));
}
export class CompletionPromise {
    #abortException = null;
    #completionPromise;
    constructor(startPromise, resolver) {
        this.#completionPromise = startPromise.then(resolver).catch(abortException => this.#abort(abortException));
    }
    get completionPromise() {
        return this.#completionPromise;
    }
    /**
     * Abort processing and forward the exception.
     *
     * @param {Error} exception The rejection value.
     * @throws
     */
    #abort(exception) {
        this.#abortException = exception;
        throw exception;
    }
    /** @type {Error | null} */
    get abortException() {
        return this.#abortException;
    }
}
//# sourceMappingURL=PromiseTypes.mjs.map