import SoloStrongSet from "../generated/SoloStrongSet.mjs";
import ToHoldRefsMatchers from "../support/toHoldReferences.mjs";

describe("CodeGenerator(SoloStrongSet.mjs)", () => {
  let testSet, refSet = new Set;
  const key1 = {isKey1: true}, key2 = {isKey2: true};
  Object.freeze(key1);
  Object.freeze(key2);

  beforeEach(() => {
    refSet.clear();
    testSet = new SoloStrongSet();
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(SoloStrongSet)).toBe(true);
    expect(Object.isFrozen(SoloStrongSet.prototype)).toBe(true);
  });

  xit("class only exposes public methods", () => {
    // not implemented yet
  });

  it("adding one value", () => {
    refSet.add(key1);

    expect(testSet.add(key1)).toBe(testSet);
    expect(testSet.size).toBe(refSet.size);
    expect(testSet.has(key1)).toBe(refSet.has(key1));

    {
      const testIterator = testSet.values();
      const refIterator  = refSet.values();
      expect(testIterator.next()).toEqual({value: [key1], done: false});
      refIterator.next();
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
    }

    expect(testSet.delete(key1)).toBe(true);
    expect(testSet.size).toBe(0);
    expect(testSet.has(key1)).toBe(false);

    expect(testSet.has(key2)).toBe(false);

    expect(testSet.delete(key1)).toBe(false);
    expect(testSet.size).toBe(0);
    expect(testSet.has(key1)).toBe(false);

    expect(testSet.add(key1)).toBe(testSet);
    expect(testSet.size).toBe(refSet.size);
    expect(testSet.has(key1)).toBe(refSet.has(key1));

    const thisObj = {};
    const spy = jasmine.createSpy("forEach");
    testSet.forEach(spy, thisObj);

    /*
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    */
    expect(spy).toHaveBeenCalledOnceWith(key1, testSet);

    expect(testSet.clear()).toBe(undefined);
    expect(testSet.size).toBe(0);

    spy.calls.reset();
    testSet.forEach(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it("adding two values", () => {
    refSet.add(key1);
    refSet.add(key2);

    expect(testSet.add(key1)).toBe(testSet);
    expect(testSet.has(key1)).toBe(refSet.has(key1));

    expect(testSet.add(key2)).toBe(testSet);
    expect(testSet.has(key2)).toBe(refSet.has(key2));

    expect(testSet.size).toBe(refSet.size);

    {
      const testIterator = testSet.values();
      const refIterator  = refSet.values();
      expect(testIterator.next()).toEqual({value: [key1], done: false});
      refIterator.next();
      expect(testIterator.next()).toEqual({value: [key2], done: false});
      refIterator.next();
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
    }

    const thisObj = {};
    const spy = jasmine.createSpy("forEach");

    testSet.forEach(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([key1, testSet]);
    expect(spy.calls.argsFor(1)).toEqual([key2, testSet]);
    /*
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.thisFor(1)).toBe(thisObj);
    */

    spy.calls.reset();

    expect(testSet.delete(key1)).toBe(true);
    expect(testSet.size).toBe(1);
    expect(testSet.delete(key1)).toBe(false);
    expect(testSet.size).toBe(1);

    refSet.delete(key1);
    refSet.add(key1);

    expect(testSet.add(key1)).toBe(testSet);
    expect(testSet.size).toBe(refSet.size);
    expect(testSet.has(key1)).toBe(refSet.has(key1));

    {
      const testIterator = testSet.values();
      const refIterator  = refSet.values();
      expect(testIterator.next()).toEqual({value: [key2], done: false});
      refIterator.next();
      expect(testIterator.next()).toEqual({value: [key1], done: false});
      refIterator.next();
      expect(testIterator.next()).toEqual(refIterator.next());
      expect(testIterator.next()).toEqual(refIterator.next());
    }

    testSet.forEach(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([key2, testSet]);
    expect(spy.calls.argsFor(1)).toEqual([key1, testSet]);
    /*
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.thisFor(1)).toBe(thisObj);
    */
  });

  describe("holds references to objects", () => {
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    it("strongly as the key in .add()", async () => {
      await expectAsync(
        key => testSet.add(key)
      ).toHoldReferencesStrongly();
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

    it("weakly as the key in .add(), then .delete()", async () => {
      await expectAsync(
        key => {
          testSet.add(key);
          testSet.delete(key);
        }
      ).toHoldReferencesWeakly();
    });
  });
});
