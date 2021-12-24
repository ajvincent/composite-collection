import WeakMapWeakStrongSet from "../generated/WeakMapWeakStrongSet.mjs";
import ToHoldRefsMatchers from "../../support/toHoldReferences.mjs";

describe("CodeGenerator(WeakMapWeakStrongSet.mjs)", () => {
  const refSet = new Set;
  const key1 = {isKey1: true},
        key2 = {isKey2: true},
        key3 = {isKey3: true},
        key4 = "isKey4";

  let testSet;
  beforeEach(() => {
    refSet.clear();
    testSet = new WeakMapWeakStrongSet();
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(WeakMapWeakStrongSet)).toBe(true);
    expect(Object.isFrozen(WeakMapWeakStrongSet.prototype)).toBe(true);
  });

  it("class only exposes public methods", () => {
    expect(Reflect.ownKeys(WeakMapWeakStrongSet.prototype)).toEqual([
      "constructor",
      "add",
      "addSets",
      "delete",
      "deleteSets",
      "has",
      "hasSets",
      "isValidKey",
    ]);
  });

  it("instances have no public properties", () => {
    const map = new WeakMapWeakStrongSet();
    expect(Reflect.ownKeys(map)).toEqual([]);
  });

  it("adding one value", () => {
    refSet.add(key1);

    expect(testSet.add(key1, key2, key4)).toBe(testSet);
    expect(testSet.has(key1, key2, key4)).toBe(refSet.has(key1));

    // Keys are ordered, and you cannot use only some of the keys.
    expect(testSet.has(key2, key1, key4)).toBe(false);
    expect(testSet.has(key1, key3, key4)).toBe(false);
    expect(testSet.has(key2, key3, key4)).toBe(false);

    // These should be no-ops, but it doesn't hurt to try them.
    expect(testSet.add(key1, key2, key4)).toBe(testSet);
    expect(testSet.has(key1, key2, key4)).toBe(refSet.has(key1));

    expect(testSet.delete(key1, key2, key4)).toBe(true);

    expect(testSet.delete(key1, key2, key4)).toBe(false);

    expect(testSet.add(key1, key2, key4)).toBe(testSet);
    expect(testSet.has(key1, key2, key4)).toBe(refSet.has(key1));
  });

  it("adding two keys with a constant second key", () => {
    refSet.add(key1);
    refSet.add(key2);

    expect(testSet.add(key1, key3, key4)).toBe(testSet);
    expect(testSet.has(key1, key3, key4)).toBe(true);

    expect(testSet.add(key2, key3, key4)).toBe(testSet);
    expect(testSet.has(key2, key3, key4)).toBe(true);

    // These should be no-ops, but it doesn't hurt to try them.
    expect(testSet.add(key1, key3, key4)).toBe(testSet);
    expect(testSet.has(key1, key3, key4)).toBe(true);

    expect(testSet.delete(key3, key1, key4)).toBe(false);

    expect(testSet.delete(key1, key3, key4)).toBe(true);
    expect(testSet.delete(key1, key3, key4)).toBe(false);

    expect(testSet.add(key1, key3, key4)).toBe(testSet);
    expect(testSet.has(key1, key3, key4)).toBe(refSet.has(key1));
  });

  it("adding two keys with a constant first key", () => {
    refSet.add(key1);
    refSet.add(key2);

    expect(testSet.add(key3, key1, key4)).toBe(testSet);
    expect(testSet.has(key3, key1, key4)).toBe(true);
    expect(testSet.has(key3, key1, key4)).toBe(refSet.has(key1));

    expect(testSet.add(key3, key2, key4)).toBe(testSet);
    expect(testSet.has(key3, key2, key4)).toBe(true);
    expect(testSet.has(key3, key1, key4)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2, key4)).toBe(refSet.has(key2));

    // These should be no-ops, but it doesn't hurt to try them.
    expect(testSet.add(key3, key1, key4)).toBe(testSet);
    expect(testSet.has(key3, key1, key4)).toBe(true);
    expect(testSet.has(key3, key1, key4)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2, key4)).toBe(refSet.has(key2));

    expect(testSet.delete(key2, key1, key4)).toBe(false);
    expect(testSet.has(key3, key1, key4)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2, key4)).toBe(refSet.has(key2));

    expect(testSet.delete(key3, key1, key4)).toBe(true);
    expect(testSet.has(key3, key1, key4)).toBe(false);
    expect(testSet.has(key3, key2, key4)).toBe(refSet.has(key2));

    expect(testSet.delete(key3, key1, key4)).toBe(false);
    expect(testSet.has(key3, key1, key4)).toBe(false);
    expect(testSet.has(key3, key2, key4)).toBe(refSet.has(key2));

    expect(testSet.add(key3, key1, key4)).toBe(testSet);
    expect(testSet.has(key3, key1, key4)).toBe(refSet.has(key1));
  });

  it("adding two keys with the second add swapping the keys", () => {
    refSet.add(key1);
    refSet.add(key2);

    expect(testSet.add(key1, key2, key4)).toBe(testSet);
    expect(testSet.has(key1, key2, key4)).toBe(true);

    expect(testSet.add(key2, key1, key4)).toBe(testSet);
    expect(testSet.has(key2, key1, key4)).toBe(true);
    expect(testSet.has(key1, key2, key4)).toBe(refSet.has(key1));
    expect(testSet.has(key2, key1, key4)).toBe(refSet.has(key2));

    // These should be no-ops, but it doesn't hurt to try them.
    expect(testSet.add(key1, key2, key4)).toBe(testSet);
    expect(testSet.has(key1, key2, key4)).toBe(true);
    expect(testSet.has(key1, key2, key4)).toBe(refSet.has(key1));
    expect(testSet.has(key2, key1, key4)).toBe(refSet.has(key2));

    expect(testSet.delete(key3, key1, key4)).toBe(false);
    expect(testSet.delete(key1, key2, key4)).toBe(true);
    expect(testSet.has(key1, key2, key4)).toBe(false);
    expect(testSet.has(key2, key1, key4)).toBe(refSet.has(key2));

    expect(testSet.delete(key1, key2, key4)).toBe(false);
    expect(testSet.has(key1, key2, key4)).toBe(false);
    expect(testSet.has(key2, key1, key4)).toBe(refSet.has(key2));

    expect(testSet.add(key1, key2, key4)).toBe(testSet);
    expect(testSet.has(key1, key2, key4)).toBe(refSet.has(key1));
    expect(testSet.has(key2, key1, key4)).toBe(refSet.has(key2));
  });

  it("invoking .addSets() and its full-set friends", () => {
    const setOfSets = new Set([
      [key1, key4],
      [key2, key4],
    ]);
    refSet.add(key1);
    refSet.add(key2);

    testSet.addSets(key3, setOfSets);
    expect(testSet.has(key3, key1, key4)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2, key4)).toBe(refSet.has(key2));

    expect(testSet.hasSets(key1, key4)).toBe(false);
    expect(testSet.hasSets(key2, key4)).toBe(false);
    expect(testSet.hasSets(key3, key4)).toBe(true);

    testSet.deleteSets(key3);
    refSet.delete(key1);
    refSet.delete(key2);
    expect(testSet.has(key3, key1, key4)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2, key4)).toBe(refSet.has(key2));
  });

  describe("holds references to objects", () => {
    const externalKey1 = {}, externalKey2 = {};
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    it("weakly as the first key in .add()", async () => {
      await expectAsync(
        key => testSet.add(key, externalKey1, externalKey2)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the first key in .delete()", async () => {
      await expectAsync(
        key => testSet.delete(key, externalKey1, externalKey2)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the first key in .has()", async () => {
      await expectAsync(
        key => testSet.has(key, externalKey1, externalKey2)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the second key in .add()", async () => {
      await expectAsync(
        key => testSet.add(externalKey1, key, externalKey2)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the second key in .delete()", async () => {
      await expectAsync(
        key => testSet.delete(externalKey1, key, externalKey2)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the second key in .has()", async () => {
      await expectAsync(
        key => testSet.has(externalKey1, key, externalKey2)
      ).toHoldReferencesWeakly();
    });

    it("strongly as the third key in .add()", async () => {
      await expectAsync(
        key => testSet.add(externalKey1, externalKey2, key)
      ).toHoldReferencesStrongly();
    });

    it("weakly as the third key in .delete()", async () => {
      await expectAsync(
        key => testSet.delete(externalKey1, externalKey2, key)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the third key in .has()", async () => {
      await expectAsync(
        key => testSet.has(externalKey1, externalKey2, key)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the third key through .add(), then .delete()", async () => {
      await expectAsync(
        key => {
          testSet.add(externalKey1, externalKey2, key);
          testSet.delete(externalKey1, externalKey2, key);
        }
      ).toHoldReferencesWeakly();
    });
  });
});
