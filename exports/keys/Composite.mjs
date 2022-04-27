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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tcG9zaXRlLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNvbXBvc2l0ZS5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUVILE9BQU8sU0FBUyxNQUFNLGNBQWMsQ0FBQztBQUVyQyxNQUFNLE9BQU87SUFDWDtRQUNFLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEIsQ0FBQztDQUNGO0FBRUQsTUFBTSxZQUFZO0lBQ2hCO1FBQ0UsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0QixDQUFDO0NBQ0Y7QUFJRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLGtCQUFrQjtJQUN0QixlQUFlLENBQXdCO0lBQ3ZDLFVBQVUsQ0FBa0I7SUFDNUIsSUFBSSxDQUFzQjtJQUMxQixZQUFZLENBQWU7SUFDM0IsU0FBUyxDQUFXO0lBRXBCOzs7OztPQUtHO0lBQ0gsWUFBWSxZQUEwQixFQUFFLE9BQWdCLEVBQUUsSUFBVSxFQUFFLGVBQTBCO1FBQzlGLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV2QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUVqQixJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzlCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7U0FDOUM7YUFDSSxJQUFJLGVBQWUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3JDLElBQUksQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3JDO0lBQ0gsQ0FBQztDQUNGO0FBRUQ7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFDSCxNQUFNLENBQUMsT0FBTyxPQUFPLGVB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Q0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFaEQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsYUFBYSxDQUFDLGFBQXVCLEVBQUUsZUFBMEI7UUFDL0QsSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTTtZQUNuRCxPQUFPLEtBQUssQ0FBQztRQUNmLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUM7WUFDaEQsT0FBTyxLQUFLLENBQUM7UUFDZixJQUFJLGVBQWUsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNO1lBQ3ZELE9BQU8sS0FBSyxDQUFDO1FBQ2YsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0NBQ0Y7QUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQy9CLE1BQU0sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGlzIFNvdXJjZSBDb2RlIEZvcm0gaXMgc3ViamVjdCB0byB0aGUgdGVybXMgb2YgdGhlIE1vemlsbGEgUHVibGljXG4gKiBMaWNlbnNlLCB2LiAyLjAuIElmIGEgY29weSBvZiB0aGUgTVBMIHdhcyBub3QgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzXG4gKiBmaWxlLCBZb3UgY2FuIG9idGFpbiBvbmUgYXQgaHR0cHM6Ly9tb3ppbGxhLm9yZy9NUEwvMi4wLy5cbiAqXG4gKiBAbGljZW5zZSBNUEwtMi4wXG4gKiBAYXV0aG9yIEFsZXhhbmRlciBKLiBWaW5jZW50IDxhanZpbmNlbnRAZ21haWwuY29tPlxuICogQGNvcHlyaWdodCDCqSAyMDIxLTIwMjIgQWxleGFuZGVyIEouIFZpbmNlbnRcbiAqIEBmaWxlXG4gKiBUaGlzIHRyYW5zZm9ybXMgbXVsdGlwbGUgb2JqZWN0IGtleXMgaW50byBhIFwid2VhayBrZXlcIiBvYmplY3QuICBUaGUgd2VhayBhcmd1bWVudHNcbiAqIGluIFdlYWtLZXlDb21wb3Nlci5wcm90b3R5cGUuZ2V0S2V5KCkgYXJlIHRoZSBvbmx5IGd1YXJhbnRlZXMgdGhhdCB0aGUgd2VhayBrZXlcbiAqIHdpbGwgY29udGludWUgdG8gZXhpc3Q6ICBpZiBvbmUgb2YgdGhlIHdlYWsgYXJndW1lbnRzIGlzIG5vIGxvbmdlciByZWFjaGFibGUsXG4gKiB0aGUgd2VhayBrZXkgaXMgc3ViamVjdCB0byBnYXJiYWdlIGNvbGxlY3Rpb24uXG4gKi9cblxuaW1wb3J0IEtleUhhc2hlciBmcm9tIFwiLi9IYXNoZXIubWpzXCI7XG5cbmNsYXNzIFdlYWtLZXkge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xuICB9XG59XG5cbmNsYXNzIEZpbmFsaXplcktleSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cbn1cblxudHlwZSBoYXNoID0gc3RyaW5nO1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBAY2xhc3NkZXNjXG4gKiBJbnRlcm5hbGx5LCB0aGVyZSBhcmUgdHdvIGxldmVscyBvZiBrZXlzOlxuICogZmluYWxpemVyS2V5IGlzIGEgZnJvemVuIG9iamVjdCB3aGljaCBuZXZlciBsZWF2ZXMgdGhpcyBtb2R1bGUuXG4gKiB3ZWFrS2V5IGlzIHRoZSBhY3R1YWwga2V5IHdlIGdpdmUgdG8gdGhlIGNhbGxlci5cbiAqL1xuY2xhc3MgV2Vha0tleVByb3BlcnR5QmFnIHtcbiAgZmluYWxpemVyS2V5UmVmOiBXZWFrUmVmPEZpbmFsaXplcktleT47XG4gIHdlYWtLZXlSZWY6IFdlYWtSZWY8V2Vha0tleT5cbiAgaGFzaDogTm9uTnVsbGFibGU8c3RyaW5nPjtcbiAgc3Ryb25nUmVmU2V0PzogU2V0PHVua25vd24+XG4gIHN0cm9uZ1JlZj86IHVua25vd247XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7RmluYWxpemVyS2V5fSBmaW5hbGl6ZXJLZXkgICAgVGhlIGZpbmFsaXplciBrZXkgZm9yIGRlbGV0aW5nIHRoZSB3ZWFrIGtleSBvYmplY3QuXG4gICAqIEBwYXJhbSB7V2Vha0tleX0gICAgICB3ZWFrS2V5ICAgICAgICAgVGhlIHdlYWsga2V5IG9iamVjdC5cbiAgICogQHBhcmFtIHtoYXNofSAgICAgICAgIGhhc2ggICAgICAgICAgICBBIGhhc2ggb2YgYWxsIHRoZSBhcmd1bWVudHMgZnJvbSBhIEtleUhhc2hlci5cbiAgICogQHBhcmFtIHsqW119ICAgICAgICAgIHN0cm9uZ0FyZ3VtZW50cyBUaGUgbGlzdCBvZiBzdHJvbmcgYXJndW1lbnRzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZmluYWxpemVyS2V5OiBGaW5hbGl6ZXJLZXksIHdlYWtLZXk6IFdlYWtLZXksIGhhc2g6IGhhc2gsIHN0cm9uZ0FyZ3VtZW50czogdW5rbm93bltdKSB7XG4gICAgdGhpcy5maW5hbGl6ZXJLZXlSZWYgPSBuZXcgV2Vha1JlZihmaW5hbGl6ZXJLZXkpO1xuICAgIHRoaXMud2Vha0tleVJlZiA9IG5ldyBXZWFrUmVmKHdlYWtLZXkpO1xuXG4gICAgdGhpcy5oYXNoID0gaGFzaDtcblxuICAgIGlmIChzdHJvbmdBcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgdGhpcy5zdHJvbmdSZWZTZXQgPSBuZXcgU2V0KHN0cm9uZ0FyZ3VtZW50cyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHN0cm9uZ0FyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHRoaXMuc3Ryb25nUmVmID0gc3Ryb25nQXJndW1lbnRzWzBdO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFRoZSB3ZWFrIGtleSBjb21wb3Nlci5cbiAqXG4gKiBAcHVibGljXG4gKiBAY2xhc3NkZXNjXG4gKlxuICogRWFjaCB3ZWFrIGFyZ3VtZW50LCB0aHJvdWdoICNrZXlGaW5hbGl6ZXIsIGhvbGRzIGEgc3Ryb25nIHJlZmVyZW5jZSB0byBmaW5hbGl6ZXJLZXkuXG4gKiAjZmluYWxpemVyVG9QdWJsaWMgbWFwcyBmcm9tIGZpbmFsaXplcktleSB0byB3ZWFrS2V5LlxuICogI3dlYWtLZXlQcm9wZXJ0eU1hcCBtYXBzIGZyb20gd2Vha0tleSB0byBhbiBpbnN0YW5jZSBvZiBXZWFrS2V5UHJvcGVydHlCYWcsXG4gKiAgIHdoaWNoIGhvbGRzIHdlYWsgcmVmZXJlbmNlcyB0byBmaW5hbGl6ZXJLZXkgYW5kIHdlYWtLZXkuXG4gKiAjaGFzaFRvUHJvcGVydHlNYXAgbWFwcyBmcm9tIGEgaGFzaCB0byB0aGUgc2FtZSBpbnN0YW5jZSBvZiBXZWFrS2V5UHJvcGVydHlCYWcuXG4gKlxuICogU2hvcnRoYW5kOlxuICogd2Vha0FyZyA9PiBmaW5hbGl6ZXJLZXkgPT4gd2Vha0tleSA9PiBXZWFrS2V5UHJvcGVydHlCYWcgLT4gdGhlIHNhbWUgd2Vha0tleSwgdGhlIHNhbWUgZmluYWxpemVyS2V5LCBoYXNoIC0+IHRoZSBzYW1lIFdlYWtLZXlQcm9wZXJ0eUJhZ1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXZWFrS2V5Q29tcG9zZXIge1xuICAvKiogQHR5cGUge3N0cmluZ1tdfSBAY29uc3RhbnQgKi9cbiAgI3dlYWtBcmdMaXN0OiBSZWFkb25seUFycmF5PHN0cmluZz47XG5cbiAgLyoqIEB0eXBlIHtzdHJpbmdbXX0gQGNvbnN0YW50ICovXG4gICNzdHJvbmdBcmdMaXN0OiBSZWFkb25seUFycmF5PHN0cmluZz47XG5cbiAgLyoqIEB0eXBlIHtLZXlIYXNoZXJ9IEBjb25zdGFudCAqL1xuICAja2V5SGFzaGVyOiBSZWFkb25seTxLZXlIYXNoZXI+O1xuXG4gIC8qKiBAdHlwZSB7RmluYWxpemF0aW9uUmVnaXN0cnl9IEBjb25zdGFudCAqL1xuICAja2V5RmluYWxpemVyOiBSZWFkb25seTxGaW5hbGl6YXRpb25SZWdpc3RyeTxGaW5hbGl6ZXJLZXk+PiA9IG5ldyBGaW5hbGl6YXRpb25SZWdpc3RyeShcbiAgICBmaW5hbGl6ZXJLZXkgPT4gdGhpcy4jZGVsZXRlQnlGaW5hbGl6ZXJLZXkoZmluYWxpemVyS2V5KVxuICApO1xuXG4gIC8qKiBAdHlwZSB7V2Vha01hcDxGaW5hbGl6ZXJLZXksIFdlYWtLZXk+fSAqL1xuICAjZmluYWxpemVyVG9QdWJsaWM6IFJlYWRvbmx5PFdlYWtNYXA8RmluYWxpemVyS2V5LCBXZWFrS2V5Pj4gPSBuZXcgV2Vha01hcDtcblxuICAvKiogQHR5cGUge1dlYWtNYXA8V2Vha0tleSwgV2Vha0tleVByb3BlcnR5QmFnPn0gQGNvbnN0YW50ICovXG4gICN3ZWFrS2V5UHJvcGVydHlNYXA6IFJlYWRvbmx5PFdlYWtNYXA8V2Vha0tleSwgV2Vha0tleVByb3BlcnR5QmFnPj4gPSBuZXcgV2Vha01hcDtcblxuICAvKiogQHR5cGUge01hcDxoYXNoLCBXZWFrS2V5UHJvcGVydHlCYWc+fSAqL1xuICAjaGFzaFRvUHJvcGVydHlNYXA6IFJlYWRvbmx5PE1hcDxoYXNoLCBXZWFrS2V5UHJvcGVydHlCYWc+PiA9IG5ldyBNYXA7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IHdlYWtBcmdMaXN0ICAgVGhlIGxpc3Qgb2Ygd2VhayBhcmd1bWVudCBuYW1lcy5cbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gc3Ryb25nQXJnTGlzdCBUaGUgbGlzdCBvZiBzdHJvbmcgYXJndW1lbnQgbmFtZXMuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3ZWFrQXJnTGlzdDogc3RyaW5nW10sIHN0cm9uZ0FyZ0xpc3Q6IHN0cmluZ1tdID0gW10pIHtcbiAgICBpZiAobmV3LnRhcmdldCAhPT0gV2Vha0tleUNvbXBvc2VyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IGNhbm5vdCBzdWJjbGFzcyBXZWFrS2V5Q29tcG9zZXIhXCIpO1xuICAgIGlmICghQXJyYXkuaXNBcnJheSh3ZWFrQXJnTGlzdCkgfHwgKHdlYWtBcmdMaXN0Lmxlbmd0aCA9PT0gMCkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ3ZWFrQXJnTGlzdCBtdXN0IGJlIGEgc3RyaW5nIGFycmF5IG9mIGF0IGxlYXN0IG9uZSBhcmd1bWVudCFcIik7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHN0cm9uZ0FyZ0xpc3QpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwic3Ryb25nQXJnTGlzdCBtdXN0IGJlIGEgc3RyaW5nIGFycmF5IVwiKTtcblxuICAgIC8vIHJlcXVpcmUgYWxsIGFyZ3VtZW50cyBiZSB1bmlxdWUgc3RyaW5nc1xuICAgIHtcbiAgICAgIGNvbnN0IGFsbEFyZ3MgPSB3ZWFrQXJnTGlzdC5jb25jYXQoc3Ryb25nQXJnTGlzdCk7XG4gICAgICBpZiAoIWFsbEFyZ3MuZXZlcnkoYXJnID0+ICh0eXBlb2YgYXJnID09PSBcInN0cmluZ1wiKSAmJiAoYXJnLmxlbmd0aCA+IDApKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwid2Vha0FyZ0xpc3QgYW5kIHN0cm9uZ0FyZ0xpc3QgY2FuIG9ubHkgY29udGFpbiBub24tZW1wdHkgc3RyaW5ncyFcIik7XG5cbiAgICAgIGNvbnN0IGFyZ1NldCA9IG5ldyBTZXQoYWxsQXJncyk7XG4gICAgICBpZiAoYXJnU2V0LnNpemUgIT09IGFsbEFyZ3MubGVuZ3RoKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGVyZSBpcyBhIGR1cGxpY2F0ZSBhcmd1bWVudCBhbW9uZyB3ZWFrQXJnTGlzdCBhbmQgc3Ryb25nQXJnTGlzdCFcIik7XG4gICAgfVxuXG4gICAgdGhpcy4jd2Vha0FyZ0xpc3QgPSB3ZWFrQXJnTGlzdC5zbGljZSgpO1xuICAgIHRoaXMuI3N0cm9uZ0FyZ0xpc3QgPSBzdHJvbmdBcmdMaXN0LnNsaWNlKCk7XG5cbiAgICB0aGlzLiNrZXlIYXNoZXIgPSBuZXcgS2V5SGFzaGVyKCk7XG5cbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbiB1bmlxdWUga2V5IGZvciBhbiBvcmRlcmVkIHNldCBvZiB3ZWFrIGFuZCBzdHJvbmcgYXJndW1lbnRzLiAgQ3JlYXRlIGl0IGlmIHRoZXJlIGlzbid0IG9uZS5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3RbXX0gIHdlYWtBcmd1bWVudHMgICBUaGUgbGlzdCBvZiB3ZWFrIGFyZ3VtZW50cy5cbiAgICogQHBhcmFtIHthbnlbXX0gc3Ryb25nQXJndW1lbnRzIFRoZSBsaXN0IG9mIHN0cm9uZyBhcmd1bWVudHMuXG4gICAqIEByZXR1cm5zIHtXZWFrS2V5fSBUaGUga2V5LlxuICAgKiBAcHVibGljXG4gICAqL1xuICBnZXRLZXkod2Vha0FyZ3VtZW50czogb2JqZWN0W10sIHN0cm9uZ0FyZ3VtZW50czogdW5rbm93bltdKSA6IFdlYWtLZXkge1xuICAgIGlmICghdGhpcy5pc1ZhbGlkRm9yS2V5KHdlYWtBcmd1bWVudHMsIHN0cm9uZ0FyZ3VtZW50cykpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBcmd1bWVudCBsaXN0cyBkbyBub3QgZm9ybSBhIHZhbGlkIGtleSFcIik7XG5cbiAgICBjb25zdCBoYXNoID0gdGhpcy4ja2V5SGFzaGVyLmdldEhhc2goLi4ud2Vha0FyZ3VtZW50cy5jb25jYXQoc3Ryb25nQXJndW1lbnRzKSk7XG5cbiAgICBsZXQgcHJvcGVydGllcyA9IHRoaXMuI2hhc2hUb1Byb3BlcnR5TWFwLmdldChoYXNoKTtcbiAgICBpZiAocHJvcGVydGllcykge1xuICAgICAgLy8gRWFjaCB3ZWFrIGFyZ3VtZW50IGluZGlyZWN0bHkgaG9sZHMgYSBzdHJvbmcgcmVmZXJlbmNlIG9uIHRoZSB3ZWFrIGtleS5cbiAgICAgIHJldHVybiBwcm9wZXJ0aWVzLndlYWtLZXlSZWYuZGVyZWYoKSBhcyBvYmplY3Q7XG4gICAgfVxuXG4gICAgY29uc3QgZmluYWxpemVyS2V5ID0gbmV3IEZpbmFsaXplcktleTtcbiAgICBjb25zdCB3ZWFrS2V5ID0gbmV3IFdlYWtLZXk7XG5cbiAgICBwcm9wZXJ0aWVzID0gbmV3IFdlYWtLZXlQcm9wZXJ0eUJhZyhmaW5hbGl6ZXJLZXksIHdlYWtLZXksIGhhc2gsIHN0cm9uZ0FyZ3VtZW50cyk7XG5cbiAgICB3ZWFrQXJndW1lbnRzLmZvckVhY2god2Vha0FyZyA9PiB0aGlzLiNrZXlGaW5hbGl6ZXIucmVnaXN0ZXIod2Vha0FyZywgZmluYWxpemVyS2V5LCBmaW5hbGl6ZXJLZXkpKTtcbiAgICB0aGlzLiNmaW5hbGl6ZXJUb1B1YmxpYy5zZXQoZmluYWxpemVyS2V5LCB3ZWFrS2V5KTtcbiAgICB0aGlzLiN3ZWFrS2V5UHJvcGVydHlNYXAuc2V0KHdlYWtLZXksIHByb3BlcnRpZXMpO1xuICAgIHRoaXMuI2hhc2hUb1Byb3BlcnR5TWFwLnNldChoYXNoLCBwcm9wZXJ0aWVzKTtcblxuICAgIHJldHVybiB3ZWFrS2V5O1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZSBpZiBhbiB1bmlxdWUga2V5IGZvciBhbiBvcmRlcmVkIHNldCBvZiB3ZWFrIGFuZCBzdHJvbmcgYXJndW1lbnRzIGV4aXN0cy5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3RbXX0gIHdlYWtBcmd1bWVudHMgICBUaGUgbGlzdCBvZiB3ZWFrIGFyZ3VtZW50cy5cbiAgICogQHBhcmFtIHthbnlbXX0gc3Ryb25nQXJndW1lbnRzIFRoZSBsaXN0IG9mIHN0cm9uZyBhcmd1bWVudHMuXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBrZXkgZXhpc3RzLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBoYXNLZXkod2Vha0FyZ3VtZW50czogb2JqZWN0W10sIHN0cm9uZ0FyZ3VtZW50czogdW5rbm93bltdKSA6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGZ1bGxBcmdMaXN0ID0gd2Vha0FyZ3VtZW50cy5jb25jYXQoc3Ryb25nQXJndW1lbnRzKTtcbiAgICBjb25zdCBoYXNoID0gdGhpcy4ja2V5SGFzaGVyLmdldEhhc2hJZkV4aXN0cyguLi5mdWxsQXJnTGlzdCk7XG4gICAgcmV0dXJuIGhhc2ggPyB0aGlzLiNoYXNoVG9Qcm9wZXJ0eU1hcC5oYXMoaGFzaCkgOiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHVuaXF1ZSBrZXkgZm9yIGFuIG9yZGVyZWQgc2V0IG9mIHdlYWsgYW5kIHN0cm9uZyBhcmd1bWVudHMgaWYgaXQgZXhpc3RzLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdFtdfSAgd2Vha0FyZ3VtZW50cyAgIFRoZSBsaXN0IG9mIHdlYWsgYXJndW1lbnRzLlxuICAgKiBAcGFyYW0ge2FueVtdfSBzdHJvbmdBcmd1bWVudHMgVGhlIGxpc3Qgb2Ygc3Ryb25nIGFyZ3VtZW50cy5cbiAgICogQHJldHVybnMge1dlYWtLZXk/fSBUaGUgV2Vha0tleSwgb3IgbnVsbCBpZiB0aGVyZSBpc24ndCBvbmUgYWxyZWFkeS5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZ2V0S2V5SWZFeGlzdHMod2Vha0FyZ3VtZW50czogb2JqZWN0W10sIHN0cm9uZ0FyZ3VtZW50czogdW5rbm93bltdKSA6IFdlYWtLZXkgfCBudWxsIHtcbiAgICBsZXQgaGFzaCA9IHRoaXMuI2tleUhhc2hlci5nZXRIYXNoSWZFeGlzdHMoLi4ud2Vha0FyZ3VtZW50cywgLi4uc3Ryb25nQXJndW1lbnRzKTtcbiAgICBpZiAoIWhhc2gpXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICBsZXQgcHJvcGVydGllcyA9IHRoaXMuI2hhc2hUb1Byb3BlcnR5TWFwLmdldChoYXNoKTtcblxuICAgIC8vIEVhY2ggd2VhayBhcmd1bWVudCBpbmRpcmVjdGx5IGhvbGRzIGEgc3Ryb25nIHJlZmVyZW5jZSBvbiB0aGUgd2VhayBrZXkuXG4gICAgcmV0dXJuIHByb3BlcnRpZXMgPyBwcm9wZXJ0aWVzLndlYWtLZXlSZWYuZGVyZWYoKSBhcyBvYmplY3QgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZSBhbiB1bmlxdWUga2V5IGZvciBhbiBvcmRlcmVkIHNldCBvZiB3ZWFrIGFuZCBzdHJvbmcgYXJndW1lbnRzLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdFtdfSAgd2Vha0FyZ3VtZW50cyAgIFRoZSBsaXN0IG9mIHdlYWsgYXJndW1lbnRzLlxuICAgKiBAcGFyYW0ge2FueVtdfSBzdHJvbmdBcmd1bWVudHMgVGhlIGxpc3Qgb2Ygc3Ryb25nIGFyZ3VtZW50cy5cbiAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIGtleSB3YXMgZGVsZXRlZCwgZmFsc2UgaWYgdGhlIGtleSB3YXNuJ3QgZm91bmQuXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGRlbGV0ZUtleSh3ZWFrQXJndW1lbnRzOiBvYmplY3RbXSwgc3Ryb25nQXJndW1lbnRzOiB1bmtub3duW10pIDogYm9vbGVhbiB7XG4gICAgdm9pZCB3ZWFrQXJndW1lbnRzO1xuICAgIHZvaWQgc3Ryb25nQXJndW1lbnRzO1xuXG4gICAgY29uc3QgZnVsbEFyZ0xpc3QgPSB3ZWFrQXJndW1lbnRzLmNvbmNhdChzdHJvbmdBcmd1bWVudHMpO1xuXG4gICAgY29uc3QgaGFzaCA9IHRoaXMuI2tleUhhc2hlci5nZXRIYXNoSWZFeGlzdHMoLi4uZnVsbEFyZ0xpc3QpO1xuICAgIGlmICghaGFzaClcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLiNoYXNoVG9Qcm9wZXJ0eU1hcC5nZXQoaGFzaCk7XG4gICAgaWYgKCFwcm9wZXJ0aWVzKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gRWFjaCB3ZWFrIGFyZ3VtZW50IGluZGlyZWN0bHkgaG9sZHMgYSBzdHJvbmcgcmVmZXJlbmNlIG9uIHRoZSBmaW5hbGl6ZXIga2V5LlxuICAgIGNvbnN0IGZpbmFsaXplcktleSA9IHByb3BlcnRpZXMuZmluYWxpemVyS2V5UmVmLmRlcmVmKCkgYXMgb2JqZWN0O1xuICAgIHJldHVybiB0aGlzLiNkZWxldGVCeUZpbmFsaXplcktleShmaW5hbGl6ZXJLZXkpO1xuICB9XG5cbiAgI2RlbGV0ZUJ5RmluYWxpemVyS2V5KGZpbmFsaXplcktleTogRmluYWxpemVyS2V5KSA6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHdlYWtLZXkgPSB0aGlzLiNmaW5hbGl6ZXJUb1B1YmxpYy5nZXQoZmluYWxpemVyS2V5KTtcbiAgICBpZiAoIXdlYWtLZXkpXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBFYWNoIHdlYWsgYXJndW1lbnQgaW5kaXJlY3RseSBob2xkcyBhIHN0cm9uZyByZWZlcmVuY2Ugb24gdGhlIHByb3BlcnR5IGJhZy5cbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gdGhpcy4jd2Vha0tleVByb3BlcnR5TWFwLmdldCh3ZWFrS2V5KSBhcyBXZWFrS2V5UHJvcGVydHlCYWc7XG5cbiAgICB0aGlzLiNrZXlGaW5hbGl6ZXIudW5yZWdpc3RlcihmaW5hbGl6ZXJLZXkpO1xuICAgIHRoaXMuI2ZpbmFsaXplclRvUHVibGljLmRlbGV0ZShmaW5hbGl6ZXJLZXkpO1xuICAgIHRoaXMuI3dlYWtLZXlQcm9wZXJ0eU1hcC5kZWxldGUod2Vha0tleSk7XG4gICAgdGhpcy4jaGFzaFRvUHJvcGVydHlNYXAuZGVsZXRlKHByb3BlcnRpZXMuaGFzaCk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgaWYgdGhlIHNldCBvZiBhcmd1bWVudHMgaXMgdmFsaWQgdG8gZm9ybSBhIGtleS5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3RbXX0gIHdlYWtBcmd1bWVudHMgICBUaGUgbGlzdCBvZiB3ZWFrIGFyZ3VtZW50cy5cbiAgICogQHBhcmFtIHthbnlbXX0gc3Ryb25nQXJndW1lbnRzIFRoZSBsaXN0IG9mIHN0cm9uZyBhcmd1bWVudHMuXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBhcmd1bWVudHMgbWF5IGxlYWQgdG8gYSBXZWFrS2V5LlxuICAgKi9cbiAgaXNWYWxpZEZvcktleSh3ZWFrQXJndW1lbnRzOiBvYmplY3RbXSwgc3Ryb25nQXJndW1lbnRzOiB1bmtub3duW10pIDogYm9vbGVhbiB7XG4gICAgaWYgKHdlYWtBcmd1bWVudHMubGVuZ3RoICE9PSB0aGlzLiN3ZWFrQXJnTGlzdC5sZW5ndGgpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHdlYWtBcmd1bWVudHMuc29tZShhcmcgPT4gT2JqZWN0KGFyZykgIT09IGFyZykpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHN0cm9uZ0FyZ3VtZW50cy5sZW5ndGggIT09IHRoaXMuI3N0cm9uZ0FyZ0xpc3QubGVuZ3RoKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbk9iamVjdC5mcmVlemUoV2Vha0tleUNvbXBvc2VyKTtcbk9iamVjdC5mcmVlemUoV2Vha0tleUNvbXBvc2VyLnByb3RvdHlwZSk7XG4iXX0=