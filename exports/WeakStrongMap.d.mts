declare class WeakStrongMap<__MK0__ extends object, __MK1__, __V__> {
    #private;
    constructor(iterable?: [__MK0__, __MK1__, __V__][]);
    /**
     * Delete an element from the collection by the given key sequence.
     *
     * @param {object} weakKey   The weakly held key.
     * @param {*}      strongKey The strongly held key.
     * @returns {boolean} True if we found the value and deleted it.
     * @public
     */
    delete(weakKey: __MK0__, strongKey: __MK1__): boolean;
    /**
     * Get a value for a key set.
     *
     * @param {object} weakKey   The weakly held key.
     * @param {*}      strongKey The strongly held key.
     * @returns {*?} The value.  Undefined if it isn't in the collection.
     * @public
     */
    get(weakKey: __MK0__, strongKey: __MK1__): __V__ | undefined;
    /**
     * Provide a default value for .getDefault().
     *
     * @callback __WeakStrongMap_GetDefaultCallback__
     * @returns {*} The value.
     */
    /**
     * Guarantee a value for a key set.
     *
     * @param {object}                               weakKey     The weakly held key.
     * @param {*}                                    strongKey   The strongly held key.
     * @param {__WeakStrongMap_GetDefaultCallback__} __default__ A function to provide a default value if necessary.
     * @returns {*} The value.
     * @public
     */
    getDefault(weakKey: __MK0__, strongKey: __MK1__, __default__: () => __V__): __V__;
    /**
     * Report if the collection has a value for a key set.
     *
     * @param {object} weakKey   The weakly held key.
     * @param {*}      strongKey The strongly held key.
     * @returns {boolean} True if the key set refers to a value in the collection.
     * @public
     */
    has(weakKey: __MK0__, strongKey: __MK1__): boolean;
    /**
     * Determine if a set of keys is valid.
     *
     * @param {object} weakKey   The weakly held key.
     * @param {*}      strongKey The strongly held key.
     * @returns {boolean} True if the validation passes, false if it doesn't.
     * @public
     */
    isValidKey(weakKey: __MK0__, strongKey: __MK1__): boolean;
    /**
     * Set a value for a key set.
     *
     * @param {object} weakKey   The weakly held key.
     * @param {*}      strongKey The strongly held key.
     * @param {*}      value     The value.
     * @returns {WeakStrongMap} This collection.
     * @public
     */
    set(weakKey: __MK0__, strongKey: __MK1__, value: __V__): this;
    [Symbol.toStringTag]: string;
}
export default WeakStrongMap;
