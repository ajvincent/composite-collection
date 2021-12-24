import WeakMapOfStrongSets from "../generated/WeakMapOfStrongSets.mjs";
import ToHoldRefsMatchers from "../../support/toHoldReferences.mjs";

describe("CodeGenerator(WeakMapOfStrongSets.mjs)", () => {
  const refSet = new Set;
  const key1 = {isKey1: true},
        key2 = {isKey2: true},
        key3 = {isKey3: true};
  const thisObj = {};

  let testSet;
  beforeEach(() => {
    refSet.clear();
    testSet = new WeakMapOfStrongSets();
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(WeakMapOfStrongSets)).toBe(true);
    expect(Object.isFrozen(WeakMapOfStrongSets.prototype)).toBe(true);
  });

  it("class only exposes public methods", () => {
    expect(Reflect.ownKeys(WeakMapOfStrongSets.prototype)).toEqual([
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

  it("instances have no public properties", () => {
    const map = new WeakMapOfStrongSets();
    expect(Reflect.ownKeys(map)).toEqual([]);
  });

  it("adding one value", () => {
    refSet.add(key1);

    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.getSizeOfSet(key1)).toBe(1);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));

    // Keys are ordered, and you cannot use only some of the keys.
    expect(testSet.has(key2, key1)).toBe(false);
    expect(testSet.has(key1)).toBe(false);
    expect(testSet.has(key2)).toBe(false);

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

    expect(testSet.getSizeOfSet(key1)).toBe(1);
    expect(testSet.getSizeOfSet(key2)).toBe(1);

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
    expect(testSet.getSizeOfSet(key1)).toBe(1);
    expect(testSet.getSizeOfSet(key2)).toBe(1);

    expect(testSet.delete(key1, key3)).toBe(true);
    expect(testSet.getSizeOfSet(key1)).toBe(0);
    expect(testSet.getSizeOfSet(key2)).toBe(1);

    expect(testSet.delete(key1, key3)).toBe(false);
    expect(testSet.getSizeOfSet(key1)).toBe(0);
    expect(testSet.getSizeOfSet(key2)).toBe(1);

    refSet.delete(key1);
    refSet.add(key1);

    expect(testSet.add(key1, key3)).toBe(testSet);
    expect(testSet.has(key1, key3)).toBe(refSet.has(key1));
    expect(testSet.getSizeOfSet(key1)).toBe(1);
    expect(testSet.getSizeOfSet(key2)).toBe(1);

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
    testSet.forEachSet(key1, spy, thisObj);
    expect(spy).toHaveBeenCalledOnceWith(key1, key3, testSet);

    spy.calls.reset();
    testSet.forEachSet(key2, spy, thisObj);
    expect(spy).toHaveBeenCalledOnceWith(key2, key3, testSet);
  });

  it("adding two keys with a constant first key", () => {
    refSet.add(key1);
    refSet.add(key2);

    expect(testSet.add(key3, key1)).toBe(testSet);
    expect(testSet.has(key3, key1)).toBe(true);
    expect(testSet.getSizeOfSet(key3)).toBe(1);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));

    expect(testSet.add(key3, key2)).toBe(testSet);
    expect(testSet.has(key3, key2)).toBe(true);
    expect(testSet.getSizeOfSet(key3)).toBe(2);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));

    // These should be no-ops, but it doesn't hurt to try them.
    expect(testSet.add(key3, key1)).toBe(testSet);
    expect(testSet.has(key3, key1)).toBe(true);
    expect(testSet.getSizeOfSet(key3)).toBe(2);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));

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
    expect(testSet.getSizeOfSet(key3)).toBe(2);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));

    expect(testSet.delete(key3, key1)).toBe(true);
    expect(testSet.getSizeOfSet(key3)).toBe(1);
    expect(testSet.has(key3, key1)).toBe(false);
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));

    {
      const iterator = testSet.valuesSet(key3);
      expect(iterator.next()).toEqual({value: [key3, key2], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    expect(testSet.delete(key3, key1)).toBe(false);
    expect(testSet.getSizeOfSet(key3)).toBe(1);
    expect(testSet.has(key3, key1)).toBe(false);
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));

    {
      const iterator = testSet.valuesSet(key3);
      expect(iterator.next()).toEqual({value: [key3, key2], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    refSet.delete(key1);
    refSet.add(key1);

    expect(testSet.add(key3, key1)).toBe(testSet);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));

    {
      const iterator = testSet.valuesSet(key3);
      expect(iterator.next()).toEqual({value: [key3, key2], done: false});
      expect(iterator.next()).toEqual({value: [key3, key1], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    const spy = jasmine.createSpy("forEach");
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
  });

  it("adding two keys with the second add swapping the keys", () => {
    refSet.add(key1);
    refSet.add(key2);

    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.has(key1, key2)).toBe(true);

    expect(testSet.add(key2, key1)).toBe(testSet);
    expect(testSet.has(key2, key1)).toBe(true);
    expect(testSet.getSizeOfSet(key1)).toBe(1);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));
    expect(testSet.getSizeOfSet(key2)).toBe(1);
    expect(testSet.has(key2, key1)).toBe(refSet.has(key2));

    // These should be no-ops, but it doesn't hurt to try them.
    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.has(key1, key2)).toBe(true);
    expect(testSet.getSizeOfSet(key1)).toBe(1);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));
    expect(testSet.getSizeOfSet(key2)).toBe(1);
    expect(testSet.has(key2, key1)).toBe(refSet.has(key2));

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
    expect(testSet.delete(key1, key2)).toBe(true);
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
    expect(testSet.getSizeOfSet(key1)).toBe(0);
    expect(testSet.has(key1, key2)).toBe(false);
    expect(testSet.getSizeOfSet(key2)).toBe(1);
    expect(testSet.has(key2, key1)).toBe(refSet.has(key2));

    refSet.delete(key1);
    refSet.add(key1);

    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.getSizeOfSet(key1)).toBe(1);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));
    expect(testSet.getSizeOfSet(key2)).toBe(1);
    expect(testSet.has(key2, key1)).toBe(refSet.has(key2));

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
    expect(testSet.getSizeOfSet(key3)).toBe(2);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));

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
    expect(testSet.getSizeOfSet(key3)).toBe(0);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));

    refSet.add(key1);
    refSet.add(key2);

    testSet.addSets(key3, setOfSets);
    testSet.clearSets(key1);
    expect(testSet.getSizeOfSet(key3)).toBe(2);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));
    expect(testSet.hasSets(key3)).toBe(true);

    refSet.clear();

    testSet.clearSets(key3);
    expect(testSet.getSizeOfSet(key3)).toBe(0);
    expect(testSet.has(key3, key1)).toBe(refSet.has(key1));
    expect(testSet.has(key3, key2)).toBe(refSet.has(key2));
    expect(testSet.hasSets(key3)).toBe(true);
  });

  it("constructor initializes with iterator of first argument", () => {
    const key4 = {isKey4: true};

    const items = [
      [key1, key2],
      [key3, key4],
    ];

    testSet = new WeakMapOfStrongSets(items);
    expect(testSet.has(key1, key2)).toBe(true);
    expect(testSet.has(key3, key4)).toBe(true);
  });

  it("constructor throws for an argument that is not iterable", () => {
    expect(() => {
      void(new WeakMapOfStrongSets({isKey1: true}));
    }).toThrow();
  });

  describe("holds references to objects", () => {
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });
    const externalKey = {};

    it("weakly as the first key in .add()", async () => {
      await expectAsync(
        key => testSet.add(key, externalKey)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the first key in .delete()", async () => {
      await expectAsync(
        key => testSet.delete(key, externalKey)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the first key in .has()", async () => {
      await expectAsync(
        key => testSet.has(key, externalKey)
      ).toHoldReferencesWeakly();
    });

    it("strongly as the first key in .add() when the key is held externally", async () => {
      // this is really to make sure .has() still works
      const externalKeys = [];
      await expectAsync(
        key => {
          externalKeys.push(key);
          testSet.add(key, externalKey);
        }
      ).toHoldReferencesStrongly();
      externalKeys.forEach(key => {
        expect(testSet.has(key, externalKey)).toBe(true);
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

    it("weakly as the second key in .add(), then .delete()", async () => {
      await expectAsync(
        key => {
          testSet.add(externalKey, key);
          testSet.delete(externalKey, key);
        }
      ).toHoldReferencesWeakly();
    });
  });
});
