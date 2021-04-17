import SoloWeakMap from "../generated/SoloWeakMap.mjs";
import ToHoldRefsMatchers from "../support/toHoldReferences.mjs";

describe("CodeGenerator(SoloWeakMap.mjs)", () => {
  let testMap, refMap;
  const key1 = {isKey1: true}, key2 = {isKey2: true};
  Object.freeze(key1);
  Object.freeze(key2);

  beforeEach(() => {
    refMap = new WeakMap;
    testMap = new SoloWeakMap;
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(SoloWeakMap));
    expect(Object.isFrozen(SoloWeakMap.prototype));
  });

  xit("class only exposes public methods", () => {
    // not implemented yet
  });

  xit("exposes all methods of a weak map, but not those of a strong map", () => {

  });

  it("validating a value is a non-primitive", () => {
    expect(testMap.isValidKey(key1)).toBe(true);
    expect(testMap.isValidKey(key2)).toBe(true);
    expect(testMap.isValidKey("foo")).toBe(false);
  });

  it("setting one value", () => {
    const value = "value";
    refMap.set(key1, value);

    expect(testMap.set(key1, value)).toBe(testMap);
    expect(testMap.has(key1)).toBe(refMap.has(key1));
    expect(testMap.get(key1)).toBe(refMap.get(key1));

    expect(testMap.delete(key1)).toBe(true);
    expect(testMap.delete(key1)).toBe(false);

    expect(testMap.set(key1, value)).toBe(testMap);
    expect(testMap.has(key1)).toBe(refMap.has(key1));
    expect(testMap.get(key1)).toBe(refMap.get(key1));
  });

  describe("using a primitive as a key throws for", () => {
    it("delete()", () => {
      expect(
        () => testMap.delete("foo")
      ).toThrowError("The ordered key set is not valid!");
    });

    it("get()", () => {
      expect(
        () => testMap.get("foo")
      ).toThrowError("The ordered key set is not valid!");
    });

    it("has()", () => {
      expect(
        () => testMap.has("foo")
      ).toThrowError("The ordered key set is not valid!");
    });

    it("set()", () => {
      expect(
        () => testMap.set("foo")
      ).toThrowError("The ordered key set is not valid!");
    });
  });

  it("setting two values", () => {
    const value1 = "value1";
    refMap.set(key1, value1);
    const value2 = "value2";
    refMap.set(key2, value2);

    expect(testMap.set(key1, value1)).toBe(testMap);
    expect(testMap.has(key1)).toBe(refMap.has(key1));
    expect(testMap.get(key1)).toBe(refMap.get(key1));

    expect(testMap.set(key2, value2)).toBe(testMap);
    expect(testMap.has(key2)).toBe(refMap.has(key2));
    expect(testMap.get(key2)).toBe(refMap.get(key2));

    expect(testMap.delete(key1)).toBe(true);
    expect(testMap.delete(key1)).toBe(false);

    refMap.delete(key1);
    refMap.set(key1, value1);

    expect(testMap.set(key1, value1)).toBe(testMap);
    expect(testMap.has(key1)).toBe(refMap.has(key1));
    expect(testMap.get(key1)).toBe(refMap.get(key1));
  });

  describe("holds references to objects", () => {
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    it("weakly as the key in .isValidKey()", async () => {
      await expectAsync(
        key => testMap.isValidKey(key)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the key in .delete()", async () => {
      await expectAsync(
        key => testMap.delete(key)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the key in .get()", async () => {
      await expectAsync(
        key => testMap.get(key)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the key in .has()", async () => {
      await expectAsync(
        key => testMap.has(key)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the key in .set()", async () => {
      await expectAsync(
        key => testMap.set(key, {})
      ).toHoldReferencesWeakly();
    });

    it("strongly as values when the keys are held externally", async () => {
      const externalKeys = [];
      await expectAsync(
        value => {
          let externalKey = {};
          testMap.set(externalKey, value);
          externalKeys.push(externalKey);
          externalKey = null;
        }
      ).toHoldReferencesStrongly();
    });

    it("weakly as values when the keys are not held externally", async () => {
      await expectAsync(
        key => testMap.set({}, key)
      ).toHoldReferencesWeakly();
    });
  });
});
