import ToHoldRefsMatchers from "#support/toHoldReferences.mjs";

import WeakStrongMap from "../generated/WeakStrongMap.mjs";

describe("CodeGenerator(WeakStrongMap.mjs),", () => {
  let testMap, refMap = new Map;

  const defaultValue1 = Symbol("default value one");
  const defaultGetter1 = () => defaultValue1;
  const defaultValue2 = Symbol("default value two");
  const defaultGetter2 = () => defaultValue2;

  beforeEach(() => {
    refMap.clear();
    testMap = new WeakStrongMap();
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(WeakStrongMap)).toBe(true);
    expect(Object.isFrozen(WeakStrongMap.prototype)).toBe(true);
  });

  it("class only exposes public methods", () => {
    expect(Reflect.ownKeys(WeakStrongMap.prototype)).toEqual([
      "constructor",
      "delete",
      "get",
      "getDefault",
      "has",
      "isValidKey",
      "set",
    ]);
  });

  it("instances have only symbol public properties", () => {
    expect(Reflect.ownKeys(testMap)).toEqual([
      Symbol.toStringTag,
    ]);
  });

  it("instances stringify to a string with the className", () => {
    expect(testMap.toString().includes("WeakStrongMap")).toBe(true);
  });

  it("exposes all methods of a weak map, but not those of a strong map", () => {
    expect(Reflect.getOwnPropertyDescriptor(testMap, "size")).toBe(undefined);
    expect(Reflect.getOwnPropertyDescriptor(testMap, "clear")).toBe(undefined);
    expect(Reflect.getOwnPropertyDescriptor(testMap, "keys")).toBe(undefined);
    expect(Reflect.getOwnPropertyDescriptor(testMap, "values")).toBe(undefined);
    expect(Reflect.getOwnPropertyDescriptor(testMap, "entries")).toBe(undefined);
    expect(Reflect.getOwnPropertyDescriptor(testMap, "forEach")).toBe(undefined);
  });

  it(".isValidKey() returns true only if the first key part is non-primitive", () => {
    const key1 = {isKey1: true}, key2 = {isKey2: true};
    expect(testMap.isValidKey(key1, key2)).toBe(true);
    expect(testMap.isValidKey(key2, key1)).toBe(true);
    expect(testMap.isValidKey(key1, "foo")).toBe(true);
    expect(testMap.isValidKey("foo", key2)).toBe(false);
    expect(testMap.isValidKey(key1)).toBe(true);
    expect(testMap.isValidKey()).toBe(false);
  });

  it("setting one value", () => {
    const key1 = {isKey1: true}, key2 = {isKey2: true}, value = "value";
    refMap.set(key1, value);

    expect(testMap.set(key1, key2, value)).toBe(testMap);
    expect(testMap.has(key1, key2)).toBe(refMap.has(key1));
    expect(testMap.get(key1, key2)).toBe(refMap.get(key1));
    expect(testMap.getDefault(key1, key2, defaultGetter1)).toBe(refMap.get(key1));

    expect(testMap.delete(key1, key2)).toBe(true);
    expect(testMap.delete(key1, key2)).toBe(false);

    expect(testMap.set(key1, key2, value)).toBe(testMap);
    expect(testMap.has(key1, key2)).toBe(refMap.has(key1));
    expect(testMap.get(key1, key2)).toBe(refMap.get(key1));
    expect(testMap.getDefault(key1, key2, defaultGetter1)).toBe(refMap.get(key1));
  });

  it("setting two values with a constant second key", () => {
    const key1 = {isKey1: true}, key3 = {isKey3: true}, value1 = "value1";
    refMap.set(key1, value1);
    const key2 = {isKey2: true}, value2 = "value3";
    refMap.set(key2, value2);

    expect(testMap.set(key1, key3, value1)).toBe(testMap);
    expect(testMap.has(key1, key3)).toBe(refMap.has(key1));
    expect(testMap.get(key1, key3)).toBe(refMap.get(key1));
    expect(testMap.getDefault(key1, key3, defaultGetter1)).toBe(refMap.get(key1));

    expect(testMap.set(key2, key3, value2)).toBe(testMap);
    expect(testMap.has(key2, key3)).toBe(refMap.has(key2));
    expect(testMap.get(key2, key3)).toBe(refMap.get(key2));
    expect(testMap.getDefault(key2, key3, defaultGetter1)).toBe(refMap.get(key2));

    expect(testMap.delete(key1, key3)).toBe(true);
    expect(testMap.delete(key1, key3)).toBe(false);

    refMap.delete(key1);
    refMap.set(key1, value1);

    expect(testMap.set(key1, key3, value1)).toBe(testMap);
    expect(testMap.has(key1, key3)).toBe(refMap.has(key1));
    expect(testMap.get(key1, key3)).toBe(refMap.get(key1));
    expect(testMap.getDefault(key1, key3, defaultGetter1)).toBe(refMap.get(key1));
  });

  it("setting two values with a constant first key", () => {
    const key1 = {isKey1: true}, key3 = {isKey3: true}, value1 = "value1";
    refMap.set(key1, value1);
    const key2 = {isKey2: true}, value2 = "value3";
    refMap.set(key2, value2);

    expect(testMap.set(key3, key1, value1)).toBe(testMap);
    expect(testMap.has(key3, key1)).toBe(refMap.has(key1));
    expect(testMap.get(key3, key1)).toBe(refMap.get(key1));
    expect(testMap.getDefault(key3, key1, defaultGetter1)).toBe(refMap.get(key1));

    expect(testMap.set(key3, key2, value2)).toBe(testMap);
    expect(testMap.has(key3, key2)).toBe(refMap.has(key2));
    expect(testMap.get(key3, key2)).toBe(refMap.get(key2));
    expect(testMap.getDefault(key3, key2, defaultGetter1)).toBe(refMap.get(key2));

    expect(testMap.delete(key3, key1)).toBe(true);
    expect(testMap.delete(key3, key1)).toBe(false);

    refMap.delete(key1);
    refMap.set(key1, value1);

    expect(testMap.set(key3, key1, value1)).toBe(testMap);
    expect(testMap.has(key3, key1)).toBe(refMap.has(key1));
    expect(testMap.get(key3, key1)).toBe(refMap.get(key1));
    expect(testMap.getDefault(key3, key1, defaultGetter1)).toBe(refMap.get(key1));
  });

  it("setting two values with swapping keys", () => {
    const key1 = {isKey1: true}, value1 = "value1";
    refMap.set(key1, value1);
    const key2 = {isKey2: true}, value2 = "value3";
    refMap.set(key2, value2);

    expect(testMap.set(key1, key2, value1)).toBe(testMap);
    expect(testMap.has(key1, key2)).toBe(refMap.has(key1));
    expect(testMap.get(key1, key2)).toBe(refMap.get(key1));
    expect(testMap.getDefault(key1, key2, defaultGetter1)).toBe(refMap.get(key1));

    expect(testMap.set(key2, key1, value2)).toBe(testMap);
    expect(testMap.has(key2, key1)).toBe(refMap.has(key2));
    expect(testMap.get(key2, key1)).toBe(refMap.get(key2));
    expect(testMap.getDefault(key2, key1, defaultGetter1)).toBe(refMap.get(key2));

    expect(testMap.delete(key1, key2)).toBe(true);
    expect(testMap.delete(key1, key2)).toBe(false);

    refMap.delete(key1);
    refMap.set(key1, value1);

    expect(testMap.set(key1, key2, value1)).toBe(testMap);
    expect(testMap.has(key1, key2)).toBe(refMap.has(key1));
    expect(testMap.get(key1, key2)).toBe(refMap.get(key1));
    expect(testMap.getDefault(key1, key2, defaultGetter1)).toBe(refMap.get(key1));
  });

  it("calling .getDefault() returns default values for undefined key sets", () => {
    const key1 = {isKey1: true}, key2 = {isKey2: true};
    refMap.set(key1, defaultGetter1());
    refMap.set(key2, defaultGetter2());

    expect(testMap.getDefault(key1, key2, defaultGetter1)).toBe(refMap.get(key1));
    expect(testMap.getDefault(key2, key1, defaultGetter2)).toBe(refMap.get(key2));
  });

  it("constructor initializes with iterator of first argument", () => {
    const key1 = {isKey1: true}, key2 = {isKey2: true},
          key3 = {isKey3: true}, key4 = {isKey4: true},
          value1 = "value1", value2 = "value2";

    const items = [
      [key1, key2, value1],
      [key3, key4, value2],
    ];

    testMap = new WeakStrongMap(items);
    expect(testMap.get(key1, key2)).toBe(value1);
    expect(testMap.get(key3, key4)).toBe(value2);
  });

  it("constructor throws for an argument that is not iterable", () => {
    expect(() => {
      void(new WeakStrongMap({isKey1: true}));
    });
  });

  describe("holds references to objects", () => {
    const externalKey = {}, externalValue = {};
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    it("weakly as the first key in .delete()", async () => {
      await expectAsync(
        key => testMap.delete(key, externalKey)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the first key in .get()", async () => {
      await expectAsync(
        key => testMap.get(key, externalKey)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the first key in .has()", async () => {
      await expectAsync(
        key => testMap.has(key, externalKey)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the first key in .set()", async () => {
      await expectAsync(
        key => testMap.set(key, externalKey, externalValue)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the first argument in .set() where there is no second argument", async () => {
      await expectAsync(
        key => testMap.set(key)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the second key in .delete()", async () => {
      await expectAsync(
        key => testMap.delete(externalKey, key)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the second key in .get()", async () => {
      await expectAsync(
        key => testMap.get(externalKey, key)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the second key in .has()", async () => {
      await expectAsync(
        key => testMap.has(externalKey, key)
      ).toHoldReferencesWeakly();
    });

    it("strongly as the second key in .set()", async () => {
      await expectAsync(
        key => testMap.set(externalKey, key, externalValue)
      ).toHoldReferencesStrongly();
    });

    it("weakly as the second key through .add(), then .delete()", async () => {
      await expectAsync(
        key => {
          testMap.set(externalKey, key, externalValue);
          testMap.delete(externalKey, key);
        }
      ).toHoldReferencesWeakly();
    });

    it("strongly as the second argument in .set() where there is no third argument", async () => {
      await expectAsync(
        key => testMap.set(externalKey, key)
      ).toHoldReferencesStrongly();
    });

    it("strongly as values when the keys are held externally", async () => {
      const externalKeys = [];
      await expectAsync(
        value => {
          let externalKey = {};
          testMap.set(externalKeys, externalKey, value);
          externalKeys.push(externalKey);
          externalKey = null;
        }
      ).toHoldReferencesStrongly();

      externalKeys.forEach(externalKey => {
        expect(testMap.has(externalKeys, externalKey)).toBe(true);
      });
    });

    it("weakly as values when the keys are not held externally", async () => {
      await expectAsync(
        value => testMap.set({}, {}, value)
      ).toHoldReferencesWeakly();
    });
  });
});
