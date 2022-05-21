declare class WeakMapOfStrongSets<__MK0__ extends object, __SK0__> {
    #private;
    constructor(iterable?: [__MK0__, __SK0__][]);
    /**
     * Add a key set to this collection.
     *
     * @param {object} mapKey The map key.
     * @param {*}      setKey The set key.
     * @returns {WeakMapOfStrongSets} This collection.
     * @public
     */
    add(mapKey: __MK0__, setKey: __SK0__): this;
    /**
     * Add several sets to a map in this collection.
     *
     * @param {object} mapKey   The map key.
     * @param {Set[]}  __sets__ The sets to add.
     * @returns {WeakMapOfStrongSets} This collection.
     * @public
     */
    addSets(mapKey: __MK0__, __sets__: [__SK0__][]): this;
    /**
     * Delete an element from the collection by the given key sequence.
     *
     * @param {object} mapKey The map key.
     * @param {*}      setKey The set key.
     * @returns {boolean} True if we found the value and deleted it.
     * @public
     */
    delete(mapKey: __MK0__, setKey: __SK0__): boolean;
    /**
     * Delete all sets from the collection by the given map sequence.
     *
     * @param {object} mapKey The map key.
     * @returns {boolean} True if we found the value and deleted it.
     * @public
     */
    deleteSets(mapKey: __MK0__): boolean;
    /**
     * Iterate over the keys under a map in this collection.
     *
     * @param {object}                                  mapKey       The map key.
     * @param {__WeakMapOfStrongSets_ForEachCallback__} __callback__ A function to invoke for each iteration.
     * @param {object}                                  __thisArg__  Value to use as this when executing callback.
     * @public
     */
    forEachSet(mapKey: __MK0__, __callback__: (mapKey: __MK0__, setKey: __SK0__, __collection__: WeakMapOfStrongSets<__MK0__, __SK0__>) => void, __thisArg__: unknown): void;
    /**
     * An user-provided callback to .forEach().
     *
     * @callback __WeakMapOfStrongSets_ForEachCallback__
     * @param {object}              mapKey         The map key.
     * @param {*}                   setKey         The set key.
     * @param {WeakMapOfStrongSets} __collection__ This collection.
     */
    /**
     * Get the size of a particular set.
     *
     * @param {object} mapKey The map key.
     * @returns {number} The set size.
     * @public
     */
    getSizeOfSet(mapKey: __MK0__): number;
    /**
     * Report if the collection has a value for a key set.
     *
     * @param {object} mapKey The map key.
     * @param {*}      setKey The set key.
     * @returns {boolean} True if the key set refers to a value in the collection.
     * @public
     */
    has(mapKey: __MK0__, setKey: __SK0__): boolean;
    /**
     * Report if the collection has any sets for a map.
     *
     * @param {object} mapKey The map key.
     * @returns {boolean} True if the key set refers to a value in the collection.
     * @public
     */
    hasSets(mapKey: __MK0__): boolean;
    /**
     * Determine if a set of keys is valid.
     *
     * @param {object} mapKey The map key.
     * @param {*}      setKey The set key.
     * @returns {boolean} True if the validation passes, false if it doesn't.
     * @public
     */
    isValidKey(mapKey: __MK0__, setKey: __SK0__): boolean;
    /**
     * Yield the sets of the collection in a map.
     *
     * @param {object} mapKey The map key.
     * @yields {*} The sets.
     * @public
     */
    valuesSet(mapKey: __MK0__): Iterator<[__MK0__, __SK0__]>;
    [Symbol.toStringTag]: string;
}
export default WeakMapOfStrongSets;
