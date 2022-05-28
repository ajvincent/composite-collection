import MockImportable from "#spec/_01_collection-generator/fixtures/MockImportable.mjs";
import { describeForAllThree } from "../support/SpecModuleLoader.mjs";
import ToHoldRefsMatchers from "#support/toHoldReferences.mjs";

describeForAllThree("StrongMapOfOptimizedStrongSets", (modules, mapMod, setMod) => {
  const {
    StrongMapOfOptimizedStrongSets,
  } = modules;

  let mapOfSets, firstMapKey, firstSetKey, secondMapKey, secondSetKey;
  beforeEach(() => {
    mapOfSets = new StrongMapOfOptimizedStrongSets;
    firstMapKey = [new MockImportable, new MockImportable];
    firstSetKey = setMod([new MockImportable]);
    secondMapKey = [new MockImportable, new MockImportable];
    secondSetKey = setMod([new MockImportable]);
  });
  afterEach(() => {
    mapOfSets = null;
    firstMapKey = null;
    firstSetKey = null;
  });

  it("class is frozen", () => {
    expect(Object.isFrozen(StrongMapOfOptimizedStrongSets)).toBe(true);
    expect(Object.isFrozen(StrongMapOfOptimizedStrongSets.prototype)).toBe(true);
  });

  it("class only exposes public methods", () => {
    expect(Reflect.ownKeys(StrongMapOfOptimizedStrongSets.prototype)).toEqual([
      "constructor",
      "size",
      "getSizeOfSet",
      "mapSize",
      "add",
      "addSets",
      "clear",
      "delete",
      "deleteSets",
      "forEach",
      "forEachMap",
      "forEachSet",
      "has",
      "hasSets",
      "isValidKey",
      "values",
      "valuesSet",
      Symbol.iterator,
    ]);
  });

  it("instances have only symbol public properties", () => {
    expect(Reflect.ownKeys(mapOfSets)).toEqual([
      Symbol.toStringTag,
    ]);
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

    mapOfSets.forEachMap(spy, thisObj);
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

    mapOfSets.forEachMap(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, mapOfSets]);
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

    mapOfSets.forEachMap(spy, thisObj);
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

    mapOfSets.forEachMap(spy, thisObj);
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

    mapOfSets.forEachMap(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
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

  it(".addSets(...firstMapKey, []) is a no-op", () => {
    mapOfSets.addSets(...firstMapKey, []);
    expect(mapOfSets.size).toBe(0);
    expect(mapOfSets.mapSize).toBe(0);
    expect(mapOfSets.hasSets(...firstMapKey)).toBe(false);
    expect(mapOfSets.deleteSets(...firstMapKey)).toBe(false);

    let spy = jasmine.createSpy(), thisObj = {};
    mapOfSets.forEach(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(0);
    spy.calls.reset();

    mapOfSets.forEachMap(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(0);
    spy.calls.reset();

    mapOfSets.forEachSet(...firstMapKey, spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(0);
    spy.calls.reset();

    let iter = mapOfSets.values();
    expect(iter.next()).toEqual({value: undefined, done: true});

    iter = mapOfSets.valuesSet(...firstMapKey);
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

    mapOfSets.forEachMap(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
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

    mapOfSets.forEachMap(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
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

    mapOfSets.forEachMap(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.argsFor(1)).toEqual([...secondMapKey, mapOfSets]);
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

    mapOfSets.forEachMap(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.argsFor(1)).toEqual([...secondMapKey, mapOfSets]);
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

    mapOfSets.forEachMap(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.argsFor(1)).toEqual([...secondMapKey, mapOfSets]);
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

    mapOfSets.forEachMap(spy, thisObj);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([...firstMapKey, mapOfSets]);
    expect(spy.calls.thisFor(0)).toBe(thisObj);
    expect(spy.calls.argsFor(1)).toEqual([...secondMapKey, mapOfSets]);
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

  it(".forEach() immediately propagates an exception from its callback", () => {
    const thirdMapKey = [new MockImportable, new MockImportable];
    const thirdSetKey = setMod([new MockImportable]);

    mapOfSets.add(...firstMapKey, ...firstSetKey);
    mapOfSets.add(...secondMapKey, ...secondSetKey);
    mapOfSets.add(...thirdMapKey, ...thirdSetKey);

    const exn = {type: "exception"};
    const spy0 = jasmine.createSpy();
    const spy1 = jasmine.createSpy();
    let count = 0;
    spy1.and.callFake(() => {
      count++;
      if (count === 2)
        throw exn;
    });

    expect(
      () => mapOfSets.forEach((...args) => {
        spy0(...args);
        spy1(...args);
      })
    ).toThrow(exn);

    expect(spy0).toHaveBeenCalledTimes(2);
    expect(spy0).toHaveBeenCalledWith(...firstMapKey, ...firstSetKey, mapOfSets);
    expect(spy0).toHaveBeenCalledWith(...secondMapKey, ...secondSetKey, mapOfSets);

    expect(spy1).toHaveBeenCalledTimes(2);
    expect(spy1).toHaveBeenCalledWith(...firstMapKey, ...firstSetKey, mapOfSets);
    expect(spy1).toHaveBeenCalledWith(...secondMapKey, ...secondSetKey, mapOfSets);
  });

  it(".forEachMap() immediately propagates an exception from its callback", () => {
    const thirdMapKey = [new MockImportable, new MockImportable];
    const thirdSetKey = setMod([new MockImportable]);

    mapOfSets.add(...firstMapKey, ...firstSetKey);
    mapOfSets.add(...secondMapKey, ...secondSetKey);
    mapOfSets.add(...thirdMapKey, ...thirdSetKey);

    const exn = {type: "exception"};
    const spy0 = jasmine.createSpy();
    const spy1 = jasmine.createSpy();
    let count = 0;
    spy1.and.callFake(() => {
      count++;
      if (count === 2)
        throw exn;
    });

    expect(
      () => mapOfSets.forEachMap((...args) => {
        spy0(...args);
        spy1(...args);
      })
    ).toThrow(exn);

    expect(spy0).toHaveBeenCalledTimes(2);
    expect(spy0).toHaveBeenCalledWith(...firstMapKey, mapOfSets);
    expect(spy0).toHaveBeenCalledWith(...secondMapKey, mapOfSets);

    expect(spy1).toHaveBeenCalledTimes(2);
    expect(spy1).toHaveBeenCalledWith(...firstMapKey, mapOfSets);
    expect(spy1).toHaveBeenCalledWith(...secondMapKey, mapOfSets);
  });

  it(".forEachSet() immediately propagates an exception from its callback", () => {
    const thirdSetKey = setMod([new MockImportable]);

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

  describe("to hold references strongly", () => {
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    it("as the map key", async () => {
      await expectAsync(
        key => {
          const mapKey = [new MockImportable(key), new MockImportable];
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
