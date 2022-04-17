export class DefaultMap<K, V> extends Map<K, V> {
  getDefault(key: K, builder: () => V): V {
    const value = this.get(key) || builder();
    if (!this.has(key))
      this.set(key, value);
    return value;
  }
}

export class DefaultWeakMap<K extends object, V> extends WeakMap<K, V> {
  getDefault(key: K, builder: () => V): V {
    const value = this.get(key) || builder();
    if (!this.has(key))
      this.set(key, value);
    return value;
  }
}
