export default class CompletionPromise {
  /**
   * @type {*}
   * @private
   */
  #abortException = null;

  /**
   * @type {Promise<string, Error>}
   * @readonly
   * @private
   */
  #completionPromise;

  constructor(startPromise, resolver) {
    if (!(startPromise instanceof Promise))
      throw new Error("startPromise must be a Promise!");

    this.#completionPromise = startPromise.then(resolver).catch(
      abortException => this.abort(abortException)
    );
  }

  /**
   * @returns {Promise<string, Error>}
   */
  get completionPromise() {
    return this.#completionPromise;
  }

  /**
   * Abort processing and forward the exception.
   * @param {Error} exception
   * @throws
   */
  async abort(exception) {
    this.#abortException = exception;
    throw exception;
  }

  /**
   * @returns {Error?}
   */
  get abortException() {
    return this.#abortException;
  }
}
