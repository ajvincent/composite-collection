declare class WeakStrongSet<__SK0__ extends object, __SK1__> {
    #private;
    constructor(iterable?: [__SK0__, __SK1__][]);
    /**
     * Add a key set to this collection.
     *
     * @param {object} weakKey   The weakly held key.
     * @param {*}      strongKey The strongly held key.
     * @returns {WeakStrongSet} This collection.
     * @public
     */
    add(weakKey: __SK0__, strongKey: __SK1__): this;
    /**
     * Delete an element from the collection by the given key sequence.
     *
     * @param {object} weakKey   The weakly held key.
     * @param {*}      strongKey The strongly held key.
     * @returns {boolean} True if we found the value and deleted it.
     * @public
     */
    delete(weakKey: __SK0__, strongKey: __SK1__): boolean;
    /**
     * Report if the collection has a value for a key set.
     *
     * @param {object} weakKey   The weakly held key.
     * @param {*}      strongKey The strongly held key.
     * @returns {boolean} True if the key set refers to a value in the collection.
     * @public
     */
    has(weakKey: __SK0__, strongKey: __SK1__): boolean;
    /**
     * Determine if a set of keys is valid.
     *
     * @param {object} weakKey   The weakly held key.
     * @param {*}      strongKey The strongly held key.
     * @returns {boolean} True if the validation passes, false if it doesn't.
     * @public
     */
    isValidKey(weakKey: __SK0__, strongKey: __SK1__): boolean;
    [Symbol.toStringTag]: string;
}
export declare type ReadonlyWeakStrongSet<__SK0__ extends object, __SK1__> = Pick<WeakStrongSet<__SK0__, __SK1__>, "has" | "isValidKey">;
export default WeakStrongSet;
