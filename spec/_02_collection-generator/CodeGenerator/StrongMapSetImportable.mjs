import StrongMapSetMockImportable from "../generated/StrongMapSetImportable.mjs";
import MockImportable from "../fixtures/MockImportable.mjs";

describe("CodeGenerator(StrongMapSetImportable.mjs)", () => {
  const refSet = new Set;
  const key1 = new MockImportable({isKey1: true}),
        key2 = new MockImportable({isKey2: true}),
        key3 = new MockImportable({isKey3: true});
  const thisObj = {};

  let testSet;
  beforeEach(() => {
    refSet.clear();
    testSet = new StrongMapSetMockImportable();
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(StrongMapSetMockImportable)).toBe(true);
    expect(Object.isFrozen(StrongMapSetMockImportable.prototype)).toBe(true);
  });

  it("class only exposes public methods", () => {
    expect(Reflect.ownKeys(StrongMapSetMockImportable.prototype)).toEqual([
      "constructor",
      "size",
      "getSizeOfSet",
      "mapSize",
      "add",
      "addSets",
      "clear",
      "clearSets",
      "delete",
      "deleteSets",
      "forEach",
      "forEachSet",
      "has",
      "hasSets",
      "isValidKey",
      "values",
      "valuesSet",
    ]);
  });

  it("instances have no public properties", () => {
    const map = new StrongMapSetMockImportable();
    expect(Reflect.ownKeys(map)).toEqual([]);
  });

  it("adding one value", () => {
    refSet.add(key1);

    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.size).toBe(refSet.size);
    expect(testSet.mapSize).toBe(1);
    expect(testSet.getSizeOfSet(key1)).toBe(1);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));

    // Keys are ordered, and you cannot use only some of the keys.
    expect(testSet.has(key2, key1)).toBe(false);

    // These should be no-ops, but it doesn't hurt to try them.
    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.size).toBe(refSet.size);
    expect(testSet.mapSize).toBe(1);
    expect(testSet.getSizeOfSet(key1)).toBe(1);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));

    {
      const testIterator = testSet.values();
      const refIterator  = refSet.values();
      expect(testIterator.next()).toEqual({value: [key1, key2], done: false});
      refIterator.next();
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
    }

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
    expect(testSet.size).toBe(0);
    expect(testSet.mapSize).toBe(0);
    expect(testSet.getSizeOfSet(key1)).toBe(0);

    expect(testSet.delete(key1, key2)).toBe(false);
    expect(testSet.size).toBe(0);
    expect(testSet.mapSize).toBe(0);
    expect(testSet.getSizeOfSet(key1)).toBe(0);

    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.size).toBe(refSet.size);
    expect(testSet.mapSize).toBe(1);
    expect(testSet.getSizeOfSet(key1)).toBe(1);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));

    const spy = jasmine.createSpy("forEach");
    testSet.forEach(spy, thisObj);
    expect(spy).toHaveBeenCalledOnceWith(key1, key2, testSet);

    spy.calls.reset();
    testSet.forEachSet(key1, spy, thisObj);
    expect(spy).toHaveBeenCalledOnceWith(key1, key2, testSet);

    expect(() => testSet.clear()).not.toThrow();
    expect(testSet.size).toBe(0);
    expect(testSet.has(key1, key2)).toBe(false);
    expect(testSet.mapSize).toBe(0);
    expect(testSet.getSizeOfSet(key1)).toBe(0);
  });

  it("throws for setting a non-validated key", () => {
    expect(() => {
      testSet.add(key1, {})
    }).toThrowError("The ordered key set is not valid!");

    expect(() => {
      testSet.add({}, key2)
    }).toThrowError("The ordered key set is not valid!");
  });
});
