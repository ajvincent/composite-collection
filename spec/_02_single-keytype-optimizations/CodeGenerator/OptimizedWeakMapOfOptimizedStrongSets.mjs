import MockImportable from "#spec/_01_collection-generator/fixtures/MockImportable.mjs";
import { describeForAllThree } from "../support/SpecModuleLoader.mjs";
import ToHoldRefsMatchers from "#support/toHoldReferences.mjs";

describeForAllThree("OptimizedWeakMapOfOptimizedStrongSets", (modules, mapMod, setMod) => {
  const {
    OptimizedWeakMapOfOptimizedStrongSets,
  } = modules;

  let mapOfSets, firstMapKey, firstSetKey, secondMapKey, secondSetKey;
  beforeEach(() => {
    mapOfSets = new OptimizedWeakMapOfOptimizedStrongSets;
    firstMapKey = mapMod([new MockImportable]);
    firstSetKey = setMod([new MockImportable]);
    secondMapKey = mapMod([new MockImportable]);
    secondSetKey = setMod([new MockImportable]);
  });
  afterEach(() => {
    mapOfSets = null;
    firstMapKey = null;
    firstSetKey = null;
  });

  it("starts out empty", () => {
    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(0);

    expect(mapOfSets.delete(...firstMapKey, ...firstSetKey)).toBe(false);
    expect(mapOfSets.deleteSets(...firstMapKey)).toBe(false);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(false);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(false);

    let spy = jasmine.createSpy(), thisObj = {};
    mapOfSets.forEachSet(...firstMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(0);

    let iter = mapOfSets.valuesSet(...firstMapKey);
    expect(iter.next()).toEqual({value: undefined, done: true});
  });

  it(".add(...firstMapKey, ...firstSetKey) adds a single member", () => {
    mapOfSets.add(...firstMapKey, ...firstSetKey);

    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(1);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(true);

    let spy = jasmine.createSpy(), thisObj = {};
    mapOfSets.forEachSet(...firstMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);

    let iter = mapOfSets.valuesSet(...firstMapKey);
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});

    mapOfSets.add(...firstMapKey, ...firstSetKey);
    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(1);
  });

  it(".delete(...firstMapKey, ...firstSetKey) undoes .add(...firstMapKey, ...firstSetKey)", () => {
    mapOfSets.add(...firstMapKey, ...firstSetKey);

    expect(mapOfSets.delete(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(0);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(false);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(false);

    let spy = jasmine.createSpy(), thisObj = {};
    mapOfSets.forEachSet(...firstMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(0);

    let iter = mapOfSets.valuesSet(...firstMapKey);
    expect(iter.next()).toEqual({value: undefined, done: true});
  });

  it(".deleteSets(...firstMapKey) undoes .add(...firstMapKey, ...firstSetKey)", () => {
    mapOfSets.add(...firstMapKey, ...firstSetKey);

    expect(mapOfSets.deleteSets(...firstMapKey)).toBe(true);
    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(0);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(false);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(false);

    let spy = jasmine.createSpy(), thisObj = {};
    mapOfSets.forEachSet(...firstMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(0);

    let iter = mapOfSets.valuesSet(...firstMapKey);
    expect(iter.next()).toEqual({value: undefined, done: true});
  });

  it(".add(...firstMapKey, ...secondSetKey) means two sets under one map", () => {
    mapOfSets.add(...firstMapKey, ...firstSetKey);
    mapOfSets.add(...firstMapKey, ...secondSetKey);

    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(2);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.has(...firstMapKey, ...secondSetKey)).toBe(true);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(true);

    let spy = jasmine.createSpy(), thisObj = {};

    mapOfSets.forEachSet(...firstMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.argsFor(1)).toEqual([...firstMapKey, ...secondSetKey, mapOfSets]);
    expect(spy.calls.thisFor(1)).toBe(thisObj);
    spy.calls.reset();

    let iter = mapOfSets.valuesSet(...firstMapKey);
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: [...firstMapKey, ...secondSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});
  });

  it(".addSets(...firstMapKey, []) is a no-op", () => {
    mapOfSets.addSets(...firstMapKey, []);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(false);
    expect(mapOfSets.deleteSets(...firstMapKey)).toBe(false);

    let spy = jasmine.createSpy(), thisObj = {};
    mapOfSets.forEachSet(...firstMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(0);
    spy.calls.reset();

    let iter = mapOfSets.valuesSet(...firstMapKey);
    expect(iter.next()).toEqual({value: undefined, done: true});
  });

  it(".addSets(...firstMapKey, [firstSetKey, secondSetKey]) means two sets under one map", () => {
    mapOfSets.addSets(...firstMapKey, [firstSetKey, secondSetKey]);

    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(2);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.has(...firstMapKey, ...secondSetKey)).toBe(true);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(true);

    let spy = jasmine.createSpy(), thisObj = {};

    mapOfSets.forEachSet(...firstMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.argsFor(1)).toEqual([...firstMapKey, ...secondSetKey, mapOfSets]);
    expect(spy.calls.thisFor(1)).toBe(thisObj);
    spy.calls.reset();

    let iter = mapOfSets.valuesSet(...firstMapKey);
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: [...firstMapKey, ...secondSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});
  });

  it(".add(...firstMapKey, ...secondSetKey) after delete() reorders iterator, forEach() results", () => {
    mapOfSets.add(...firstMapKey, ...secondSetKey);
    mapOfSets.add(...firstMapKey, ...firstSetKey);

    let spy = jasmine.createSpy(), thisObj = {};

    mapOfSets.delete(...firstMapKey, ...secondSetKey);
    mapOfSets.add(...firstMapKey, ...secondSetKey);

    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(2);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.has(...firstMapKey, ...secondSetKey)).toBe(true);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(true);

    mapOfSets.forEachSet(...firstMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.argsFor(1)).toEqual([...firstMapKey, ...secondSetKey, mapOfSets]);
    expect(spy.calls.thisFor(1)).toBe(thisObj);
    spy.calls.reset();

    let iter = mapOfSets.valuesSet(...firstMapKey);
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: [...firstMapKey, ...secondSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});
  });

  it(".add(...secondMapKey, ...firstSetKey) means one set under each of two maps", () => {
    mapOfSets.add(...firstMapKey, ...firstSetKey);
    mapOfSets.add(...secondMapKey, ...firstSetKey);

    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(1);
    expect(mapOfSets.getSizeOfSet(...secondMapKey)).toBe(1);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.has(...firstMapKey, ...secondSetKey)).toBe(false);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(true);

    expect(mapOfSets.has(...secondMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.hasSets(...secondMapKey)).toBe(true);

    let spy = jasmine.createSpy(), thisObj = {};
    mapOfSets.forEachSet(...firstMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    spy.calls.reset();

    mapOfSets.forEachSet(...secondMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.calls.argsFor(0)).toEqual([...secondMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    spy.calls.reset();

    let iter = mapOfSets.valuesSet(...firstMapKey);
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});

    iter = mapOfSets.valuesSet(...secondMapKey);
    expect(iter.next()).toEqual({value: [...secondMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});
  });

  it(".add(...secondMapKey, ...firstSetKey) after delete() reorders iterator, forEach() results", () => {
    mapOfSets.add(...secondMapKey, ...firstSetKey);
    mapOfSets.add(...firstMapKey, ...firstSetKey);

    let spy = jasmine.createSpy(), thisObj = {};

    mapOfSets.delete(...secondMapKey, ...firstSetKey);
    mapOfSets.add(...secondMapKey, ...firstSetKey);

    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(1);
    expect(mapOfSets.getSizeOfSet(...secondMapKey)).toBe(1);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.has(...secondMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(true);

    mapOfSets.forEachSet(...firstMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    spy.calls.reset();

    mapOfSets.forEachSet(...secondMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.calls.argsFor(0)).toEqual([...secondMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    spy.calls.reset();

    let iter = mapOfSets.valuesSet(...firstMapKey);
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    //expect(iter.next()).toEqual({value: [...secondMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});

    iter = mapOfSets.valuesSet(...secondMapKey);
    expect(iter.next()).toEqual({value: [...secondMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});
  });

  it(".add(...secondMapKey, ...secondSetKey) means one set under each of two maps", () => {
    mapOfSets.add(...firstMapKey, ...firstSetKey);
    mapOfSets.add(...secondMapKey, ...secondSetKey);

    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(1);
    expect(mapOfSets.getSizeOfSet(...secondMapKey)).toBe(1);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(true);

    expect(mapOfSets.has(...secondMapKey, ...secondSetKey)).toBe(true);
    expect(mapOfSets.hasSets(...secondMapKey)).toBe(true);

    let spy = jasmine.createSpy(), thisObj = {};

    mapOfSets.forEachSet(...firstMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    spy.calls.reset();

    mapOfSets.forEachSet(...secondMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.calls.argsFor(0)).toEqual([...secondMapKey, ...secondSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    spy.calls.reset();

    let iter = mapOfSets.valuesSet(...firstMapKey);
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});

    iter = mapOfSets.valuesSet(...secondMapKey);
    expect(iter.next()).toEqual({value: [...secondMapKey, ...secondSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});
  });

  it(".add(...secondMapKey, ...secondSetKey) after delete() reorders iterator, forEach() results", () => {
    mapOfSets.add(...secondMapKey, ...secondSetKey);
    mapOfSets.add(...firstMapKey, ...firstSetKey);

    mapOfSets.delete(...secondMapKey, ...secondSetKey);
    mapOfSets.add(...secondMapKey, ...secondSetKey);

    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(1);
    expect(mapOfSets.getSizeOfSet(...secondMapKey)).toBe(1);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(true);

    expect(mapOfSets.has(...secondMapKey, ...secondSetKey)).toBe(true);
    expect(mapOfSets.hasSets(...secondMapKey)).toBe(true);

    let spy = jasmine.createSpy(), thisObj = {};
    mapOfSets.forEachSet(...firstMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    spy.calls.reset();

    mapOfSets.forEachSet(...secondMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.calls.argsFor(0)).toEqual([...secondMapKey, ...secondSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    spy.calls.reset();

    let iter = mapOfSets.valuesSet(...firstMapKey);
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});

    iter = mapOfSets.valuesSet(...secondMapKey);
    expect(iter.next()).toEqual({value: [...secondMapKey, ...secondSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});
  });

  it(".add() throws for a non-MockImportable map key", () => {
    expect(
      () => mapOfSets.add(mapMod([{}]), ...firstSetKey)
    ).toThrowError("The ordered key set is not valid!");
  });

  it(".add() throws for a non-MockImportable set key", () => {
    expect(
      () => mapOfSets.add(...firstMapKey, setMod([{}]))
    ).toThrowError("The ordered key set is not valid!");
  });

  it(".forEachSet() immediately propagates an exception from its callback", () => {
    const thirdSetKey = [new MockImportable, new MockImportable];

    mapOfSets.addSets(...firstMapKey, [
      firstSetKey,
      secondSetKey,
      thirdSetKey
    ]);

    const exn = {type: "exception"};
    const spy0 = jasmine.createSpy();
    const spy1 = jasmine.createSpy();
    let count = 0;
    spy1.and.callFake(() => {
      count++;
      if (count === 2)
        throw exn;
    });

    expect(() => {
      mapOfSets.forEachSet(...firstMapKey, (...args) => {
        spy0(...args);
        spy1(...args);
      })
    }).toThrow(exn);

    expect(spy0).toHaveBeenCalledTimes(2);
    expect(spy0).toHaveBeenCalledWith(...firstMapKey, ...firstSetKey, mapOfSets);
    expect(spy0).toHaveBeenCalledWith(...firstMapKey, ...secondSetKey, mapOfSets);

    expect(spy1).toHaveBeenCalledTimes(2);
    expect(spy1).toHaveBeenCalledWith(...firstMapKey, ...firstSetKey, mapOfSets);
    expect(spy1).toHaveBeenCalledWith(...firstMapKey, ...secondSetKey, mapOfSets);
  });

  describe("to hold references", () => {
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    it("weakly as the map key", async () => {
      await expectAsync(
        key => {
          const mapKey = setMod([new MockImportable(key)]);
          mapOfSets.add(...mapKey, ...firstSetKey);
        }
      ).toHoldReferencesWeakly();
    });

    it("strongly as the set key", async () => {
      await expectAsync(
        key => {
          const setKey = setMod([new MockImportable(key)]);
          mapOfSets.add(...firstMapKey, ...setKey);
        }
      ).toHoldReferencesStrongly();
    });
  });
});
