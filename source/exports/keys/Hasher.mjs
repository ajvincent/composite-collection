export default class KeyHasher {
  /** @type {Number} */
  #hashCount = 0;

  /** @type {WeakMap<Object, string>} @constant */
  #weakValueToHash = new WeakMap();

  /** @type {Map<value, string>} @constant */
  #strongValueToHash = new Map();

  #getMap(key) {
    return Object(key) === key ? this.#weakValueToHash : this.#strongValueToHash;
  }

  #requireKey(key) {
    const map = this.#getMap(key);
    if (!map.has(key))
      map.set(key, (this.#hashCount++).toString(36));
    return map.get(key);
  }

  constructor() {
    if (new.target !== KeyHasher)
      throw new Error("You cannot subclass KeyHasher!");
    Object.freeze(this);
  }

  getHash(...args) {
    return args.map(arg => this.#requireKey(arg)).join(",");
  }

  hasHash(...args) {
    return args.every(arg => this.#getMap(arg).has(arg));
  }

  getHashIfExists(...args) {
    const values = [];
    const result = args.every(arg => {
      const map = this.#getMap(arg);
      values.push(map.get(arg));
      return map.has(arg);
    });
    return result ? [true, values.join(",")] : [false, ""];
  }
}

Object.freeze(KeyHasher.prototype);
Object.freeze(KeyHasher);
