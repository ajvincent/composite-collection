import { DefaultMap, DefaultWeakMap } from "./DefaultMap.mjs";

export class RequiredMap<K, V> extends DefaultMap<K, V>
{
  getRequired(key: K) : V {
    const value = this.get(key);
    if (!value)
      throw new Error("Key not found: " + key);
    return value;
  }
}

export class RequiredWeakMap<K extends object, V> extends DefaultWeakMap<K, V>
{
  getRequired(key: K) : V {
    const value = this.get(key);
    if (!value)
      throw new Error("Key not found: " + key);
    return value;
  }
}

export type ReadonlyRequiredMap<K, V> = Omit<ReadonlyMap<K, V>, "get"> &
{
  getRequired(key: K) : V;
}

export type ReadonlyRequiredWeakMap<K extends object, V> = Pick<RequiredWeakMap<K, V>, "getRequired" | "has">
