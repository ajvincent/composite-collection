import MockImportable from "#spec/_01_collection-generator/fixtures/MockImportable.mjs";
import { describeForAllThree } from "../support/CodeGenerator.mjs";
import ToHoldRefsMatchers from "#support/toHoldReferences.mjs";

describeForAllThree("OptimizedWeakMapOfOptimizedWeakSets", (modules, mapMod, setMod) => {
  const {
    OptimizedWeakMapOfOptimizedWeakSets,
  } = modules;

  let mapOfSets, firstMapKey, firstSetKey, secondMapKey, secondSetKey;
  beforeEach(() => {
    mapOfSets = new OptimizedWeakMapOfOptimizedWeakSets;
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
    expect(mapOfSets.delete(...firstMapKey, ...firstSetKey)).toBe(false);
    expect(mapOfSets.deleteSets(...firstMapKey)).toBe(false);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(false);
  });

  it(".add(...firstMapKey, ...firstSetKey) adds a single member", () => {
    mapOfSets.add(...firstMapKey, ...firstSetKey);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);

    mapOfSets.add(...firstMapKey, ...firstSetKey);
  });

  it(".delete(...firstMapKey, ...firstSetKey) undoes .add(...firstMapKey, ...firstSetKey)", () => {
    mapOfSets.add(...firstMapKey, ...firstSetKey);

    expect(mapOfSets.delete(...firstMapKey, ...firstSetKey)).toBe(true);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(false);
  });

  it(".deleteSets(...firstMapKey) undoes .add(...firstMapKey, ...firstSetKey)", () => {
    mapOfSets.add(...firstMapKey, ...firstSetKey);

    expect(mapOfSets.deleteSets(...firstMapKey)).toBe(true);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(false);
  });

  it(".add(...firstMapKey, ...secondSetKey) means two sets under one map", () => {
    mapOfSets.add(...firstMapKey, ...firstSetKey);
    mapOfSets.add(...firstMapKey, ...secondSetKey);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.has(...firstMapKey, ...secondSetKey)).toBe(true);
  });

  it(".addSets(...firstMapKey, [firstSetKey, secondSetKey]) means two sets under one map", () => {
    mapOfSets.addSets(...firstMapKey, [firstSetKey, secondSetKey]);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.has(...firstMapKey, ...secondSetKey)).toBe(true);
  });

  it(".add(...firstMapKey, ...secondSetKey) after delete() reorders iterator, forEach() results", () => {
    mapOfSets.add(...firstMapKey, ...secondSetKey);
    mapOfSets.add(...firstMapKey, ...firstSetKey);

    mapOfSets.delete(...firstMapKey, ...secondSetKey);
    mapOfSets.add(...firstMapKey, ...secondSetKey);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.has(...firstMapKey, ...secondSetKey)).toBe(true);
  });

  it(".add(...secondMapKey, ...firstSetKey) means one set under each of two maps", () => {
    mapOfSets.add(...firstMapKey, ...firstSetKey);
    mapOfSets.add(...secondMapKey, ...firstSetKey);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.has(...firstMapKey, ...secondSetKey)).toBe(false);

    expect(mapOfSets.has(...secondMapKey, ...firstSetKey)).toBe(true);
  });

  it(".add(...secondMapKey, ...firstSetKey) after delete() reorders iterator, forEach() results", () => {
    mapOfSets.add(...secondMapKey, ...firstSetKey);
    mapOfSets.add(...firstMapKey, ...firstSetKey);

    mapOfSets.delete(...secondMapKey, ...firstSetKey);
    mapOfSets.add(...secondMapKey, ...firstSetKey);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.has(...secondMapKey, ...firstSetKey)).toBe(true);
  });

  it(".add(...secondMapKey, ...secondSetKey) means one set under each of two maps", () => {
    mapOfSets.add(...firstMapKey, ...firstSetKey);
    mapOfSets.add(...secondMapKey, ...secondSetKey);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);

    expect(mapOfSets.has(...secondMapKey, ...secondSetKey)).toBe(true);
  });

  it(".add(...secondMapKey, ...secondSetKey) after delete() reorders iterator, forEach() results", () => {
    mapOfSets.add(...secondMapKey, ...secondSetKey);
    mapOfSets.add(...firstMapKey, ...firstSetKey);

    mapOfSets.delete(...secondMapKey, ...secondSetKey);
    mapOfSets.add(...secondMapKey, ...secondSetKey);

    expect(mapOfSets.has(...firstMapKey, ...firstSetKey)).toBe(true);
    expect(mapOfSets.has(...secondMapKey, ...secondSetKey)).toBe(true);
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

    it("weakly as the set key", async () => {
      await expectAsync(
        key => {
          const setKey = setMod([new MockImportable(key)]);
          mapOfSets.add(...firstMapKey, ...setKey);
        }
      ).toHoldReferencesWeakly();
    });
  });
});
