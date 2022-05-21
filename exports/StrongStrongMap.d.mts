declare class StrongStrongMap<__MK0__, __MK1__, __V__> {
    #private;
    constructor(iterable?: [__MK0__, __MK1__, __V__][]);
    /**
     * The number of elements in this collection.
     *
     * @returns {number} The element count.
     * @public
     * @constant
     */
    get size(): number;
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
    delete(key1: __MK0__, key2: __MK1__): boolean;
    /**
     * Yield the key-value tuples of the collection.
     *
     * @yields {*[]} The keys and values.
     * @public
     */
    entries(): Iterator<[__MK0__, __MK1__, __V__]>;
    /**
     * An user-provided callback to .forEach().
     *
     * @callback __StrongStrongMap_ForEachCallback__
     * @param {*}               value          The value.
     * @param {*}               key1           The first key.
     * @param {*}               key2           The second key.
     * @param {StrongStrongMap} __collection__ This collection.
     */
    /**
     * Iterate over the keys and values.
     *
     * @param {__StrongStrongMap_ForEachCallback__} __callback__ A function to invoke for each iteration.
     * @param {object}                              __thisArg__  Value to use as this when executing callback.
     * @public
     */
    forEach(__callback__: (value: __V__, key1: __MK0__, key2: __MK1__, __collection__: StrongStrongMap<__MK0__, __MK1__, __V__>) => void, __thisArg__: unknown): void;
    /**
     * Get a value for a key set.
     *
     * @param {*} key1 The first key.
     * @param {*} key2 The second key.
     * @returns {*?} The value.  Undefined if it isn't in the collection.
     * @public
     */
    get(key1: __MK0__, key2: __MK1__): __V__ | undefined;
    /**
     * Provide a default value for .getDefault().
     *
     * @callback __StrongStrongMap_GetDefaultCallback__
     * @returns {*} The value.
     */
    /**
     * Guarantee a value for a key set.
     *
     * @param {*}                                      key1        The first key.
     * @param {*}                                      key2        The second key.
     * @param {__StrongStrongMap_GetDefaultCallback__} __default__ A function to provide a default value if necessary.
     * @returns {*} The value.
     * @public
     */
    getDefault(key1: __MK0__, key2: __MK1__, __default__: () => __V__): __V__;
    /**
     * Report if the collection has a value for a key set.
     *
     * @param {*} key1 The first key.
     * @param {*} key2 The second key.
     * @returns {boolean} True if the key set refers to a value in the collection.
     * @public
     */
    has(key1: __MK0__, key2: __MK1__): boolean;
    /**
     * Yield the key sets of the collection.
     *
     * @yields {*[]} The key sets.
     * @public
     */
    keys(): Iterator<[__MK0__, __MK1__]>;
    /**
     * Set a value for a key set.
     *
     * @param {*} key1  The first key.
     * @param {*} key2  The second key.
     * @param {*} value The value.
     * @returns {StrongStrongMap} This collection.
     * @public
     */
    set(key1: __MK0__, key2: __MK1__, value: __V__): this;
    /**
     * Yield the values of the collection.
     *
     * @yields {*} The value.
     * @public
     */
    values(): Iterator<__V__>;
    [Symbol.iterator](): Iterator<[__MK0__, __MK1__, __V__]>;
    [Symbol.toStringTag]: string;
}
export default StrongStrongMap;
