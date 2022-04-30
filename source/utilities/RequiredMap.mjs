export default class RequiredMap extends Map {
    getRequired(key) {
        const value = this.get(key);
        if (!value)
            throw new Error("Key not found: " + key);
        return value;
    }
}
//# sourceMappingURL=RequiredMap.mjs.map