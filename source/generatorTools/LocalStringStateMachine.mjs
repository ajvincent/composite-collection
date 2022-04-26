// CollectionConfiguration => ConfigurationStateMachine => StringStateMachine => CollectionConfiguration
// So I'm creating a local copy while I figure out the rest.
import KeyHasher from "../exports/keys/Hasher.mjs";
/**
 * An user-provided callback to .forEach().
 *
 * @callback ForEachCallback
 * @param {string}                  currentState   The current state.
 * @param {string}                  nextState      An allowable next state.
 * @param {LocalStringStateMachine} __this__       This collection.
 */
const ForEachCallback = function (currentState, nextState, __this__) {
    void (currentState);
    void (nextState);
    void (__this__);
    // do nothing
};
void (ForEachCallback);
class LocalStringStateMachine {
    /**
     * Storage of the Set's contents for quick iteration in .values().  The values are always frozen arrays.
     *
     * @type {Map<string, *[]>}
     * @constant
     */
    #root = new Map;
    /** @type {KeyHasher} @constant */
    #hasher = new KeyHasher();
    constructor(__iterable__) {
        if (__iterable__) {
            for (let [key, value] of __iterable__) {
                this.add(key, value);
            }
        }
    }
    /**
     * The number of elements in this collection.
     *
     * @returns {number} The element count.
     * @public
     * @constant
     */
    get size() {
        return this.#root.size;
    }
    /**
     * Add a key set to this collection.
     *
     * @param {string} currentState The current state.
     * @param {string} nextState    An allowable next state.
     * @returns {LocalStringStateMachine} This collection.
     * @public
     */
    add(currentState, nextState) {
        this.#requireValidKey(currentState, nextState);
        const __hash__ = this.#hasher.getHash(currentState, nextState);
        this.#root.set(__hash__, [currentState, nextState]);
        return this;
    }
    /**
     * Clear the collection.
     *
     * @public
     */
    clear() {
        this.#root.clear();
    }
    /**
     * Delete an element from the collection by the given key sequence.
     *
     * @param {string} currentState The current state.
     * @param {string} nextState    An allowable next state.
     * @returns {boolean} True if we found the value and deleted it.
     * @public
     */
    delete(currentState, nextState) {
        const __hash__ = this.#hasher.getHashIfExists(currentState, nextState);
        return __hash__ ? this.#root.delete(__hash__) : false;
    }
    /**
     * Iterate over the keys.
     *
     * @param {ForEachCallback} __callback__ A function to invoke for each iteration.
     * @param {object}          __thisArg__  Value to use as this when executing callback.
     * @public
     */
    forEach(__callback__, __thisArg__) {
        this.#root.forEach((valueSet) => {
            __callback__.apply(__thisArg__, [...valueSet, this]);
        });
    }
    /**
     * Report if the collection has a value for a key set.
     *
     * @param {string} currentState The current state.
     * @param {string} nextState    An allowable next state.
     * @returns {boolean} True if the key set refers to a value in the collection.
     * @public
     */
    has(currentState, nextState) {
        const __hash__ = this.#hasher.getHashIfExists(currentState, nextState);
        return __hash__ ? this.#root.has(__hash__) : false;
    }
    /**
     * Determine if a set of keys is valid.
     *
     * @param {string} currentState The current state.
     * @param {string} nextState    An allowable next state.
     * @returns {boolean} True if the validation passes, false if it doesn't.
     * @public
     */
    isValidKey(currentState, nextState) {
        return this.#isValidKey(currentState, nextState);
    }
    /**
     * Yield the values of the collection.
     *
     * @yields {*} The value.
     * @public
     */
    *values() {
        for (let __value__ of this.#root.values())
            yield __value__;
    }
    /**
     * Throw if the key set is not valid.
     *
     * @param {string} currentState The current state.
     * @param {string} nextState    An allowable next state.
     * @throws for an invalid key set.
     */
    #requireValidKey(currentState, nextState) {
        if (!this.#isValidKey(currentState, nextState))
            throw new Error("The ordered key set is not valid!");
    }
    /**
     * Determine if a set of keys is valid.
     *
     * @param {string} currentState The current state.
     * @param {string} nextState    An allowable next state.
     * @returns {boolean} True if the validation passes, false if it doesn't.
     */
    #isValidKey(currentState, nextState) {
        {
            if (typeof currentState !== "string")
                return false;
        }
        {
            if (typeof nextState !== "string")
                return false;
        }
        return true;
    }
    [Symbol.iterator]() {
        return this.values();
    }
    /**
     * @returns {string} The class name.
     */
    get [Symbol.toStringTag]() {
        return "LocalStringStateMachine";
    }
}
Object.freeze(LocalStringStateMachine);
Object.freeze(LocalStringStateMachine.prototype);
export default LocalStringStateMachine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9jYWxTdHJpbmdTdGF0ZU1hY2hpbmUubWpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTG9jYWxTdHJpbmdTdGF0ZU1hY2hpbmUubXRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHdHQUF3RztBQUN4Ryw0REFBNEQ7QUFFNUQsT0FBTyxTQUFTLE1BQU0sNEJBQTRCLENBQUM7QUFNbkQ7Ozs7Ozs7R0FPRztBQUNILE1BQU0sZUFBZSxHQUF3QixVQUFVLFlBQVksRUFBRSxTQUFTLEVBQUUsUUFBUTtJQUN0RixLQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDbkIsS0FBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2hCLEtBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNmLGFBQWE7QUFDZixDQUFDLENBQUE7QUFDRCxLQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7QUFFdEIsTUFBTSx1QkFBdUI7SUFDM0I7Ozs7O09BS0c7SUFDSCxLQUFLLEdBQTRCLElBQUksR0FBRyxDQUFDO0lBRXpDLGtDQUFrQztJQUNsQyxPQUFPLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztJQUUxQixZQUFZLFlBQXNDO1FBQ2hELElBQUksWUFBWSxFQUFFO1lBQ2hCLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxZQUFZLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3RCO1NBQ0Y7SUFDSCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztJQUN6QixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILEdBQUcsQ0FBQyxZQUFvQixFQUFFLFNBQWlCO1FBQ3pDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFL0MsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9B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bGxlY3Rpb25Db25maWd1cmF0aW9uID0+IENvbmZpZ3VyYXRpb25TdGF0ZU1hY2hpbmUgPT4gU3RyaW5nU3RhdGVNYWNoaW5lID0+IENvbGxlY3Rpb25Db25maWd1cmF0aW9uXG4vLyBTbyBJJ20gY3JlYXRpbmcgYSBsb2NhbCBjb3B5IHdoaWxlIEkgZmlndXJlIG91dCB0aGUgcmVzdC5cblxuaW1wb3J0IEtleUhhc2hlciBmcm9tIFwiLi4vZXhwb3J0cy9rZXlzL0hhc2hlci5tanNcIjtcblxuZXhwb3J0IHR5cGUgdmFsdWVUdXBsZSA9IFtzdHJpbmcsIHN0cmluZ107XG5cbnR5cGUgRm9yRWFjaENhbGxiYWNrVHlwZSA9IChjdXJyZW50U3RhdGU6IHN0cmluZywgbmV4dFN0YXRlOiBzdHJpbmcsIF9fdGhpc19fOiBMb2NhbFN0cmluZ1N0YXRlTWFjaGluZSkgPT4gdm9pZDtcblxuLyoqXG4gKiBBbiB1c2VyLXByb3ZpZGVkIGNhbGxiYWNrIHRvIC5mb3JFYWNoKCkuXG4gKlxuICogQGNhbGxiYWNrIEZvckVhY2hDYWxsYmFja1xuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgY3VycmVudFN0YXRlICAgVGhlIGN1cnJlbnQgc3RhdGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICBuZXh0U3RhdGUgICAgICBBbiBhbGxvd2FibGUgbmV4dCBzdGF0ZS5cbiAqIEBwYXJhbSB7TG9jYWxTdHJpbmdTdGF0ZU1hY2hpbmV9IF9fdGhpc19fICAgICAgIFRoaXMgY29sbGVjdGlvbi5cbiAqL1xuY29uc3QgRm9yRWFjaENhbGxiYWNrOiBGb3JFYWNoQ2FsbGJhY2tUeXBlID0gZnVuY3Rpb24gKGN1cnJlbnRTdGF0ZSwgbmV4dFN0YXRlLCBfX3RoaXNfXykgOiB2b2lkIHtcbiAgdm9pZChjdXJyZW50U3RhdGUpO1xuICB2b2lkKG5leHRTdGF0ZSk7XG4gIHZvaWQoX190aGlzX18pO1xuICAvLyBkbyBub3RoaW5nXG59XG52b2lkKEZvckVhY2hDYWxsYmFjayk7XG5cbmNsYXNzIExvY2FsU3RyaW5nU3RhdGVNYWNoaW5lIHtcbiAgLyoqXG4gICAqIFN0b3JhZ2Ugb2YgdGhlIFNldCdzIGNvbnRlbnRzIGZvciBxdWljayBpdGVyYXRpb24gaW4gLnZhbHVlcygpLiAgVGhlIHZhbHVlcyBhcmUgYWx3YXlzIGZyb3plbiBhcnJheXMuXG4gICAqXG4gICAqIEB0eXBlIHtNYXA8c3RyaW5nLCAqW10+fVxuICAgKiBAY29uc3RhbnRcbiAgICovXG4gICNyb290OiBNYXA8c3RyaW5nLCB2YWx1ZVR1cGxlPiA9IG5ldyBNYXA7XG5cbiAgLyoqIEB0eXBlIHtLZXlIYXNoZXJ9IEBjb25zdGFudCAqL1xuICAjaGFzaGVyID0gbmV3IEtleUhhc2hlcigpO1xuXG4gIGNvbnN0cnVjdG9yKF9faXRlcmFibGVfXzogdmFsdWVUdXBsZVtdIHwgdW5kZWZpbmVkKSB7XG4gICAgaWYgKF9faXRlcmFibGVfXykge1xuICAgICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIF9faXRlcmFibGVfXykge1xuICAgICAgICB0aGlzLmFkZChrZXksIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGlzIGNvbGxlY3Rpb24uXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBlbGVtZW50IGNvdW50LlxuICAgKiBAcHVibGljXG4gICAqIEBjb25zdGFudFxuICAgKi9cbiAgZ2V0IHNpemUoKSA6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuI3Jvb3Quc2l6ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBrZXkgc2V0IHRvIHRoaXMgY29sbGVjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGN1cnJlbnRTdGF0ZSBUaGUgY3VycmVudCBzdGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5leHRTdGF0ZSAgICBBbiBhbGxvd2FibGUgbmV4dCBzdGF0ZS5cbiAgICogQHJldHVybnMge0xvY2FsU3RyaW5nU3RhdGVNYWNoaW5lfSBUaGlzIGNvbGxlY3Rpb24uXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGFkZChjdXJyZW50U3RhdGU6IHN0cmluZywgbmV4dFN0YXRlOiBzdHJpbmcpIDogdGhpcyB7XG4gICAgdGhpcy4jcmVxdWlyZVZhbGlkS2V5KGN1cnJlbnRTdGF0ZSwgbmV4dFN0YXRlKTtcblxuICAgIGNvbnN0IF9faGFzaF9fID0gdGhpcy4jaGFzaGVyLmdldEhhc2goY3VycmVudFN0YXRlLCBuZXh0U3RhdGUpO1xuICAgIHRoaXMuI3Jvb3Quc2V0KF9faGFzaF9fLCBbY3VycmVudFN0YXRlLCBuZXh0U3RhdGVdKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciB0aGUgY29sbGVjdGlvbi5cbiAgICpcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgY2xlYXIoKSA6IHZvaWQge1xuICAgIHRoaXMuI3Jvb3QuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGUgYW4gZWxlbWVudCBmcm9tIHRoZSBjb2xsZWN0aW9uIGJ5IHRoZSBnaXZlbiBrZXkgc2VxdWVuY2UuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjdXJyZW50U3RhdGUgVGhlIGN1cnJlbnQgc3RhdGUuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuZXh0U3RhdGUgICAgQW4gYWxsb3dhYmxlIG5leHQgc3RhdGUuXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHdlIGZvdW5kIHRoZSB2YWx1ZSBhbmQgZGVsZXRlZCBpdC5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZGVsZXRlKGN1cnJlbnRTdGF0ZTogc3RyaW5nLCBuZXh0U3RhdGU6IHN0cmluZykgOiBib29sZWFuIHtcbiAgICBjb25zdCBfX2hhc2hfXyA9IHRoaXMuI2hhc2hlci5nZXRIYXNoSWZFeGlzdHMoY3VycmVudFN0YXRlLCBuZXh0U3RhdGUpO1xuICAgIHJldHVybiBfX2hhc2hfXyA/IHRoaXMuI3Jvb3QuZGVsZXRlKF9faGFzaF9fKSA6IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgb3ZlciB0aGUga2V5cy5cbiAgICpcbiAgICogQHBhcmFtIHtGb3JFYWNoQ2FsbGJhY2t9IF9fY2FsbGJhY2tfXyBBIGZ1bmN0aW9uIHRvIGludm9rZSBmb3IgZWFjaCBpdGVyYXRpb24uXG4gICAqIEBwYXJhbSB7b2JqZWN0fSAgICAgICAgICBfX3RoaXNBcmdfXyAgVmFsdWUgdG8gdXNlIGFzIHRoaXMgd2hlbiBleGVjdXRpbmcgY2FsbGJhY2suXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGZvckVhY2goX19jYWxsYmFja19fOiBGb3JFYWNoQ2FsbGJhY2tUeXBlLCBfX3RoaXNBcmdfXzogYW55KTogdm9pZCB7XG4gICAgdGhpcy4jcm9vdC5mb3JFYWNoKCh2YWx1ZVNldDogdmFsdWVUdXBsZSkgOiBhbnkgPT4ge1xuICAgICAgX19jYWxsYmFja19fLmFwcGx5KF9fdGhpc0FyZ19fLCBbLi4udmFsdWVTZXQsIHRoaXNdKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBvcnQgaWYgdGhlIGNvbGxlY3Rpb24gaGFzIGEgdmFsdWUgZm9yIGEga2V5IHNldC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGN1cnJlbnRTdGF0ZSBUaGUgY3VycmVudCBzdGF0ZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5leHRTdGF0ZSAgICBBbiBhbGxvd2FibGUgbmV4dCBzdGF0ZS5cbiAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIGtleSBzZXQgcmVmZXJzIHRvIGEgdmFsdWUgaW4gdGhlIGNvbGxlY3Rpb24uXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGhhcyhjdXJyZW50U3RhdGU6IHN0cmluZywgbmV4dFN0YXRlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBfX2hhc2hfXyA9IHRoaXMuI2hhc2hlci5nZXRIYXNoSWZFeGlzdHMoY3VycmVudFN0YXRlLCBuZXh0U3RhdGUpO1xuICAgIHJldHVybiBfX2hhc2hfXyA/IHRoaXMuI3Jvb3QuaGFzKF9faGFzaF9fKSA6IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZSBpZiBhIHNldCBvZiBrZXlzIGlzIHZhbGlkLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gY3VycmVudFN0YXRlIFRoZSBjdXJyZW50IHN0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmV4dFN0YXRlICAgIEFuIGFsbG93YWJsZSBuZXh0IHN0YXRlLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsaWRhdGlvbiBwYXNzZXMsIGZhbHNlIGlmIGl0IGRvZXNuJ3QuXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGlzVmFsaWRLZXkoY3VycmVudFN0YXRlOiBzdHJpbmcsIG5leHRTdGF0ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuI2lzVmFsaWRLZXkoY3VycmVudFN0YXRlLCBuZXh0U3RhdGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFlpZWxkIHRoZSB2YWx1ZXMgb2YgdGhlIGNvbGxlY3Rpb24uXG4gICAqXG4gICAqIEB5aWVsZHMgeyp9IFRoZSB2YWx1ZS5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgKiB2YWx1ZXMoKTogSXRlcmFibGVJdGVyYXRvcjx2YWx1ZVR1cGxlPiB7XG4gICAgZm9yIChsZXQgX192YWx1ZV9fIG9mIHRoaXMuI3Jvb3QudmFsdWVzKCkpXG4gICAgICB5aWVsZCBfX3ZhbHVlX187XG4gIH1cblxuICAvKipcbiAgICogVGhyb3cgaWYgdGhlIGtleSBzZXQgaXMgbm90IHZhbGlkLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gY3VycmVudFN0YXRlIFRoZSBjdXJyZW50IHN0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmV4dFN0YXRlICAgIEFuIGFsbG93YWJsZSBuZXh0IHN0YXRlLlxuICAgKiBAdGhyb3dzIGZvciBhbiBpbnZhbGlkIGtleSBzZXQuXG4gICAqL1xuICAjcmVxdWlyZVZhbGlkS2V5KGN1cnJlbnRTdGF0ZTogc3RyaW5nLCBuZXh0U3RhdGU6IHN0cmluZykgOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuI2lzVmFsaWRLZXkoY3VycmVudFN0YXRlLCBuZXh0U3RhdGUpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIG9yZGVyZWQga2V5IHNldCBpcyBub3QgdmFsaWQhXCIpO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZSBpZiBhIHNldCBvZiBrZXlzIGlzIHZhbGlkLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gY3VycmVudFN0YXRlIFRoZSBjdXJyZW50IHN0YXRlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmV4dFN0YXRlICAgIEFuIGFsbG93YWJsZSBuZXh0IHN0YXRlLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsaWRhdGlvbiBwYXNzZXMsIGZhbHNlIGlmIGl0IGRvZXNuJ3QuXG4gICAqL1xuICAjaXNWYWxpZEtleShjdXJyZW50U3RhdGU6IHN0cmluZywgbmV4dFN0YXRlOiBzdHJpbmcpIDogYm9vbGVhbiB7XG4gICAge1xuICAgICAgaWYgKHR5cGVvZiBjdXJyZW50U3RhdGUgIT09IFwic3RyaW5nXCIpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB7XG4gICAgICBpZiAodHlwZW9mIG5leHRTdGF0ZSAhPT0gXCJzdHJpbmdcIilcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIFtTeW1ib2wuaXRlcmF0b3JdKCk6IEl0ZXJhYmxlSXRlcmF0b3I8dmFsdWVUdXBsZT4ge1xuICAgIHJldHVybiB0aGlzLnZhbHVlcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjbGFzcyBuYW1lLlxuICAgKi9cbiAgZ2V0IFtTeW1ib2wudG9TdHJpbmdUYWddKCkgOiBzdHJpbmcge1xuICAgIHJldHVybiBcIkxvY2FsU3RyaW5nU3RhdGVNYWNoaW5lXCI7XG4gIH1cbn1cblxuT2JqZWN0LmZyZWV6ZShMb2NhbFN0cmluZ1N0YXRlTWFjaGluZSk7XG5PYmplY3QuZnJlZXplKExvY2FsU3RyaW5nU3RhdGVNYWNoaW5lLnByb3RvdHlwZSk7XG5cbmV4cG9ydCBkZWZhdWx0IExvY2FsU3RyaW5nU3RhdGVNYWNoaW5lO1xuIl19