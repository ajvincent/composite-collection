/**
 * @file
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 * Template: OneToOne/Map
 * @license MPL-2.0
 * @author Alexander J. Vincent <ajvincent@gmail.com>
 * @copyright © 2021-2022 Alexander J. Vincent
 */
declare class OneToOneSimpleMap<__V__ extends object> extends WeakMap<__V__, __V__> {
    /**
     * Bind two values together.
     *
     * @param {*} value_1 The value.
     * @param {*} value_2 The value.
     * @public
     */
    bindOneToOne(value_1: __V__, value_2: __V__): void;
    /**
     * Determine if a value is valid.
     *
     * @param {*} value The value.
     * @returns {boolean} True if the value is valid.
     * @public
     */
    isValidValue(value: __V__): boolean;
    set(key: __V__, value: __V__): never;
    [Symbol.toStringTag]: string;
}
export default OneToOneSimpleMap;