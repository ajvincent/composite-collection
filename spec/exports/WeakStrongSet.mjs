import WeakStrongSet from "../generated/WeakStrongSet.mjs";
import ToHoldRefsMatchers from "../support/toHoldReferences.mjs";

describe("CodeGenerator(WeakStrongSet.mjs)", () => {
  const refSet = new Set;
  const key1 = {isKey1: true},
        key2 = {isKey2: true},
        key3 = {isKey3: true};
  let testSet;
  beforeEach(() => {
    refSet.clear();
    testSet = new WeakStrongSet();
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(WeakStrongSet)).toBe(true);
    expect(Object.isFrozen(WeakStrongSet.prototype)).toBe(true);
  });

  it("class only exposes public methods", () => {
    expect(Reflect.ownKeys(WeakStrongSet.prototype)).toEqual([
      "constructor",
      "add",
      "delete",
      "has",
      "isValidKey",
    ]);
  });

  it("instances have no public properties", () => {
    const map = new WeakStrongSet();
    expect(Reflect.ownKeys(map)).toEqual([]);
  });

  it("exposes all methods of a weak set, but not those of a strong set", () => {
    expect(Reflect.getOwnPropertyDescriptor(testSet, "size")).toBe(undefined);
    expect(Reflect.getOwnPropertyDescriptor(testSet, "clear")).toBe(undefined);
    expect(Reflect.getOwnPropertyDescriptor(testSet, "values")).toBe(undefined);
  });

  it(".isValidKey() returns true only if the first key part is non-primitive", () => {
    const key1 = {isKey1: true}, key2 = {isKey2: true};
    expect(testSet.isValidKey(key1, key2)).toBe(true);
    expect(testSet.isValidKey(key2, key1)).toBe(true);
    expect(testSet.isValidKey(key1, "foo")).toBe(true);
    expect(testSet.isValidKey("foo", key2)).toBe(false);
    expect(testSet.isValidKey(key1)).toBe(true);
    expect(testSet.isValidKey()).toBe(false);
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

  describe("using a primitive as", () => {
    describe("the first key throws for", () => {
      it("delete()", () => {
        expect(
          () => testSet.delete("foo", {})
        ).toThrowError("The ordered key set is not valid!");
      });

      it("has()", () => {
        expect(
          () => testSet.has("foo", {})
        ).toThrowError("The ordered key set is not valid!");
      });

      it("add()", () => {
        expect(
          () => testSet.add("foo", {})
        ).toThrowError("The ordered key set is not valid!");
      });
    });

    describe("the second key does not throw for", () => {
      it("delete()", () => {
        expect(
          () => testSet.delete({}, "foo")
        ).not.toThrow();
      });

      it("has()", () => {
        expect(
          () => testSet.has({}, "foo")
        ).not.toThrow();
      });

      it("add()", () => {
        expect(
          () => testSet.add({}, "foo")
        ).not.toThrow();
      });
    });
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

    refSet.delete(key1);
    refSet.add(key1);

    expect(testSet.add(key1, key3)).toBe(testSet);
    expect(testSet.has(key1, key3)).toBe(refSet.has(key1));
  });

  it("adding two keys with a constant first key", () => {
    refSet.add(key1);
    refSet.add(key2);

    expect(testSet.add(key3, key1)).toBe(testSet);
    expect(testSet.has(key3, key1)).toBe(true);

    expect(testSet.add(key3, key2)).toBe(testSet);
    expect(testSet.has(key3, key2)).toBe(true);

    // These should be no-ops, but it doesn't hurt to try them.
    expect(testSet.add(key3, key1)).toBe(testSet);
    expect(testSet.has(key3, key1)).toBe(true);

    expect(testSet.delete(key2, key1)).toBe(false);
    expect(testSet.delete(key3, key1)).toBe(true);
    expect(testSet.delete(key3, key1)).toBe(false);

    refSet.delete(key1);
    refSet.add(key1);

    expect(testSet.add(key3, key1)).toBe(testSet);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));
  });

  it("adding two keys with the second add swapping the keys", () => {
    refSet.add(key1);
    refSet.add(key2);

    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.has(key1, key2)).toBe(true);

    expect(testSet.add(key2, key1)).toBe(testSet);
    expect(testSet.has(key2, key1)).toBe(true);

    // These should be no-ops, but it doesn't hurt to try them.
    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.has(key1, key2)).toBe(true);

    expect(testSet.delete(key3, key1)).toBe(false);
    expect(testSet.delete(key1, key2)).toBe(true);
    expect(testSet.delete(key1, key2)).toBe(false);

    refSet.delete(key1);
    refSet.add(key1);

    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));
  });

  it("constructor initializes with iterator of first argument", () => {
    const key4 = {isKey4: true};

    const items = [
      [key1, key2],
      [key3, key4],
    ];

    testSet = new WeakStrongSet(items);
    expect(testSet.has(key1, key2)).toBe(true);
    expect(testSet.has(key3, key4)).toBe(true);
  });

  it("constructor throws for an argument that is not iterable", () => {
    expect(() => {
      void(new WeakStrongSet({isKey1: true}));
    }).toThrow();
  });

  describe("holds references to objects", () => {
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    const externalKey = {};

    describe("weakly as the first key in", () => {
      it("first key in .add()", async () => {
        await expectAsync(
          key => testSet.add(key, externalKey)
        ).toHoldReferencesWeakly();
      });

      it("first key in .delete()", async () => {
        await expectAsync(
          key => testSet.delete(key, externalKey)
        ).toHoldReferencesWeakly();
      });

      it("first key in .has()", async () => {
        await expectAsync(
          key => testSet.has(key, externalKey)
        ).toHoldReferencesWeakly();
      });
    });

    it("strongly as the second key in .add()", async () => {
      await expectAsync(
        key => testSet.add(externalKey, key)
      ).toHoldReferencesStrongly();
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

    it("weakly as the second key through .add(), then .delete()", async () => {
      await expectAsync(
        key => {
          testSet.add(externalKey, key);
          testSet.delete(externalKey, key);
        }
      ).toHoldReferencesWeakly();
    });
  });
});
