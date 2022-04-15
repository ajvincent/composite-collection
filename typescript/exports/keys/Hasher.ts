export class KeyHasher {
  #hashCount: number = 0;

  #weakValueToHash: WeakMap<object, string> = new WeakMap;

  #strongValueToHash: Map<any, string> = new Map;

  #sortKeys: boolean = false;

  #getMap(key: any) {
    return Object(key) === key ? this.#weakValueToHash : this.#strongValueToHash;
  }

  #requireKey(key: any) {
    const map = this.#getMap(key);
    if (!map.has(key))
      map.set(key, (++this.#hashCount).toString(36));
    return map.get(key);
  }

  getHash(args: ReadonlyArray<any>): string {
    const rv = args.map(arg => this.#requireKey(arg));
    if (this.#sortKeys)
      rv.sort();
    return rv.join(",");
  }

  getHashIfExists(args: ReadonlyArray<any>): string {
    const values: string[] = [];
    const result = args.every(arg => {
      const rv = this.#getMap(arg).get(arg);
      if (!rv)
        return false;
      values.push(rv);
      return true;
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
