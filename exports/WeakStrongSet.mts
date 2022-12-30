/*
  * This Source Code Form is subject to the terms of the Mozilla Public
  * License, v. 2.0. If a copy of the MPL was not distributed with this
  * file, You can obtain one at https://mozilla.org/MPL/2.0/.
  */

/**
 * @file
 * This is generated code.  Do not edit.
 *
 * Generator: https://github.com/ajvincent/composite-collection/
 * Template: Weak/Set
 * @license MPL-2.0
 * @author Alexander J. Vincent <ajvincent@gmail.com>
 * @copyright © 2021-2022 Alexander J. Vincent
 */

import WeakKeyComposer from "./keys/Composite.mjs";

class WeakStrongSet<
  __SK0__ extends object,
  __SK1__
>
{
  // eslint-disable-next-line jsdoc/require-property
  /** @typedef {object} WeakKey */

  /** @type {WeakKeyComposer} @constant */
  #keyComposer = new WeakKeyComposer(["weakKey"], ["strongKey"]);

  /** @type {WeakSet<WeakKey>} @constant */
  #weakKeySet = new WeakSet;

  constructor(iterable? : [__SK0__, __SK1__][]) {
    if (iterable) {
      for (const [weakKey, strongKey] of iterable) {
        this.add(weakKey, strongKey);
      }
    }
  }

  /**
   * Add a key set to this collection.
   *
   * @param {object} weakKey   The weakly held key.
   * @param {*}      strongKey The strongly held key.
   * @returns {WeakStrongSet} This collection.
   * @public
   */
  add(weakKey: __SK0__, strongKey: __SK1__) : this
  {
    this.#requireValidKey(weakKey, strongKey);

    const __key__ = this.#keyComposer.getKey([weakKey], [strongKey]);

    this.#weakKeySet.add(__key__);
    return this;
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param {object} weakKey   The weakly held key.
   * @param {*}      strongKey The strongly held key.
   * @returns {boolean} True if we found the value and deleted it.
   * @public
   */
  delete(weakKey: __SK0__, strongKey: __SK1__) : boolean
  {
    this.#requireValidKey(weakKey, strongKey);

    const __key__ = this.#keyComposer.getKeyIfExists([weakKey], [strongKey]);
    if (!__key__)
      return false;

    const __returnValue__ = this.#weakKeySet.delete(__key__);
    this.#keyComposer.deleteKey([weakKey], [strongKey]);
    return __returnValue__;
  }

  /**
   * Report if the collection has a value for a key set.
   *
   * @param {object} weakKey   The weakly held key.
   * @param {*}      strongKey The strongly held key.
   * @returns {boolean} True if the key set refers to a value in the collection.
   * @public
   */
  has(weakKey: __SK0__, strongKey: __SK1__) : boolean
  {
    this.#requireValidKey(weakKey, strongKey);

    const __key__ = this.#keyComposer.getKeyIfExists([weakKey], [strongKey]);

    return __key__ ? this.#weakKeySet.has(__key__) : false;
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} weakKey   The weakly held key.
   * @param {*}      strongKey The strongly held key.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   * @public
   */
  isValidKey(weakKey: __SK0__, strongKey: __SK1__) : boolean
  {
    return this.#isValidKey(weakKey, strongKey);
  }

  /**
   * Throw if the key set is not valid.
   *
   * @param {object} weakKey   The weakly held key.
   * @param {*}      strongKey The strongly held key.
   * @throws for an invalid key set.
   */
  #requireValidKey(weakKey: __SK0__, strongKey: __SK1__) : void
  {
    if (!this.#isValidKey(weakKey, strongKey))
      throw new Error("The ordered key set is not valid!");
  }

  /**
   * Determine if a set of keys is valid.
   *
   * @param {object} weakKey   The weakly held key.
   * @param {*}      strongKey The strongly held key.
   * @returns {boolean} True if the validation passes, false if it doesn't.
   */
  #isValidKey(weakKey: __SK0__, strongKey: __SK1__) : boolean
  {
    if (!this.#keyComposer.isValidForKey([weakKey], [strongKey]))
      return false;

    return true;
  }

  [Symbol.toStringTag] = "WeakStrongSet";
}

Object.freeze(WeakStrongSet);
Object.freeze(WeakStrongSet.prototype);

export type ReadonlyWeakStrongSet<
  __SK0__ extends object,
  __SK1__
> =
  Pick<
    WeakStrongSet<__SK0__, __SK1__>,
    "has" | "isValidKey"
  >

export default WeakStrongSet;
