export default class RequiredMap<K, V> extends Map<K, V> {
    getRequired(key: K): V;
}
export declare type ReadonlyRequiredMap<K, V> = Omit<ReadonlyMap<K, V>, "get"> & {
    getRequired(key: K): V;
};
