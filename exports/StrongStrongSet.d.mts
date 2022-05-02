declare class StrongStrongSet<__SK0__, __SK1__> {
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
     * @param {*} key1 The first key.
     * @param {*} key2 The second key.
     * @returns {StrongStrongSet} This collection.
     * @public
     */
    add(key1: __SK0__, key2: __SK1__): this;
    /**
     * Clear the collection.
     *
     * @public
     */
    clear(): void;
    /**
     * Delete an element from the collection by the given key sequence.
     *
     * @param {*} key1 The first key.
     * @param {*} key2 The second key.
     * @returns {boolean} True if we found the value and deleted it.
     * @public
     */
    delete(key1: __SK0__, key2: __SK1__): boolean;
    /**
     * An user-provided callback to .forEach().
     *
     * @callback __StrongStrongSet_ForEachCallback__
     * @param {*}               key1           The first key.
     * @param {*}               key2           The second key.
     * @param {StrongStrongSet} __collection__ This collection.
     */
    /**
     * Iterate over the keys.
     *
     * @param {__StrongStrongSet_ForEachCallback__} __callback__ A function to invoke for each iteration.
     * @param {object}                              __thisArg__  Value to use as this when executing callback.
     * @public
     */
    forEach(__callback__: (key1: __SK0__, key2: __SK1__, __collection__: StrongStrongSet<__SK0__, __SK1__>) => void, __thisArg__: unknown): void;
    /**
     * Report if the collection has a value for a key set.
     *
     * @param {*} key1 The first key.
     * @param {*} key2 The second key.
     * @returns {boolean} True if the key set refers to a value in the collection.
     * @public
     */
    has(key1: __SK0__, key2: __SK1__): boolean;
    /**
     * Yield the values of the collection.
     *
     * @yields {*} The value.
     * @public
     */
    values(): Iterator<[key1: __SK0__, key2: __SK1__]>;
    [Symbol.iterator](): Iterator<[__SK0__, __SK1__]>;
    [Symbol.toStringTag]: string;
}
export default StrongStrongSet;
