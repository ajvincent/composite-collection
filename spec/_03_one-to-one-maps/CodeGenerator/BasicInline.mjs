
import ToHoldRefsMatchers from "#support/toHoldReferences.mjs";
import OneToOneMap from "../generated/BasicInline.mjs";

describe("CodeGenerator(OneToOneBasicInlineMap.mjs)", () => {
  let map;
  beforeEach(() => map = new OneToOneMap);
  afterEach(() => map = null);

  const redObj = {}, blueObj = {}, greenObj = {}, yellowObj = {};

  it("class is frozen", () => {
    expect(Object.isFrozen(OneToOneMap)).toBe(true);
    expect(Object.isFrozen(OneToOneMap.prototype)).toBe(true);
  });

  it("is an instance of WeakMap", () => {
    expect(map).toBeInstanceOf(WeakMap);
  });

  it("prototype has .bindOneToOne(), .isValidValue(), .set() methods", () => {
    expect(Reflect.ownKeys(OneToOneMap.prototype)).toEqual([
      "constructor",
      "bindOneToOne",
      "hasIdentity",
      "isValidValue",
      "set"
    ]);
  });

  it(".get() points from a source object to a target object after binding", () => {
    expect(map.get(redObj)).toBe(undefined);
    expect(map.get(blueObj)).toBe(undefined);

    map.bindOneToOne(redObj, blueObj);

    expect(map.get(redObj)).toBe(blueObj);
    expect(map.get(blueObj)).toBe(redObj);
  });

  it(".bindOneToOne() accepts the same arguments twice", () => {
    map.bindOneToOne(redObj, blueObj);
    expect(
      () => map.bindOneToOne(redObj, blueObj)
    ).not.toThrow();

    expect(
      () => map.bindOneToOne(blueObj, redObj)
    ).not.toThrow();
  });

  it(".bindOneToOne() accepts different pairings as long as there's no overlap", () => {
    map.bindOneToOne(redObj, blueObj);
    expect(
      () => map.bindOneToOne(greenObj, yellowObj)
    ).not.toThrow();

    expect(
      () => map.bindOneToOne(greenObj, yellowObj)
    ).not.toThrow();

    expect(
      () => map.bindOneToOne(yellowObj, greenObj)
    ).not.toThrow();
  });

  it(".bindOneToOne() throws for overlapping pairs", () => {
    map.bindOneToOne(redObj, blueObj);
    expect(
      () => map.bindOneToOne(greenObj, redObj)
    ).toThrowError("value_2 mismatch!");

    expect(map.get(redObj)).toBe(blueObj);
    expect(map.get(blueObj)).toBe(redObj);
    expect(map.has(greenObj)).toBe(false);

    expect(
      () => map.bindOneToOne(redObj, yellowObj)
    ).toThrowError("value_1 mismatch!");

    expect(map.get(redObj)).toBe(blueObj);
    expect(map.get(blueObj)).toBe(redObj);
    expect(map.has(yellowObj)).toBe(false);
  });

  it(".hasIdentity() returns true for a known identity", () => {
    map.bindOneToOne(redObj, blueObj);
    expect(map.hasIdentity(redObj, false)).toBe(true);
    expect(map.hasIdentity(redObj, true)).toBe(true);
  });

  it(".hasIdentity returns the boolean value of allowNotDefined for an unknown identity", () => {
    expect(map.hasIdentity(redObj, false)).toBe(false);
    expect(map.hasIdentity(redObj, true)).toBe(true);
  });

  it(".isValidValue() returns true for objects", () => {
    expect(map.isValidValue(redObj)).toBe(true);
    expect(map.isValidValue(null)).toBe(false);
    expect(map.isValidValue("hello world")).toBe(false);
  });

  it(".set() throws", () => {
    expect(
      () => map.set(redObj, blueObj)
    ).toThrowError("Not implemented, use .bindOneToOne(value_1, value_2);");
  });

  it(".bindOneToOne() throws for primitive values", () => {
    expect(
      () => map.bindOneToOne(redObj, "hello world")
    ).toThrowError("value_2 is not a valid value!");
    expect(map.has(redObj)).toBe(false);

    expect(
      () => map.bindOneToOne(redObj, null)
    ).toThrowError("value_2 is not a valid value!");
    expect(map.has(redObj)).toBe(false);

    expect(
      () => map.bindOneToOne("hello world", redObj)
    ).toThrowError("value_1 is not a valid value!");
    expect(map.has(redObj)).toBe(false);

    expect(
      () => map.bindOneToOne("hello world", null)
    ).toThrowError("value_1 is not a valid value!");
    expect(map.has(redObj)).toBe(false);
  });

  describe("to hold values weakly", () => {
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    it("as the first argument to .bindOneToOne()", async () => {
      await expectAsync(key => map.bindOneToOne(key, {})).toHoldReferencesWeakly();
    });

    it("as the second argument to .bindOneToOne()", async () => {
      await expectAsync(key => map.bindOneToOne({}, key)).toHoldReferencesWeakly();
    });

    it("as the argument in .isValidValue()", async () => {
      await expectAsync(key => map.isValidValue(key)).toHoldReferencesWeakly();
    });
  });
});
