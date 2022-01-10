import ToHoldRefsMatchers from "#support/toHoldReferences.mjs";
import hasClassInSource from "#support/hasClassInSource.mjs";

import OneToOneMap from "../generated/BasicStrongImported.mjs";

describe("CodeGenerator(OneToOneBasicStrongInline.mjs)", () => {
  let map;
  beforeEach(() => map = new OneToOneMap);
  afterEach(() => map = null);

  const redObj = {}, blueObj = {}, greenObj = {}, yellowObj = {};

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
      "isValidKey",
      "isValidValue"
    ]);
  });

  it(".get() points from a source object to a target object after binding", () => {
    expect(map.get(redObj, "red")).toBe(undefined);
    expect(map.get(blueObj, "blue")).toBe(undefined);

    map.bindOneToOne("red", redObj, "blue", blueObj);

    expect(map.get(redObj, "blue")).toBe(blueObj);
    expect(map.get(blueObj, "red")).toBe(redObj);
  });

  it(".bindOneToOne() accepts the same arguments twice", () => {
    map.bindOneToOne("red", redObj, "blue", blueObj);
    expect(
      () => map.bindOneToOne("red", redObj, "blue", blueObj)
    ).not.toThrow();

    expect(
      () => map.bindOneToOne("blue", blueObj, "red", redObj)
    ).not.toThrow();
  });

  it(".bindOneToOne() accepts different pairings as long as there's no overlap", () => {
    map.bindOneToOne("red", redObj, "blue", blueObj);
    expect(
      () => map.bindOneToOne("green", greenObj, "yellow", yellowObj)
    ).not.toThrow();

    expect(
      () => map.bindOneToOne("green", greenObj, "yellow", yellowObj)
    ).not.toThrow();

    expect(
      () => map.bindOneToOne("yellow", yellowObj, "green", greenObj)
    ).not.toThrow();

    expect(
      () => map.bindOneToOne("green", greenObj, "red", redObj)
    ).toThrowError("value_1 and value_2 are already in different one-to-one mappings!");
  });

  it(".bindOneToOne() accepts joining pairings as long as there's no overlap", () => {
    map.bindOneToOne("red", redObj, "blue", blueObj);
    expect(
      () => map.bindOneToOne("green", greenObj, "red", redObj)
    ).not.toThrow("value_2 mismatch!");

    expect(map.get(redObj, "blue")).toBe(blueObj);
    expect(map.get(blueObj, "red")).toBe(redObj);
    expect(map.get(greenObj, "blue")).toBe(blueObj);
  });

  it(".isValidValue() returns true for objects", () => {
    expect(map.isValidValue(redObj, "red")).toBe(true);
    expect(map.isValidValue(null)).toBe(false);
    expect(map.isValidValue("hello world")).toBe(false);
  });

  it(".bindOneToOne() throws for primitive values", () => {
    expect(
      () => map.bindOneToOne("red", redObj, "blue", "hello world")
    ).toThrowError("value_2 is not a valid value!");
    expect(map.has(redObj, "red")).toBe(false);

    expect(
      () => map.bindOneToOne("red", redObj, "blue", null)
    ).toThrowError("value_2 is not a valid value!");
    expect(map.has(redObj, "red")).toBe(false);

    expect(
      () => map.bindOneToOne("blue", "hello world", "red", redObj)
    ).toThrowError("value_1 is not a valid value!");
    expect(map.has(redObj, "red")).toBe(false);

    expect(
      () => map.bindOneToOne("blue", null, "red", redObj)
    ).toThrowError("value_1 is not a valid value!");
    expect(map.has(redObj, "red")).toBe(false);
  });

  describe("to hold values", () => {
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    it("strongly as the first argument to .bindOneToOne()", async () => {
      await expectAsync(key => map.bindOneToOne(key, {}, {}, {})).toHoldReferencesStrongly();
    });

    it("strongly as the second argument to .bindOneToOne()", async () => {
      await expectAsync(key => map.bindOneToOne({}, key, {}, {})).toHoldReferencesStrongly();
    });

    it("strongly as the third argument to .bindOneToOne()", async () => {
      await expectAsync(key => map.bindOneToOne({}, {}, key, {})).toHoldReferencesStrongly();
    });

    it("strongly as the fourth argument to .bindOneToOne()", async () => {
      await expectAsync(key => map.bindOneToOne({}, {}, {}, key)).toHoldReferencesStrongly();
    });

    it("weakly as the argument in .isValidValue()", async () => {
      await expectAsync(key => map.isValidValue(key)).toHoldReferencesWeakly();
    });
  });

  it("creates the WeakStrongMap class in the module", async () => {
    await expectAsync(
      hasClassInSource("./spec/_03_one-to-one-maps/generated/BasicStrongInline.mjs", "WeakStrongMap")
    ).toBeResolvedTo(true);
  });
});
