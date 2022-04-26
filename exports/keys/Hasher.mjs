/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * @license MPL-2.0
 * @author Alexander J. Vincent <ajvincent@gmail.com>
 * @copyright © 2021-2022 Alexander J. Vincent
 * @file
 * This hashes multiple keys into a string.  Unknown keys get new hash values if we need them.
 */
import { DefaultMap, DefaultWeakMap } from "./DefaultMap.mjs";
export default class KeyHasher {
    /** @type {number} */
    #hashCount = 0;
    /** @type {WeakMap<object, string>} @constant */
    #weakValueToHash = new DefaultWeakMap();
    /** @type {Map<*, string>} @constant */
    #strongValueToHash = new DefaultMap();
    /** @type {boolean} @constant */
    #sortKeys = false;
    #getMap(key) {
        return Object(key) === key ? this.#weakValueToHash : this.#strongValueToHash;
    }
    #requireKey(key) {
        const map = this.#getMap(key);
        return map.getDefault(key, () => (++this.#hashCount).toString(36));
    }
    /**
     * @param {boolean} sortKeys True if we should sort the keys we generate.
     */
    constructor(sortKeys = false) {
        if (new.target !== KeyHasher)
            throw new Error("You cannot subclass KeyHasher!");
        this.#sortKeys = Boolean(sortKeys);
        Object.freeze(this);
    }
    getHash(...args) {
        const rv = args.map(arg => this.#requireKey(arg));
        if (this.#sortKeys)
            rv.sort();
        return rv.join(",");
    }
    getHashIfExists(...args) {
        const values = [];
        const result = args.every(arg => {
            const rv = this.#getMap(arg).get(arg);
            if (rv)
                values.push(rv);
            return rv;
        });
        if (!result)
            return "";
        if (this.#sortKeys)
            values.sort();
        return values.join(",");
    }
}
Object.freeze(KeyHasher.prototype);
Object.freeze(KeyHasher);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGFzaGVyLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkhhc2hlci5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7R0FVRztBQUVILE9BQU8sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFLOUQsTUFBTSxDQUFDLE9BQU8sT0FBTyxTQUFTO0lBQzVCLHFCQUFxQjtJQUNyQixVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBRWYsZ0RBQWdEO0lBQ2hELGdCQUFnQixHQUFlLElBQUksY0FBYyxFQUFFLENBQUM7SUFFcEQsdUNBQXVDO0lBQ3ZDLGtCQUFrQixHQUFpQixJQUFJLFVBQVUsRUFBRSxDQUFDO0lBRXBELGdDQUFnQztJQUNoQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBRWxCLE9BQU8sQ0FBQyxHQUFZO1FBQ2xCLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUM7SUFDL0UsQ0FBQztJQUVELFdBQVcsQ0FBQyxHQUFRO1FBQ2xCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUIsT0FBTyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFRDs7T0FFRztJQUNILFlBQVksUUFBUSxHQUFHLEtBQUs7UUFDMUIsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLFNBQVM7WUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25DLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFHLElBQWU7UUFDeEIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNsRCxJQUFJLElBQUksQ0FBQyxTQUFTO1lBQ2hCLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNaLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0QixDQUFDO0lBRUQsZUFBZSxDQUFDLEdBQUcsSUFBVztRQUM1QixNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7UUFDNUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM5QixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0QyxJQUFJLEVBQUU7Z0JBQ0osTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNsQixPQUFPLEVBQUUsQ0FBQztRQUNaLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLE1BQU07WUFDVCxPQUFPLEVBQUUsQ0FBQztRQUVaLElBQUksSUFBSSxDQUFDLFNBQVM7WUFDaEIsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRWhCLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMxQixDQUFDO0NBQ0Y7QUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGlzIFNvdXJjZSBDb2RlIEZvcm0gaXMgc3ViamVjdCB0byB0aGUgdGVybXMgb2YgdGhlIE1vemlsbGEgUHVibGljXG4gKiBMaWNlbnNlLCB2LiAyLjAuIElmIGEgY29weSBvZiB0aGUgTVBMIHdhcyBub3QgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzXG4gKiBmaWxlLCBZb3UgY2FuIG9idGFpbiBvbmUgYXQgaHR0cHM6Ly9tb3ppbGxhLm9yZy9NUEwvMi4wLy5cbiAqXG4gKiBAbGljZW5zZSBNUEwtMi4wXG4gKiBAYXV0aG9yIEFsZXhhbmRlciBKLiBWaW5jZW50IDxhanZpbmNlbnRAZ21haWwuY29tPlxuICogQGNvcHlyaWdodCDCqSAyMDIxLTIwMjIgQWxleGFuZGVyIEouIFZpbmNlbnRcbiAqIEBmaWxlXG4gKiBUaGlzIGhhc2hlcyBtdWx0aXBsZSBrZXlzIGludG8gYSBzdHJpbmcuICBVbmtub3duIGtleXMgZ2V0IG5ldyBoYXNoIHZhbHVlcyBpZiB3ZSBuZWVkIHRoZW0uXG4gKi9cblxuaW1wb3J0IHsgRGVmYXVsdE1hcCwgRGVmYXVsdFdlYWtNYXAgfSBmcm9tIFwiLi9EZWZhdWx0TWFwLm1qc1wiO1xuXG50eXBlIFdlYWtSZWZNYXAgPSBEZWZhdWx0V2Vha01hcDxvYmplY3QsIHN0cmluZz5cbnR5cGUgU3Ryb25nUmVmTWFwID0gRGVmYXVsdE1hcDx1bmtub3duLCBzdHJpbmc+XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtleUhhc2hlciB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAjaGFzaENvdW50ID0gMDtcblxuICAvKiogQHR5cGUge1dlYWtNYXA8b2JqZWN0LCBzdHJpbmc+fSBAY29uc3RhbnQgKi9cbiAgI3dlYWtWYWx1ZVRvSGFzaDogV2Vha1JlZk1hcCA9IG5ldyBEZWZhdWx0V2Vha01hcCgpO1xuXG4gIC8qKiBAdHlwZSB7TWFwPCosIHN0cmluZz59IEBjb25zdGFudCAqL1xuICAjc3Ryb25nVmFsdWVUb0hhc2g6IFN0cm9uZ1JlZk1hcCA9IG5ldyBEZWZhdWx0TWFwKCk7XG5cbiAgLyoqIEB0eXBlIHtib29sZWFufSBAY29uc3RhbnQgKi9cbiAgI3NvcnRLZXlzID0gZmFsc2U7XG5cbiAgI2dldE1hcChrZXk6IHVua25vd24pIDogV2Vha1JlZk1hcCB8IFN0cm9uZ1JlZk1hcCB7XG4gICAgcmV0dXJuIE9iamVjdChrZXkpID09PSBrZXkgPyB0aGlzLiN3ZWFrVmFsdWVUb0hhc2ggOiB0aGlzLiNzdHJvbmdWYWx1ZVRvSGFzaDtcbiAgfVxuXG4gICNyZXF1aXJlS2V5KGtleTogYW55KSA6IHN0cmluZyB7XG4gICAgY29uc3QgbWFwID0gdGhpcy4jZ2V0TWFwKGtleSk7XG4gICAgcmV0dXJuIG1hcC5nZXREZWZhdWx0KGtleSwgKCkgPT4gKCsrdGhpcy4jaGFzaENvdW50KS50b1N0cmluZygzNikpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gc29ydEtleXMgVHJ1ZSBpZiB3ZSBzaG91bGQgc29ydCB0aGUga2V5cyB3ZSBnZW5lcmF0ZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHNvcnRLZXlzID0gZmFsc2UpIHtcbiAgICBpZiAobmV3LnRhcmdldCAhPT0gS2V5SGFzaGVyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IGNhbm5vdCBzdWJjbGFzcyBLZXlIYXNoZXIhXCIpO1xuICAgIHRoaXMuI3NvcnRLZXlzID0gQm9vbGVhbihzb3J0S2V5cyk7XG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgfVxuXG4gIGdldEhhc2goLi4uYXJnczogdW5rbm93bltdKSA6IHN0cmluZyB7XG4gICAgY29uc3QgcnYgPSBhcmdzLm1hcChhcmcgPT4gdGhpcy4jcmVxdWlyZUtleShhcmcpKTtcbiAgICBpZiAodGhpcy4jc29ydEtleXMpXG4gICAgICBydi5zb3J0KCk7XG4gICAgcmV0dXJuIHJ2LmpvaW4oXCIsXCIpO1xuICB9XG5cbiAgZ2V0SGFzaElmRXhpc3RzKC4uLmFyZ3M6IGFueVtdKSA6IHN0cmluZyB7XG4gICAgY29uc3QgdmFsdWVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IHJlc3VsdCA9IGFyZ3MuZXZlcnkoYXJnID0+IHtcbiAgICAgIGNvbnN0IHJ2ID0gdGhpcy4jZ2V0TWFwKGFyZykuZ2V0KGFyZyk7XG4gICAgICBpZiAocnYpXG4gICAgICAgIHZhbHVlcy5wdXNoKHJ2KTtcbiAgICAgIHJldHVybiBydjtcbiAgICB9KTtcblxuICAgIGlmICghcmVzdWx0KVxuICAgICAgcmV0dXJuIFwiXCI7XG5cbiAgICBpZiAodGhpcy4jc29ydEtleXMpXG4gICAgICB2YWx1ZXMuc29ydCgpO1xuXG4gICAgcmV0dXJuIHZhbHVlcy5qb2luKFwiLFwiKTtcbiAgfVxufVxuXG5PYmplY3QuZnJlZXplKEtleUhhc2hlci5wcm90b3R5cGUpO1xuT2JqZWN0LmZyZWV6ZShLZXlIYXNoZXIpO1xuIl19