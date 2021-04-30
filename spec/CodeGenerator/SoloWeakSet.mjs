import SoloWeakSet from "../generated/SoloWeakSet.mjs";
import ToHoldRefsMatchers from "../support/toHoldReferences.mjs";

describe("CodeGenerator(SoloWeakSet.mjs)", () => {
  let testSet, refSet;
  const key1 = {isKey1: true}, key2 = {isKey2: true};
  Object.freeze(key1);
  Object.freeze(key2);

  beforeEach(() => {
    refSet = new WeakSet;
    testSet = new SoloWeakSet();
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(SoloWeakSet)).toBe(true);
    expect(Object.isFrozen(SoloWeakSet.prototype)).toBe(true);
  });

  xit("class only exposes public methods", () => {
    // not implemented yet
  });

  it("exposes all methods of a weak set, but not those of a strong set", () => {
    expect(Reflect.getOwnPropertyDescriptor(testSet, "size")).toBe(undefined);
    expect(Reflect.getOwnPropertyDescriptor(testSet, "values")).toBe(undefined);
    expect(Reflect.getOwnPropertyDescriptor(testSet, "forEach")).toBe(undefined);
  });

  it("validating a value is a non-primitive", () => {
    expect(testSet.isValidKey(key1)).toBe(true);
    expect(testSet.isValidKey(key2)).toBe(true);
    expect(testSet.isValidKey("foo")).toBe(false);
  });

  it("adding one value", () => {
    refSet.add(key1);

    expect(testSet.add(key1)).toBe(testSet);
    expect(testSet.has(key1)).toBe(refSet.has(key1));

    expect(testSet.delete(key1)).toBe(true);
    expect(testSet.has(key1)).toBe(false);

    expect(testSet.has(key2)).toBe(false);

    expect(testSet.delete(key1)).toBe(false);
    expect(testSet.has(key1)).toBe(false);

    expect(testSet.add(key1)).toBe(testSet);
    expect(testSet.has(key1)).toBe(refSet.has(key1));
  });

  it("adding two values", () => {
    refSet.add(key1);
    refSet.add(key2);

    expect(testSet.add(key1)).toBe(testSet);
    expect(testSet.has(key1)).toBe(refSet.has(key1));

    expect(testSet.add(key2)).toBe(testSet);
    expect(testSet.has(key2)).toBe(refSet.has(key2));

    expect(testSet.delete(key1)).toBe(true);
    expect(testSet.delete(key1)).toBe(false);

    refSet.delete(key1);
    refSet.add(key1);

    expect(testSet.add(key1)).toBe(testSet);
    expect(testSet.has(key1)).toBe(refSet.has(key1));
  });

  describe("holds references to objects", () => {
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    it("weakly as the key in .add()", async () => {
      await expectAsync(
        key => testSet.add(key)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the key in .delete()", async () => {
      await expectAsync(
        key => testSet.delete(key)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the key in .has()", async () => {
      await expectAsync(
        key => testSet.has(key)
      ).toHoldReferencesWeakly();
    });

    it("strongly when the keys are held externally", async () => {
      const externalKeys = [];
      await expectAsync(
        externalKey => {
          testSet.add(externalKey);
          externalKeys.push(externalKey);
          externalKey = null;
        }
      ).toHoldReferencesStrongly();

      externalKeys.forEach(externalKey => {
        expect(testSet.has(externalKey)).toBe(true);
      });
    });
  });
});
