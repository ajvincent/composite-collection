declare class OneToOneWeakMap<__MK1__ extends object, __V__ extends object> {
    #private;
    /**
     * Bind two sets of keys and values together.
     *
     * @param {object} key2_1  The second key.
     * @param {object} value_1 The value.
     * @param {object} key2_2  The second key.
     * @param {object} value_2 The value.
     * @public
     */
    bindOneToOne(key2_1: __MK1__, value_1: __V__, key2_2: __MK1__, value_2: __V__): void;
    /**
     * Delete a target value.
     *
     * @param {object} value The value.
     * @param {object} key2  The second key.
     * @returns {boolean} True if the target value was deleted.
     * @public
     */
    delete(value: __V__, key2: __MK1__): boolean;
    /**
     * Get a target value.
     *
     * @param {object} value The value.
     * @param {object} key2  The second key.
     * @returns {*} The target value.
     * @public
     */
    get(value: __V__, key2: __MK1__): __V__ | undefined;
    /**
     * Determine if a target value exists.
     *
     * @param {object} value The value.
     * @param {object} key2  The second key.
     * @returns {boolean} True if the target value exists.
     * @public
     */
    has(value: __V__, key2: __MK1__): boolean;
    /**
     * Determine if a target value is an identity in this map.
     *
     * @param {object}  value           The value.
     * @param {object}  key2            The second key.
     * @param {boolean} allowNotDefined If true, treat the absence of the value as an identity.
     * @returns {boolean} True if the target value exists.
     * @public
     */
    hasIdentity(value: __V__, key2: __MK1__, allowNotDefined: boolean): boolean;
    /**
     * Determine if a key is valid.
     *
     * @param {object} key2 The second key.
     * @returns {boolean} True if the key is valid.
     * @see the base map class for further constraints.
     * @public
     */
    isValidKey(key2: __MK1__): boolean;
    /**
     * Determine if a value is valid.
     *
     * @param {object} value The value.
     * @returns {boolean} True if the value is valid.
     * @see the base map class for further constraints.
     * @public
     */
    isValidValue(value: __V__): boolean;
    [Symbol.toStringTag]: string;
}
export declare type ReadonlyOneToOneWeakMap<__MK1__ extends object, __V__ extends object> = Pick<OneToOneWeakMap<__MK1__, __V__>, "get" | "has" | "hasIdentity" | "isValidKey" | "isValidValue">;
export default OneToOneWeakMap;
