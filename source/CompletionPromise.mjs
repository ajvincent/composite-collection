export default class CompletionPromise {
  /**
   * @type {*}
   */
  #abortException = null;

  /**
   * @type {Promise<string, Error>}
   * @readonly
   */
  #completionPromise;

  constructor(startPromise, resolver) {
    if (!(startPromise instanceof Promise))
      throw new Error("startPromise must be a Promise!");

    this.#completionPromise = startPromise.then(resolver).catch(
      abortException => this.abort(abortException)
    );
  }

  /** @type {Promise<string, Error>} */
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

  /** @type {Error?} */
  get abortException() {
    return this.#abortException;
  }
}
