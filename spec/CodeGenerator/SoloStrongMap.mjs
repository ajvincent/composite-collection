import SoloStrongMap from "../generated/SoloStrongMap.mjs";
import ToHoldRefsMatchers from "../support/toHoldReferences.mjs";

describe("CodeGenerator(SoloStrongMap.mjs)", () => {
  let testMap, refMap = new Map;
  beforeEach(() => {
    refMap.clear();
    testMap = new SoloStrongMap();
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(SoloStrongMap)).toBe(true);
    expect(Object.isFrozen(SoloStrongMap.prototype)).toBe(true);
  });

  xit("class only exposes public methods", () => {
    // not implemented yet
  });

  it("setting one value", () => {
    const key = {isKey: true}, value = "value";
    refMap.set(key, value);

    expect(testMap.set(key, value)).toBe(testMap);
    expect(testMap.size).toBe(refMap.size);
    expect(testMap.has(key)).toBe(refMap.has(key));
    expect(testMap.get(key)).toBe(refMap.get(key));

    {
      const iterator = testMap.keys();
      expect(iterator.next()).toEqual({value: [key], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const testIterator = testMap.values();
      const refIterator  = refMap.values();
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
    }

    {
      const testIterator = testMap.entries();
      const refIterator  = refMap.entries()
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
    }

    expect(testMap.delete(key)).toBe(true);
    expect(testMap.size).toBe(0);
    expect(testMap.delete(key)).toBe(false);
    expect(testMap.size).toBe(0);

    expect(testMap.set(key, value)).toBe(testMap);
    expect(testMap.size).toBe(refMap.size);
    expect(testMap.has(key)).toBe(refMap.has(key));
    expect(testMap.get(key)).toBe(refMap.get(key));

    const testSpy = jasmine.createSpy("testMap.forEach");
    testMap.forEach(testSpy);
    expect(testSpy).toHaveBeenCalledOnceWith(value, key, testMap);
  });

  it("setting two values", () => {
    const key1 = {isKey1: true}, value1 = "value1";
    refMap.set(key1, value1);
    const key2 = {isKey2: true}, value2 = "value2";
    refMap.set(key2, value2);

    expect(testMap.set(key1, value1)).toBe(testMap);
    expect(testMap.has(key1)).toBe(refMap.has(key1));
    expect(testMap.get(key1)).toBe(refMap.get(key1));

    expect(testMap.set(key2, value2)).toBe(testMap);
    expect(testMap.has(key2)).toBe(refMap.has(key2));
    expect(testMap.get(key2)).toBe(refMap.get(key2));
    expect(testMap.size).toBe(refMap.size);

    {
      const iterator = testMap.keys();
      expect(iterator.next()).toEqual({value: [key1], done: false});
      expect(iterator.next()).toEqual({value: [key2], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const testIterator = testMap.values();
      const refIterator  = refMap.values();
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
    }

    {
      const testIterator = testMap.entries();
      const refIterator  = refMap.entries();
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
    }

    expect(testMap.delete(key1)).toBe(true);
    expect(testMap.size).toBe(1);
    expect(testMap.delete(key1)).toBe(false);
    expect(testMap.size).toBe(1);

    refMap.delete(key1);
    refMap.set(key1, value1);

    expect(testMap.set(key1, value1)).toBe(testMap);
    expect(testMap.size).toBe(refMap.size);
    expect(testMap.has(key1)).toBe(refMap.has(key1));
    expect(testMap.get(key1)).toBe(refMap.get(key1));

    {
      const iterator = testMap.keys();
      expect(iterator.next()).toEqual({value: [key2], done: false});
      expect(iterator.next()).toEqual({value: [key1], done: false});
      expect(iterator.next()).toEqual({value: undefined, done: true});
      expect(iterator.next()).toEqual({value: undefined, done: true});
    }

    {
      const testIterator = testMap.values();
      const refIterator  = refMap.values();
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
    }

    {
      const testIterator = testMap.entries();
      const refIterator  = refMap.entries()
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
    }

    const testSpy = jasmine.createSpy("testMap.forEach");
    testMap.forEach(testSpy);
    expect(testSpy).toHaveBeenCalledTimes(2);
    expect(testSpy.calls.argsFor(0)).toEqual([value2, key2, testMap]);
    expect(testSpy.calls.argsFor(1)).toEqual([value1, key1, testMap]);
  });

  describe("holds references to objects", () => {
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    it("weakly as the key in .delete()", async () => {
      await expectAsync(
        key => testMap.delete(key)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the key in .get()", async () => {
      await expectAsync(
        key => testMap.get(key)
      ).toHoldReferencesWeakly();
    });

    it("weakly as the key in .has()", async () => {
      await expectAsync(
        key => testMap.has(key)
      ).toHoldReferencesWeakly();
    });

    it("strongly as the key in .set()", async () => {
      await expectAsync(
        key => testMap.set(key, {})
      ).toHoldReferencesStrongly();
    });

    it("as values when the keys are held externally", async () => {
      const externalKeys = [];
      await expectAsync(
        value => {
          let externalKey = {};
          testMap.set(externalKey, value);
          externalKeys.push(externalKey);
          externalKey = null;
        }
      ).toHoldReferencesStrongly();
    });

    it("as values when the keys are not held externally", async () => {
      await expectAsync(
        value => testMap.set({}, value)
      ).toHoldReferencesStrongly();
    });
  });
});
