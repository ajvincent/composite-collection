/* This spec is about test coverage for .isValidKey() and .isValidValue() on maps.
   Other tests should have adequate coverage.
*/

import SoloStrongMap from "../generated/SoloStrongMap.mjs";
import SoloWeakMap from "../generated/SoloWeakMap.mjs";

import StrongStrongMapImportable from "../generated/StrongStrongMapImportable.mjs";
import WeakStrongMapImportable from "../generated/WeakStrongMapImportable.mjs";
import WeakWeakMapImportable from "../generated/WeakWeakMapImportable.mjs";

import SoloStrongSet from "../generated/SoloStrongSet.mjs";
import SoloWeakSet from "../generated/SoloWeakSet.mjs";

import StrongStrongSetImportable from "../generated/StrongStrongSetImportable.mjs";
import WeakStrongSetImportable from "../generated/WeakStrongSetImportable.mjs";
import WeakWeakSetImportable from "../generated/WeakWeakSetImportable.mjs";

import StrongMapSetImportable from "../generated/StrongMapSetImportable.mjs";
import WeakMapStrongSetImportable from "../generated/WeakMapStrongSetImportable.mjs";
import WeakMapWeakSetImportable from "../generated/WeakMapWeakSetImportable.mjs";

import MockImportable from "../fixtures/MockImportable.mjs";

const key1Importable = new MockImportable(5),
      key2Importable = new MockImportable(7),
      valueImportable = new MockImportable(9);

/**
 * Define key/value specifications for a one-key map collection.
 *
 * @param {Function} ctor The class.
 */
function oneKeyMapTests(ctor) {
describe(ctor[Symbol.toStringTag] + " supports valid keys ", () => {
  let testMap = null;
  beforeEach(() => testMap = new ctor);
  afterEach(() => testMap = null);

  it("and values via .isValidKey() and .isValidValue()", () => {
    expect(testMap.isValidKey(key1Importable)).toBe(true);
    expect(testMap.isValidKey({})).toBe(false);

    expect(testMap.isValidValue(valueImportable)).toBe(true);
    expect(testMap.isValidValue({})).toBe(false);
  });

  it("via .delete()", () => {
    expect(
      () => testMap.delete(key1Importable)
    ).not.toThrow();

    expect(
      () => testMap.delete({})
    ).toThrowError("The ordered key set is not valid!");
  });

  it("via .get()", () => {
    expect(
      () => testMap.get(key1Importable)
    ).not.toThrow();

    expect(
      () => testMap.get({})
    ).toThrowError("The ordered key set is not valid!");
  });

  it("via .has()", () => {
    expect(
      () => testMap.has(key1Importable)
    ).not.toThrow();

    expect(
      () => testMap.has({})
    ).toThrowError("The ordered key set is not valid!");
  });

  it("and values via .set()", () => {
    expect(
      () => testMap.set(key1Importable, valueImportable)
    ).not.toThrow();

    expect(
      () => testMap.set({}, valueImportable)
    ).toThrowError("The ordered key set is not valid!");

    expect(
      () => testMap.set(key1Importable, {})
    ).toThrowError("The value is not valid!");
  });
});

}

/**
 * Define key/value specifications for a two-key map collection.
 *
 * @param {Function} ctor The class.
 */
function twoKeyMapTests(ctor) {
describe(ctor[Symbol.toStringTag] + " supports valid keys ", () => {
  let testMap = null;
  beforeEach(() => testMap = new ctor);
  afterEach(() => testMap = null);

  it("and values via .isValidKey() and .isValidValue()", () => {
    expect(testMap.isValidKey(key1Importable, key2Importable)).toBe(true);
    expect(testMap.isValidKey(key1Importable, {})).toBe(false);
    expect(testMap.isValidKey({}, key2Importable)).toBe(false);
    expect(testMap.isValidKey({}, {})).toBe(false);

    expect(testMap.isValidValue(valueImportable)).toBe(true);
    expect(testMap.isValidValue({})).toBe(false);
  });

  it("via .delete()", () => {
    expect(
      () => testMap.delete(key1Importable, key2Importable)
    ).not.toThrow();

    expect(
      () => testMap.delete(key1Importable, {})
    ).toThrowError("The ordered key set is not valid!");

    expect(
      () => testMap.delete({}, key2Importable)
    ).toThrowError("The ordered key set is not valid!");

    expect(
      () => testMap.delete({}, {})
    ).toThrowError("The ordered key set is not valid!");
  });

  it("via .get()", () => {
    expect(
      () => testMap.get(key1Importable, key2Importable)
    ).not.toThrow();

    expect(
      () => testMap.get(key1Importable, {})
    ).toThrowError("The ordered key set is not valid!");

    expect(
      () => testMap.get({}, key2Importable)
    ).toThrowError("The ordered key set is not valid!");

    expect(
      () => testMap.get({}, {})
    ).toThrowError("The ordered key set is not valid!");
  });

  it("via .has()", () => {
    expect(
      () => testMap.has(key1Importable, key2Importable)
    ).not.toThrow();

    expect(
      () => testMap.has(key1Importable, {})
    ).toThrowError("The ordered key set is not valid!");

    expect(
      () => testMap.has({}, key2Importable)
    ).toThrowError("The ordered key set is not valid!");

    expect(
      () => testMap.has({}, {})
    ).toThrowError("The ordered key set is not valid!");
  });

  it("and values via .set()", () => {
    expect(
      () => testMap.set(key1Importable, key2Importable, valueImportable)
    ).not.toThrow();

    expect(
      () => testMap.set(key1Importable, {}, valueImportable)
    ).toThrowError("The ordered key set is not valid!");

    expect(
      () => testMap.set({}, key2Importable, valueImportable)
    ).toThrowError("The ordered key set is not valid!");

    expect(
      () => testMap.set({}, {}, valueImportable)
    ).toThrowError("The ordered key set is not valid!");

    expect(
      () => testMap.set(key1Importable, key2Importable, {})
    ).toThrowError("The value is not valid!");
  });
});
}

/**
 * Define key/value specifications for a one-key set collection.
 *
 * @param {Function} ctor The class.
 */
function oneKeySetTests(ctor) {
describe(ctor[Symbol.toStringTag] + " supports valid keys ", () => {
  let testSet = null;
  beforeEach(() => testSet = new ctor);
  afterEach(() => testSet = null);

  it("via .isValidKey()", () => {
    expect(testSet.isValidKey(key1Importable)).toBe(true);
    expect(testSet.isValidKey({})).toBe(false);
  });

  it("via .add()", () => {
    expect(
      () => testSet.add(key1Importable)
    ).not.toThrow();

    expect(
      () => testSet.add({})
    ).toThrowError("The ordered key set is not valid!");
  });
});
}

/**
 * Define key/value specifications for a two-key map collection.
 *
 * @param {Function} ctor The class.
 */
function twoKeySetTests(ctor) {
describe(ctor[Symbol.toStringTag] + " supports valid keys ", () => {
  let testSet = null;
  beforeEach(() => testSet = new ctor);
  afterEach(() => testSet = null);

  it("via .isValidKey()", () => {
    expect(testSet.isValidKey(key1Importable, key2Importable)).toBe(true);
    expect(testSet.isValidKey(key1Importable, {})).toBe(false);
    expect(testSet.isValidKey({}, key2Importable)).toBe(false);
    expect(testSet.isValidKey({}, {})).toBe(false);
  });

  it("via .add()", () => {
    expect(
      () => testSet.add(key1Importable, key2Importable)
    ).not.toThrow();

    expect(
      () => testSet.add(key1Importable, {})
    ).toThrowError("The ordered key set is not valid!");

    expect(
      () => testSet.add({}, key2Importable)
    ).toThrowError("The ordered key set is not valid!");

    expect(
      () => testSet.add({}, {})
    ).toThrowError("The ordered key set is not valid!");
  });
});
}

/**
 * Define key/value specifications for a map-set collection totalling two keys.
 *
 * @param {Function} ctor The class.
 * @param {boolean} enableHasSets True if the ".hasSets()" method should exist.
 */
function mapSetKeyTests(ctor, enableHasSets) {
describe(ctor[Symbol.toStringTag] + " supports valid keys ", () => {
  let testSet = null;
  beforeEach(() => testSet = new ctor);
  afterEach(() => testSet = null);

  it("via .isValidKey()", () => {
    expect(testSet.isValidKey(key1Importable, key2Importable)).toBe(true);
    expect(testSet.isValidKey(key1Importable, {})).toBe(false);
    expect(testSet.isValidKey({}, key2Importable)).toBe(false);
    expect(testSet.isValidKey({}, {})).toBe(false);
  });

  it("via .add()", () => {
    expect(
      () => testSet.add(key1Importable, key2Importable)
    ).not.toThrow();

    expect(
      () => testSet.add(key1Importable, {})
    ).toThrowError("The ordered key set is not valid!");

    expect(
      () => testSet.add({}, key2Importable)
    ).toThrowError("The ordered key set is not valid!");

    expect(
      () => testSet.add({}, {})
    ).toThrowError("The ordered key set is not valid!");
  });

  it("via .addSets()", () => {
    expect(
      () => testSet.addSets(key1Importable, [[key2Importable]])
    ).not.toThrow();

    expect(
      () => testSet.addSets(key1Importable, [[{}]])
    ).toThrowError("The ordered key set is not valid!");

    expect(
      () => testSet.addSets(key1Importable, [[key2Importable], [{}]])
    ).toThrowError("The ordered key set is not valid!");

    expect(
      () => testSet.addSets({}, [[key2Importable]])
    ).toThrowError("The ordered map key set is not valid!");

    expect(
      () => testSet.addSets({}, [[{}]])
    ).toThrowError("The ordered map key set is not valid!");

    expect(
      () => testSet.addSets({}, [[key2Importable], [{}]])
    ).toThrowError("The ordered map key set is not valid!");
  });

  it("via .delete()", () => {
    expect(
      () => testSet.delete(key1Importable, key2Importable)
    ).not.toThrow();

    expect(
      () => testSet.delete(key1Importable, {})
    ).toThrowError("The ordered key set is not valid!");

    expect(
      () => testSet.delete({}, key2Importable)
    ).toThrowError("The ordered key set is not valid!");

    expect(
      () => testSet.delete({}, {})
    ).toThrowError("The ordered key set is not valid!");
  });

  it("via .deleteSets()", () => {
    expect(
      () => testSet.deleteSets(key1Importable)
    ).not.toThrow();

    expect(
      () => testSet.deleteSets({})
    ).toThrowError("The ordered map key set is not valid!");
  });

  it("via .has()", () => {
    expect(
      () => testSet.has(key1Importable, key2Importable)
    ).not.toThrow();

    expect(
      () => testSet.has(key1Importable, {})
    ).toThrowError("The ordered key set is not valid!");

    expect(
      () => testSet.has({}, key2Importable)
    ).toThrowError("The ordered key set is not valid!");

    expect(
      () => testSet.has({}, {})
    ).toThrowError("The ordered key set is not valid!");
  });

  if (enableHasSets) {
    it("via .hasSets()", () => {
      expect(
        () => testSet.hasSets(key1Importable)
      ).not.toThrow();

      expect(
        () => testSet.hasSets({})
      ).toThrowError("The ordered map key set is not valid!");
    });
  }
});
}

oneKeyMapTests(SoloStrongMap);
oneKeyMapTests(SoloWeakMap);

oneKeySetTests(SoloStrongSet);
oneKeySetTests(SoloWeakSet);

twoKeyMapTests(StrongStrongMapImportable);
twoKeyMapTests(WeakStrongMapImportable);
twoKeyMapTests(WeakWeakMapImportable);

twoKeySetTests(StrongStrongSetImportable);
twoKeySetTests(WeakStrongSetImportable);
twoKeySetTests(WeakWeakSetImportable);

mapSetKeyTests(StrongMapSetImportable, true);
mapSetKeyTests(WeakMapStrongSetImportable, true);
mapSetKeyTests(WeakMapWeakSetImportable, false);
