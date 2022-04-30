import { DefaultMap, DefaultWeakMap } from "./DefaultMap.mjs";
export declare class RequiredMap<K, V> extends DefaultMap<K, V> {
    getRequired(key: K): V;
}
export declare class RequiredWeakMap<K extends object, V> extends DefaultWeakMap<K, V> {
    getRequired(key: K): V;
}
export declare type ReadonlyRequiredMap<K, V> = Omit<ReadonlyMap<K, V>, "get"> & {
    getRequired(key: K): V;
};
export declare type ReadonlyRequiredWeakMap<K extends object, V> = Pick<RequiredWeakMap<K, V>, "getRequired" | "has">;
