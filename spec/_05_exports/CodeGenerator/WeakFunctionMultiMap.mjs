import WeakFunctionMultiMap from "../generated/WeakFunctionMultiMap.mjs";

describe("CodeGenerator(WeakFunctionMultiMap.mjs)", () => {
  const refSet = new Set;
  const key1 = jasmine.createSpy("key1"),
        key2 = jasmine.createSpy("key2"),
        key3 = jasmine.createSpy("key3");
  const thisObj = {};

  let testSet;
  beforeEach(() => {
    refSet.clear();
    testSet = new WeakFunctionMultiMap();

    key1.calls.reset();
    key2.calls.reset();
    key3.calls.reset();
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(WeakFunctionMultiMap)).toBe(true);
    expect(Object.isFrozen(WeakFunctionMultiMap.prototype)).toBe(true);
  });

  it("class only exposes public methods", () => {
    expect(Reflect.ownKeys(WeakFunctionMultiMap.prototype)).toEqual([
      "constructor",
      "add",
      "addSets",
      "clearSets",
      "delete",
      "deleteSets",
      "forEachSet",
      "getSizeOfSet",
      "has",
      "hasSets",
      "isValidKey",
      "valuesSet",
    ]);
  });

  it("instances have only symbol public properties", () => {
    expect(Reflect.ownKeys(testSet)).toEqual([
      Symbol.toStringTag,
    ]);
  });

  it("instances stringify to a string with the className", () => {
    expect(testSet.toString().includes("WeakFunctionMultiMap")).toBe(true);
  });


  it("adding one value", () => {
    refSet.add(key1);

    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.getSizeOfSet(key1)).toBe(1);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));

    // Keys are ordered, and you cannot use only some of the keys.
    expect(testSet.has(key2, key1)).toBe(false);

    // These should be no-ops, but it doesn't hurt to try them.
    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.getSizeOfSet(key1)).toBe(1);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));

    {
      const testIterator = testSet.valuesSet(key1);
      const refIterator  = refSet.values();
      expect(testIterator.next()).toEqual({value: [key1, key2], done: false});
      refIterator.next();
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
    }

    {
      const testIterator = testSet.valuesSet(key3);
      expect(testIterator.next()).toEqual({value: undefined, done: true});
      expect(testIterator.next()).toEqual({value: undefined, done: true});
    }

    expect(testSet.delete(key1, key2)).toBe(true);
    expect(testSet.getSizeOfSet(key1)).toBe(0);

    expect(testSet.delete(key1, key2)).toBe(false);
    expect(testSet.getSizeOfSet(key1)).toBe(0);

    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.getSizeOfSet(key1)).toBe(1);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));

    const spy = jasmine.createSpy("forEach");
    testSet.forEachSet(key1, spy, thisObj);
    expect(spy).toHaveBeenCalledOnceWith(key1, key2, testSet);
  });

  it("throws for adding a non-function as the second key", () => {
    const root = {};
    expect(() => testSet.add(root, key1)).not.toThrow();

    expect(() => testSet.add(root, {})).toThrowError()
  });

  it("throws for setting a non-validated key", () => {
    expect(() => {
      testSet.add(key1, {})
    }).toThrowError("The ordered key set is not valid!");
  });

  // I'm excluding the other tests because ./WeakStrongMap.mjs covers them already.
});
