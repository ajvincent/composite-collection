import { DefaultMap, DefaultWeakMap } from "./DefaultMap.mjs";
export class RequiredMap extends DefaultMap {
    getRequired(key) {
        const value = this.get(key);
        if (!value)
            throw new Error("Key not found: " + key);
        return value;
    }
}
export class RequiredWeakMap extends DefaultWeakMap {
    getRequired(key) {
        const value = this.get(key);
        if (!value)
            throw new Error("Key not found: " + key);
        return value;
    }
}
//# sourceMappingURL=RequiredMap.mjs.map