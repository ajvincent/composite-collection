import ToHoldRefsMatchers from "#support/toHoldReferences.mjs";
import OneToOneMap from "../generated/WeakInlineMockImportable.mjs";

import MockImportable from "#spec/_01_collection-generator/fixtures/MockImportable.mjs";

describe("CodeGenerator(OneToOneWeakInlineMockImportable.mjs)", () => {
  let map;
  beforeEach(() => map = new OneToOneMap);
  afterEach(() => map = null);

  const redObj = new MockImportable("red"),
        blueObj = new MockImportable("blue"),
        greenObj = new MockImportable("green"),
        yellowObj = new MockImportable("yellow");

  const redKey = new MockImportable("redKey"),
        blueKey = new MockImportable("blueKey"),
        greenKey = new MockImportable("greenKey"),
        yellowKey = new MockImportable("yellowKey");

  it("class is frozen", () => {
    expect(Object.isFrozen(OneToOneMap)).toBe(true);
    expect(Object.isFrozen(OneToOneMap.prototype)).toBe(true);
  });

  it("prototype has .bindOneToOne(), .isValidValue(), .set() methods", () => {
    expect(Reflect.ownKeys(OneToOneMap.prototype)).toEqual([
      "constructor",
      "bindOneToOne",
      "delete",
      "get",
      "has",
      "hasIdentity",
      "isValidKey",
      "isValidValue"
    ]);
  });

  it(".get() points from a source object to a target object after binding", () => {
    expect(map.get(redObj, redKey)).toBe(undefined);
    expect(map.get(blueObj, blueKey)).toBe(undefined);

    map.bindOneToOne(redKey, redObj, blueKey, blueObj);

    expect(map.get(redObj, blueKey)).toBe(blueObj);
    expect(map.get(blueObj, redKey)).toBe(redObj);
  });

  it(".bindOneToOne() accepts the same arguments twice", () => {
    map.bindOneToOne(redKey, redObj, blueKey, blueObj);
    expect(
      () => map.bindOneToOne(redKey, redObj, blueKey, blueObj)
    ).not.toThrow();

    expect(
      () => map.bindOneToOne(blueKey, blueObj, redKey, redObj)
    ).not.toThrow();
  });

  it(".bindOneToOne() accepts different pairings as long as there's no overlap", () => {
    map.bindOneToOne(redKey, redObj, blueKey, blueObj);
    expect(
      () => map.bindOneToOne(greenKey, greenObj, yellowKey, yellowObj)
    ).not.toThrow();

    expect(
      () => map.bindOneToOne(greenKey, greenObj, yellowKey, yellowObj)
    ).not.toThrow();

    expect(
      () => map.bindOneToOne(yellowKey, yellowObj, greenKey, greenObj)
    ).not.toThrow();

    expect(
      () => map.bindOneToOne(greenKey, greenObj, redKey, redObj)
    ).toThrowError("value_1 and value_2 are already in different one-to-one mappings!");
  });

  it(".bindOneToOne() accepts joining pairings as long as there's no overlap", () => {
    map.bindOneToOne(redKey, redObj, blueKey, blueObj);
    expect(
      () => map.bindOneToOne(greenKey, greenObj, redKey, redObj)
    ).not.toThrow("value_2 mismatch!");

    expect(map.get(redObj, blueKey)).toBe(blueObj);
    expect(map.get(blueObj, redKey)).toBe(redObj);
    expect(map.get(greenObj, blueKey)).toBe(blueObj);
  });

  it(".hasIdentity() returns true for a known identity", () => {
    map.bindOneToOne(redKey, redObj, blueKey, blueObj);
    expect(map.hasIdentity(redObj, redKey, false)).toBe(true);
    expect(map.hasIdentity(redObj, redKey, true)).toBe(true);

    expect(map.hasIdentity(redObj, blueKey, false)).toBe(false);
    expect(map.hasIdentity(redObj, blueKey, true)).toBe(false);
  });

  it(".hasIdentity returns the boolean value of allowNotDefined for an unknown identity", () => {
    expect(map.hasIdentity(redObj, redKey, false)).toBe(false);
    expect(map.hasIdentity(redObj, redKey, true)).toBe(true);

    expect(map.hasIdentity(redObj, blueKey, false)).toBe(false);
    expect(map.hasIdentity(redObj, blueKey, true)).toBe(true);
  });

  it(".isValidValue() returns true for objects", () => {
    expect(map.isValidValue(redObj, redKey)).toBe(true);
    expect(map.isValidValue(null)).toBe(false);
    expect(map.isValidValue("hello world")).toBe(false);
  });

  it(".bindOneToOne() throws for primitive values", () => {
    expect(
      () => map.bindOneToOne(redKey, redObj, blueKey, "hello world")
    ).toThrowError("value_2 is not a valid value!");
    expect(map.has(redObj, redKey)).toBe(false);

    expect(
      () => map.bindOneToOne(redKey, redObj, blueKey, null)
    ).toThrowError("value_2 is not a valid value!");
    expect(map.has(redObj, redKey)).toBe(false);

    expect(
      () => map.bindOneToOne(blueKey, "hello world", redKey, redObj)
    ).toThrowError("value_1 is not a valid value!");
    expect(map.has(redObj, redKey)).toBe(false);

    expect(
      () => map.bindOneToOne(blueKey, null, redKey, redObj)
    ).toThrowError("value_1 is not a valid value!");
    expect(map.has(redObj, redKey)).toBe(false);
  });

  describe("to hold values", () => {
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    it("weakly as the first argument to .bindOneToOne()", async () => {
      await expectAsync(key => map.bindOneToOne(
        new MockImportable(key),
        new MockImportable({}),
        new MockImportable({}),
        new MockImportable({}),
      )).toHoldReferencesWeakly();
    });

    it("weakly as the second argument to .bindOneToOne()", async () => {
      await expectAsync(key => map.bindOneToOne(
        new MockImportable({}),
        new MockImportable(key),
        new MockImportable({}),
        new MockImportable({}),
      )).toHoldReferencesWeakly();
    });

    it("weakly as the third argument to .bindOneToOne()", async () => {
      await expectAsync(key => map.bindOneToOne(
        new MockImportable({}),
        new MockImportable({}),
        new MockImportable(key),
        new MockImportable({}),
      )).toHoldReferencesWeakly();
    });

    it("weakly as the fourth argument to .bindOneToOne()", async () => {
      await expectAsync(key => map.bindOneToOne(
        new MockImportable({}),
        new MockImportable({}),
        new MockImportable({}),
        new MockImportable(key),
      )).toHoldReferencesWeakly();
    });

    it("weakly as the argument in .isValidValue()", async () => {
      await expectAsync(key => map.isValidValue(key)).toHoldReferencesWeakly();
    });
  });
});
