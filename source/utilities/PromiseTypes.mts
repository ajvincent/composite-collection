//
export type PromiseResolver<T> = (value: T | PromiseLike<T>) => void;
export type PromiseRejecter = (reason?: any) => void;

/*
TypeScript apparently doesn't recognize arrow functions in constructors.
  this.promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
  });
*/
export class Deferred<T> {
  resolve: PromiseResolver<T>;
  reject: PromiseRejecter;
  promise: Promise<T>;

  constructor() {
    this.resolve = (value) => {
      void(value);
    };
    this.reject = (reason) => {
      void(reason);
    }
    this.promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }
}

export class CompletionPromise {
  #abortException: Error | null = null;

  #completionPromise: Readonly<Promise<string>>;

  constructor(startPromise: Promise<any>, resolver: ((value: any) => any)) {
    this.#completionPromise = startPromise.then(resolver).catch(
      abortException => this.abort(abortException)
    );
  }

  get completionPromise(): Promise<string> {
    return this.#completionPromise;
  }

  /**
   * Abort processing and forward the exception.
   *
   * @param {Error} exception The rejection value.
   * @throws
   */
  async abort(exception: Error) {
    this.#abortException = exception;
    throw exception;
  }

  /** @type {Error | null} */
  get abortException(): Error | null {
    return this.#abortException;
  }
}
