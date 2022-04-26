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
 * @returns {Promise<*[]>} Resolved if the sequence passes.
 * @see {Promise.all}
 * @see {Array.prototype.reduce}
 */
export async function PromiseAllSequence(elementArray, callback) {
    return await elementArray.reduce(async (previousPromise, element) => {
        const items = await previousPromise;
        items.push(await callback(element));
        return items;
    }, Promise.resolve([]));
}
/**
 * Evaluate a callback asynchronously for every element of an array, in parallel.
 *
 * @param {*[]} elementArray The array of objects to pass into the callback.
 * @param {Function} callback The callback function.
 * @returns {Promise<*[]>} Resolved if the sequence passes.
 * @see {Promise.all}
 * @see {Array.prototype.map}
 */
export async function PromiseAllParallel(elementArray, callback) {
    return Promise.all(elementArray.map(element => callback(element)));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvbWlzZVR5cGVzLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlByb21pc2VUeXBlcy5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUE7Ozs7OztFQU1FO0FBQ0YsTUFBTSxPQUFPLFFBQVE7SUFDbkIsT0FBTyxDQUFxQjtJQUM1QixNQUFNLENBQWtCO0lBQ3hCLE9BQU8sQ0FBYTtJQUVwQjtRQUNFLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxLQUFLLEVBQVEsRUFBRTtZQUM3QixLQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDZCxDQUFDLENBQUM7UUFDRixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsTUFBTSxFQUFRLEVBQUU7WUFDN0IsTUFBTSxNQUFNLENBQUM7UUFDZixDQUFDLENBQUE7UUFDRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ3RDLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1lBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLENBQUMsS0FBSyxVQUFVLGtCQUFrQixDQUN0QyxZQUFtQixFQUNuQixRQUE2QjtJQUc3QixPQUFPLE1BQU0sWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQ2xFLE1BQU0sS0FBSyxHQUFHLE1BQU0sZUFBZSxDQUFDO1FBQ3BDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNwQyxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxDQUFDLEtBQUssVUFBVSxrQkFBa0IsQ0FDdEMsWUFBbUIsRUFDbkIsUUFBNkI7SUFHN0IsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvL1xuZXhwb3J0IHR5cGUgUHJvbWlzZVJlc29sdmVyPFQ+ID0gKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQ7XG5leHBvcnQgdHlwZSBQcm9taXNlUmVqZWN0ZXIgPSAocmVhc29uPzogYW55KSA9PiB2b2lkO1xuXG4vKlxuVHlwZVNjcmlwdCBhcHBhcmVudGx5IGRvZXNuJ3QgcmVjb2duaXplIGFycm93IGZ1bmN0aW9ucyBpbiBjb25zdHJ1Y3RvcnMuXG4gIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgdGhpcy5yZXNvbHZlID0gcmVzO1xuICAgICAgdGhpcy5yZWplY3QgPSByZWo7XG4gIH0pO1xuKi9cbmV4cG9ydCBjbGFzcyBEZWZlcnJlZDxUPiB7XG4gIHJlc29sdmU6IFByb21pc2VSZXNvbHZlcjxUPjtcbiAgcmVqZWN0OiBQcm9taXNlUmVqZWN0ZXI7XG4gIHByb21pc2U6IFByb21pc2U8VD47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5yZXNvbHZlID0gKHZhbHVlKTogdm9pZCA9PiB7XG4gICAgICB2b2lkKHZhbHVlKTtcbiAgICB9O1xuICAgIHRoaXMucmVqZWN0ID0gKHJlYXNvbik6IHZvaWQgPT4ge1xuICAgICAgdGhyb3cgcmVhc29uO1xuICAgIH1cbiAgICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgIHRoaXMucmVzb2x2ZSA9IHJlcztcbiAgICAgIHRoaXMucmVqZWN0ID0gcmVqO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogRXZhbHVhdGUgYSBjYWxsYmFjayBhc3luY2hyb25vdXNseSBmb3IgZXZlcnkgZWxlbWVudCBvZiBhbiBhcnJheSwgc2VxdWVudGlhbGx5LlxuICpcbiAqIEBwYXJhbSB7KltdfSBlbGVtZW50QXJyYXkgVGhlIGFycmF5IG9mIG9iamVjdHMgdG8gcGFzcyBpbnRvIHRoZSBjYWxsYmFjay5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBjYWxsYmFjayBmdW5jdGlvbi5cbiAqIEByZXR1cm5zIHtQcm9taXNlPCpbXT59IFJlc29sdmVkIGlmIHRoZSBzZXF1ZW5jZSBwYXNzZXMuXG4gKiBAc2VlIHtQcm9taXNlLmFsbH1cbiAqIEBzZWUge0FycmF5LnByb3RvdHlwZS5yZWR1Y2V9XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQcm9taXNlQWxsU2VxdWVuY2UoXG4gIGVsZW1lbnRBcnJheTogYW55W10sXG4gIGNhbGxiYWNrOiAodmFsdWU6IGFueSkgPT4gYW55XG4pIDogUHJvbWlzZTxhbnlbXT5cbntcbiAgcmV0dXJuIGF3YWl0IGVsZW1lbnRBcnJheS5yZWR1Y2UoYXN5bmMgKHByZXZpb3VzUHJvbWlzZSwgZWxlbWVudCkgPT4ge1xuICAgIGNvbnN0IGl0ZW1zID0gYXdhaXQgcHJldmlvdXNQcm9taXNlO1xuICAgIGl0ZW1zLnB1c2goYXdhaXQgY2FsbGJhY2soZWxlbWVudCkpO1xuICAgIHJldHVybiBpdGVtcztcbiAgfSwgUHJvbWlzZS5yZXNvbHZlKFtdKSk7XG59XG5cbi8qKlxuICogRXZhbHVhdGUgYSBjYWxsYmFjayBhc3luY2hyb25vdXNseSBmb3IgZXZlcnkgZWxlbWVudCBvZiBhbiBhcnJheSwgaW4gcGFyYWxsZWwuXG4gKlxuICogQHBhcmFtIHsqW119IGVsZW1lbnRBcnJheSBUaGUgYXJyYXkgb2Ygb2JqZWN0cyB0byBwYXNzIGludG8gdGhlIGNhbGxiYWNrLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHJldHVybnMge1Byb21pc2U8KltdPn0gUmVzb2x2ZWQgaWYgdGhlIHNlcXVlbmNlIHBhc3Nlcy5cbiAqIEBzZWUge1Byb21pc2UuYWxsfVxuICogQHNlZSB7QXJyYXkucHJvdG90eXBlLm1hcH1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFByb21pc2VBbGxQYXJhbGxlbChcbiAgZWxlbWVudEFycmF5OiBhbnlbXSxcbiAgY2FsbGJhY2s6ICh2YWx1ZTogYW55KSA9PiBhbnlcbikgOiBQcm9taXNlPGFueVtdPlxue1xuICByZXR1cm4gUHJvbWlzZS5hbGwoZWxlbWVudEFycmF5Lm1hcChlbGVtZW50ID0+IGNhbGxiYWNrKGVsZW1lbnQpKSk7XG59XG4iXX0=