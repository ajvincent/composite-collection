import HashClass from "../generated/HashClass.mjs";
import ToHoldRefsMatchers from "#support/toHoldReferences.mjs";

describe("KeyClassGenerator for a simple string hash and strongly held arguments", () => {
  let hasher;
  const objects = [];
  for (let i = 0; i < 6; i++) {
    objects.push({ index: i });
  }
  Object.freeze(objects);

  beforeEach(() => hasher = new HashClass());

  it("class is frozen", () => {
    expect(typeof HashClass).toBe("function");
    expect(Object.isFrozen(HashClass)).toBe(true);
    expect(Object.isFrozen(HashClass.prototype)).toBe(true);

    expect(Reflect.ownKeys(HashClass.prototype)).toEqual([
      "constructor",
      "getHash",
      "hasHash",
    ]);
  });

  it("instances are sealed", () => {
    expect(Object.isSealed(hasher)).toBe(true);
  });

  it("instance exposes no private properties", () => {
    expect(Reflect.ownKeys(hasher)).toEqual([]);
  });

  it(".hasHash() returns false for unknown objects", () => {
    expect(hasher.hasHash(objects[0], objects[1])).toBe(false);
    expect(hasher.hasHash(objects[0], objects[1])).toBe(false);
    expect(hasher.hasHash(objects[2], objects[3])).toBe(false);
    expect(hasher.hasHash(objects[2], objects[0])).toBe(false);
    expect(hasher.hasHash(objects[1], objects[0])).toBe(false);
  });

  it(".getHash() generates a consistent hash for each key", () => {
    const hash1 = hasher.getHash(objects[0], objects[1]);
    expect(typeof hash1).toBe("string");
    expect(hasher.hasHash(objects[0], objects[1])).toBe(true);
    expect(hasher.getHash(objects[0], objects[1])).toBe(hash1);

    const hash2 = hasher.getHash(objects[1], objects[0]);
    expect(typeof hash2).toBe("string");
    expect(hash2).not.toBe(hash1);
    expect(hasher.hasHash(objects[0], objects[1])).toBe(true);
    expect(hasher.hasHash(objects[1], objects[0])).toBe(true);
    expect(hasher.getHash(objects[0], objects[1])).toBe(hash1);
    expect(hasher.getHash(objects[1], objects[0])).toBe(hash2);
  });

  it(".getHash() accepts primitives for keys", () => {
    const hash1 = hasher.getHash("row", "column");
    expect(typeof hash1).toBe("string");

    expect(typeof hash1).toBe("string");
    expect(hasher.hasHash("row", "column")).toBe(true);
    expect(hasher.getHash("row", "column")).toBe(hash1);

    const hash2 = hasher.getHash("column", objects[0]);
    expect(typeof hash2).toBe("string");
    expect(hash2).not.toBe(hash1);
    expect(hasher.hasHash("row", "column")).toBe(true);
    expect(hasher.hasHash("column", objects[0])).toBe(true);
    expect(hasher.getHash("row", "column")).toBe(hash1);
    expect(hasher.getHash("column", objects[0])).toBe(hash2);
  });

  it(".getHash() generates a consistent hash for a repeated key", () => {
    const hash1 = hasher.getHash(objects[0], objects[0]);
    expect(typeof hash1).toBe("string");
    expect(hasher.hasHash(objects[0], objects[0])).toBe(true);
    expect(hasher.getHash(objects[0], objects[0])).toBe(hash1);
  });

  describe("holds references", () => {
    beforeEach(() => {
      jasmine.addAsyncMatchers(ToHoldRefsMatchers);
    });

    it("weakly to objects", async () => {
      await expectAsync(
        key => hasher.getHash(key, objects[5])
      ).toHoldReferencesWeakly();
      await expectAsync(
        key => hasher.getHash(objects[4], key)
      ).toHoldReferencesWeakly();
    });
  });
});
