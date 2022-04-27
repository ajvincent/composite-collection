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
    #incrementer = () => {
        return (++this.#hashCount).toString(36);
    };
    #requireKey(key) {
        if (Object(key) === key) {
            return this.#weakValueToHash.getDefault(key, this.#incrementer);
        }
        return this.#strongValueToHash.getDefault(key, this.#incrementer);
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
            let rv;
            if (Object(arg) === arg)
                rv = this.#weakValueToHash.get(arg);
            else
                rv = this.#strongValueToHash.get(arg);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGFzaGVyLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkhhc2hlci5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7R0FVRztBQUVILE9BQU8sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFLOUQsTUFBTSxDQUFDLE9BQU8sT0FBTyxTQUFTO0lBQzVCLHFCQUFxQjtJQUNyQixVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBRWYsZ0RBQWdEO0lBQ2hELGdCQUFnQixHQUFlLElBQUksY0FBYyxFQUFFLENBQUM7SUFFcEQsdUNBQXVDO0lBQ3ZDLGtCQUFrQixHQUFpQixJQUFJLFVBQVUsRUFBRSxDQUFDO0lBRXBELGdDQUFnQztJQUNoQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBRWxCLFlBQVksR0FBbUIsR0FBRyxFQUFFO1FBQ2xDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUMsQ0FBQyxDQUFBO0lBRUQsV0FBVyxDQUFDLEdBQVk7UUFDdEIsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxFQUFFO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxHQUFhLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQzNFO1FBQ0QsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVEOztPQUVHO0lBQ0gsWUFBWSxRQUFRLEdBQUcsS0FBSztRQUMxQixJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssU0FBUztZQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0QixDQUFDO0lBRUQsT0FBTyxDQUFDLEdBQUcsSUFBZTtRQUN4QixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2xELElBQUksSUFBSSxDQUFDLFNBQVM7WUFDaEIsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1osT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFFRCxlQUFlLENBQUMsR0FBRyxJQUFlO1FBQ2hDLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztRQUM1QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQzlCLElBQUksRUFBc0IsQ0FBQztZQUMzQixJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHO2dCQUNyQixFQUFFLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFhLENBQUMsQ0FBQzs7Z0JBRTlDLEVBQUUsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRXhDLElBQUksRUFBRTtnQkFDSixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2xCLE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsTUFBTTtZQUNULE9BQU8sRUFBRSxDQUFDO1FBRVosSUFBSSxJQUFJLENBQUMsU0FBUztZQUNoQixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFaEIsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLENBQUM7Q0FDRjtBQUVELE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ25DLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoaXMgU291cmNlIENvZGUgRm9ybSBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtcyBvZiB0aGUgTW96aWxsYSBQdWJsaWNcbiAqIExpY2Vuc2UsIHYuIDIuMC4gSWYgYSBjb3B5IG9mIHRoZSBNUEwgd2FzIG5vdCBkaXN0cmlidXRlZCB3aXRoIHRoaXNcbiAqIGZpbGUsIFlvdSBjYW4gb2J0YWluIG9uZSBhdCBodHRwczovL21vemlsbGEub3JnL01QTC8yLjAvLlxuICpcbiAqIEBsaWNlbnNlIE1QTC0yLjBcbiAqIEBhdXRob3IgQWxleGFuZGVyIEouIFZpbmNlbnQgPGFqdmluY2VudEBnbWFpbC5jb20+XG4gKiBAY29weXJpZ2h0IMKpIDIwMjEtMjAyMiBBbGV4YW5kZXIgSi4gVmluY2VudFxuICogQGZpbGVcbiAqIFRoaXMgaGFzaGVzIG11bHRpcGxlIGtleXMgaW50byBhIHN0cmluZy4gIFVua25vd24ga2V5cyBnZXQgbmV3IGhhc2ggdmFsdWVzIGlmIHdlIG5lZWQgdGhlbS5cbiAqL1xuXG5pbXBvcnQgeyBEZWZhdWx0TWFwLCBEZWZhdWx0V2Vha01hcCB9IGZyb20gXCIuL0RlZmF1bHRNYXAubWpzXCI7XG5cbnR5cGUgV2Vha1JlZk1hcCA9IERlZmF1bHRXZWFrTWFwPG9iamVjdCwgc3RyaW5nPlxudHlwZSBTdHJvbmdSZWZNYXAgPSBEZWZhdWx0TWFwPHVua25vd24sIHN0cmluZz5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2V5SGFzaGVyIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICNoYXNoQ291bnQgPSAwO1xuXG4gIC8qKiBAdHlwZSB7V2Vha01hcDxvYmplY3QsIHN0cmluZz59IEBjb25zdGFudCAqL1xuICAjd2Vha1ZhbHVlVG9IYXNoOiBXZWFrUmVmTWFwID0gbmV3IERlZmF1bHRXZWFrTWFwKCk7XG5cbiAgLyoqIEB0eXBlIHtNYXA8Kiwgc3RyaW5nPn0gQGNvbnN0YW50ICovXG4gICNzdHJvbmdWYWx1ZVRvSGFzaDogU3Ryb25nUmVmTWFwID0gbmV3IERlZmF1bHRNYXAoKTtcblxuICAvKiogQHR5cGUge2Jvb2xlYW59IEBjb25zdGFudCAqL1xuICAjc29ydEtleXMgPSBmYWxzZTtcblxuICAjaW5jcmVtZW50ZXI6ICgoKSA9PiBzdHJpbmcpID0gKCkgPT4ge1xuICAgIHJldHVybiAoKyt0aGlzLiNoYXNoQ291bnQpLnRvU3RyaW5nKDM2KTtcbiAgfVxuXG4gICNyZXF1aXJlS2V5KGtleTogdW5rbm93bikgOiBzdHJpbmcge1xuICAgIGlmIChPYmplY3Qoa2V5KSA9PT0ga2V5KSB7XG4gICAgICByZXR1cm4gdGhpcy4jd2Vha1ZhbHVlVG9IYXNoLmdldERlZmF1bHQoa2V5IGFzIG9iamVjdCwgdGhpcy4jaW5jcmVtZW50ZXIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy4jc3Ryb25nVmFsdWVUb0hhc2guZ2V0RGVmYXVsdChrZXksIHRoaXMuI2luY3JlbWVudGVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNvcnRLZXlzIFRydWUgaWYgd2Ugc2hvdWxkIHNvcnQgdGhlIGtleXMgd2UgZ2VuZXJhdGUuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihzb3J0S2V5cyA9IGZhbHNlKSB7XG4gICAgaWYgKG5ldy50YXJnZXQgIT09IEtleUhhc2hlcilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBjYW5ub3Qgc3ViY2xhc3MgS2V5SGFzaGVyIVwiKTtcbiAgICB0aGlzLiNzb3J0S2V5cyA9IEJvb2xlYW4oc29ydEtleXMpO1xuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cblxuICBnZXRIYXNoKC4uLmFyZ3M6IHVua25vd25bXSkgOiBzdHJpbmcge1xuICAgIGNvbnN0IHJ2ID0gYXJncy5tYXAoYXJnID0+IHRoaXMuI3JlcXVpcmVLZXkoYXJnKSk7XG4gICAgaWYgKHRoaXMuI3NvcnRLZXlzKVxuICAgICAgcnYuc29ydCgpO1xuICAgIHJldHVybiBydi5qb2luKFwiLFwiKTtcbiAgfVxuXG4gIGdldEhhc2hJZkV4aXN0cyguLi5hcmdzOiB1bmtub3duW10pIDogc3RyaW5nIHtcbiAgICBjb25zdCB2YWx1ZXM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgcmVzdWx0ID0gYXJncy5ldmVyeShhcmcgPT4ge1xuICAgICAgbGV0IHJ2OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgICBpZiAoT2JqZWN0KGFyZykgPT09IGFyZylcbiAgICAgICAgcnYgPSB0aGlzLiN3ZWFrVmFsdWVUb0hhc2guZ2V0KGFyZyBhcyBvYmplY3QpO1xuICAgICAgZWxzZVxuICAgICAgICBydiA9IHRoaXMuI3N0cm9uZ1ZhbHVlVG9IYXNoLmdldChhcmcpO1xuXG4gICAgICBpZiAocnYpXG4gICAgICAgIHZhbHVlcy5wdXNoKHJ2KTtcbiAgICAgIHJldHVybiBydjtcbiAgICB9KTtcblxuICAgIGlmICghcmVzdWx0KVxuICAgICAgcmV0dXJuIFwiXCI7XG5cbiAgICBpZiAodGhpcy4jc29ydEtleXMpXG4gICAgICB2YWx1ZXMuc29ydCgpO1xuXG4gICAgcmV0dXJuIHZhbHVlcy5qb2luKFwiLFwiKTtcbiAgfVxufVxuXG5PYmplY3QuZnJlZXplKEtleUhhc2hlci5wcm90b3R5cGUpO1xuT2JqZWN0LmZyZWV6ZShLZXlIYXNoZXIpO1xuIl19