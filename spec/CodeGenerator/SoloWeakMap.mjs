import SoloWeakMap from "../generated/SoloWeakMap.mjs";
import ToHoldRefsMatchers from "../support/toHoldReferences.mjs";
import MockImportable from "../fixtures/MockImportable.mjs";

describe("CodeGenerator(SoloWeakMap.mjs)", () => {
  let testMap, refMap;
  const key1 = new MockImportable({isKey1: true}), key2 = new MockImportable({isKey2: true});
  const value1 = new MockImportable("value1"), value2 = new MockImportable("value2");

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

  it("class only exposes public methods", () => {
    expect(SoloWeakMap.prototype).toBeInstanceOf(WeakMap);
    expect(Reflect.ownKeys(SoloWeakMap.prototype)).toEqual([
      "constructor", // implicit
      "delete",
      "get",
      "has",
      "isValidKey",
      "isValidValue",
      "set",
    ]);
  });

  it("instances have no public properties", () => {
    const map = new SoloWeakMap();
    expect(Reflect.ownKeys(map)).toEqual([]);
  });

  it("exposes all methods of a weak map, but not those of a strong map", () => {
    expect(Reflect.getOwnPropertyDescriptor(testMap, "size")).toBe(undefined);
    expect(Reflect.getOwnPropertyDescriptor(testMap, "keys")).toBe(undefined);
    expect(Reflect.getOwnPropertyDescriptor(testMap, "values")).toBe(undefined);
    expect(Reflect.getOwnPropertyDescriptor(testMap, "entries")).toBe(undefined);
    expect(Reflect.getOwnPropertyDescriptor(testMap, "forEach")).toBe(undefined);
  });

  it("validating a value is a non-primitive", () => {
    expect(testMap.isValidKey(key1)).toBe(true);
    expect(testMap.isValidKey(key2)).toBe(true);
    expect(testMap.isValidKey("foo")).toBe(false);
  });

  it("setting one value", () => {
    refMap.set(key1, value1);

    expect(testMap.set(key1, value1)).toBe(testMap);
    expect(testMap.has(key1)).toBe(refMap.has(key1));
    expect(testMap.get(key1)).toBe(refMap.get(key1));

    expect(testMap.delete(key1)).toBe(true);
    expect(testMap.delete(key1)).toBe(false);

    expect(testMap.set(key1, value1)).toBe(testMap);
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
    refMap.set(key1, value1);
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

  it("throws for setting a non-validated key or value", () => {
    expect(() => {
      testMap.set({}, value1)
    }).toThrowError("The ordered key set is not valid!");

    expect(() => {
      testMap.set(key1, {})
    }).toThrowError("The value is not valid!");
  });

  describe("holds references to objects", () => {
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    it("weakly as the key in .isValidKey()", async () => {
      await expectAsync(
        key => testMap.isValidKey(new MockImportable(key))
      ).toHoldReferencesWeakly();
    });

    it("weakly as the key in .delete()", async () => {
      await expectAsync(
        key => testMap.delete(new MockImportable(key))
      ).toHoldReferencesWeakly();
    });

    it("weakly as the key in .get()", async () => {
      await expectAsync(
        key => testMap.get(new MockImportable(key))
      ).toHoldReferencesWeakly();
    });

    it("weakly as the key in .has()", async () => {
      await expectAsync(
        key => testMap.has(new MockImportable(key))
      ).toHoldReferencesWeakly();
    });

    it("weakly as the key in .set()", async () => {
      await expectAsync(
        key => testMap.set(new MockImportable(key), new MockImportable({}))
      ).toHoldReferencesWeakly();
    });

    it("strongly as values when the keys are held externally", async () => {
      const externalKeys = [];
      await expectAsync(
        value => {
          value = new MockImportable(value);
          let externalKey = new MockImportable({});
          testMap.set(externalKey, value);
          externalKeys.push(externalKey);
          externalKey = null;
        }
      ).toHoldReferencesStrongly();

      externalKeys.forEach(externalKey => {
        expect(testMap.has(externalKey)).toBe(true);
      });
    });

    it("weakly as values when the keys are not held externally", async () => {
      await expectAsync(
        key => testMap.set(new MockImportable({}), new MockImportable(key))
      ).toHoldReferencesWeakly();
    });
  });
});
