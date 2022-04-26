/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * @license MPL-2.0
 * @author Alexander J. Vincent <ajvincent@gmail.com>
 * @copyright © 2021-2022 Alexander J. Vincent
 * @file
 * This transforms multiple object keys into a "weak key" object.  The weak arguments
 * in WeakKeyComposer.prototype.getKey() are the only guarantees that the weak key
 * will continue to exist:  if one of the weak arguments is no longer reachable,
 * the weak key is subject to garbage collection.
 */
import KeyHasher from "./Hasher.mjs";
class WeakKey {
    constructor() {
        Object.freeze(this);
    }
}
class FinalizerKey {
    constructor() {
        Object.freeze(this);
    }
}
/**
 * @private
 * @classdesc
 * Internally, there are two levels of keys:
 * finalizerKey is a frozen object which never leaves this module.
 * weakKey is the actual key we give to the caller.
 */
class WeakKeyPropertyBag {
    finalizerKeyRef;
    weakKeyRef;
    hash;
    strongRefSet;
    strongRef;
    /**
     * @param {FinalizerKey} finalizerKey    The finalizer key for deleting the weak key object.
     * @param {WeakKey}      weakKey         The weak key object.
     * @param {hash}         hash            A hash of all the arguments from a KeyHasher.
     * @param {*[]}          strongArguments The list of strong arguments.
     */
    constructor(finalizerKey, weakKey, hash, strongArguments) {
        this.finalizerKeyRef = new WeakRef(finalizerKey);
        this.weakKeyRef = new WeakRef(weakKey);
        this.hash = hash;
        if (strongArguments.length > 1) {
            this.strongRefSet = new Set(strongArguments);
        }
        else if (strongArguments.length === 1) {
            this.strongRef = strongArguments[0];
        }
    }
}
/**
 * The weak key composer.
 *
 * @public
 * @classdesc
 *
 * Each weak argument, through #keyFinalizer, holds a strong reference to finalizerKey.
 * #finalizerToPublic maps from finalizerKey to weakKey.
 * #weakKeyPropertyMap maps from weakKey to an instance of WeakKeyPropertyBag,
 *   which holds weak references to finalizerKey and weakKey.
 * #hashToPropertyMap maps from a hash to the same instance of WeakKeyPropertyBag.
 *
 * Shorthand:
 * weakArg => finalizerKey => weakKey => WeakKeyPropertyBag -> the same weakKey, the same finalizerKey, hash -> the same WeakKeyPropertyBag
 */
export default class WeakKeyComposer {
    /** @type {string[]} @constant */
    #weakArgList;
    /** @type {string[]} @constant */
    #strongArgList;
    /** @type {KeyHasher} @constant */
    #keyHasher;
    /** @type {FinalizationRegistry} @constant */
    #keyFinalizer = new FinalizationRegistry(finalizerKey => this.#deleteByFinalizerKey(finalizerKey));
    /** @type {WeakMap<FinalizerKey, WeakKey>} */
    #finalizerToPublic = new WeakMap;
    /** @type {WeakMap<WeakKey, WeakKeyPropertyBag>} @constant */
    #weakKeyPropertyMap = new WeakMap;
    /** @type {Map<hash, WeakKeyPropertyBag>} */
    #hashToPropertyMap = new Map;
    /**
     * @param {string[]} weakArgList   The list of weak argument names.
     * @param {string[]} strongArgList The list of strong argument names.
     */
    constructor(weakArgList, strongArgList = []) {
        if (new.target !== WeakKeyComposer)
            throw new Error("You cannot subclass WeakKeyComposer!");
        if (!Array.isArray(weakArgList) || (weakArgList.length === 0))
            throw new Error("weakArgList must be a string array of at least one argument!");
        if (!Array.isArray(strongArgList))
            throw new Error("strongArgList must be a string array!");
        // require all arguments be unique strings
        {
            const allArgs = weakArgList.concat(strongArgList);
            if (!allArgs.every(arg => (typeof arg === "string") && (arg.length > 0)))
                throw new Error("weakArgList and strongArgList can only contain non-empty strings!");
            const argSet = new Set(allArgs);
            if (argSet.size !== allArgs.length)
                throw new Error("There is a duplicate argument among weakArgList and strongArgList!");
        }
        this.#weakArgList = weakArgList.slice();
        this.#strongArgList = strongArgList.slice();
        this.#keyHasher = new KeyHasher();
        Object.freeze(this);
    }
    /**
     * Get an unique key for an ordered set of weak and strong arguments.  Create it if there isn't one.
     *
     * @param {object[]}  weakArguments   The list of weak arguments.
     * @param {any[]} strongArguments The list of strong arguments.
     * @returns {WeakKey} The key.
     * @public
     */
    getKey(weakArguments, strongArguments) {
        if (!this.isValidForKey(weakArguments, strongArguments))
            throw new Error("Argument lists do not form a valid key!");
        const hash = this.#keyHasher.getHash(...weakArguments.concat(strongArguments));
        let properties = this.#hashToPropertyMap.get(hash);
        if (properties) {
            // Each weak argument indirectly holds a strong reference on the weak key.
            return properties.weakKeyRef.deref();
        }
        const finalizerKey = new FinalizerKey;
        const weakKey = new WeakKey;
        properties = new WeakKeyPropertyBag(finalizerKey, weakKey, hash, strongArguments);
        weakArguments.forEach(weakArg => this.#keyFinalizer.register(weakArg, finalizerKey, finalizerKey));
        this.#finalizerToPublic.set(finalizerKey, weakKey);
        this.#weakKeyPropertyMap.set(weakKey, properties);
        this.#hashToPropertyMap.set(hash, properties);
        return weakKey;
    }
    /**
     * Determine if an unique key for an ordered set of weak and strong arguments exists.
     *
     * @param {object[]}  weakArguments   The list of weak arguments.
     * @param {any[]} strongArguments The list of strong arguments.
     * @returns {boolean} True if the key exists.
     * @public
     */
    hasKey(weakArguments, strongArguments) {
        const fullArgList = weakArguments.concat(strongArguments);
        const hash = this.#keyHasher.getHashIfExists(...fullArgList);
        return hash ? this.#hashToPropertyMap.has(hash) : false;
    }
    /**
     * Get the unique key for an ordered set of weak and strong arguments if it exists.
     *
     * @param {object[]}  weakArguments   The list of weak arguments.
     * @param {any[]} strongArguments The list of strong arguments.
     * @returns {WeakKey?} The WeakKey, or null if there isn't one already.
     * @public
     */
    getKeyIfExists(weakArguments, strongArguments) {
        let hash = this.#keyHasher.getHashIfExists(...weakArguments, ...strongArguments);
        if (!hash)
            return null;
        let properties = this.#hashToPropertyMap.get(hash);
        // Each weak argument indirectly holds a strong reference on the weak key.
        return properties ? properties.weakKeyRef.deref() : null;
    }
    /**
     * Delete an unique key for an ordered set of weak and strong arguments.
     *
     * @param {object[]}  weakArguments   The list of weak arguments.
     * @param {any[]} strongArguments The list of strong arguments.
     * @returns {boolean} True if the key was deleted, false if the key wasn't found.
     * @public
     */
    deleteKey(weakArguments, strongArguments) {
        void weakArguments;
        void strongArguments;
        const fullArgList = weakArguments.concat(strongArguments);
        const hash = this.#keyHasher.getHashIfExists(...fullArgList);
        if (!hash)
            return false;
        const properties = this.#hashToPropertyMap.get(hash);
        if (!properties)
            return false;
        // Each weak argument indirectly holds a strong reference on the finalizer key.
        const finalizerKey = properties.finalizerKeyRef.deref();
        return this.#deleteByFinalizerKey(finalizerKey);
    }
    #deleteByFinalizerKey(finalizerKey) {
        const weakKey = this.#finalizerToPublic.get(finalizerKey);
        if (!weakKey)
            return false;
        // Each weak argument indirectly holds a strong reference on the property bag.
        const properties = this.#weakKeyPropertyMap.get(weakKey);
        this.#keyFinalizer.unregister(finalizerKey);
        this.#finalizerToPublic.delete(finalizerKey);
        this.#weakKeyPropertyMap.delete(weakKey);
        this.#hashToPropertyMap.delete(properties.hash);
        return true;
    }
    /**
     * Determine if the set of arguments is valid to form a key.
     *
     * @param {object[]}  weakArguments   The list of weak arguments.
     * @param {any[]} strongArguments The list of strong arguments.
     * @returns {boolean} True if the arguments may lead to a WeakKey.
     */
    isValidForKey(weakArguments, strongArguments) {
        if (weakArguments.length !== this.#weakArgList.length)
            return false;
        if (weakArguments.some(arg => Object(arg) !== arg))
            return false;
        if (strongArguments.length !== this.#strongArgList.length)
            return false;
        return true;
    }
}
Object.freeze(WeakKeyComposer);
Object.freeze(WeakKeyComposer.prototype);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcG9zaXRlLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNvbXBvc2l0ZS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUVILE9BQU8sU0FBUyxNQUFNLGNBQWMsQ0FBQztBQUVyQyxNQUFNLE9BQU87SUFDWDtRQUNFLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEIsQ0FBQztDQUNGO0FBRUQsTUFBTSxZQUFZO0lBQ2hCO1FBQ0UsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0QixDQUFDO0NBQ0Y7QUFJRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLGtCQUFrQjtJQUN0QixlQUFlLENBQXdCO0lBQ3ZDLFVBQVUsQ0FBa0I7SUFDNUIsSUFBSSxDQUFzQjtJQUMxQixZQUFZLENBQWU7SUFDM0IsU0FBUyxDQUFXO0lBRXBCOzs7OztPQUtHO0lBQ0gsWUFBWSxZQUEwQixFQUFFLE9BQWdCLEVBQUUsSUFBVSxFQUFFLGVBQTBCO1FBQzlGLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV2QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUVqQixJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzlCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7U0FDOUM7YUFDSSxJQUFJLGVBQWUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3JDLElBQUksQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3JDO0lBQ0gsQ0FBQztDQUNGO0FBRUQ7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFDSCxNQUFNLENBQUMsT0FBTyxPQUFPLGVB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QUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVoRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxhQUFhLENBQUMsYUFBdUIsRUFBRSxlQUEwQjtRQUMvRCxJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNO1lBQ25ELE9BQU8sS0FBSyxDQUFDO1FBQ2YsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQztZQUNoRCxPQUFPLEtBQUssQ0FBQztRQUNmLElBQUksZUFBZSxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU07WUFDdkQsT0FBTyxLQUFLLENBQUM7UUFDZixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7Q0FDRjtBQUVELE1BQU0sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDL0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoaXMgU291cmNlIENvZGUgRm9ybSBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtcyBvZiB0aGUgTW96aWxsYSBQdWJsaWNcbiAqIExpY2Vuc2UsIHYuIDIuMC4gSWYgYSBjb3B5IG9mIHRoZSBNUEwgd2FzIG5vdCBkaXN0cmlidXRlZCB3aXRoIHRoaXNcbiAqIGZpbGUsIFlvdSBjYW4gb2J0YWluIG9uZSBhdCBodHRwczovL21vemlsbGEub3JnL01QTC8yLjAvLlxuICpcbiAqIEBsaWNlbnNlIE1QTC0yLjBcbiAqIEBhdXRob3IgQWxleGFuZGVyIEouIFZpbmNlbnQgPGFqdmluY2VudEBnbWFpbC5jb20+XG4gKiBAY29weXJpZ2h0IMKpIDIwMjEtMjAyMiBBbGV4YW5kZXIgSi4gVmluY2VudFxuICogQGZpbGVcbiAqIFRoaXMgdHJhbnNmb3JtcyBtdWx0aXBsZSBvYmplY3Qga2V5cyBpbnRvIGEgXCJ3ZWFrIGtleVwiIG9iamVjdC4gIFRoZSB3ZWFrIGFyZ3VtZW50c1xuICogaW4gV2Vha0tleUNvbXBvc2VyLnByb3RvdHlwZS5nZXRLZXkoKSBhcmUgdGhlIG9ubHkgZ3VhcmFudGVlcyB0aGF0IHRoZSB3ZWFrIGtleVxuICogd2lsbCBjb250aW51ZSB0byBleGlzdDogIGlmIG9uZSBvZiB0aGUgd2VhayBhcmd1bWVudHMgaXMgbm8gbG9uZ2VyIHJlYWNoYWJsZSxcbiAqIHRoZSB3ZWFrIGtleSBpcyBzdWJqZWN0IHRvIGdhcmJhZ2UgY29sbGVjdGlvbi5cbiAqL1xuXG5pbXBvcnQgS2V5SGFzaGVyIGZyb20gXCIuL0hhc2hlci5tanNcIjtcblxuY2xhc3MgV2Vha0tleSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cbn1cblxuY2xhc3MgRmluYWxpemVyS2V5IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgfVxufVxuXG50eXBlIGhhc2ggPSBzdHJpbmc7XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIEBjbGFzc2Rlc2NcbiAqIEludGVybmFsbHksIHRoZXJlIGFyZSB0d28gbGV2ZWxzIG9mIGtleXM6XG4gKiBmaW5hbGl6ZXJLZXkgaXMgYSBmcm96ZW4gb2JqZWN0IHdoaWNoIG5ldmVyIGxlYXZlcyB0aGlzIG1vZHVsZS5cbiAqIHdlYWtLZXkgaXMgdGhlIGFjdHVhbCBrZXkgd2UgZ2l2ZSB0byB0aGUgY2FsbGVyLlxuICovXG5jbGFzcyBXZWFrS2V5UHJvcGVydHlCYWcge1xuICBmaW5hbGl6ZXJLZXlSZWY6IFdlYWtSZWY8RmluYWxpemVyS2V5PjtcbiAgd2Vha0tleVJlZjogV2Vha1JlZjxXZWFrS2V5PlxuICBoYXNoOiBOb25OdWxsYWJsZTxzdHJpbmc+O1xuICBzdHJvbmdSZWZTZXQ/OiBTZXQ8dW5rbm93bj5cbiAgc3Ryb25nUmVmPzogdW5rbm93bjtcblxuICAvKipcbiAgICogQHBhcmFtIHtGaW5hbGl6ZXJLZXl9IGZpbmFsaXplcktleSAgICBUaGUgZmluYWxpemVyIGtleSBmb3IgZGVsZXRpbmcgdGhlIHdlYWsga2V5IG9iamVjdC5cbiAgICogQHBhcmFtIHtXZWFrS2V5fSAgICAgIHdlYWtLZXkgICAgICAgICBUaGUgd2VhayBrZXkgb2JqZWN0LlxuICAgKiBAcGFyYW0ge2hhc2h9ICAgICAgICAgaGFzaCAgICAgICAgICAgIEEgaGFzaCBvZiBhbGwgdGhlIGFyZ3VtZW50cyBmcm9tIGEgS2V5SGFzaGVyLlxuICAgKiBAcGFyYW0geypbXX0gICAgICAgICAgc3Ryb25nQXJndW1lbnRzIFRoZSBsaXN0IG9mIHN0cm9uZyBhcmd1bWVudHMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihmaW5hbGl6ZXJLZXk6IEZpbmFsaXplcktleSwgd2Vha0tleTogV2Vha0tleSwgaGFzaDogaGFzaCwgc3Ryb25nQXJndW1lbnRzOiB1bmtub3duW10pIHtcbiAgICB0aGlzLmZpbmFsaXplcktleVJlZiA9IG5ldyBXZWFrUmVmKGZpbmFsaXplcktleSk7XG4gICAgdGhpcy53ZWFrS2V5UmVmID0gbmV3IFdlYWtSZWYod2Vha0tleSk7XG5cbiAgICB0aGlzLmhhc2ggPSBoYXNoO1xuXG4gICAgaWYgKHN0cm9uZ0FyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICB0aGlzLnN0cm9uZ1JlZlNldCA9IG5ldyBTZXQoc3Ryb25nQXJndW1lbnRzKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoc3Ryb25nQXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgdGhpcy5zdHJvbmdSZWYgPSBzdHJvbmdBcmd1bWVudHNbMF07XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogVGhlIHdlYWsga2V5IGNvbXBvc2VyLlxuICpcbiAqIEBwdWJsaWNcbiAqIEBjbGFzc2Rlc2NcbiAqXG4gKiBFYWNoIHdlYWsgYXJndW1lbnQsIHRocm91Z2ggI2tleUZpbmFsaXplciwgaG9sZHMgYSBzdHJvbmcgcmVmZXJlbmNlIHRvIGZpbmFsaXplcktleS5cbiAqICNmaW5hbGl6ZXJUb1B1YmxpYyBtYXBzIGZyb20gZmluYWxpemVyS2V5IHRvIHdlYWtLZXkuXG4gKiAjd2Vha0tleVByb3BlcnR5TWFwIG1hcHMgZnJvbSB3ZWFrS2V5IHRvIGFuIGluc3RhbmNlIG9mIFdlYWtLZXlQcm9wZXJ0eUJhZyxcbiAqICAgd2hpY2ggaG9sZHMgd2VhayByZWZlcmVuY2VzIHRvIGZpbmFsaXplcktleSBhbmQgd2Vha0tleS5cbiAqICNoYXNoVG9Qcm9wZXJ0eU1hcCBtYXBzIGZyb20gYSBoYXNoIHRvIHRoZSBzYW1lIGluc3RhbmNlIG9mIFdlYWtLZXlQcm9wZXJ0eUJhZy5cbiAqXG4gKiBTaG9ydGhhbmQ6XG4gKiB3ZWFrQXJnID0+IGZpbmFsaXplcktleSA9PiB3ZWFrS2V5ID0+IFdlYWtLZXlQcm9wZXJ0eUJhZyAtPiB0aGUgc2FtZSB3ZWFrS2V5LCB0aGUgc2FtZSBmaW5hbGl6ZXJLZXksIGhhc2ggLT4gdGhlIHNhbWUgV2Vha0tleVByb3BlcnR5QmFnXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdlYWtLZXlDb21wb3NlciB7XG4gIC8qKiBAdHlwZSB7c3RyaW5nW119IEBjb25zdGFudCAqL1xuICAjd2Vha0FyZ0xpc3Q6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPjtcblxuICAvKiogQHR5cGUge3N0cmluZ1tdfSBAY29uc3RhbnQgKi9cbiAgI3N0cm9uZ0FyZ0xpc3Q6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPjtcblxuICAvKiogQHR5cGUge0tleUhhc2hlcn0gQGNvbnN0YW50ICovXG4gICNrZXlIYXNoZXI6IFJlYWRvbmx5PEtleUhhc2hlcj47XG5cbiAgLyoqIEB0eXBlIHtGaW5hbGl6YXRpb25SZWdpc3RyeX0gQGNvbnN0YW50ICovXG4gICNrZXlGaW5hbGl6ZXI6IFJlYWRvbmx5PEZpbmFsaXphdGlvblJlZ2lzdHJ5PEZpbmFsaXplcktleT4+ID0gbmV3IEZpbmFsaXphdGlvblJlZ2lzdHJ5KFxuICAgIGZpbmFsaXplcktleSA9PiB0aGlzLiNkZWxldGVCeUZpbmFsaXplcktleShmaW5hbGl6ZXJLZXkpXG4gICk7XG5cbiAgLyoqIEB0eXBlIHtXZWFrTWFwPEZpbmFsaXplcktleSwgV2Vha0tleT59ICovXG4gICNmaW5hbGl6ZXJUb1B1YmxpYzogUmVhZG9ubHk8V2Vha01hcDxGaW5hbGl6ZXJLZXksIFdlYWtLZXk+PiA9IG5ldyBXZWFrTWFwO1xuXG4gIC8qKiBAdHlwZSB7V2Vha01hcDxXZWFrS2V5LCBXZWFrS2V5UHJvcGVydHlCYWc+fSBAY29uc3RhbnQgKi9cbiAgI3dlYWtLZXlQcm9wZXJ0eU1hcDogUmVhZG9ubHk8V2Vha01hcDxXZWFrS2V5LCBXZWFrS2V5UHJvcGVydHlCYWc+PiA9IG5ldyBXZWFrTWFwO1xuXG4gIC8qKiBAdHlwZSB7TWFwPGhhc2gsIFdlYWtLZXlQcm9wZXJ0eUJhZz59ICovXG4gICNoYXNoVG9Qcm9wZXJ0eU1hcDogUmVhZG9ubHk8TWFwPGhhc2gsIFdlYWtLZXlQcm9wZXJ0eUJhZz4+ID0gbmV3IE1hcDtcblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gd2Vha0FyZ0xpc3QgICBUaGUgbGlzdCBvZiB3ZWFrIGFyZ3VtZW50IG5hbWVzLlxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBzdHJvbmdBcmdMaXN0IFRoZSBsaXN0IG9mIHN0cm9uZyBhcmd1bWVudCBuYW1lcy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHdlYWtBcmdMaXN0OiBzdHJpbmdbXSwgc3Ryb25nQXJnTGlzdDogc3RyaW5nW10gPSBbXSkge1xuICAgIGlmIChuZXcudGFyZ2V0ICE9PSBXZWFrS2V5Q29tcG9zZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgY2Fubm90IHN1YmNsYXNzIFdlYWtLZXlDb21wb3NlciFcIik7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHdlYWtBcmdMaXN0KSB8fCAod2Vha0FyZ0xpc3QubGVuZ3RoID09PSAwKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIndlYWtBcmdMaXN0IG11c3QgYmUgYSBzdHJpbmcgYXJyYXkgb2YgYXQgbGVhc3Qgb25lIGFyZ3VtZW50IVwiKTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoc3Ryb25nQXJnTGlzdCkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzdHJvbmdBcmdMaXN0IG11c3QgYmUgYSBzdHJpbmcgYXJyYXkhXCIpO1xuXG4gICAgLy8gcmVxdWlyZSBhbGwgYXJndW1lbnRzIGJlIHVuaXF1ZSBzdHJpbmdzXG4gICAge1xuICAgICAgY29uc3QgYWxsQXJncyA9IHdlYWtBcmdMaXN0LmNvbmNhdChzdHJvbmdBcmdMaXN0KTtcbiAgICAgIGlmICghYWxsQXJncy5ldmVyeShhcmcgPT4gKHR5cGVvZiBhcmcgPT09IFwic3RyaW5nXCIpICYmIChhcmcubGVuZ3RoID4gMCkpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ3ZWFrQXJnTGlzdCBhbmQgc3Ryb25nQXJnTGlzdCBjYW4gb25seSBjb250YWluIG5vbi1lbXB0eSBzdHJpbmdzIVwiKTtcblxuICAgICAgY29uc3QgYXJnU2V0ID0gbmV3IFNldChhbGxBcmdzKTtcbiAgICAgIGlmIChhcmdTZXQuc2l6ZSAhPT0gYWxsQXJncy5sZW5ndGgpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZXJlIGlzIGEgZHVwbGljYXRlIGFyZ3VtZW50IGFtb25nIHdlYWtBcmdMaXN0IGFuZCBzdHJvbmdBcmdMaXN0IVwiKTtcbiAgICB9XG5cbiAgICB0aGlzLiN3ZWFrQXJnTGlzdCA9IHdlYWtBcmdMaXN0LnNsaWNlKCk7XG4gICAgdGhpcy4jc3Ryb25nQXJnTGlzdCA9IHN0cm9uZ0FyZ0xpc3Quc2xpY2UoKTtcblxuICAgIHRoaXMuI2tleUhhc2hlciA9IG5ldyBLZXlIYXNoZXIoKTtcblxuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFuIHVuaXF1ZSBrZXkgZm9yIGFuIG9yZGVyZWQgc2V0IG9mIHdlYWsgYW5kIHN0cm9uZyBhcmd1bWVudHMuICBDcmVhdGUgaXQgaWYgdGhlcmUgaXNuJ3Qgb25lLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdFtdfSAgd2Vha0FyZ3VtZW50cyAgIFRoZSBsaXN0IG9mIHdlYWsgYXJndW1lbnRzLlxuICAgKiBAcGFyYW0ge2FueVtdfSBzdHJvbmdBcmd1bWVudHMgVGhlIGxpc3Qgb2Ygc3Ryb25nIGFyZ3VtZW50cy5cbiAgICogQHJldHVybnMge1dlYWtLZXl9IFRoZSBrZXkuXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGdldEtleSh3ZWFrQXJndW1lbnRzOiBvYmplY3RbXSwgc3Ryb25nQXJndW1lbnRzOiB1bmtub3duW10pIDogV2Vha0tleSB7XG4gICAgaWYgKCF0aGlzLmlzVmFsaWRGb3JLZXkod2Vha0FyZ3VtZW50cywgc3Ryb25nQXJndW1lbnRzKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkFyZ3VtZW50IGxpc3RzIGRvIG5vdCBmb3JtIGEgdmFsaWQga2V5IVwiKTtcblxuICAgIGNvbnN0IGhhc2ggPSB0aGlzLiNrZXlIYXNoZXIuZ2V0SGFzaCguLi53ZWFrQXJndW1lbnRzLmNvbmNhdChzdHJvbmdBcmd1bWVudHMpKTtcblxuICAgIGxldCBwcm9wZXJ0aWVzID0gdGhpcy4jaGFzaFRvUHJvcGVydHlNYXAuZ2V0KGhhc2gpO1xuICAgIGlmIChwcm9wZXJ0aWVzKSB7XG4gICAgICAvLyBFYWNoIHdlYWsgYXJndW1lbnQgaW5kaXJlY3RseSBob2xkcyBhIHN0cm9uZyByZWZlcmVuY2Ugb24gdGhlIHdlYWsga2V5LlxuICAgICAgcmV0dXJuIHByb3BlcnRpZXMud2Vha0tleVJlZi5kZXJlZigpITtcbiAgICB9XG5cbiAgICBjb25zdCBmaW5hbGl6ZXJLZXkgPSBuZXcgRmluYWxpemVyS2V5O1xuICAgIGNvbnN0IHdlYWtLZXkgPSBuZXcgV2Vha0tleTtcblxuICAgIHByb3BlcnRpZXMgPSBuZXcgV2Vha0tleVByb3BlcnR5QmFnKGZpbmFsaXplcktleSwgd2Vha0tleSwgaGFzaCwgc3Ryb25nQXJndW1lbnRzKTtcblxuICAgIHdlYWtBcmd1bWVudHMuZm9yRWFjaCh3ZWFrQXJnID0+IHRoaXMuI2tleUZpbmFsaXplci5yZWdpc3Rlcih3ZWFrQXJnLCBmaW5hbGl6ZXJLZXksIGZpbmFsaXplcktleSkpO1xuICAgIHRoaXMuI2ZpbmFsaXplclRvUHVibGljLnNldChmaW5hbGl6ZXJLZXksIHdlYWtLZXkpO1xuICAgIHRoaXMuI3dlYWtLZXlQcm9wZXJ0eU1hcC5zZXQod2Vha0tleSwgcHJvcGVydGllcyk7XG4gICAgdGhpcy4jaGFzaFRvUHJvcGVydHlNYXAuc2V0KGhhc2gsIHByb3BlcnRpZXMpO1xuXG4gICAgcmV0dXJuIHdlYWtLZXk7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIGlmIGFuIHVuaXF1ZSBrZXkgZm9yIGFuIG9yZGVyZWQgc2V0IG9mIHdlYWsgYW5kIHN0cm9uZyBhcmd1bWVudHMgZXhpc3RzLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdFtdfSAgd2Vha0FyZ3VtZW50cyAgIFRoZSBsaXN0IG9mIHdlYWsgYXJndW1lbnRzLlxuICAgKiBAcGFyYW0ge2FueVtdfSBzdHJvbmdBcmd1bWVudHMgVGhlIGxpc3Qgb2Ygc3Ryb25nIGFyZ3VtZW50cy5cbiAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIGtleSBleGlzdHMuXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGhhc0tleSh3ZWFrQXJndW1lbnRzOiBvYmplY3RbXSwgc3Ryb25nQXJndW1lbnRzOiB1bmtub3duW10pIDogYm9vbGVhbiB7XG4gICAgY29uc3QgZnVsbEFyZ0xpc3QgPSB3ZWFrQXJndW1lbnRzLmNvbmNhdChzdHJvbmdBcmd1bWVudHMpO1xuICAgIGNvbnN0IGhhc2ggPSB0aGlzLiNrZXlIYXNoZXIuZ2V0SGFzaElmRXhpc3RzKC4uLmZ1bGxBcmdMaXN0KTtcbiAgICByZXR1cm4gaGFzaCA/IHRoaXMuI2hhc2hUb1Byb3BlcnR5TWFwLmhhcyhoYXNoKSA6IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgdW5pcXVlIGtleSBmb3IgYW4gb3JkZXJlZCBzZXQgb2Ygd2VhayBhbmQgc3Ryb25nIGFyZ3VtZW50cyBpZiBpdCBleGlzdHMuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0W119ICB3ZWFrQXJndW1lbnRzICAgVGhlIGxpc3Qgb2Ygd2VhayBhcmd1bWVudHMuXG4gICAqIEBwYXJhbSB7YW55W119IHN0cm9uZ0FyZ3VtZW50cyBUaGUgbGlzdCBvZiBzdHJvbmcgYXJndW1lbnRzLlxuICAgKiBAcmV0dXJucyB7V2Vha0tleT99IFRoZSBXZWFrS2V5LCBvciBudWxsIGlmIHRoZXJlIGlzbid0IG9uZSBhbHJlYWR5LlxuICAgKiBAcHVibGljXG4gICAqL1xuICBnZXRLZXlJZkV4aXN0cyh3ZWFrQXJndW1lbnRzOiBvYmplY3RbXSwgc3Ryb25nQXJndW1lbnRzOiB1bmtub3duW10pIDogV2Vha0tleSB8IG51bGwge1xuICAgIGxldCBoYXNoID0gdGhpcy4ja2V5SGFzaGVyLmdldEhhc2hJZkV4aXN0cyguLi53ZWFrQXJndW1lbnRzLCAuLi5zdHJvbmdBcmd1bWVudHMpO1xuICAgIGlmICghaGFzaClcbiAgICAgIHJldHVybiBudWxsO1xuICAgIGxldCBwcm9wZXJ0aWVzID0gdGhpcy4jaGFzaFRvUHJvcGVydHlNYXAuZ2V0KGhhc2gpO1xuXG4gICAgLy8gRWFjaCB3ZWFrIGFyZ3VtZW50IGluZGlyZWN0bHkgaG9sZHMgYSBzdHJvbmcgcmVmZXJlbmNlIG9uIHRoZSB3ZWFrIGtleS5cbiAgICByZXR1cm4gcHJvcGVydGllcyA/IHByb3BlcnRpZXMud2Vha0tleVJlZi5kZXJlZigpISA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogRGVsZXRlIGFuIHVuaXF1ZSBrZXkgZm9yIGFuIG9yZGVyZWQgc2V0IG9mIHdlYWsgYW5kIHN0cm9uZyBhcmd1bWVudHMuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0W119ICB3ZWFrQXJndW1lbnRzICAgVGhlIGxpc3Qgb2Ygd2VhayBhcmd1bWVudHMuXG4gICAqIEBwYXJhbSB7YW55W119IHN0cm9uZ0FyZ3VtZW50cyBUaGUgbGlzdCBvZiBzdHJvbmcgYXJndW1lbnRzLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUga2V5IHdhcyBkZWxldGVkLCBmYWxzZSBpZiB0aGUga2V5IHdhc24ndCBmb3VuZC5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZGVsZXRlS2V5KHdlYWtBcmd1bWVudHM6IG9iamVjdFtdLCBzdHJvbmdBcmd1bWVudHM6IHVua25vd25bXSkgOiBib29sZWFuIHtcbiAgICB2b2lkIHdlYWtBcmd1bWVudHM7XG4gICAgdm9pZCBzdHJvbmdBcmd1bWVudHM7XG5cbiAgICBjb25zdCBmdWxsQXJnTGlzdCA9IHdlYWtBcmd1bWVudHMuY29uY2F0KHN0cm9uZ0FyZ3VtZW50cyk7XG5cbiAgICBjb25zdCBoYXNoID0gdGhpcy4ja2V5SGFzaGVyLmdldEhhc2hJZkV4aXN0cyguLi5mdWxsQXJnTGlzdCk7XG4gICAgaWYgKCFoYXNoKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgcHJvcGVydGllcyA9IHRoaXMuI2hhc2hUb1Byb3BlcnR5TWFwLmdldChoYXNoKTtcbiAgICBpZiAoIXByb3BlcnRpZXMpXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBFYWNoIHdlYWsgYXJndW1lbnQgaW5kaXJlY3RseSBob2xkcyBhIHN0cm9uZyByZWZlcmVuY2Ugb24gdGhlIGZpbmFsaXplciBrZXkuXG4gICAgY29uc3QgZmluYWxpemVyS2V5ID0gcHJvcGVydGllcy5maW5hbGl6ZXJLZXlSZWYuZGVyZWYoKSE7XG4gICAgcmV0dXJuIHRoaXMuI2RlbGV0ZUJ5RmluYWxpemVyS2V5KGZpbmFsaXplcktleSk7XG4gIH1cblxuICAjZGVsZXRlQnlGaW5hbGl6ZXJLZXkoZmluYWxpemVyS2V5OiBGaW5hbGl6ZXJLZXkpIDogYm9vbGVhbiB7XG4gICAgY29uc3Qgd2Vha0tleSA9IHRoaXMuI2ZpbmFsaXplclRvUHVibGljLmdldChmaW5hbGl6ZXJLZXkpO1xuICAgIGlmICghd2Vha0tleSlcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIC8vIEVhY2ggd2VhayBhcmd1bWVudCBpbmRpcmVjdGx5IGhvbGRzIGEgc3Ryb25nIHJlZmVyZW5jZSBvbiB0aGUgcHJvcGVydHkgYmFnLlxuICAgIGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLiN3ZWFrS2V5UHJvcGVydHlNYXAuZ2V0KHdlYWtLZXkpITtcblxuICAgIHRoaXMuI2tleUZpbmFsaXplci51bnJlZ2lzdGVyKGZpbmFsaXplcktleSk7XG4gICAgdGhpcy4jZmluYWxpemVyVG9QdWJsaWMuZGVsZXRlKGZpbmFsaXplcktleSk7XG4gICAgdGhpcy4jd2Vha0tleVByb3BlcnR5TWFwLmRlbGV0ZSh3ZWFrS2V5KTtcbiAgICB0aGlzLiNoYXNoVG9Qcm9wZXJ0eU1hcC5kZWxldGUocHJvcGVydGllcy5oYXNoKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZSBpZiB0aGUgc2V0IG9mIGFyZ3VtZW50cyBpcyB2YWxpZCB0byBmb3JtIGEga2V5LlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdFtdfSAgd2Vha0FyZ3VtZW50cyAgIFRoZSBsaXN0IG9mIHdlYWsgYXJndW1lbnRzLlxuICAgKiBAcGFyYW0ge2FueVtdfSBzdHJvbmdBcmd1bWVudHMgVGhlIGxpc3Qgb2Ygc3Ryb25nIGFyZ3VtZW50cy5cbiAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIGFyZ3VtZW50cyBtYXkgbGVhZCB0byBhIFdlYWtLZXkuXG4gICAqL1xuICBpc1ZhbGlkRm9yS2V5KHdlYWtBcmd1bWVudHM6IG9iamVjdFtdLCBzdHJvbmdBcmd1bWVudHM6IHVua25vd25bXSkgOiBib29sZWFuIHtcbiAgICBpZiAod2Vha0FyZ3VtZW50cy5sZW5ndGggIT09IHRoaXMuI3dlYWtBcmdMaXN0Lmxlbmd0aClcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICBpZiAod2Vha0FyZ3VtZW50cy5zb21lKGFyZyA9PiBPYmplY3QoYXJnKSAhPT0gYXJnKSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICBpZiAoc3Ryb25nQXJndW1lbnRzLmxlbmd0aCAhPT0gdGhpcy4jc3Ryb25nQXJnTGlzdC5sZW5ndGgpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuT2JqZWN0LmZyZWV6ZShXZWFrS2V5Q29tcG9zZXIpO1xuT2JqZWN0LmZyZWV6ZShXZWFrS2V5Q29tcG9zZXIucHJvdG90eXBlKTtcbiJdfQ==