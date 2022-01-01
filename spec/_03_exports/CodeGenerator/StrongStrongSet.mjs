import ToHoldRefsMatchers from "#support/toHoldReferences.mjs";

import StrongStrongSet from "../generated/StrongStrongSet.mjs";

describe("CodeGenerator(StrongStrongSet.mjs)", () => {
  const refSet = new Set;
  const key1 = {isKey1: true},
        key2 = {isKey2: true},
        key3 = {isKey3: true};
  let testSet;
  beforeEach(() => {
    refSet.clear();
    testSet = new StrongStrongSet();
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(StrongStrongSet)).toBe(true);
    expect(Object.isFrozen(StrongStrongSet.prototype)).toBe(true);
  });

  it("class only exposes public methods", () => {
    expect(Reflect.ownKeys(StrongStrongSet.prototype)).toEqual([
      "constructor",
      "size",
      "add",
      "clear",
      "delete",
      "forEach",
      "has",
      "values",
    ]);
  });

  it("instances have no public properties", () => {
    const map = new StrongStrongSet();
    expect(Reflect.ownKeys(map)).toEqual([]);
  });

  it("adding one value", () => {
    refSet.add(key1);

    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.size).toBe(refSet.size);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));

    // Keys are ordered, and you cannot use only some of the keys.
    expect(testSet.has(key2, key1)).toBe(false);
    expect(testSet.has(key1)).toBe(false);
    expect(testSet.has(key2)).toBe(false);

    // These should be no-ops, but it doesn't hurt to try them.
    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.size).toBe(refSet.size);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));

    {
      const testIterator = testSet.values();
      const refIterator  = refSet.values();
      expect(testIterator.next()).toEqual({value: [key1, key2], done: false});
      refIterator.next();
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
    }

    expect(testSet.delete(key1, key2)).toBe(true);
    expect(testSet.size).toBe(0);
    expect(testSet.delete(key1, key2)).toBe(false);
    expect(testSet.size).toBe(0);

    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.size).toBe(refSet.size);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));

    const spy = jasmine.createSpy("forEach");
    const thisObj = {};
    testSet.forEach(spy, thisObj);

    expect(spy).toHaveBeenCalledOnceWith(key1, key2, testSet);

    expect(() => testSet.clear()).not.toThrow();
    expect(testSet.size).toBe(0);
    expect(testSet.has(key1, key2)).toBe(false);
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

    {
      const iterator = testSet.values();
      expect(iterator.next()).toEqual({value: [key1, key3], done: false});
      expect(iterator.next()).toEqual({value: [key2, key3], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    expect(testSet.delete(key3, key1)).toBe(false);
    expect(testSet.size).toBe(2);

    expect(testSet.delete(key1, key3)).toBe(true);
    expect(testSet.size).toBe(1);

    expect(testSet.delete(key1, key3)).toBe(false);
    expect(testSet.size).toBe(1);

    refSet.delete(key1);
    refSet.add(key1);

    expect(testSet.add(key1, key3)).toBe(testSet);
    expect(testSet.size).toBe(refSet.size);
    expect(testSet.has(key1, key3)).toBe(refSet.has(key1));

    {
      const iterator = testSet.values();
      expect(iterator.next()).toEqual({value: [key2, key3], done: false});
      expect(iterator.next()).toEqual({value: [key1, key3], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }
  
    const testSpy = jasmine.createSpy("testSet.forEach");
    testSet.forEach(testSpy);
    expect(testSpy).toHaveBeenCalledTimes(2);
    expect(testSpy.calls.argsFor(0)).toEqual([key2, key3, testSet]);
    expect(testSpy.calls.argsFor(1)).toEqual([key1, key3, testSet]);
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

    expect(testSet.size).toBe(refSet.size);

    {
      const iterator = testSet.values();
      expect(iterator.next()).toEqual({value: [key3, key1], done: false});
      expect(iterator.next()).toEqual({value: [key3, key2], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    expect(testSet.delete(key2, key1)).toBe(false);
    expect(testSet.size).toBe(2);

    expect(testSet.delete(key3, key1)).toBe(true);
    expect(testSet.size).toBe(1);

    expect(testSet.delete(key3, key1)).toBe(false);
    expect(testSet.size).toBe(1);

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
  
    const testSpy = jasmine.createSpy("testSet.forEach");
    testSet.forEach(testSpy);
    expect(testSpy).toHaveBeenCalledTimes(2);
    expect(testSpy.calls.argsFor(0)).toEqual([key3, key2, testSet]);
    expect(testSpy.calls.argsFor(1)).toEqual([key3, key1, testSet]);
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

    expect(testSet.size).toBe(refSet.size);

    {
      const iterator = testSet.values();
      expect(iterator.next()).toEqual({value: [key1, key2], done: false});
      expect(iterator.next()).toEqual({value: [key2, key1], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    expect(testSet.delete(key3, key1)).toBe(false);
    expect(testSet.size).toBe(2);

    expect(testSet.delete(key1, key2)).toBe(true);
    expect(testSet.size).toBe(1);

    expect(testSet.delete(key1, key2)).toBe(false);
    expect(testSet.size).toBe(1);

    refSet.delete(key1);
    refSet.add(key1);

    expect(testSet.add(key1, key2)).toBe(testSet);
    expect(testSet.size).toBe(refSet.size);
    expect(testSet.has(key1, key2)).toBe(refSet.has(key1));

    {
      const iterator = testSet.values();
      expect(iterator.next()).toEqual({value: [key2, key1], done: false});
      expect(iterator.next()).toEqual({value: [key1, key2], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }
  
    const testSpy = jasmine.createSpy("testSet.forEach");
    testSet.forEach(testSpy);
    expect(testSpy).toHaveBeenCalledTimes(2);
    expect(testSpy.calls.argsFor(0)).toEqual([key2, key1, testSet]);
    expect(testSpy.calls.argsFor(1)).toEqual([key1, key2, testSet]);
  });

  it("constructor initializes with iterator of first argument", () => {
    const key4 = {isKey4: true};

    const items = [
      [key1, key2],
      [key3, key4],
    ];

    testSet = new StrongStrongSet(items);
    expect(testSet.has(key1, key2)).toBe(true);
    expect(testSet.has(key3, key4)).toBe(true);
    expect(testSet.size).toBe(2);
  });

  it("constructor throws for an argument that is not iterable", () => {
    expect(() => {
      void(new StrongStrongSet({isKey1: true}));
    }).toThrow();
  });

  describe("holds references to objects", () => {
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    it("strongly as the first key in .add()", async () => {
      await expectAsync(
        key => testSet.add(key, {})
      ).toHoldReferencesStrongly();
    });

    it("strongly as the first argument in .add() where there is no second argument", async () => {
      await expectAsync(
        key => testSet.add(key)
      ).toHoldReferencesStrongly();
    });

    it("weakly as the first key in .delete()", async () => {
      await expectAsync(
        key => testSet.delete(key, {})
      ).toHoldReferencesWeakly();
    });

    it("weakly as the first key in .has()", async () => {
      await expectAsync(
        key => testSet.has(key, {})
      ).toHoldReferencesWeakly();
    });

    it("strongly as the second key in .add()", async () => {
      await expectAsync(
        key => testSet.add({}, key)
      ).toHoldReferencesStrongly();
    });

    it("weakly as the second key in .delete()", async () => {
      await expectAsync(
        key => testSet.delete({}, key)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the second key in .has()", async () => {
      await expectAsync(
        key => testSet.has({}, key)
      ).toHoldReferencesWeakly();
    });
  });
});
