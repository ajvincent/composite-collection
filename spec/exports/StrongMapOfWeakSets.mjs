import StrongMapOfWeakSets from "../generated/StrongMapOfWeakSets.mjs";
import ToHoldRefsMatchers from "../support/toHoldReferences.mjs";

describe("CodeGenerator(StrongMapOfWeakSets.mjs)", () => {
  const refSet = new Set;
  const key1 = {isKey1: true},
        key2 = {isKey2: true},
        key3 = {isKey3: true};
  const thisObj = {};

  let testSet;
  beforeEach(() => {
    refSet.clear();
    testSet = new StrongMapOfWeakSets();
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(StrongMapOfWeakSets)).toBe(true);
    expect(Object.isFrozen(StrongMapOfWeakSets.prototype)).toBe(true);
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

    expect(() => testSet.clear()).not.toThrow();
    expect(testSet.has(key1, key2)).toBe(false);
    expect(testSet.has(key1, key2)).toBe(false);
  });

  it("adding two keys with a constant second key", () => {
    refSet.add(key1);
    refSet.add(key2);

    expect(testSet.add(key1, key3)).toBe(testSet);
    expect(testSet.has(key1, key3)).toBe(true);

    expect(testSet.add(key2, key3)).toBe(testSet);
    expect(testSet.has(key2, key3)).toBe(true);

    // These should be no-ops, but it doesn't hurt to try them.
    expect(testSet.add(key1, key3)).toBe(testSet);
    expect(testSet.has(key1, key3)).toBe(true);

    expect(testSet.delete(key3, key1)).toBe(false);

    expect(testSet.delete(key1, key3)).toBe(true);
    expect(testSet.delete(key1, key3)).toBe(false);

    expect(testSet.add(key1, key3)).toBe(testSet);
    expect(testSet.has(key1, key3)).toBe(refSet.has(key1));

    expect(() => testSet.clear()).not.toThrow();
    expect(testSet.has(key1, key2)).toBe(false);
  });

  it("adding two keys with a constant first key", () => {
    refSet.add(key1);
    refSet.add(key2);

    expect(testSet.add(key3, key1)).toBe(testSet);
    expect(testSet.has(key3, key1)).toBe(true);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));

    expect(testSet.add(key3, key2)).toBe(testSet);
    expect(testSet.has(key3, key2)).toBe(true);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));

    // These should be no-ops, but it doesn't hurt to try them.
    expect(testSet.add(key3, key1)).toBe(testSet);
    expect(testSet.has(key3, key1)).toBe(true);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));

    expect(testSet.delete(key2, key1)).toBe(false);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));

    expect(testSet.delete(key3, key1)).toBe(true);
    expect(testSet.has(key3, key1)).toBe(false);
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));

    expect(testSet.delete(key3, key1)).toBe(false);
    expect(testSet.has(key3, key1)).toBe(false);
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));

    refSet.delete(key1);
    refSet.add(key1);

    expect(testSet.add(key3, key1)).toBe(testSet);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));

    expect(() => testSet.clear()).not.toThrow();
    expect(testSet.has(key3, key1)).toBe(false);
    expect(testSet.has(key3, key2)).toBe(false);
  });

  it("adding two keys with the second add swapping the keys", () => {
    refSet.add(key1);
    refSet.add(key2);

    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.has(key1, key2)).toBe(true);

    expect(testSet.add(key2, key1)).toBe(testSet);
    expect(testSet.has(key2, key1)).toBe(true);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));
    expect(testSet.has(key2, key1)).toBe(refSet.has(key2));

    // These should be no-ops, but it doesn't hurt to try them.
    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.has(key1, key2)).toBe(true);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));
    expect(testSet.has(key2, key1)).toBe(refSet.has(key2));

    expect(testSet.delete(key3, key1)).toBe(false);
    expect(testSet.delete(key1, key2)).toBe(true);
    expect(testSet.has(key1, key2)).toBe(false);
    expect(testSet.has(key2, key1)).toBe(refSet.has(key2));

    expect(testSet.delete(key1, key2)).toBe(false);
    expect(testSet.has(key1, key2)).toBe(false);
    expect(testSet.has(key2, key1)).toBe(refSet.has(key2));

    refSet.delete(key1);
    refSet.add(key1);

    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));
    expect(testSet.has(key2, key1)).toBe(refSet.has(key2));
  });

  it("invoking .addSets() and its full-set friends", () => {
    const setOfSets = new Set([
      [key1],
      [key2],
    ]);
    refSet.add(key1);
    refSet.add(key2);

    testSet.addSets(key3, setOfSets);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));

    expect(testSet.hasSets(key1)).toBe(false);
    expect(testSet.hasSets(key2)).toBe(false);
    expect(testSet.hasSets(key3)).toBe(true);

    refSet.delete(key1);
    refSet.delete(key2);

    testSet.deleteSets(key3);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));
  });

  describe("holds references to objects", () => {
    const externalKey = {};
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    xit("strongly as the first key in .add()", async () => {
      await expectAsync(
        key => {
          testSet.add(key, externalKey);
        }
      ).toHoldReferencesStrongly();
    });

    it("weakly as the first key in .delete()", async () => {
      await expectAsync(
        key => testSet.delete(key, externalKey)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the first key in .has()", async () => {
      await expectAsync(
        key => testSet.has(key, externalKey)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the first key in .add(), then .delete()", async () => {
      await expectAsync(
        key => {
          testSet.add(key, externalKey);
          testSet.delete(key, externalKey);
        }
      ).toHoldReferencesWeakly();
    });

    it("weakly as the second key in .add()", async () => {
      await expectAsync(
        key => testSet.add(externalKey, key)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the second key in .delete()", async () => {
      await expectAsync(
        key => testSet.delete(externalKey, key)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the second key in .has()", async () => {
      await expectAsync(
        key => testSet.has(externalKey, key)
      ).toHoldReferencesWeakly();
    });
  });
});
