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

/**
 * Evaluate a callback asynchronously for every element of an array, sequentially.
 *
 * @param {*[]} elementArray The array of objects to pass into the callback.
 * @param {Function} callback The callback function.
 * @returns {Promise} Resolved if the sequence passes.
 * @see {Promise.all}
 * @see {Array.prototype.reduce}
 */
export async function PromiseAllSequence(
  elementArray: any[],
  callback: (value: any) => any
) : Promise<any>
{
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
export async function PromiseAllParallel(
  elementArray: any[],
  callback: (value: any) => any
) : Promise<any>
{
  return Promise.all(elementArray.map(element => callback(element)));
}
