declare class StringStateMachine<__SK0__ extends string, __SK1__ extends string> {
    #private;
    constructor(iterable?: [__SK0__, __SK1__][]);
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
     * @returns {StringStateMachine} This collection.
     * @public
     */
    add(currentState: __SK0__, nextState: __SK1__): this;
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
    delete(currentState: __SK0__, nextState: __SK1__): boolean;
    /**
     * An user-provided callback to .forEach().
     *
     * @callback __StringStateMachine_ForEachCallback__
     * @param {string}             currentState   The current state.
     * @param {string}             nextState      An allowable next state.
     * @param {StringStateMachine} __collection__ This collection.
     */
    /**
     * Iterate over the keys.
     *
     * @param {__StringStateMachine_ForEachCallback__} __callback__ A function to invoke for each iteration.
     * @param {object}                                 __thisArg__  Value to use as this when executing callback.
     * @public
     */
    forEach(__callback__: (currentState: __SK0__, nextState: __SK1__, __collection__: StringStateMachine<__SK0__, __SK1__>) => void, __thisArg__: unknown): void;
    /**
     * Report if the collection has a value for a key set.
     *
     * @param {string} currentState The current state.
     * @param {string} nextState    An allowable next state.
     * @returns {boolean} True if the key set refers to a value in the collection.
     * @public
     */
    has(currentState: __SK0__, nextState: __SK1__): boolean;
    /**
     * Determine if a set of keys is valid.
     *
     * @param {string} currentState The current state.
     * @param {string} nextState    An allowable next state.
     * @returns {boolean} True if the validation passes, false if it doesn't.
     * @public
     */
    isValidKey(currentState: __SK0__, nextState: __SK1__): boolean;
    /**
     * Yield the values of the collection.
     *
     * @yields {*} The value.
     * @public
     */
    values(): Iterator<[__SK0__, __SK1__]>;
    [Symbol.iterator](): Iterator<[__SK0__, __SK1__]>;
    [Symbol.toStringTag]: string;
}
export default StringStateMachine;
