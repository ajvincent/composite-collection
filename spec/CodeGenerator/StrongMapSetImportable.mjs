import StrongMapSetMockImportable from "../generated/StrongMapSetImportable.mjs";
import ToHoldRefsMatchers from "../support/toHoldReferences.mjs";
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

  xit("class only exposes public methods", () => {
    // not implemented yet
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
    expect(testSet.has(key1)).toBe(false);
    expect(testSet.has(key2)).toBe(false);

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

    expect(testSet.size).toBe(refSet.size);
    expect(testSet.mapSize).toBe(2);
    expect(testSet.getSizeOfSet(key1)).toBe(1);
    expect(testSet.getSizeOfSet(key2)).toBe(1);

    {
      const iterator = testSet.values();
      expect(iterator.next()).toEqual({value: [key1, key3], done: false});
      expect(iterator.next()).toEqual({value: [key2, key3], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const iterator = testSet.valuesSet(key1);
      expect(iterator.next()).toEqual({value: [key1, key3], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const iterator = testSet.valuesSet(key2);
      expect(iterator.next()).toEqual({value: [key2, key3], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const iterator = testSet.valuesSet(key3);
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    expect(testSet.delete(key3, key1)).toBe(false);
    expect(testSet.size).toBe(2);
    expect(testSet.mapSize).toBe(2);
    expect(testSet.getSizeOfSet(key1)).toBe(1);
    expect(testSet.getSizeOfSet(key2)).toBe(1);

    expect(testSet.delete(key1, key3)).toBe(true);
    expect(testSet.size).toBe(1);
    expect(testSet.mapSize).toBe(1);
    expect(testSet.getSizeOfSet(key1)).toBe(0);
    expect(testSet.getSizeOfSet(key2)).toBe(1);

    expect(testSet.delete(key1, key3)).toBe(false);
    expect(testSet.size).toBe(1);
    expect(testSet.mapSize).toBe(1);
    expect(testSet.getSizeOfSet(key1)).toBe(0);
    expect(testSet.getSizeOfSet(key2)).toBe(1);

    refSet.delete(key1);
    refSet.add(key1);

    expect(testSet.add(key1, key3)).toBe(testSet);
    expect(testSet.size).toBe(refSet.size);
    expect(testSet.has(key1, key3)).toBe(refSet.has(key1));
    expect(testSet.mapSize).toBe(2);
    expect(testSet.getSizeOfSet(key1)).toBe(1);
    expect(testSet.getSizeOfSet(key2)).toBe(1);

    {
      const iterator = testSet.values();
      expect(iterator.next()).toEqual({value: [key2, key3], done: false});
      expect(iterator.next()).toEqual({value: [key1, key3], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const iterator = testSet.valuesSet(key1);
      expect(iterator.next()).toEqual({value: [key1, key3], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const iterator = testSet.valuesSet(key2);
      expect(iterator.next()).toEqual({value: [key2, key3], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const iterator = testSet.valuesSet(key3);
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    const spy = jasmine.createSpy("forEach");
    testSet.forEach(spy);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([key2, key3, testSet]);
    expect(spy.calls.argsFor(1)).toEqual([key1, key3, testSet]);

    spy.calls.reset();
    testSet.forEachSet(key1, spy, thisObj);
    expect(spy).toHaveBeenCalledOnceWith(key1, key3, testSet);

    spy.calls.reset();
    testSet.forEachSet(key2, spy, thisObj);
    expect(spy).toHaveBeenCalledOnceWith(key2, key3, testSet);

    expect(() => testSet.clear()).not.toThrow();
    expect(testSet.size).toBe(0);
    expect(testSet.has(key1, key2)).toBe(false);
    expect(testSet.mapSize).toBe(0);
    expect(testSet.getSizeOfSet(key1)).toBe(0);
    expect(testSet.has(key1, key2)).toBe(false);
  });

  it("adding two keys with a constant first key", () => {
    refSet.add(key1);
    refSet.add(key2);

    expect(testSet.add(key3, key1)).toBe(testSet);
    expect(testSet.has(key3, key1)).toBe(true);
    expect(testSet.size).toBe(1);
    expect(testSet.mapSize).toBe(1);
    expect(testSet.getSizeOfSet(key3)).toBe(1);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));

    expect(testSet.add(key3, key2)).toBe(testSet);
    expect(testSet.has(key3, key2)).toBe(true);
    expect(testSet.size).toBe(2);
    expect(testSet.mapSize).toBe(1);
    expect(testSet.getSizeOfSet(key3)).toBe(2);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));

    // These should be no-ops, but it doesn't hurt to try them.
    expect(testSet.add(key3, key1)).toBe(testSet);
    expect(testSet.has(key3, key1)).toBe(true);
    expect(testSet.size).toBe(2);
    expect(testSet.mapSize).toBe(1);
    expect(testSet.getSizeOfSet(key3)).toBe(2);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));

    {
      const iterator = testSet.values();
      expect(iterator.next()).toEqual({value: [key3, key1], done: false});
      expect(iterator.next()).toEqual({value: [key3, key2], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const iterator = testSet.valuesSet(key3);
      expect(iterator.next()).toEqual({value: [key3, key1], done: false});
      expect(iterator.next()).toEqual({value: [key3, key2], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const iterator = testSet.valuesSet(key1);
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const iterator = testSet.valuesSet(key2);
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    expect(testSet.delete(key2, key1)).toBe(false);
    expect(testSet.size).toBe(2);
    expect(testSet.mapSize).toBe(1);
    expect(testSet.getSizeOfSet(key3)).toBe(2);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));

    expect(testSet.delete(key3, key1)).toBe(true);
    expect(testSet.size).toBe(1);
    expect(testSet.mapSize).toBe(1);
    expect(testSet.getSizeOfSet(key3)).toBe(1);
    expect(testSet.has(key3, key1)).toBe(false);
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));

    {
      const iterator = testSet.values();
      expect(iterator.next()).toEqual({value: [key3, key2], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const iterator = testSet.valuesSet(key3);
      expect(iterator.next()).toEqual({value: [key3, key2], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    expect(testSet.delete(key3, key1)).toBe(false);
    expect(testSet.size).toBe(1);
    expect(testSet.mapSize).toBe(1);
    expect(testSet.getSizeOfSet(key3)).toBe(1);
    expect(testSet.has(key3, key1)).toBe(false);
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));

    {
      const iterator = testSet.values();
      expect(iterator.next()).toEqual({value: [key3, key2], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const iterator = testSet.valuesSet(key3);
      expect(iterator.next()).toEqual({value: [key3, key2], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    refSet.delete(key1);
    refSet.add(key1);

    expect(testSet.add(key3, key1)).toBe(testSet);
    expect(testSet.size).toBe(refSet.size);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));

    {
      const iterator = testSet.values();
      expect(iterator.next()).toEqual({value: [key3, key2], done: false});
      expect(iterator.next()).toEqual({value: [key3, key1], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const iterator = testSet.valuesSet(key3);
      expect(iterator.next()).toEqual({value: [key3, key2], done: false});
      expect(iterator.next()).toEqual({value: [key3, key1], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    const spy = jasmine.createSpy("forEach");
    testSet.forEach(spy);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([key3, key2, testSet]);
    expect(spy.calls.argsFor(1)).toEqual([key3, key1, testSet]);

    spy.calls.reset();
    testSet.forEachSet(key3, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([key3, key2, testSet]);
    expect(spy.calls.argsFor(1)).toEqual([key3, key1, testSet]);

    spy.calls.reset();
    testSet.forEachSet(key1, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(0);

    spy.calls.reset();
    testSet.forEachSet(key2, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(0);

    expect(() => testSet.clear()).not.toThrow();
    expect(testSet.size).toBe(0);
    expect(testSet.has(key3, key1)).toBe(false);
    expect(testSet.mapSize).toBe(0);
    expect(testSet.getSizeOfSet(key1)).toBe(0);
    expect(testSet.has(key3, key2)).toBe(false);
  });

  it("adding two keys with the second add swapping the keys", () => {
    refSet.add(key1);
    refSet.add(key2);

    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.has(key1, key2)).toBe(true);

    expect(testSet.add(key2, key1)).toBe(testSet);
    expect(testSet.has(key2, key1)).toBe(true);
    expect(testSet.size).toBe(2);
    expect(testSet.mapSize).toBe(2);
    expect(testSet.getSizeOfSet(key1)).toBe(1);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));
    expect(testSet.getSizeOfSet(key2)).toBe(1);
    expect(testSet.has(key2, key1)).toBe(refSet.has(key2));

    // These should be no-ops, but it doesn't hurt to try them.
    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.has(key1, key2)).toBe(true);
    expect(testSet.size).toBe(2);
    expect(testSet.mapSize).toBe(2);
    expect(testSet.getSizeOfSet(key1)).toBe(1);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));
    expect(testSet.getSizeOfSet(key2)).toBe(1);
    expect(testSet.has(key2, key1)).toBe(refSet.has(key2));

    {
      const iterator = testSet.values();
      expect(iterator.next()).toEqual({value: [key1, key2], done: false});
      expect(iterator.next()).toEqual({value: [key2, key1], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const iterator = testSet.valuesSet(key1);
      expect(iterator.next()).toEqual({value: [key1, key2], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const iterator = testSet.valuesSet(key2);
      expect(iterator.next()).toEqual({value: [key2, key1], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    expect(testSet.delete(key3, key1)).toBe(false);
    expect(testSet.size).toBe(2);

    expect(testSet.delete(key1, key2)).toBe(true);
    expect(testSet.size).toBe(1);
    expect(testSet.mapSize).toBe(1);
    expect(testSet.getSizeOfSet(key1)).toBe(0);
    expect(testSet.has(key1, key2)).toBe(false);
    expect(testSet.getSizeOfSet(key2)).toBe(1);
    expect(testSet.has(key2, key1)).toBe(refSet.has(key2));

    {
      const iterator = testSet.valuesSet(key1);
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const iterator = testSet.valuesSet(key2);
      expect(iterator.next()).toEqual({value: [key2, key1], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    expect(testSet.delete(key1, key2)).toBe(false);
    expect(testSet.size).toBe(1);
    expect(testSet.mapSize).toBe(1);
    expect(testSet.getSizeOfSet(key1)).toBe(0);
    expect(testSet.has(key1, key2)).toBe(false);
    expect(testSet.getSizeOfSet(key2)).toBe(1);
    expect(testSet.has(key2, key1)).toBe(refSet.has(key2));

    refSet.delete(key1);
    refSet.add(key1);

    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.size).toBe(refSet.size);
    expect(testSet.mapSize).toBe(2);
    expect(testSet.getSizeOfSet(key1)).toBe(1);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));
    expect(testSet.getSizeOfSet(key2)).toBe(1);
    expect(testSet.has(key2, key1)).toBe(refSet.has(key2));

    {
      const iterator = testSet.values();
      expect(iterator.next()).toEqual({value: [key2, key1], done: false});
      expect(iterator.next()).toEqual({value: [key1, key2], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const iterator = testSet.valuesSet(key1);
      expect(iterator.next()).toEqual({value: [key1, key2], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const iterator = testSet.valuesSet(key2);
      expect(iterator.next()).toEqual({value: [key2, key1], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }
  
    const spy = jasmine.createSpy("forEach");
    testSet.forEach(spy);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([key2, key1, testSet]);
    expect(spy.calls.argsFor(1)).toEqual([key1, key2, testSet]);

    spy.calls.reset();
    testSet.forEachSet(key1, spy, thisObj);
    expect(spy).toHaveBeenCalledOnceWith(key1, key2, testSet);

    spy.calls.reset();
    testSet.forEachSet(key2, spy, thisObj);
    expect(spy).toHaveBeenCalledOnceWith(key2, key1, testSet);
  });

  it("invoking .addSets() and its full-set friends", () => {
    const setOfSets = new Set([
      [key1],
      [key2],
    ]);
    refSet.add(key1);
    refSet.add(key2);

    testSet.addSets(key3, setOfSets);
    expect(testSet.size).toBe(2);
    expect(testSet.mapSize).toBe(1);
    expect(testSet.getSizeOfSet(key3)).toBe(2);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));

    {
      const iterator = testSet.values();
      expect(iterator.next()).toEqual({value: [key3, key1], done: false});
      expect(iterator.next()).toEqual({value: [key3, key2], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const iterator = testSet.valuesSet(key3);
      expect(iterator.next()).toEqual({value: [key3, key1], done: false});
      expect(iterator.next()).toEqual({value: [key3, key2], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    expect(testSet.hasSets(key1)).toBe(false);
    expect(testSet.hasSets(key2)).toBe(false);
    expect(testSet.hasSets(key3)).toBe(true);

    refSet.delete(key1);
    refSet.delete(key2);

    testSet.deleteSets(key3);
    expect(testSet.size).toBe(0);
    expect(testSet.mapSize).toBe(0);
    expect(testSet.getSizeOfSet(key3)).toBe(0);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));
    expect(testSet.hasSets(key3)).toBe(false);

    {
      const iterator = testSet.values();
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    refSet.add(key1);
    refSet.add(key2);

    testSet.addSets(key3, setOfSets);
    testSet.clearSets(key1);
    expect(testSet.size).toBe(2);
    expect(testSet.mapSize).toBe(1);
    expect(testSet.getSizeOfSet(key3)).toBe(2);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));
    expect(testSet.hasSets(key3)).toBe(true);

    refSet.clear();

    testSet.clearSets(key3);
    expect(testSet.size).toBe(0);
    expect(testSet.mapSize).toBe(1);
    expect(testSet.getSizeOfSet(key3)).toBe(0);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));
    expect(testSet.hasSets(key3)).toBe(true);
  });

  it("constructor initializes with iterator of first argument", () => {
    //const key4 = {isKey4: true};
    const key4 = new MockImportable({isKey4: true});

    const items = [
      [key1, key2],
      [key3, key4],
    ];

    testSet = new StrongMapSetMockImportable(items);
    expect(testSet.has(key1, key2)).toBe(true);
    expect(testSet.has(key3, key4)).toBe(true);
    expect(testSet.size).toBe(2);
  });

  it("constructor throws for an argument that is not iterable", () => {
    expect(() => {
      void(new StrongMapSetMockImportable({isKey1: true}));
    }).toThrow();
  });

  describe("holds references to objects", () => {
    const externalKey = new MockImportable({});
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    it("strongly as the first key in .add()", async () => {
      await expectAsync(
        key => testSet.add(new MockImportable(key), externalKey)
      ).toHoldReferencesStrongly();
    });

    it("strongly as the first argument in .add() where there is no second argument", async () => {
      await expectAsync(
        key => testSet.add(new MockImportable(key))
      ).toHoldReferencesStrongly();
    });

    it("weakly as the first key in .delete()", async () => {
      await expectAsync(
        key => testSet.delete(new MockImportable(key), externalKey)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the first key in .has()", async () => {
      await expectAsync(
        key => testSet.has(new MockImportable(key), externalKey)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the first key in .add(), then .delete()", async () => {
      await expectAsync(
        key => {
          key = new MockImportable(key);
          testSet.add(key, externalKey);
          testSet.delete(key, externalKey);
        }
      ).toHoldReferencesWeakly();
    });

    it("strongly as the second key in .add()", async () => {
      await expectAsync(
        key => testSet.add(externalKey, new MockImportable(key))
      ).toHoldReferencesStrongly();
    });

    it("weakly as the second key in .delete()", async () => {
      await expectAsync(
        key => testSet.delete(externalKey, new MockImportable(key))
      ).toHoldReferencesWeakly();
    });

    it("weakly as the second key in .has()", async () => {
      await expectAsync(
        key => testSet.has(externalKey, new MockImportable(key))
      ).toHoldReferencesWeakly();
    });
  });
});
