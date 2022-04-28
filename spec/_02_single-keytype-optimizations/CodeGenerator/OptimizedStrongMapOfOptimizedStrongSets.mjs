import MockImportable from "#spec/_01_collection-generator/fixtures/MockImportable.mjs";
import { describeForAllThree } from "../support/SpecModuleLoader.mjs";
import ToHoldRefsMatchers from "#support/toHoldReferences.mjs";

describeForAllThree("OptimizedStrongMapOfOptimizedStrongSets", (modules, mapMod, setMod) => {
  const {
    OptimizedStrongMapOfOptimizedStrongSets,
  } = modules;

  let mapOfSets, firstMapKey, firstSetKey, secondMapKey, secondSetKey;
  beforeEach(() => {
    mapOfSets = new OptimizedStrongMapOfOptimizedStrongSets;
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
    expect(mapOfSets.size).toBe(0);
    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(0);
    expect(mapOfSets.mapSize).toBe(0);

    expect(mapOfSets.delete(...firstMapKey, ...firstSetKey)).toBe(false);
    expect(mapOfSets.deleteSets(...firstMapKey)).toBe(false);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(false);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(false);

    let spy = jasmine.createSpy(), thisObj = {};
    mapOfSets.forEach(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(0);

    mapOfSets.forEachSet(...firstMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(0);

    let iter = mapOfSets.values();
    expect(iter.next()).toEqual({value: undefined, done: true});

    iter = mapOfSets.valuesSet(...firstMapKey);
    expect(iter.next()).toEqual({value: undefined, done: true});
  });

  it(".add(...firstMapKey, ...firstSetKey) adds a single member", () => {
    mapOfSets.add(...firstMapKey, ...firstSetKey);

    expect(mapOfSets.size).toBe(1);
    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(1);
    expect(mapOfSets.mapSize).toBe(1);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(true);

    let spy = jasmine.createSpy(), thisObj = {};
    mapOfSets.forEach(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    spy.calls.reset();

    mapOfSets.forEachSet(...firstMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    spy.calls.reset();

    let iter = mapOfSets.values();
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});

    iter = mapOfSets.valuesSet(...firstMapKey);
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});

    mapOfSets.add(...firstMapKey, ...firstSetKey);
    expect(mapOfSets.size).toBe(1);
    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(1);
    expect(mapOfSets.mapSize).toBe(1);
  });

  it(".delete(...firstMapKey, ...firstSetKey) undoes .add(...firstMapKey, ...firstSetKey)", () => {
    mapOfSets.add(...firstMapKey, ...firstSetKey);

    expect(mapOfSets.delete(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.size).toBe(0);
    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(0);
    expect(mapOfSets.mapSize).toBe(0);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(false);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(false);

    let spy = jasmine.createSpy(), thisObj = {};
    mapOfSets.forEach(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(0);

    mapOfSets.forEachSet(...firstMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(0);

    let iter = mapOfSets.values();
    expect(iter.next()).toEqual({value: undefined, done: true});

    iter = mapOfSets.valuesSet(...firstMapKey);
    expect(iter.next()).toEqual({value: undefined, done: true});
  });

  it(".deleteSets(...firstMapKey) undoes .add(...firstMapKey, ...firstSetKey)", () => {
    mapOfSets.add(...firstMapKey, ...firstSetKey);

    expect(mapOfSets.deleteSets(...firstMapKey)).toBe(true);
    expect(mapOfSets.size).toBe(0);
    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(0);
    expect(mapOfSets.mapSize).toBe(0);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(false);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(false);

    let spy = jasmine.createSpy(), thisObj = {};
    mapOfSets.forEach(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(0);

    mapOfSets.forEachSet(...firstMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(0);

    let iter = mapOfSets.values();
    expect(iter.next()).toEqual({value: undefined, done: true});

    iter = mapOfSets.valuesSet(...firstMapKey);
    expect(iter.next()).toEqual({value: undefined, done: true});
  });

  it(".add(...firstMapKey, ...secondSetKey) means two sets under one map", () => {
    mapOfSets.add(...firstMapKey, ...firstSetKey);
    mapOfSets.add(...firstMapKey, ...secondSetKey);

    expect(mapOfSets.size).toBe(2);
    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(2);
    expect(mapOfSets.mapSize).toBe(1);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.has(...firstMapKey, ...secondSetKey)).toBe(true);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(true);

    let spy = jasmine.createSpy(), thisObj = {};
    mapOfSets.forEach(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.argsFor(1)).toEqual([...firstMapKey, ...secondSetKey, mapOfSets]);
    expect(spy.calls.thisFor(1)).toBe(thisObj);
    spy.calls.reset();

    mapOfSets.forEachSet(...firstMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.argsFor(1)).toEqual([...firstMapKey, ...secondSetKey, mapOfSets]);
    expect(spy.calls.thisFor(1)).toBe(thisObj);
    spy.calls.reset();

    let iter = mapOfSets.values();
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: [...firstMapKey, ...secondSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});

    iter = mapOfSets.valuesSet(...firstMapKey);
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: [...firstMapKey, ...secondSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});
  });

  it(".addSets(...firstMapKey, [firstSetKey, secondSetKey]) means two sets under one map", () => {
    mapOfSets.addSets(...firstMapKey, [firstSetKey, secondSetKey]);

    expect(mapOfSets.size).toBe(2);
    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(2);
    expect(mapOfSets.mapSize).toBe(1);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.has(...firstMapKey, ...secondSetKey)).toBe(true);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(true);

    let spy = jasmine.createSpy(), thisObj = {};
    mapOfSets.forEach(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.argsFor(1)).toEqual([...firstMapKey, ...secondSetKey, mapOfSets]);
    expect(spy.calls.thisFor(1)).toBe(thisObj);
    spy.calls.reset();

    mapOfSets.forEachSet(...firstMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.argsFor(1)).toEqual([...firstMapKey, ...secondSetKey, mapOfSets]);
    expect(spy.calls.thisFor(1)).toBe(thisObj);
    spy.calls.reset();

    let iter = mapOfSets.values();
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: [...firstMapKey, ...secondSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});

    iter = mapOfSets.valuesSet(...firstMapKey);
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: [...firstMapKey, ...secondSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});
  });

  it(".add(...firstMapKey, ...secondSetKey) after delete() reorders iterator, forEach() results", () => {
    mapOfSets.add(...firstMapKey, ...secondSetKey);
    mapOfSets.add(...firstMapKey, ...firstSetKey);

    let spy = jasmine.createSpy(), thisObj = {};
    mapOfSets.forEach(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...secondSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.argsFor(1)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(1)).toBe(thisObj);

    spy.calls.reset();

    mapOfSets.delete(...firstMapKey, ...secondSetKey);
    mapOfSets.add(...firstMapKey, ...secondSetKey);

    expect(mapOfSets.size).toBe(2);
    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(2);
    expect(mapOfSets.mapSize).toBe(1);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.has(...firstMapKey, ...secondSetKey)).toBe(true);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(true);

    spy = jasmine.createSpy(), thisObj = {};
    mapOfSets.forEach(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.argsFor(1)).toEqual([...firstMapKey, ...secondSetKey, mapOfSets]);
    expect(spy.calls.thisFor(1)).toBe(thisObj);
    spy.calls.reset();

    mapOfSets.forEachSet(...firstMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.argsFor(1)).toEqual([...firstMapKey, ...secondSetKey, mapOfSets]);
    expect(spy.calls.thisFor(1)).toBe(thisObj);
    spy.calls.reset();

    let iter = mapOfSets.values();
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: [...firstMapKey, ...secondSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});

    iter = mapOfSets.valuesSet(...firstMapKey);
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: [...firstMapKey, ...secondSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});
  });

  it(".add(...secondMapKey, ...firstSetKey) means one set under each of two maps", () => {
    mapOfSets.add(...firstMapKey, ...firstSetKey);
    mapOfSets.add(...secondMapKey, ...firstSetKey);

    expect(mapOfSets.size).toBe(2);
    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(1);
    expect(mapOfSets.getSizeOfSet(...secondMapKey)).toBe(1);
    expect(mapOfSets.mapSize).toBe(2);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.has(...firstMapKey, ...secondSetKey)).toBe(false);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(true);

    expect(mapOfSets.has(...secondMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.hasSets(...secondMapKey)).toBe(true);

    let spy = jasmine.createSpy(), thisObj = {};
    mapOfSets.forEach(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.argsFor(1)).toEqual([...secondMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(1)).toBe(thisObj);
    spy.calls.reset();

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

    let iter = mapOfSets.values();
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: [...secondMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});

    iter = mapOfSets.valuesSet(...firstMapKey);
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
    mapOfSets.forEach(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([...secondMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.argsFor(1)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(1)).toBe(thisObj);

    spy.calls.reset();

    mapOfSets.delete(...secondMapKey, ...firstSetKey);
    mapOfSets.add(...secondMapKey, ...firstSetKey);

    expect(mapOfSets.size).toBe(2);
    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(1);
    expect(mapOfSets.getSizeOfSet(...secondMapKey)).toBe(1);
    expect(mapOfSets.mapSize).toBe(2);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.has(...secondMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(true);

    spy = jasmine.createSpy(), thisObj = {};
    mapOfSets.forEach(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.argsFor(1)).toEqual([...secondMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(1)).toBe(thisObj);
    spy.calls.reset();

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

    let iter = mapOfSets.values();
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: [...secondMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});

    iter = mapOfSets.valuesSet(...firstMapKey);
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

    expect(mapOfSets.size).toBe(2);
    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(1);
    expect(mapOfSets.getSizeOfSet(...secondMapKey)).toBe(1);
    expect(mapOfSets.mapSize).toBe(2);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(true);

    expect(mapOfSets.has(...secondMapKey, ...secondSetKey)).toBe(true);
    expect(mapOfSets.hasSets(...secondMapKey)).toBe(true);

    let spy = jasmine.createSpy(), thisObj = {};
    mapOfSets.forEach(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.argsFor(1)).toEqual([...secondMapKey, ...secondSetKey, mapOfSets]);
    expect(spy.calls.thisFor(1)).toBe(thisObj);
    spy.calls.reset();

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

    let iter = mapOfSets.values();
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: [...secondMapKey, ...secondSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});

    iter = mapOfSets.valuesSet(...firstMapKey);
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});

    iter = mapOfSets.valuesSet(...secondMapKey);
    expect(iter.next()).toEqual({value: [...secondMapKey, ...secondSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});
  });

  it(".add(...secondMapKey, ...secondSetKey) after delete() reorders iterator, forEach() results", () => {
    mapOfSets.add(...secondMapKey, ...secondSetKey);
    mapOfSets.add(...firstMapKey, ...firstSetKey);

    let spy = jasmine.createSpy(), thisObj = {};
    mapOfSets.forEach(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([...secondMapKey, ...secondSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.argsFor(1)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(1)).toBe(thisObj);

    spy.calls.reset();

    mapOfSets.delete(...secondMapKey, ...secondSetKey);
    mapOfSets.add(...secondMapKey, ...secondSetKey);

    expect(mapOfSets.size).toBe(2);
    expect(mapOfSets.getSizeOfSet(...firstMapKey)).toBe(1);
    expect(mapOfSets.getSizeOfSet(...secondMapKey)).toBe(1);
    expect(mapOfSets.mapSize).toBe(2);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(true);

    expect(mapOfSets.has(...secondMapKey, ...secondSetKey)).toBe(true);
    expect(mapOfSets.hasSets(...secondMapKey)).toBe(true);

    mapOfSets.forEach(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, ...firstSetKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.argsFor(1)).toEqual([...secondMapKey, ...secondSetKey, mapOfSets]);
    expect(spy.calls.thisFor(1)).toBe(thisObj);
    spy.calls.reset();

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

    let iter = mapOfSets.values();
    expect(iter.next()).toEqual({value: [...firstMapKey, ...firstSetKey], done: false});
    expect(iter.next()).toEqual({value: [...secondMapKey, ...secondSetKey], done: false});
    expect(iter.next()).toEqual({value: undefined, done: true});

    iter = mapOfSets.valuesSet(...firstMapKey);
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

  describe("to hold references strongly", () => {
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    it("as the map key", async () => {
      await expectAsync(
        key => {
          const mapKey = setMod([new MockImportable(key)]);
          mapOfSets.add(...mapKey, ...firstSetKey);
        }
      ).toHoldReferencesStrongly();
    });

    it("as the set key", async () => {
      await expectAsync(
        key => {
          const setKey = setMod([new MockImportable(key)]);
          mapOfSets.add(...firstMapKey, ...setKey);
        }
      ).toHoldReferencesStrongly();
    });
  });
});
