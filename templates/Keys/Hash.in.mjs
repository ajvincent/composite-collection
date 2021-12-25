/**
 * @param {Map} defines
 * @returns {string}
 */
export default function preprocess(defines) {
  let hasHashSteps = defines.get("argList").map(
    argName => `    this.#getMap(${argName}).has(${argName})`
  );

  const hashClassName = `__${defines.get("className")}_${defines.get("suffix")}__`;

  return `class ${hashClassName} {
  /** @type {Number} */
  #hashCount = 0;

  /** @type {WeakMap<Object, string>} @const */
  #weakValueToHash = new WeakMap();

  /** @type {Map<value, string>} @const */
  #strongValueToHash = new Map();

  #getMap(key) {
    return Object(key) === key ? this.#weakValueToHash : this.#strongValueToHash;
  }

  #requireKey(key) {
    const map = this.#getMap(key);
    if (!map.has(key))
      map.set(key, this.#hashCount++);
    return map.get(key);
  }

  constructor() {
    Object.freeze(this);
  }

  getHash(${defines.get("argList").join(", ")}) {
    return [
${
defines.get("argList").map(argName => `    this.#requireKey(${argName}),\n`).join("")
}    ].join(",")
  }

  hasHash(${defines.get("argList").join(", ")}) {
    return (
      ${hasHashSteps.join(" &&\n")}
    );
  }
}

Object.freeze(${hashClassName}.prototype);
Object.freeze(${hashClassName});
`}
