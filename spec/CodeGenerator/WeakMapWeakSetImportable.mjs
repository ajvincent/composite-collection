import WeakMapWeakSetImportable from "../generated/WeakMapWeakSetImportable.mjs";
import MockImportable from "../fixtures/MockImportable.mjs";

describe("CodeGenerator(WeakMapWeakSetImportable.mjs)", () => {
  const refSet = new WeakSet;
  const key1 = new MockImportable({isKey1: true}),
        key2 = new MockImportable({isKey2: true}),
        key3 = new MockImportable({isKey3: true});

  let testSet;
  beforeEach(() => {
    testSet = new WeakMapWeakSetImportable();
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(WeakMapWeakSetImportable)).toBe(true);
    expect(Object.isFrozen(WeakMapWeakSetImportable.prototype)).toBe(true);
  });

  xit("class only exposes public methods", () => {
    // not implemented yet
  });

  it("adding one value", () => {
    refSet.add(key1);

    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));

    // Keys are ordered, and you cannot use only some of the keys.
    expect(testSet.has(key2, key1)).toBe(false);
    expect(testSet.has(key1, key3)).toBe(false);
    expect(testSet.has(key2, key3)).toBe(false);

    // These should be no-ops, but it doesn't hurt to try them.
    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));

    expect(testSet.delete(key1, key2)).toBe(true);

    expect(testSet.delete(key1, key2)).toBe(false);

    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));
  });

  it("throws for setting a non-validated key", () => {
    expect(() => {
      testSet.add(key1, {})
    }).toThrowError("The ordered key set is not valid!");

    expect(() => {
      testSet.add({}, key2)
    }).toThrowError("The ordered key set is not valid!");
  });

  // see ./WeakMapOfWeakSets.mjs for more comprehensive tests.
});
