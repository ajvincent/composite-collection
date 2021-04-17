import WeakWeakMap from "../generated/WeakWeakMap.mjs";
import ToHoldRefsMatchers from "../support/toHoldReferences.mjs";

describe("CodeGenerator(WeakWeakMap.mjs),", () => {
  let testMap, refMap = new Map;
  beforeEach(() => {
    refMap.clear();
    testMap = new WeakWeakMap();
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(WeakWeakMap)).toBe(true);
    expect(Object.isFrozen(WeakWeakMap.prototype)).toBe(true);
  });

  it(".isValidKey() returns true only if all key parts are non-primitive", () => {
    const key1 = {isKey1: true}, key2 = {isKey2: true};
    expect(testMap.isValidKey(key1, key2)).toBe(true);
    expect(testMap.isValidKey(key2, key1)).toBe(true);
    expect(testMap.isValidKey(key1, "foo")).toBe(false);
    expect(testMap.isValidKey("foo", key2)).toBe(false);
    expect(testMap.isValidKey(key1)).toBe(false);
    expect(testMap.isValidKey()).toBe(false);
  });

  it("setting one value", () => {
    const key1 = {isKey1: true}, key2 = {isKey2: true}, value = "value";
    refMap.set(key1, value);

    expect(testMap.set(key1, key2, value)).toBe(testMap);
    expect(testMap.has(key1, key2)).toBe(refMap.has(key1));
    expect(testMap.get(key1, key2)).toBe(refMap.get(key1));

    expect(testMap.delete(key1, key2)).toBe(true);
    expect(testMap.delete(key1, key2)).toBe(false);

    expect(testMap.set(key1, key2, value)).toBe(testMap);
    expect(testMap.has(key1, key2)).toBe(refMap.has(key1));
    expect(testMap.get(key1, key2)).toBe(refMap.get(key1));
  });

  describe("using a primitive as", () => {
    describe("the first key throws for", () => {
      it("delete()", () => {
        expect(
          () => testMap.delete("foo", {})
        ).toThrowError("The ordered key set is not valid!");
      });

      it("get()", () => {
        expect(
          () => testMap.get("foo", {})
        ).toThrowError("The ordered key set is not valid!");
      });
  
      it("has()", () => {
        expect(
          () => testMap.has("foo", {})
        ).toThrowError("The ordered key set is not valid!");
      });
  
      it("set()", () => {
        expect(
          () => testMap.set("foo", {}, 3)
        ).toThrowError("The ordered key set is not valid!");
      });
    });

    describe("the second key throws for", () => {
      it("delete()", () => {
        expect(
          () => testMap.delete({}, "foo")
        ).toThrowError("The ordered key set is not valid!");
      });

      it("get()", () => {
        expect(
          () => testMap.get({}, "foo")
        ).toThrowError("The ordered key set is not valid!");
      });

      it("has()", () => {
        expect(
          () => testMap.has({}, "foo")
        ).toThrowError("The ordered key set is not valid!");
      });

      it("set()", () => {
        expect(
          () => testMap.set({}, "foo", 3)
        ).toThrowError("The ordered key set is not valid!");
      });
    });
  });

  it("setting two values with a constant second key", () => {
    const key1 = {isKey1: true}, key3 = {isKey3: true}, value1 = "value1";
    refMap.set(key1, value1);
    const key2 = {isKey2: true}, value2 = "value3";
    refMap.set(key2, value2);

    expect(testMap.set(key1, key3, value1)).toBe(testMap);
    expect(testMap.has(key1, key3)).toBe(refMap.has(key1));
    expect(testMap.get(key1, key3)).toBe(refMap.get(key1));

    expect(testMap.set(key2, key3, value2)).toBe(testMap);
    expect(testMap.has(key2, key3)).toBe(refMap.has(key2));
    expect(testMap.get(key2, key3)).toBe(refMap.get(key2));

    expect(testMap.delete(key1, key3)).toBe(true);
    expect(testMap.delete(key1, key3)).toBe(false);

    expect(testMap.set(key1, key3, value1)).toBe(testMap);
    expect(testMap.has(key1, key3)).toBe(refMap.has(key1));
    expect(testMap.get(key1, key3)).toBe(refMap.get(key1));
  });

  it("setting two values with a constant first key", () => {
    const key1 = {isKey1: true}, key3 = {isKey3: true}, value1 = "value1";
    refMap.set(key1, value1);
    const key2 = {isKey2: true}, value2 = "value3";
    refMap.set(key2, value2);

    expect(testMap.set(key3, key1, value1)).toBe(testMap);
    expect(testMap.has(key3, key1)).toBe(refMap.has(key1));
    expect(testMap.get(key3, key1)).toBe(refMap.get(key1));

    expect(testMap.set(key3, key2, value2)).toBe(testMap);
    expect(testMap.has(key3, key2)).toBe(refMap.has(key2));
    expect(testMap.get(key3, key2)).toBe(refMap.get(key2));

    expect(testMap.delete(key3, key1)).toBe(true);
    expect(testMap.delete(key3, key1)).toBe(false);

    expect(testMap.set(key3, key1, value1)).toBe(testMap);
    expect(testMap.has(key3, key1)).toBe(refMap.has(key1));
    expect(testMap.get(key3, key1)).toBe(refMap.get(key1));
  });

  it("setting two values with swapping keys", () => {
    const key1 = {isKey1: true}, value1 = "value1";
    refMap.set(key1, value1);
    const key2 = {isKey2: true}, value2 = "value3";
    refMap.set(key2, value2);

    expect(testMap.set(key1, key2, value1)).toBe(testMap);
    expect(testMap.has(key1, key2)).toBe(refMap.has(key1));
    expect(testMap.get(key1, key2)).toBe(refMap.get(key1));

    expect(testMap.set(key2, key1, value2)).toBe(testMap);
    expect(testMap.has(key2, key1)).toBe(refMap.has(key2));
    expect(testMap.get(key2, key1)).toBe(refMap.get(key2));

    expect(testMap.delete(key1, key2)).toBe(true);
    expect(testMap.delete(key1, key2)).toBe(false);

    expect(testMap.set(key1, key2, value1)).toBe(testMap);
    expect(testMap.has(key1, key2)).toBe(refMap.has(key1));
    expect(testMap.get(key1, key2)).toBe(refMap.get(key1));
  });

  describe("holds references to objects weakly as the", () => {
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    describe("first key in", () => {
      // isValidKey()?
      it(".delete()", async () => {
        await expectAsync(
          key => testMap.delete(key, {})
        ).toHoldReferencesWeakly();
      });
  
      it(".get()", async () => {
        await expectAsync(
          key => testMap.get(key, {})
        ).toHoldReferencesWeakly();
      });

      it(".has()", async () => {
        await expectAsync(
          key => testMap.has(key, {})
        ).toHoldReferencesWeakly();
      });

      it(".set()", async () => {
        await expectAsync(
          key => testMap.set(key, {}, {})
        ).toHoldReferencesWeakly();
      });
    });

    describe("second key in", () => {
      // isValidKey()?
      it(".delete()", async () => {
        await expectAsync(
          key => testMap.delete({}, key)
        ).toHoldReferencesWeakly();
      });

      it(".get()", async () => {
        await expectAsync(
          key => testMap.get({}, key)
        ).toHoldReferencesWeakly();
      });

      it(".has()", async () => {
        await expectAsync(
          key => testMap.has({}, key)
        ).toHoldReferencesWeakly();
      });

      it(".set()", async () => {
        await expectAsync(
          key => testMap.set({}, key, {})
        ).toHoldReferencesWeakly();
      });
    });

    it("value when the keys are held externally", async () => {
      const externalKeys = [];
      await expectAsync(
        value => {
          let externalKey = {};
          testMap.set(externalKey, externalKey, value);
          externalKeys.push(externalKey);
          externalKey = null;
        }
      ).toHoldReferencesStrongly();
    });

    it("value when the keys are not held externally", async () => {
      await expectAsync(
        key => testMap.set({}, {}, key)
      ).toHoldReferencesWeakly();
    });
  });
});
