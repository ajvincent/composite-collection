declare class WeakWeakMap<__MK0__ extends object, __MK1__ extends object, __V__> {
    #private;
    constructor(iterable?: [__MK0__, __MK1__, __V__][]);
    /**
     * Delete an element from the collection by the given key sequence.
     *
     * @param {object} key1 The first key.
     * @param {object} key2 The second key.
     * @returns {boolean} True if we found the value and deleted it.
     * @public
     */
    delete(key1: __MK0__, key2: __MK1__): boolean;
    /**
     * Get a value for a key set.
     *
     * @param {object} key1 The first key.
     * @param {object} key2 The second key.
     * @returns {*?} The value.  Undefined if it isn't in the collection.
     * @public
     */
    get(key1: __MK0__, key2: __MK1__): __V__ | undefined;
    /**
     * Provide a default value for .getDefault().
     *
     * @callback __WeakWeakMap_GetDefaultCallback__
     * @returns {*} The value.
     */
    /**
     * Guarantee a value for a key set.
     *
     * @param {object}                             key1        The first key.
     * @param {object}                             key2        The second key.
     * @param {__WeakWeakMap_GetDefaultCallback__} __default__ A function to provide a default value if necessary.
     * @returns {*} The value.
     * @public
     */
    getDefault(key1: __MK0__, key2: __MK1__, __default__: () => __V__): __V__;
    /**
     * Report if the collection has a value for a key set.
     *
     * @param {object} key1 The first key.
     * @param {object} key2 The second key.
     * @returns {boolean} True if the key set refers to a value in the collection.
     * @public
     */
    has(key1: __MK0__, key2: __MK1__): boolean;
    /**
     * Determine if a set of keys is valid.
     *
     * @param {object} key1 The first key.
     * @param {object} key2 The second key.
     * @returns {boolean} True if the validation passes, false if it doesn't.
     * @public
     */
    isValidKey(key1: __MK0__, key2: __MK1__): boolean;
    /**
     * Set a value for a key set.
     *
     * @param {object} key1  The first key.
     * @param {object} key2  The second key.
     * @param {*}      value The value.
     * @returns {WeakWeakMap} This collection.
     * @public
     */
    set(key1: __MK0__, key2: __MK1__, value: __V__): this;
    [Symbol.toStringTag]: string;
}
export declare type ReadonlyWeakWeakMap<__MK0__ extends object, __MK1__ extends object, __V__> = Pick<WeakWeakMap<__MK0__, __MK1__, __V__>, "get" | "has" | "isValidKey">;
export default WeakWeakMap;
