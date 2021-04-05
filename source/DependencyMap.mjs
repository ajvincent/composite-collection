/**
 * @module source/DependencyMap.mjs
 *
 * @fileoverview
 *
 * This module presents a Map->Set structure, for tracking dependencies between
 * modules CollectionGenerator will build.
 *
 * This is also an example of the kind of code I expect CollectionGenerator to output.
 */

import CollectionConfiguration from "./CollectionConfiguration.mjs";

import KeyHasher from "../templates/KeyHasher.mjs";
export default class DependencyMap {
  /**
   * @type {Number}
   * @readonly
   * @private
   */
  #keyCount = 2;

  /**
   * @type {Map<CollectionConfiguration, Set<CollectionConfiguration>>}
   * @readonly
   * @private
   */
  #root = new Map;

  /**
   * @type {KeyHasher}
   * @readonly
   * @private
   */
  #keyHasher = new KeyHasher(["exported", "importing"]);

  /**
   * @type {Set<string>}
   * @readonly
   * @private
   */
  #knownHashes = new Set();

  #validateArguments(exported, importing) {
    if (!(exported instanceof CollectionConfiguration))
      throw new Error("exported must be a CollectionConfiguration!");

    if (!(importing instanceof CollectionConfiguration))
      throw new Error("importing should be a CollectionConfiguration!");
  }

  get size() {
    return this.#knownHashes.size;
  }

  /**
   *
   * @param {CollectionConfiguration} exported
   * @param {CollectionConfiguration} importing
   * @returns
   */
  add(exported, importing) {
    this.#validateArguments(exported, importing);

    {
      const hash = this.#keyHasher.buildHash([exported, importing]);
      this.#knownHashes.add(hash);
    }

    {
      let current = this.#root;

      if (!current.has(exported)) {
        current.set(exported, new Set);
      }
      current = current.get(exported);

      // last step
      current.add(importing);
    }

    return this;
  }

  clear() {
    this.#knownHashes.clear();
    this.#root.clear();
  }

  /**
   *
   * @param {CollectionConfiguration} exported
   * @param {CollectionConfiguration} importing
   * @returns
   */
  delete(exported, importing) {
    this.#validateArguments(exported, importing);

    {
      const hash = this.#keyHasher.buildHash([exported, importing]);
      if (!this.#knownHashes.delete(hash))
        return false;
    }

    // both are strong collections, so we can work backwards.
    let stack = [];
    {
      let current = this.#root;
      for (let i = 0; i < this.#keyCount; i++) {
        const key = arguments[i];
        stack.push({current, key});
        current = current.get(key);
      }
    }

    while (stack.length) {
      const {current, key} = stack.pop();
      current.delete(key);
      if (current.size > 0)
        break;
    }

    return true;
  }

  entries() {
    // If we're bootstrapping, then let's bootstrap.
  }

  forEach(callback) {
    this.#root.forEach(exported => {
      step_1.forEach(importing => {
        callback(exported, importing, this);
      });
    });
  }

  has(exported, importing) {
    this.#validateArguments(exported, importing);

    const hash = this.#keyHasher.buildHash([exported, importing]);
    return this.#knownHashes.has(hash);
  }

  values() {
  }
}
