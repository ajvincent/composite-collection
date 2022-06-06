declare class StrongMapOfStrongSets<__MK0__, __SK0__> {
    #private;
    constructor(iterable?: [__MK0__, __SK0__][]);
    /**
     * The number of elements in this collection.
     *
     * @returns {number} The element count.
     * @public
     * @constant
     */
    get size(): number;
    /**
     * Get the size of a particular set.
     *
     * @param {*} mapKey The map key.
     * @returns {number} The set size.
     * @public
     */
    getSizeOfSet(mapKey: __MK0__): number;
    /**
     * The number of maps in this collection.
     *
     * @returns {number} The map count.
     * @public
     * @constant
     */
    get mapSize(): number;
    /**
     * Add a key set to this collection.
     *
     * @param {*} mapKey The map key.
     * @param {*} setKey The set key.
     * @returns {StrongMapOfStrongSets} This collection.
     * @public
     */
    add(mapKey: __MK0__, setKey: __SK0__): this;
    /**
     * Add several sets to a map in this collection.
     *
     * @param {*}     mapKey   The map key.
     * @param {Set[]} __sets__ The sets to add.
     * @returns {StrongMapOfStrongSets} This collection.
     * @public
     */
    addSets(mapKey: __MK0__, __sets__: [__SK0__][]): this;
    /**
     * Clear the collection.
     *
     * @public
     */
    clear(): void;
    /**
     * Delete an element from the collection by the given key sequence.
     *
     * @param {*} mapKey The map key.
     * @param {*} setKey The set key.
     * @returns {boolean} True if we found the value and deleted it.
     * @public
     */
    delete(mapKey: __MK0__, setKey: __SK0__): boolean;
    /**
     * Delete all sets from the collection by the given map sequence.
     *
     * @param {*} mapKey The map key.
     * @returns {boolean} True if we found the value and deleted it.
     * @public
     */
    deleteSets(mapKey: __MK0__): boolean;
    /**
     * Iterate over the keys.
     *
     * @param {__StrongMapOfStrongSets_ForEachCallback__} __callback__ A function to invoke for each iteration.
     * @param {object}                                    __thisArg__  Value to use as this when executing callback.
     * @public
     */
    forEach(__callback__: (mapKey: __MK0__, setKey: __SK0__, __collection__: StrongMapOfStrongSets<__MK0__, __SK0__>) => void, __thisArg__?: unknown): void;
    /**
     * An user-provided callback to .forEach().
     *
     * @callback __StrongMapOfStrongSets_ForEachCallback__
     * @param {*}                     mapKey         The map key.
     * @param {*}                     setKey         The set key.
     * @param {StrongMapOfStrongSets} __collection__ This collection.
     */
    /**
     * Iterate over the map keys.
     *
     * @param {__StrongMapOfStrongSets_ForEachMapCallback__} __callback__ A function to invoke for each iteration.
     * @param {object}                                       __thisArg__  Value to use as this when executing callback.
     * @public
     */
    forEachMap(__callback__: (mapKey: __MK0__, __collection__: StrongMapOfStrongSets<__MK0__, __SK0__>) => void, __thisArg__?: unknown): void;
    /**
     * An user-provided callback to .forEachMap().
     *
     * @callback __StrongMapOfStrongSets_ForEachMapCallback__
     * @param {*}                     mapKey         The map key.
     * @param {StrongMapOfStrongSets} __collection__ This collection.
     */
    /**
     * Iterate over the keys under a map in this collection.
     *
     * @param {*}                                         mapKey       The map key.
     * @param {__StrongMapOfStrongSets_ForEachCallback__} __callback__ A function to invoke for each iteration.
     * @param {object}                                    __thisArg__  Value to use as this when executing callback.
     * @public
     */
    forEachSet(mapKey: __MK0__, __callback__: (mapKey: __MK0__, setKey: __SK0__, __collection__: StrongMapOfStrongSets<__MK0__, __SK0__>) => void, __thisArg__?: unknown): void;
    /**
     * Report if the collection has a value for a key set.
     *
     * @param {*} mapKey The map key.
     * @param {*} setKey The set key.
     * @returns {boolean} True if the key set refers to a value in the collection.
     * @public
     */
    has(mapKey: __MK0__, setKey: __SK0__): boolean;
    /**
     * Report if the collection has any sets for a map.
     *
     * @param {*} mapKey The map key.
     * @returns {boolean} True if the key set refers to a value in the collection.
     * @public
     */
    hasSets(mapKey: __MK0__): boolean;
    /**
     * Yield the values of the collection.
     *
     * @yields {*} The value.
     * @public
     */
    values(): IterableIterator<[__MK0__, __SK0__]>;
    /**
     * Yield the sets of the collection in a map.
     *
     * @param {*} mapKey The map key.
     * @yields {*} The sets.
     * @public
     */
    valuesSet(mapKey: __MK0__): IterableIterator<[__MK0__, __SK0__]>;
    [Symbol.iterator](): IterableIterator<[__MK0__, __SK0__]>;
    [Symbol.toStringTag]: string;
}
export declare type ReadonlyStrongMapOfStrongSets<__MK0__, __SK0__> = Pick<StrongMapOfStrongSets<__MK0__, __SK0__>, "size" | "getSizeOfSet" | "mapSize" | "has" | "hasSets" | "values" | "valuesSet"> & {
    forEach(__callback__: (mapKey: __MK0__, setKey: __SK0__, __collection__: ReadonlyStrongMapOfStrongSets<__MK0__, __SK0__>) => void, __thisArg__?: unknown): void;
    forEachMap(__callback__: (mapKey: __MK0__, __collection__: ReadonlyStrongMapOfStrongSets<__MK0__, __SK0__>) => void, __thisArg__?: unknown): void;
    forEachSet(mapKey: __MK0__, __callback__: (mapKey: __MK0__, setKey: __SK0__, __collection__: ReadonlyStrongMapOfStrongSets<__MK0__, __SK0__>) => void, __thisArg__?: unknown): void;
};
export default StrongMapOfStrongSets;
