export default class RequiredMap<K, V> extends Map<K, V> {
  getRequired(key: K) : V {
    const value = this.get(key);
    if (!value)
      throw new Error("Key not found: " + key);
    return value;
  }
}

export type ReadonlyRequiredMap<K, V> = Omit<ReadonlyMap<K, V>, "get"> & {
  getRequired(key: K) : V;
}
