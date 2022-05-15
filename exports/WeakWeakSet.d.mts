declare class WeakWeakSet<__SK0__ extends object, __SK1__ extends object> {
    #private;
    constructor(iterable?: [__SK0__, __SK1__][]);
    /**
     * Add a key set to this collection.
     *
     * @param {object} key1 The first key.
     * @param {object} key2 The second key.
     * @returns {WeakWeakSet} This collection.
     * @public
     */
    add(key1: __SK0__, key2: __SK1__): this;
    /**
     * Delete an element from the collection by the given key sequence.
     *
     * @param {object} key1 The first key.
     * @param {object} key2 The second key.
     * @returns {boolean} True if we found the value and deleted it.
     * @public
     */
    delete(key1: __SK0__, key2: __SK1__): boolean;
    /**
     * Report if the collection has a value for a key set.
     *
     * @param {object} key1 The first key.
     * @param {object} key2 The second key.
     * @returns {boolean} True if the key set refers to a value in the collection.
     * @public
     */
    has(key1: __SK0__, key2: __SK1__): boolean;
    /**
     * Determine if a set of keys is valid.
     *
     * @param {object} key1 The first key.
     * @param {object} key2 The second key.
     * @returns {boolean} True if the validation passes, false if it doesn't.
     * @public
     */
    isValidKey(key1: __SK0__, key2: __SK1__): boolean;
    [Symbol.toStringTag]: string;
}
export default WeakWeakSet;
