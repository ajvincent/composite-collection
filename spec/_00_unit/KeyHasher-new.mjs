import KeyHasher from "#source/exports/keys/Hasher.mjs";
import ToHoldRefsMatchers from "#support/toHoldReferences.mjs";

describe("KeyHasher-new", () => {
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
      "getHash",
      "hasHash",
      "getHashIfExists",
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

  it(".hasHash() returns false for an unknown key", () => {
    const keyList = objects.slice(0, 3);
    expect(hasher.hasHash(...keyList)).toBe(false);
  });

  describe(".getHash()", () => {
    it("generates a consistent hash for an initial key", () => {
      const expected = [1,2,3].join(",");

      const keyList = objects.slice(0, 3);

      const actual = hasher.getHash(...keyList);
      expect(actual).toEqual(expected);
      expect(hasher.hasHash(...keyList)).toBe(true);

      expect(hasher.getHash(...keyList)).toEqual(expected);
      expect(hasher.hasHash(...keyList)).toBe(true);
    });

    it("accepts primitives for keys", () => {
      const expected = [1,2,3].join(",");

      const keyList = ["row", "column", "floor"];
      const actual = hasher.getHash(...keyList);

      expect(actual).toEqual(expected);
      expect(hasher.getHash(...keyList)).toEqual(expected);
    });

    it("generates a consistent hash for a repeated key", () => {
      const expected = [1,1,2].join(",");

      const keyList = objects.slice(0, 3);
      keyList[1] = keyList[0];

      const actual = hasher.getHash(...keyList);
      expect(actual).toEqual(expected);

      expect(hasher.getHash(...keyList)).toEqual(expected);
    });

    it("generates new hash indexes for unknown objects", () => {
      const expected = [4,5,6].join(",");

      const keyList = objects.slice(0, 3);

      hasher.getHash(...objects.slice(3, 6));
      const actual = hasher.getHash(...keyList);
      expect(actual).toEqual(expected);

      expect(hasher.getHash(...keyList)).toEqual(expected);
    });
  });

  describe(".getHashIfExists()", () => {
    it("returns a non-empty string for a known hash", () => {
      const keyList = objects.slice(0, 3);
      const expected = hasher.getHash(...keyList);

      expect(hasher.getHashIfExists(...keyList)).toEqual(expected);
    });

    it("returns an empty string for an unknown hash", () => {
      const keyList = objects.slice(0, 3);
      expect(hasher.getHashIfExists(...keyList)).toEqual("");
    });
  });

  describe("holds references", () => {
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    it("weakly to objects", async () => {
      await expectAsync(
        key => hasher.getHash("row", "column", key)
      ).toHoldReferencesWeakly();
    });
  });
});
