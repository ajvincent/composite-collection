export class DefaultMap extends Map {
    getDefault(key, builder) {
        const value = this.get(key) || builder();
        if (!this.has(key))
            this.set(key, value);
        return value;
    }
}
export class DefaultWeakMap extends WeakMap {
    getDefault(key, builder) {
        const value = this.get(key) || builder();
        if (!this.has(key))
            this.set(key, value);
        return value;
    }
}
//# sourceMappingURL=DefaultMap.mjs.map