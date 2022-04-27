export declare type valueTuple = [string, string];
declare type ForEachCallbackType = (currentState: string, nextState: string, __this__: LocalStringStateMachine) => void;
declare class LocalStringStateMachine {
    #private;
    constructor(__iterable__: valueTuple[] | undefined);
    /**
     * The number of elements in this collection.
     *
     * @returns {number} The element count.
     * @public
     * @constant
     */
    get size(): number;
    /**
     * Add a key set to this collection.
     *
     * @param {string} currentState The current state.
     * @param {string} nextState    An allowable next state.
     * @returns {LocalStringStateMachine} This collection.
     * @public
     */
    add(currentState: string, nextState: string): this;
    /**
     * Clear the collection.
     *
     * @public
     */
    clear(): void;
    /**
     * Delete an element from the collection by the given key sequence.
     *
     * @param {string} currentState The current state.
     * @param {string} nextState    An allowable next state.
     * @returns {boolean} True if we found the value and deleted it.
     * @public
     */
    delete(currentState: string, nextState: string): boolean;
    /**
     * Iterate over the keys.
     *
     * @param {ForEachCallback} __callback__ A function to invoke for each iteration.
     * @param {object}          __thisArg__  Value to use as this when executing callback.
     * @public
     */
    forEach(__callback__: ForEachCallbackType, __thisArg__: unknown): void;
    /**
     * Report if the collection has a value for a key set.
     *
     * @param {string} currentState The current state.
     * @param {string} nextState    An allowable next state.
     * @returns {boolean} True if the key set refers to a value in the collection.
     * @public
     */
    has(currentState: string, nextState: string): boolean;
    /**
     * Determine if a set of keys is valid.
     *
     * @param {string} currentState The current state.
     * @param {string} nextState    An allowable next state.
     * @returns {boolean} True if the validation passes, false if it doesn't.
     * @public
     */
    isValidKey(currentState: string, nextState: string): boolean;
    /**
     * Yield the values of the collection.
     *
     * @yields {*} The value.
     * @public
     */
    values(): IterableIterator<valueTuple>;
    [Symbol.iterator](): IterableIterator<valueTuple>;
    /**
     * @returns {string} The class name.
     */
    get [Symbol.toStringTag](): string;
}
export default LocalStringStateMachine;
