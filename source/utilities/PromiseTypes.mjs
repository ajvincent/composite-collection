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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvbWlzZVR5cGVzLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlByb21pc2VUeXBlcy5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUE7Ozs7OztFQU1FO0FBQ0YsTUFBTSxPQUFPLFFBQVE7SUFDbkIsT0FBTyxDQUFxQjtJQUM1QixNQUFNLENBQWtCO0lBQ3hCLE9BQU8sQ0FBYTtJQUVwQjtRQUNFLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxLQUFLLEVBQVEsRUFBRTtZQUM3QixLQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDZCxDQUFDLENBQUM7UUFDRixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsTUFBTSxFQUFRLEVBQUU7WUFDN0IsTUFBTSxNQUFNLENBQUM7UUFDZixDQUFDLENBQUE7UUFDRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ3RDLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1lBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBRUQ7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLENBQUMsS0FBSyxVQUFVLGtCQUFrQixDQUN0QyxZQUFpQixFQUNqQixRQUFrQztJQUdsQyxPQUFPLE1BQU0sWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsZUFBNkIsRUFBRSxPQUFVLEVBQUUsRUFBRTtRQUNuRixNQUFNLEtBQUssR0FBRyxNQUFNLGVBQWUsQ0FBQztRQUNwQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDcEMsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzFCLENBQUM7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sQ0FBQyxLQUFLLFVBQVUsa0JBQWtCLENBQ3RDLFlBQWlCLEVBQ2pCLFFBQWtDO0lBR2xDLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy9cbmV4cG9ydCB0eXBlIFByb21pc2VSZXNvbHZlcjxUPiA9ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB1bmtub3duO1xuZXhwb3J0IHR5cGUgUHJvbWlzZVJlamVjdGVyID0gKHJlYXNvbj86IHVua25vd24pID0+IHVua25vd247XG5cbi8qXG5UeXBlU2NyaXB0IGFwcGFyZW50bHkgZG9lc24ndCByZWNvZ25pemUgYXJyb3cgZnVuY3Rpb25zIGluIGNvbnN0cnVjdG9ycy5cbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICB0aGlzLnJlc29sdmUgPSByZXM7XG4gICAgICB0aGlzLnJlamVjdCA9IHJlajtcbiAgfSk7XG4qL1xuZXhwb3J0IGNsYXNzIERlZmVycmVkPFQ+IHtcbiAgcmVzb2x2ZTogUHJvbWlzZVJlc29sdmVyPFQ+O1xuICByZWplY3Q6IFByb21pc2VSZWplY3RlcjtcbiAgcHJvbWlzZTogUHJvbWlzZTxUPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnJlc29sdmUgPSAodmFsdWUpOiB2b2lkID0+IHtcbiAgICAgIHZvaWQodmFsdWUpO1xuICAgIH07XG4gICAgdGhpcy5yZWplY3QgPSAocmVhc29uKTogdm9pZCA9PiB7XG4gICAgICB0aHJvdyByZWFzb247XG4gICAgfVxuICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgdGhpcy5yZXNvbHZlID0gcmVzO1xuICAgICAgdGhpcy5yZWplY3QgPSByZWo7XG4gICAgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBFdmFsdWF0ZSBhIGNhbGxiYWNrIGFzeW5jaHJvbm91c2x5IGZvciBldmVyeSBlbGVtZW50IG9mIGFuIGFycmF5LCBzZXF1ZW50aWFsbHkuXG4gKlxuICogQHBhcmFtIHsqW119IGVsZW1lbnRBcnJheSBUaGUgYXJyYXkgb2Ygb2JqZWN0cyB0byBwYXNzIGludG8gdGhlIGNhbGxiYWNrLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHJldHVybnMge1Byb21pc2U8KltdPn0gUmVzb2x2ZWQgaWYgdGhlIHNlcXVlbmNlIHBhc3Nlcy5cbiAqIEBzZWUge1Byb21pc2UuYWxsfVxuICogQHNlZSB7QXJyYXkucHJvdG90eXBlLnJlZHVjZX1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFByb21pc2VBbGxTZXF1ZW5jZTxFLCBWPihcbiAgZWxlbWVudEFycmF5OiBFW10sXG4gIGNhbGxiYWNrOiAodmFsdWU6IEUpID0+IFByb21pc2U8Vj5cbikgOiBQcm9taXNlPFZbXT5cbntcbiAgcmV0dXJuIGF3YWl0IGVsZW1lbnRBcnJheS5yZWR1Y2UoYXN5bmMgKHByZXZpb3VzUHJvbWlzZTogUHJvbWlzZTxWW10+LCBlbGVtZW50OiBFKSA9PiB7XG4gICAgY29uc3QgaXRlbXMgPSBhd2FpdCBwcmV2aW91c1Byb21pc2U7XG4gICAgaXRlbXMucHVzaChhd2FpdCBjYWxsYmFjayhlbGVtZW50KSk7XG4gICAgcmV0dXJuIGl0ZW1zO1xuICB9LCBQcm9taXNlLnJlc29sdmUoW10pKTtcbn1cblxuLyoqXG4gKiBFdmFsdWF0ZSBhIGNhbGxiYWNrIGFzeW5jaHJvbm91c2x5IGZvciBldmVyeSBlbGVtZW50IG9mIGFuIGFycmF5LCBpbiBwYXJhbGxlbC5cbiAqXG4gKiBAcGFyYW0geypbXX0gZWxlbWVudEFycmF5IFRoZSBhcnJheSBvZiBvYmplY3RzIHRvIHBhc3MgaW50byB0aGUgY2FsbGJhY2suXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgY2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcmV0dXJucyB7UHJvbWlzZTwqW10+fSBSZXNvbHZlZCBpZiB0aGUgc2VxdWVuY2UgcGFzc2VzLlxuICogQHNlZSB7UHJvbWlzZS5hbGx9XG4gKiBAc2VlIHtBcnJheS5wcm90b3R5cGUubWFwfVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUHJvbWlzZUFsbFBhcmFsbGVsPEUsIFY+KFxuICBlbGVtZW50QXJyYXk6IEVbXSxcbiAgY2FsbGJhY2s6ICh2YWx1ZTogRSkgPT4gUHJvbWlzZTxWPlxuKSA6IFByb21pc2U8VltdPlxue1xuICByZXR1cm4gUHJvbWlzZS5hbGwoZWxlbWVudEFycmF5Lm1hcChlbGVtZW50ID0+IGNhbGxiYWNrKGVsZW1lbnQpKSk7XG59XG4iXX0=