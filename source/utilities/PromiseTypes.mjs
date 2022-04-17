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
            void (reason);
        };
        this.promise = new Promise((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
    }
}
export class CompletionPromise {
    #abortException = null;
    #completionPromise;
    constructor(startPromise, resolver) {
        this.#completionPromise = startPromise.then(resolver).catch(abortException => this.abort(abortException));
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
    async abort(exception) {
        this.#abortException = exception;
        throw exception;
    }
    /** @type {Error | null} */
    get abortException() {
        return this.#abortException;
    }
}
//# sourceMappingURL=PromiseTypes.mjs.map