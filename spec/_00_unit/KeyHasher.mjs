import KeyHasher from "#source/exports/KeyHasher.mjs";
import ToHoldRefsMatchers from "#support/toHoldReferences.mjs";

describe("KeyHasher", () => {
  let hasher;
  const objects = [];
  for (let i = 0; i < 6; i++) {
    objects.push({ index: i });
  }
  Object.freeze(objects);

  beforeEach(() => hasher = new KeyHasher(["row", "column", "floor"]));

  it("class is frozen", () => {
    expect(typeof KeyHasher).toBe("function");
    expect(Object.isFrozen(KeyHasher)).toBe(true);
    expect(Object.isFrozen(KeyHasher.prototype)).toBe(true);

    expect(Reflect.ownKeys(KeyHasher.prototype)).toEqual([
      "constructor",
      "buildHash",
    ]);
  });

  it("class cannot have subclasses", () => {
    class Subclass extends KeyHasher {}
    expect(() => new Subclass).toThrowError("You cannot subclass KeyHasher!");
  });

  it("instances are sealed", () => {
    expect(Object.isSealed(hasher)).toBe(true);
  });

  it("instance exposes no private properties", () => {
    expect(Reflect.ownKeys(hasher)).toEqual([]);
  });

  describe(".buildHash()", () => {
    it("generates a consistent hash for an initial key", () => {
      const expected = JSON.stringify({
        row: 0,
        column: 1,
        floor: 2,
      });

      const keyList = objects.slice(0, 3);

      const actual = hasher.buildHash(keyList);
      expect(actual).toEqual(expected);

      expect(hasher.buildHash(keyList)).toEqual(expected);
    });

    it("accepts primitives for keys", () => {
      const expected = JSON.stringify({
        row: 0,
        column: 1,
        floor: 2,
      });

      const keyList = ["row", "column", "floor"];
      const actual = hasher.buildHash(keyList);

      expect(actual).toEqual(expected);
      expect(hasher.buildHash(keyList)).toEqual(expected);
    });

    it("generates a consistent hash for a repeated key", () => {
      const expected = JSON.stringify({
        row: 0,
        column: 0,
        floor: 1,
      });

      const keyList = objects.slice(0, 3);
      keyList[1] = keyList[0];

      const actual = hasher.buildHash(keyList);
      expect(actual).toEqual(expected);

      expect(hasher.buildHash(keyList)).toEqual(expected);
    });

    it("generates new hash indexes for unknown objects", () => {
      const expected = JSON.stringify({
        row: 3,
        column: 4,
        floor: 5,
      });

      const keyList = objects.slice(0, 3);

      hasher.buildHash(objects.slice(3, 6));
      const actual = hasher.buildHash(keyList);
      expect(actual).toEqual(expected);

      expect(hasher.buildHash(keyList)).toEqual(expected);
    });

    it("returns null for too few values", () => {
      expect(hasher.buildHash(objects.slice(0, 2))).toBe(null);
    });

    it("returns null for too many values", () => {
      expect(hasher.buildHash(objects.slice(0, 4))).toBe(null);
    });

    it("returns null for a non-array value list", () => {
      const keyList = new Set(objects.slice(0, 3));
      expect(hasher.buildHash(keyList)).toBe(null);
    });
  });

  describe("holds references", () => {
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    it("weakly to objects", async () => {
      await expectAsync(
        key => hasher.buildHash("row", "column", key)
      ).toHoldReferencesWeakly();
    });
  });
});
