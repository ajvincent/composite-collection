declare class WeakFunctionMultiMap<__MK0__ extends object, __SK0__> {
    #private;
    constructor(iterable?: [__MK0__, __SK0__][]);
    /**
     * Add a key set to this collection.
     *
     * @param {object}   key         The map key.
     * @param {Function} mapFunction The function.
     * @returns {WeakFunctionMultiMap} This collection.
     * @public
     */
    add(key: __MK0__, mapFunction: __SK0__): this;
    /**
     * Add several sets to a map in this collection.
     *
     * @param {object} key      The map key.
     * @param {Set[]}  __sets__ The sets to add.
     * @returns {WeakFunctionMultiMap} This collection.
     * @public
     */
    addSets(key: __MK0__, __sets__: [__SK0__][]): this;
    /**
     * Delete an element from the collection by the given key sequence.
     *
     * @param {object}   key         The map key.
     * @param {Function} mapFunction The function.
     * @returns {boolean} True if we found the value and deleted it.
     * @public
     */
    delete(key: __MK0__, mapFunction: __SK0__): boolean;
    /**
     * Delete all sets from the collection by the given map sequence.
     *
     * @param {object} key The map key.
     * @returns {boolean} True if we found the value and deleted it.
     * @public
     */
    deleteSets(key: __MK0__): boolean;
    /**
     * Iterate over the keys under a map in this collection.
     *
     * @param {object}                                   key          The map key.
     * @param {__WeakFunctionMultiMap_ForEachCallback__} __callback__ A function to invoke for each iteration.
     * @param {object}                                   __thisArg__  Value to use as this when executing callback.
     * @public
     */
    forEachSet(key: __MK0__, __callback__: (key: __MK0__, mapFunction: __SK0__, __collection__: WeakFunctionMultiMap<__MK0__, __SK0__>) => void, __thisArg__: unknown): void;
    /**
     * An user-provided callback to .forEach().
     *
     * @callback __WeakFunctionMultiMap_ForEachCallback__
     * @param {object}               key            The map key.
     * @param {Function}             mapFunction    The function.
     * @param {WeakFunctionMultiMap} __collection__ This collection.
     */
    /**
     * Get the size of a particular set.
     *
     * @param {object} key The map key.
     * @returns {number} The set size.
     * @public
     */
    getSizeOfSet(key: __MK0__): number;
    /**
     * Report if the collection has a value for a key set.
     *
     * @param {object}   key         The map key.
     * @param {Function} mapFunction The function.
     * @returns {boolean} True if the key set refers to a value in the collection.
     * @public
     */
    has(key: __MK0__, mapFunction: __SK0__): boolean;
    /**
     * Report if the collection has any sets for a map.
     *
     * @param {object} key The map key.
     * @returns {boolean} True if the key set refers to a value in the collection.
     * @public
     */
    hasSets(key: __MK0__): boolean;
    /**
     * Determine if a set of keys is valid.
     *
     * @param {object}   key         The map key.
     * @param {Function} mapFunction The function.
     * @returns {boolean} True if the validation passes, false if it doesn't.
     * @public
     */
    isValidKey(key: __MK0__, mapFunction: __SK0__): boolean;
    /**
     * Yield the sets of the collection in a map.
     *
     * @param {object} key The map key.
     * @yields {*} The sets.
     * @public
     */
    valuesSet(key: __MK0__): Iterator<[__MK0__, __SK0__]>;
    [Symbol.toStringTag]: string;
}
export default WeakFunctionMultiMap;
