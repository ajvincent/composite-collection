// CollectionConfiguration => ConfigurationStateMachine => StringStateMachine => CollectionConfiguration
// So I'm creating a local copy while I figure out the rest.
import KeyHasher from "../exports/keys/Hasher.mjs";
/**
 * An user-provided callback to .forEach().
 *
 * @callback ForEachCallback
 * @param {string}                  currentState   The current state.
 * @param {string}                  nextState      An allowable next state.
 * @param {LocalStringStateMachine} __this__       This collection.
 */
const ForEachCallback = function (currentState, nextState, __this__) {
    void (currentState);
    void (nextState);
    void (__this__);
    // do nothing
};
void (ForEachCallback);
class LocalStringStateMachine {
    /**
     * Storage of the Set's contents for quick iteration in .values().  The values are always frozen arrays.
     *
     * @type {Map<string, *[]>}
     * @constant
     */
    #root = new Map;
    /** @type {KeyHasher} @constant */
    #hasher = new KeyHasher();
    constructor(__iterable__) {
        if (__iterable__) {
            for (let [key, value] of __iterable__) {
                this.add(key, value);
            }
        }
    }
    /**
     * The number of elements in this collection.
     *
     * @returns {number} The element count.
     * @public
     * @constant
     */
    get size() {
        return this.#root.size;
    }
    /**
     * Add a key set to this collection.
     *
     * @param {string} currentState The current state.
     * @param {string} nextState    An allowable next state.
     * @returns {LocalStringStateMachine} This collection.
     * @public
     */
    add(currentState, nextState) {
        this.#requireValidKey(currentState, nextState);
        const __hash__ = this.#hasher.getHash(currentState, nextState);
        this.#root.set(__hash__, [currentState, nextState]);
        return this;
    }
    /**
     * Clear the collection.
     *
     * @public
     */
    clear() {
        this.#root.clear();
    }
    /**
     * Delete an element from the collection by the given key sequence.
     *
     * @param {string} currentState The current state.
     * @param {string} nextState    An allowable next state.
     * @returns {boolean} True if we found the value and deleted it.
     * @public
     */
    delete(currentState, nextState) {
        const __hash__ = this.#hasher.getHashIfExists(currentState, nextState);
        return __hash__ ? this.#root.delete(__hash__) : false;
    }
    /**
     * Iterate over the keys.
     *
     * @param {ForEachCallback} __callback__ A function to invoke for each iteration.
     * @param {object}          __thisArg__  Value to use as this when executing callback.
     * @public
     */
    forEach(__callback__, __thisArg__) {
        this.#root.forEach((valueSet) => {
            __callback__.apply(__thisArg__, [...valueSet, this]);
        });
    }
    /**
     * Report if the collection has a value for a key set.
     *
     * @param {string} currentState The current state.
     * @param {string} nextState    An allowable next state.
     * @returns {boolean} True if the key set refers to a value in the collection.
     * @public
     */
    has(currentState, nextState) {
        const __hash__ = this.#hasher.getHashIfExists(currentState, nextState);
        return __hash__ ? this.#root.has(__hash__) : false;
    }
    /**
     * Determine if a set of keys is valid.
     *
     * @param {string} currentState The current state.
     * @param {string} nextState    An allowable next state.
     * @returns {boolean} True if the validation passes, false if it doesn't.
     * @public
     */
    isValidKey(currentState, nextState) {
        return this.#isValidKey(currentState, nextState);
    }
    /**
     * Yield the values of the collection.
     *
     * @yields {*} The value.
     * @public
     */
    *values() {
        for (let __value__ of this.#root.values())
            yield __value__;
    }
    /**
     * Throw if the key set is not valid.
     *
     * @param {string} currentState The current state.
     * @param {string} nextState    An allowable next state.
     * @throws for an invalid key set.
     */
    #requireValidKey(currentState, nextState) {
        if (!this.#isValidKey(currentState, nextState))
            throw new Error("The ordered key set is not valid!");
    }
    /**
     * Determine if a set of keys is valid.
     *
     * @param {string} currentState The current state.
     * @param {string} nextState    An allowable next state.
     * @returns {boolean} True if the validation passes, false if it doesn't.
     */
    #isValidKey(currentState, nextState) {
        {
            if (typeof currentState !== "string")
                return false;
        }
        {
            if (typeof nextState !== "string")
                return false;
        }
        return true;
    }
    [Symbol.iterator]() {
        return this.values();
    }
    /**
     * @returns {string} The class name.
     */
    get [Symbol.toStringTag]() {
        return "LocalStringStateMachine";
    }
}
Object.freeze(LocalStringStateMachine);
Object.freeze(LocalStringStateMachine.prototype);
export default LocalStringStateMachine;
//# sourceMappingURL=LocalStringStateMachine.mjs.map